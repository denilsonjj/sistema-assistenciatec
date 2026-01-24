import { useState } from 'react';

const emptyForm = {
  vendedorNome: '',
  vendedorEndereco: '',
  vendedorCpf: '',
  vendedorRg: '',
  vendedorContato: '',
  marca: '',
  modelo: '',
  cor: '',
  imei1: '',
  imei2: '',
  detalhes: '',
  valor: '',
};

function BuyPhoneForm({ onBack }) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState({
    rgFrente: '',
    rgVerso: '',
    imei: '',
  });

  const handleFile = (key) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => ({ ...prev, [key]: e.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = (mode = 'a4') => {
    const dataHora = new Date().toLocaleString('pt-BR');
    let pageSize = 'A4';
    let pageWidth = '210mm';
    let fontSize = '12px';
    
    if (mode === 'thermal58') {
      pageSize = '58mm auto';
      pageWidth = '58mm';
      fontSize = '9px';
    }
    if (mode === 'thermal38') {
      pageSize = '38mm auto';
      pageWidth = '38mm';
      fontSize = '8px';
    }
    
    const imgBlock = (src, label) => {
      const imgWidth = mode === 'thermal38' ? '80px' : mode === 'thermal58' ? '120px' : '230px';
      const imgHeight = mode === 'thermal38' ? '60px' : mode === 'thermal58' ? '80px' : '144px';
      return `<div style="text-align:center;font-size:${mode === 'thermal38' ? '7px' : '9px'};">
        <img src="${src || ''}" style="width: 100%; max-width: ${imgWidth}; height: ${imgHeight}; object-fit: cover; border: 1px solid #ccc; border-radius: 4px;" />
        <div>${label}</div>
      </div>`;
    };

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Termo de Compra</title>
          <style>
            @page { size: ${pageSize}; margin: 6mm; }
            body { font-family: Arial, sans-serif; font-size: ${fontSize}; color: #1a1a1a; margin: 0; }
            header { background: linear-gradient(90deg, #001f4d, #004aad); color: #fff; padding: ${mode === 'thermal38' ? '6px 8px' : '12px 16px'}; }
            header h1 { margin: 0; font-size: ${mode === 'thermal38' ? '12px' : mode === 'thermal58' ? '14px' : '18px'}; }
            header p { margin: 2px 0; font-size: ${mode === 'thermal38' ? '7px' : mode === 'thermal58' ? '8px' : '11px'}; }
            .section { margin: ${mode === 'thermal38' ? '6px 0' : '14px 0'}; padding: ${mode === 'thermal38' ? '6px' : '12px'}; border: 1px solid #e1e8f2; border-radius: 4px; background: #f8faff; }
            .section-title { color: #001f4d; font-weight: bold; border-bottom: 1px solid #ccd6e8; margin-bottom: 4px; font-size: ${mode === 'thermal38' ? '8px' : mode === 'thermal58' ? '10px' : '13px'}; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${mode === 'thermal38' ? '2px 4px' : '8px 15px'}; }
            .imagens { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: ${mode === 'thermal38' ? '6px' : mode === 'thermal58' ? '10px' : '20px'}; margin-top: ${mode === 'thermal38' ? '4px' : '12px'}; }
            footer { text-align: center; font-size: ${mode === 'thermal38' ? '6px' : mode === 'thermal58' ? '8px' : '9px'}; color: #555; margin-top: ${mode === 'thermal38' ? '10px' : '25px'}; border-top: 1px solid #ccc; padding-top: ${mode === 'thermal38' ? '4px' : '10px'}; }
          </style>
        </head>
        <body>
          <header>
            <h1>D-Tech Utilities & Tools</h1>
            <p>CNPJ: 37.183.737/0001-05</p>
            <p>Rua do Cruzeiro, 10 - Centro, Capela do Alto - SP</p>
            <div style="text-align:right;font-size:${mode === 'thermal38' ? '6px' : mode === 'thermal58' ? '8px' : '10px'};">Emitido em: ${dataHora}</div>
          </header>

          <div class="section">
            <div class="section-title">Dados do Vendedor</div>
            <div class="grid">
              <div><b>Nome:</b> ${form.vendedorNome || '-'}</div>
              <div><b>Contato:</b> ${form.vendedorContato || '-'}</div>
              <div><b>CPF:</b> ${form.vendedorCpf || '-'}</div>
              <div><b>RG:</b> ${form.vendedorRg || '-'}</div>
              <div style="grid-column: span 2"><b>Endereco:</b> ${form.vendedorEndereco || '-'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Aparelho</div>
            <div class="grid">
              <div><b>Marca:</b> ${form.marca || '-'}</div>
              <div><b>Modelo:</b> ${form.modelo || '-'}</div>
              <div><b>Cor:</b> ${form.cor || '-'}</div>
              <div><b>IMEI 1:</b> ${form.imei1 || '-'}</div>
              <div><b>IMEI 2:</b> ${form.imei2 || '-'}</div>
              <div style="grid-column: span 2"><b>Detalhes:</b> ${form.detalhes || '-'}</div>
              <div style="grid-column: span 2"><b>Valor:</b> ${form.valor || '-'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Fotos do Documento e IMEI</div>
            <div class="imagens">
              ${imgBlock(images.rgFrente, 'RG Frente')}
              ${imgBlock(images.rgVerso, 'RG Verso')}
              ${imgBlock(images.imei, 'IMEI')}
            </div>
          </div>

          ${mode === 'a4' ? `
          <div class="section">
            <div class="section-title">Termo de Responsabilidade</div>
            <div style="font-size:11px; line-height:1.5;">
              Declaro que o aparelho descrito e de minha propriedade e possui origem licita.
              Assumo responsabilidade pela veracidade das informacoes prestadas.
            </div>
          </div>

          <div style="text-align:center; margin-top:50px;">
            <div style="height:80px; border-bottom:2px solid #000; width:320px; margin:0 auto;"></div>
            <br><b>Assinatura do Vendedor</b>
          </div>
          ` : ''}

          <footer>Documento gerado automaticamente pelo Sistema Interno D-Tech</footer>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const updateForm = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Compra de Aparelho</div>
          <div className="page-subtitle">Registro completo com fotos e termo.</div>
        </div>
      </div>

      <div className="page-card">
        <div className="section-title">Dados do Vendedor</div>
        <div className="form-grid">
          <label className="field">
            <span>Nome Completo</span>
            <input className="input" value={form.vendedorNome} onChange={updateForm('vendedorNome')} />
          </label>
          <label className="field">
            <span>Contato</span>
            <input className="input" value={form.vendedorContato} onChange={updateForm('vendedorContato')} />
          </label>
          <label className="field">
            <span>CPF</span>
            <input className="input" value={form.vendedorCpf} onChange={updateForm('vendedorCpf')} />
          </label>
          <label className="field">
            <span>RG</span>
            <input className="input" value={form.vendedorRg} onChange={updateForm('vendedorRg')} />
          </label>
          <label className="field full">
            <span>Endereco</span>
            <input className="input" value={form.vendedorEndereco} onChange={updateForm('vendedorEndereco')} />
          </label>
        </div>

        <div className="section-title">Dados do Aparelho</div>
        <div className="form-grid">
          <label className="field">
            <span>Marca</span>
            <input className="input" value={form.marca} onChange={updateForm('marca')} />
          </label>
          <label className="field">
            <span>Modelo</span>
            <input className="input" value={form.modelo} onChange={updateForm('modelo')} />
          </label>
          <label className="field">
            <span>Cor</span>
            <input className="input" value={form.cor} onChange={updateForm('cor')} />
          </label>
          <label className="field">
            <span>IMEI 1</span>
            <input className="input" value={form.imei1} onChange={updateForm('imei1')} />
          </label>
          <label className="field">
            <span>IMEI 2</span>
            <input className="input" value={form.imei2} onChange={updateForm('imei2')} />
          </label>
          <label className="field">
            <span>Valor</span>
            <input className="input" value={form.valor} onChange={updateForm('valor')} />
          </label>
          <label className="field full">
            <span>Detalhes</span>
            <textarea className="input textarea" rows="3" value={form.detalhes} onChange={updateForm('detalhes')} />
          </label>
        </div>

        <div className="section-title">Fotos (toque para selecionar)</div>
        <div className="upload-grid">
          <label className="upload-card">
            <input type="file" accept="image/*" onChange={handleFile('rgFrente')} />
            {images.rgFrente ? <img src={images.rgFrente} alt="RG Frente" /> : <span>RG Frente</span>}
          </label>
          <label className="upload-card">
            <input type="file" accept="image/*" onChange={handleFile('rgVerso')} />
            {images.rgVerso ? <img src={images.rgVerso} alt="RG Verso" /> : <span>RG Verso</span>}
          </label>
          <label className="upload-card">
            <input type="file" accept="image/*" onChange={handleFile('imei')} />
            {images.imei ? <img src={images.imei} alt="IMEI" /> : <span>IMEI</span>}
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-accent" type="button" onClick={() => handlePrint('a4')}>Imprimir A4</button>
          <button className="btn btn-accent" type="button" onClick={() => handlePrint('thermal58')}>Imprimir 58mm</button>
          <button className="btn btn-accent" type="button" onClick={() => handlePrint('thermal38')}>Imprimir 38mm</button>
          <button className="btn btn-muted" type="button" onClick={onBack}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

export default BuyPhoneForm;



