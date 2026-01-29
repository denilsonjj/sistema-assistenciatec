import { CHECKLIST_ITEMS } from '../constants/checklist';
import { formatCurrency, formatDate, normalizeDateInput } from './format';

const DEFAULT_PAYMENT = 'Pix';

/**
 * Gera número de OS no formato AAAAMMDD-SEQ
 * Incrementa automaticamente baseado nas OSs já existentes
 * @param {Array} existingOrders - Array de OSs já criadas
 * @returns {string} - Número de OS formatado (ex: 20260124-001)
 */
export const generateOsNumber = (existingOrders = []) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayPrefix = `${year}${month}${day}`;

  // Filtrar OSs de hoje
  const todayOrders = existingOrders.filter((order) => {
    const osPrefix = String(order.id || '').substring(0, 8);
    return osPrefix === todayPrefix;
  });

  // Extrair números sequenciais
  const sequences = todayOrders
    .map((order) => {
      const match = String(order.id || '').match(/-(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((seq) => !Number.isNaN(seq));

  // Encontrar o próximo número
  const nextSequence = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
  const seq = String(nextSequence).padStart(3, '0');
  return `${todayPrefix}-${seq}`;
};

export const createEmptyChecklist = () =>
  CHECKLIST_ITEMS.map(() => ({ status: '', note: '' }));

export const createEmptyForm = () => ({
  id: '',
  data: new Date().toISOString().slice(0, 10),
  dataTermino: '',
  cliente: '',
  contato: '',
  recado: '',
  marca: '',
  modelo: '',
  senha: '',
  padrao: [],
  defeito: '',
  servico: '',
  valorPeca: '',
  valorMaoDeObra: '',
  valor: '',
  pagamento: DEFAULT_PAYMENT,
  status: 'Aberta',
  obs: '',
  checklist: createEmptyChecklist(),
});

export const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('cancel')) return 'status-cancelada';
  if (normalized.includes('andamento')) return 'status-andamento';
  if (normalized.includes('finalizada')) return 'status-finalizada';
  return 'status-aberta';
};

const normalizeChecklistItem = (value) => {
  if (!value) return { status: '', note: '' };
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'sim' || lower === 'ok') return { status: 'ok', note: '' };
    if (lower === 'nao') return { status: 'nao', note: '' };
    if (lower === 'alerta' || lower === 'atencao') return { status: 'alerta', note: '' };
    return { status: '', note: value };
  }
  if (typeof value === 'object') {
    return {
      status: value.status || value.value || '',
      note: value.note || value.extra || '',
    };
  }
  return { status: '', note: '' };
};

export const normalizeChecklist = (list) => {
  if (!Array.isArray(list)) return createEmptyChecklist();
  const base = createEmptyChecklist();
  return base.map((item, index) => {
    return normalizeChecklistItem(list[index]);
  });
};

const parseObs = (value) => {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (error) {
    return null;
  }
  return null;
};

const parseLegacyObsString = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') || trimmed.indexOf('=') === -1) return null;
  const result = {};
  const regex = /(\w+)=([\s\S]*?)(?=,\s*\w+=|}$)/g;
  let match;
  while ((match = regex.exec(trimmed)) !== null) {
    const key = match[1];
    const val = match[2] ? match[2].trim() : '';
    result[key] = val;
  }
  return result;
};

const parseLegacyChecklistSelected = (value) => {
  if (!value || typeof value !== 'string') return null;
  const items = [];
  const regex = /\{label=([^,}]+),\s*status=([^,}]+),\s*note=([^}]*)\}/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    items.push({
      label: match[1].trim(),
      status: match[2].trim(),
      note: match[3] ? match[3].trim() : '',
    });
  }
  return items.length ? items : null;
};

const parsePadraoValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {
        return [];
      }
    }
    return trimmed
      .split(/[-,]/)
      .map((item) => parseInt(item, 10))
      .filter((item) => !Number.isNaN(item));
  }
  return [];
};

const parseChecklistValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return [];
    }
  }
  if (typeof value === 'object') return value;
  return [];
};

const setIfPresent = (extras, key, value) => {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    if (!value.length) return;
    extras[key] = value;
    return;
  }
  if (value === '') return;
  extras[key] = value;
};

export const normalizeOrder = (item) => {
  const obsRaw = item.Obs ?? item.obs ?? '';
  const parsed = parseObs(obsRaw);
  const legacy = parsed ? null : parseLegacyObsString(obsRaw);
  const extras = parsed ? { ...parsed } : {};

  if (legacy) {
    const legacyChecklist = parseLegacyChecklistSelected(legacy.checklistSelected);
    setIfPresent(extras, 'marca', legacy.marca || '');
    setIfPresent(extras, 'modelo', legacy.modelo || '');
    setIfPresent(extras, 'recado', legacy.recado || '');
    setIfPresent(extras, 'pagamento', legacy.pagamento || '');
    setIfPresent(extras, 'dataTermino', legacy.dataTermino || '');
    setIfPresent(extras, 'senha', legacy.senha || '');
    setIfPresent(extras, 'padrao', parsePadraoValue(legacy.padrao));
    setIfPresent(extras, 'checklist', legacyChecklist || []);
    setIfPresent(extras, 'notes', legacy.notes || '');
  }

  const marcaColumn = item.Marca ?? item.marca ?? '';
  const modeloColumn = item.Modelo ?? item.modelo ?? '';
  const recadoColumn = item.Recado ?? item.recado ?? '';
  const pagamentoColumn = item.Pagamento ?? item.pagamento ?? '';
  const dataTerminoColumn = item.DataTermino ?? item.dataTermino ?? '';
  const senhaColumn = item.Senha ?? item.senha ?? '';
  const padraoColumn = parsePadraoValue(item.Padrao ?? item.padrao ?? parsed?.padrao);
  const checklistColumn = parseChecklistValue(item.Checklist ?? item.checklist ?? parsed?.checklist);

  setIfPresent(extras, 'marca', marcaColumn || parsed?.marca || '');
  setIfPresent(extras, 'modelo', modeloColumn || parsed?.modelo || '');
  setIfPresent(extras, 'recado', recadoColumn || parsed?.recado || '');
  setIfPresent(extras, 'pagamento', pagamentoColumn || parsed?.pagamento || '');
  setIfPresent(extras, 'dataTermino', dataTerminoColumn || parsed?.dataTermino || '');
  setIfPresent(extras, 'senha', senhaColumn || parsed?.senha || '');
  setIfPresent(extras, 'padrao', padraoColumn || parsed?.padrao || []);
  setIfPresent(extras, 'checklist', checklistColumn || parsed?.checklist || []);

  const marca = extras.marca || '';
  const modelo = extras.modelo || '';
  const aparelhoRaw = item.Aparelho ?? item.aparelho ?? '';
  const aparelho = aparelhoRaw || [marca, modelo].filter(Boolean).join(' ');

  return {
    id: item.ID ?? item.id ?? '',
    data: item.Data ?? item.data ?? '',
    cliente: item.Cliente ?? item.cliente ?? '',
    contato: item.Contato ?? item.contato ?? '',
    aparelho,
    defeito: item.Defeito ?? item.defeito ?? '',
    servico: item.Servico ?? item.servico ?? '',
    valor: item.Valor ?? item.valor ?? '',
    status: item.Status ?? item.status ?? 'Aberta',
    obs: parsed ? parsed.notes || '' : (legacy?.notes || ''),
    extras,
  };
};

export const toFormFromOrder = (order) => {
  const extras = order.extras || {};
  return {
    id: order.id || '',
    data: normalizeDateInput(order.data),
    dataTermino: normalizeDateInput(extras.dataTermino),
    cliente: order.cliente || '',
    contato: order.contato || '',
    recado: extras.recado || '',
    marca: extras.marca || '',
    modelo: extras.modelo || '',
    senha: extras.senha || '',
    padrao: Array.isArray(extras.padrao) ? extras.padrao : [],
    defeito: order.defeito || '',
    servico: order.servico || '',
    valorPeca: extras.valorPeca || '',
    valorMaoDeObra: extras.valorMaoDeObra || '',
    valor: order.valor || '',
    pagamento: extras.pagamento || DEFAULT_PAYMENT,
    status: order.status || 'Aberta',
    obs: order.obs || '',
    checklist: normalizeChecklist(extras.checklist),
  };
};

const buildObsPayload = (form) => ({
  notes: form.obs || '',
  marca: form.marca || '',
  modelo: form.modelo || '',
  recado: form.recado || '',
  pagamento: form.pagamento || DEFAULT_PAYMENT,
  dataTermino: form.dataTermino || '',
  senha: form.senha || '',
  valorPeca: form.valorPeca || '',
  valorMaoDeObra: form.valorMaoDeObra || '',
  cpf: form.contato || '', // Usando contato como CPF para busca
  padrao: Array.isArray(form.padrao) ? form.padrao : [],
  checklist: normalizeChecklist(form.checklist),
});

const buildChecklistForSheet = (form) => {
  return (form.checklist || [])
    .map((entry, index) => ({
      label: CHECKLIST_ITEMS[index] || `Item ${index + 1}`,
      status: entry.status,
      note: entry.note || '',
    }))
    .filter((item) => item.status);
};

export const buildPayload = (form) => {
  const aparelho = [form.marca, form.modelo].filter(Boolean).join(' ');
  return {
    id: form.id ? String(form.id).trim() : '',
    data: form.data || new Date().toISOString().slice(0, 10),
    cliente: form.cliente || '',
    contato: form.contato || '',
    aparelho,
    defeito: form.defeito || '',
    servico: form.servico || '',
    valor: form.valor || '',
    status: form.status || 'Aberta',
    obs: {
      ...buildObsPayload(form),
      checklistSelected: buildChecklistForSheet(form),
    },
  };
};

export const buildOrderForPrint = (form) => ({
  ...buildPayload(form),
  obs: form.obs || '',
  extras: buildObsPayload(form),
});

const statusLabel = (status) => {
  if (status === 'ok') return 'OK';
  if (status === 'alerta') return 'ATENCAO';
  if (status === 'nao') return 'NAO';
  return '-';
};

const buildChecklistRows = (checklist, onlyIssues) => {
  return checklist
    .map((item, index) => ({
      label: CHECKLIST_ITEMS[index] || '',
      status: item.status || '',
      note: item.note || '',
    }))
    .filter((item) => {
      if (!onlyIssues) return true;
      return item.status === 'alerta' || item.status === 'nao';
    })
    .map((item, index) => {
      const note = item.note ? ` - ${item.note}` : '';
      return `<div class="check-item">${index + 1}. ${item.label}: <strong>${statusLabel(item.status)}</strong>${note}</div>`;
    })
    .join('');
};

const buildPatternHtml = (pattern, mode) => {
  if (!pattern || !Array.isArray(pattern) || pattern.length === 0) {
    return '';
  }

  const size = mode === 'a4' ? 180 : 100;
  const dotRadius = size / 10;
  const gridSize = 3;
  const cellSize = size / gridSize;

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="margin: 8px auto; display: block;">`;
  
  // Desenha fundo
  svg += `<rect width="${size}" height="${size}" fill="#f9f9f9" stroke="#ddd" stroke-width="1" />`;

  // Desenha linhas conectando os pontos
  if (pattern.length > 1) {
    svg += '<g stroke="#FF6B6B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    for (let i = 0; i < pattern.length - 1; i++) {
      const from = pattern[i] - 1;
      const to = pattern[i + 1] - 1;
      const fromRow = Math.floor(from / gridSize);
      const fromCol = from % gridSize;
      const toRow = Math.floor(to / gridSize);
      const toCol = to % gridSize;
      const x1 = fromCol * cellSize + cellSize / 2;
      const y1 = fromRow * cellSize + cellSize / 2;
      const x2 = toCol * cellSize + cellSize / 2;
      const y2 = toRow * cellSize + cellSize / 2;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }
    svg += '</g>';
  }

  // Desenha os pontos
  for (let i = 1; i <= 9; i++) {
    const row = Math.floor((i - 1) / gridSize);
    const col = (i - 1) % gridSize;
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    const isStart = pattern[0] === i;
    const position = pattern.indexOf(i);
    const isInPath = position !== -1;

    // Ponto de fundo
    svg += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${isStart ? '#FF6B6B' : isInPath ? 'rgba(255, 107, 107, 0.3)' : '#e8e8e8'}" stroke="${isInPath ? '#FF6B6B' : '#ccc'}" stroke-width="1" />`;

    // Número da sequência
    if (isInPath) {
      svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${dotRadius * 1.5}" font-weight="bold" fill="${isStart ? '#fff' : '#FF6B6B'}">${position + 1}</text>`;
    }
  }

  svg += '</svg>';
  return svg;
};

export const buildPrintHtml = (order, mode) => {
  const checklist = normalizeChecklist(order.extras?.checklist || []);
  const notes = order.obs || order.extras?.notes || '';
  const aparelho = order.aparelho || [order.extras?.marca, order.extras?.modelo].filter(Boolean).join(' ');
  const recado = order.extras?.recado || '';
  const pagamento = order.extras?.pagamento || '';
  const dataTermino = order.extras?.dataTermino || '';
  const padrao = order.extras?.padrao || [];
  const senha = order.extras?.senha || '';
  const dataAbertura = formatDate(order.data) || '';

  if (mode === 'thermal58') {
    const gateIndex = 3;
    const gateNao = checklist[gateIndex]?.status === 'nao';
    const avisoSistema = gateNao
      ? 'O check-list nao pode ser efetuado devido a limitacoes do aparelho, impossibilitando o acesso ao sistema, portanto a garantia sera unica e exclusivamente sobre o servico prestado.'
      : '';
    const issues = checklist
      .map((item, index) => {
        if (gateNao && index >= 4 && index <= 24) return '';
        if (item.status !== 'alerta' && item.status !== 'nao') return '';
        let textoItem = CHECKLIST_ITEMS[index] || '';
        if (item.status === 'nao') {
          textoItem += ': Nao';
        }
        if (item.note) {
          textoItem += `: ${item.note}`;
        }
        const icon = item.status === 'nao' ? 'X' : '!';
        return `<div style="font-size:11px;margin-bottom:3px;">${icon} ${textoItem}</div>`;
      })
      .filter(Boolean)
      .join('');
    const issuesHtml = issues || '<div style="font-size:11px;margin-bottom:3px;">-</div>';
    return `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Cupom 58mm</title>
        </head>
        <body>
          <div style="font-family:Arial,sans-serif;font-size:12px;padding:5px;width:55mm;">
            <div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:5px;">D-Tech Utilities & Tools</div>
            <div style="text-align:center;font-size:11px;margin-bottom:8px;">
              Rua do Cruzeiro, 10 - Centro, Capela do Alto<br>
              WhatsApp: (15) 99644-4174
            </div>
            <hr style="border-top:1px dashed #000;">
            <div style="font-size:11px;margin-bottom:4px;"><b>OS No:</b> ${order.id || '-'}</div>
            <div style="font-size:11px;margin-bottom:4px;"><b>Cliente:</b> ${order.cliente || '-'}</div>
            <div style="font-size:11px;margin-bottom:4px;"><b>CPF:</b> ${order.contato || '-'}</div>
            ${recado ? `<div style="font-size:11px;margin-bottom:4px;"><b>Recado:</b> ${recado}</div>` : ''}
            <div style="font-size:11px;margin-bottom:4px;"><b>Equipamento:</b> ${aparelho || '-'}</div>
            <div style="font-size:11px;margin-bottom:4px;"><b>Servico:</b> ${order.servico || '-'}</div>
            ${dataAbertura ? `<div style="font-size:11px;margin-bottom:4px;"><b>Data Abertura:</b> ${dataAbertura}</div>` : ''}
            ${dataTermino ? `<div style="font-size:11px;margin-bottom:4px;"><b>Data Termino:</b> ${formatDate(dataTermino)}</div>` : ''}
            <div style="font-size:11px;margin-bottom:4px;"><b>Valor:</b> ${formatCurrency(order.valor) || '-'}</div>
            ${pagamento ? `<div style="font-size:11px;margin-bottom:4px;"><b>Pagamento:</b> ${pagamento}</div>` : ''}
            <hr style="border-top:1px dashed #000;">
            <div style="font-weight:bold;margin-bottom:4px;">Atencao, problemas detectados no check-list:</div>
            ${issuesHtml}
            ${avisoSistema ? `<div style="margin-top:6px;font-size:11px;color:red;font-weight:bold;">${avisoSistema}</div>` : ''}
            ${notes ? `<div style="margin-top:6px;font-size:11px;">Observacoes: ${notes}</div>` : ''}
            <hr style="border-top:1px dashed #000;margin-top:5px;">
            <div style="text-align:center;font-size:10px;"><b>Apresente este cupom para retirar o aparelho. Retirar em ate 7 dias, sujeito a multa diaria por atraso. Obrigado por escolher a D-Tech!</b></div>
          </div>
        </body>
      </html>
    `;
  }

  let pageWidth = '210mm';
  let pageSize = 'A4';
  let fontSize = '13px';
  let checklistFontSize = '12px';

  const baseStyles = `
    body { font-family: Arial, sans-serif; color: #111; }
    h1, h2 { margin: 0 0 8px; }
    .print-body { margin: 0 auto; width: ${pageWidth}; }
    .divider { border-bottom: 1px dashed #999; margin: 8px 0; }
    .line { display: flex; justify-content: space-between; font-size: ${fontSize}; }
    .block { margin-bottom: 8px; }
    .check-item { font-size: ${checklistFontSize}; margin-bottom: 4px; }
    @media print {
      @page { size: ${pageSize}; margin: 6mm; }
      body { margin: 0; }
    }
  `;

  const checklistSection = mode === 'a4'
    ? `
    <div class="divider"></div>
    <h2>Check List Inicial</h2>
    <div class="block">${buildChecklistRows(checklist, false)}</div>
  `
    : `
    <div class="divider"></div>
    <strong>Checklist - Itens em atencao</strong>
    <div class="block">${buildChecklistRows(checklist, true) || '<div>-</div>'}</div>
  `;

  const patternSection = padrao.length > 0 ? `
    <div class="divider"></div>
    <strong>Padrão de Desbloqueio</strong>
    ${buildPatternHtml(padrao, mode)}
  ` : '';

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Impressao OS</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="print-body">
          <h1>Ordem de Servico</h1>
          <div class="line"><span>OS:</span><span>${order.id || '-'}</span></div>
          <div class="line"><span>Data:</span><span>${formatDate(order.data) || '-'}</span></div>
          ${dataTermino ? `<div class="line"><span>Data Termino:</span><span>${formatDate(dataTermino)}</span></div>` : ''}
          <div class="divider"></div>
          <div class="block">
            <div class="line"><span>Cliente:</span><span>${order.cliente || '-'}</span></div>
            <div class="line"><span>CPF:</span><span>${order.contato || '-'}</span></div>
            ${recado ? `<div class="line"><span>Recado:</span><span>${recado}</span></div>` : ''}
            <div class="line"><span>Aparelho:</span><span>${aparelho || '-'}</span></div>
            <div class="line"><span>Defeito:</span><span>${order.defeito || '-'}</span></div>
            <div class="line"><span>Servico:</span><span>${order.servico || '-'}</span></div>
            <div class="line"><span>Valor:</span><span>${formatCurrency(order.valor) || '-'}</span></div>
            ${pagamento ? `<div class="line"><span>Pagamento:</span><span>${pagamento}</span></div>` : ''}
            ${senha ? `<div class="line"><span>Senha/PIN:</span><span>${senha}</span></div>` : ''}
            <div class="line"><span>Status:</span><span>${order.status || '-'}</span></div>
          </div>
          ${checklistSection}
          ${patternSection}
          <div class="divider"></div>
          <div class="block">
            <strong>Observacoes</strong>
            <div>${notes || '-'}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};
