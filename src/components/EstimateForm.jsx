import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';

const createService = () => ({ desc: '', value: '' });

const parseValue = (value) => {
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
  return Number.isNaN(numeric) ? 0 : numeric;
};

function EstimateForm() {
  const [client, setClient] = useState({ name: '', contact: '' });
  const [services, setServices] = useState([createService()]);

  const total = useMemo(() => {
    return services.reduce((sum, item) => sum + parseValue(item.value), 0);
  }, [services]);

  const updateService = (index, field, value) => {
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addService = () => {
    setServices((prev) => [...prev, createService()]);
  };

  const handlePrint = () => {
    const itemsHtml = services
      .filter((item) => item.desc || item.value)
      .map((item) => {
        const price = formatCurrency(parseValue(item.value));
        return `<div>${item.desc || '-'} - ${price}</div>`;
      })
      .join('');

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Orcamento</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; }
            .cupom { width: 58mm; margin: 0 auto; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #333; margin: 6px 0; }
            .bold { font-weight: bold; }
            table { width: 100%; }
          </style>
        </head>
        <body>
          <div class="cupom">
            <div class="center bold">D-Tech Utilities & Tools</div>
            <div class="center">Rua do Cruzeiro, 10 - Centro</div>
            <div class="center">CNPJ: 37.183.737/0001-05</div>
            <div class="line"></div>
            <div><strong>Cliente:</strong> ${client.name || '-'}</div>
            <div><strong>Celular:</strong> ${client.contact || '-'}</div>
            <div class="line"></div>
            <div><strong>Servicos:</strong></div>
            <div>${itemsHtml || '-'}</div>
            <div class="line"></div>
            <table>
              <tr>
                <td><strong>Total:</strong></td>
                <td style="text-align:right;">${formatCurrency(total)}</td>
              </tr>
            </table>
            <div class="line"></div>
            <div style="font-size:10px; text-align: justify;">
              Orcamento valido por 7 dias. Valores sujeitos a alteracao conforme diagnostico.
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=600,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Gerar Orcamento</div>
          <div className="page-subtitle">Monte o orcamento e imprima em 58mm.</div>
        </div>
      </div>

      <div className="page-card">
        <div className="form-grid">
          <label className="field">
            <span>Nome do Cliente</span>
            <input
              className="input"
              value={client.name}
              onChange={(event) => setClient({ ...client, name: event.target.value })}
              placeholder="Nome completo"
            />
          </label>
          <label className="field">
            <span>Celular</span>
            <input
              className="input"
              value={client.contact}
              onChange={(event) => setClient({ ...client, contact: event.target.value })}
              placeholder="(00) 90000-0000"
            />
          </label>
        </div>

        <div className="section-title">Servicos e valores</div>
        <div className="service-list">
          {services.map((service, index) => (
            <div className="service-row" key={`service-${index}`}>
              <input
                className="input"
                value={service.desc}
                onChange={(event) => updateService(index, 'desc', event.target.value)}
                placeholder="Descricao do servico"
              />
              <input
                className="input"
                value={service.value}
                onChange={(event) => updateService(index, 'value', event.target.value)}
                placeholder="Valor"
              />
            </div>
          ))}
          <button className="btn btn-ghost" type="button" onClick={addService}>Adicionar servico</button>
        </div>

        <div className="summary-row">
          <div className="summary-label">Total estimado</div>
          <div className="summary-value">{formatCurrency(total)}</div>
        </div>

        <div className="form-actions">
          <button className="btn btn-accent" type="button" onClick={handlePrint}>Imprimir 58mm</button>
        </div>
      </div>
    </div>
  );
}

export default EstimateForm;



