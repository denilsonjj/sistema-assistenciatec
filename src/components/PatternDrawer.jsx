import { useState, useRef, useEffect } from 'react';
import '../styles/PatternDrawer.css';

function PatternDrawer({ pattern, onPatternChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPath, setDrawnPath] = useState([]);
  const [currentMouse, setCurrentMouse] = useState(null);

  const GRID_SIZE = 3;
  const DOT_RADIUS = 15;

  // Calcula posição do ponto na grid
  const getGridPosition = (index) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return { row, col };
  };

  // Calcula coordenadas do canvas para um ponto da grid
  const getCanvasCoords = (gridIndex) => {
    const { row, col } = getGridPosition(gridIndex);
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / GRID_SIZE;
    const cellHeight = height / GRID_SIZE;

    return {
      x: col * cellWidth + cellWidth / 2,
      y: row * cellHeight + cellHeight / 2,
      index: gridIndex,
    };
  };

  // Detecta qual ponto da grid está sob as coordenadas do mouse/toque
  const getPointAtCoords = (x, y) => {
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const coords = getCanvasCoords(i);
      if (!coords) continue;

      const dx = coords.x - x;
      const dy = coords.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= DOT_RADIUS + 10) {
        return i + 1; // Retorna 1-9 ao invés de 0-8
      }
    }
    return null;
  };

  // Converte coordenadas do mouse/touch em relação ao canvas
  const getMousePosOnCanvas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    // Suporta tanto mouse quanto touch
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    return { x, y };
  };

  // Inicia o desenho
  const handleStart = (e) => {
    e.preventDefault();
    const pos = getMousePosOnCanvas(e);
    if (!pos) return;

    const pointIndex = getPointAtCoords(pos.x, pos.y);
    if (pointIndex !== null) {
      setIsDrawing(true);
      setDrawnPath([pointIndex]);
    }
  };

  // Continua o desenho
  const handleMove = (e) => {
    e.preventDefault();
    const pos = getMousePosOnCanvas(e);
    if (!pos) return;

    setCurrentMouse(pos);

    if (!isDrawing) return;

    const pointIndex = getPointAtCoords(pos.x, pos.y);
    if (pointIndex !== null && !drawnPath.includes(pointIndex)) {
      setDrawnPath((prev) => [...prev, pointIndex]);
    }
  };

  // Finaliza o desenho
  const handleEnd = (e) => {
    e.preventDefault();
    if (isDrawing && drawnPath.length > 0) {
      onPatternChange(drawnPath);
    }
    setIsDrawing(false);
    setDrawnPath([]);
    setCurrentMouse(null);
  };

  // Limpa o padrão
  const handleClear = () => {
    setDrawnPath([]);
    setCurrentMouse(null);
    setIsDrawing(false);
    onPatternChange([]);
  };

  // Responsivo - ajusta tamanho do canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const size = Math.min(container.offsetWidth, container.offsetHeight, 400);
      canvas.width = size;
      canvas.height = size;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawnPath, currentMouse, isDrawing]);

  // Desenha os pontos
  const drawDots = (ctx) => {
    if (!ctx) return;

    // Usa padrão salvo se não estiver desenhando, senão usa o em andamento
    const displayPath = isDrawing ? drawnPath : (pattern || []);

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const coords = getCanvasCoords(i);
      if (!coords) continue;

      const pointNumber = i + 1;
      const isInPath = displayPath.includes(pointNumber);
      const position = displayPath.indexOf(pointNumber);

      // Fundo do ponto
      ctx.fillStyle = position === 0 ? '#FF6B6B' : isInPath ? 'rgba(255, 107, 107, 0.3)' : '#f0f0f0';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Borda com mais destaque em mobile
      ctx.strokeStyle = isInPath ? '#FF6B6B' : '#ccc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Número da sequência
      if (isInPath) {
        ctx.fillStyle = position === 0 ? '#fff' : '#FF6B6B';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(position + 1), coords.x, coords.y);
      }
    }
  };

  // Desenha as linhas de conexão
  const drawLines = (ctx) => {
    // Usa padrão salvo se não estiver desenhando, senão usa o em andamento
    const displayPath = isDrawing ? drawnPath : (pattern || []);
    
    if (!ctx || displayPath.length < 1) return;

    ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (displayPath.length > 0) {
      const firstCoord = getCanvasCoords(displayPath[0] - 1);
      ctx.beginPath();
      ctx.moveTo(firstCoord.x, firstCoord.y);

      for (let i = 1; i < displayPath.length; i++) {
        const coord = getCanvasCoords(displayPath[i] - 1);
        ctx.lineTo(coord.x, coord.y);
      }

      // Se ainda estão desenhando, conecta até o mouse/toque
      if (isDrawing && currentMouse) {
        ctx.lineTo(currentMouse.x, currentMouse.y);
      }

      ctx.stroke();
    }
  };

  // Redesenha o canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines(ctx);
    drawDots(ctx);
  };

  // Atualiza o canvas quando há mudanças
  useEffect(() => {
    redrawCanvas();
  }, [drawnPath, currentMouse, isDrawing, pattern]);

  return (
    <div className="pattern-drawer">
      <div className="pattern-label">
        <span>🔐 Padrão de Desbloqueio</span>
        <span className="pattern-hint">{pattern && pattern.length > 0 ? `✅ ${pattern.length} pontos salvos` : drawnPath.length > 0 ? `${drawnPath.length} pontos` : 'Desenhe um padrão'}</span>
      </div>
      <div className="pattern-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="pattern-canvas"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ touchAction: 'none', cursor: 'crosshair' }}
        />
      </div>
      <div className="pattern-controls">
        <button
          type="button"
          className="btn btn-small btn-outline"
          onClick={handleClear}
        >
          🔄 Limpar
        </button>
      </div>
    </div>
  );
}

export default PatternDrawer;
