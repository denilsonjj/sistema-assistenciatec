import { useMemo, useState } from 'react';
import { formatCurrency, formatDate } from '../utils/format';

const createService = () => ({ desc: '', value: '' });

const parseValue = (value) => {
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
  return Number.isNaN(numeric) ? 0 : numeric;
};

function CloseOrderForm({ orders = [], onBack }) {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [form, setForm] = useState({
    os: '',
    data: new Date().toISOString().slice(0, 10),
    nome: '',
    contato: '',
    valor: '',
    pagamento: 'Pix',
    observacao: '',
  });
  const [services, setServices] = useState([createService()]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.status || '').toLowerCase();
      return status.includes('aberta') || status.includes('andamento');
    });
  }, [orders]);

  // Buscar dados da OS quando uma é selecionada
  const handleOrderSelect = (event) => {
    const orderId = event.target.value;
    setSelectedOrderId(orderId);

    const selectedOrder = filteredOrders.find((order) => order.id === orderId);
    if (selectedOrder) {
      const extras = selectedOrder.extras || {};
      const cpfValue = extras.cpf || selectedOrder.contato || '';
      setForm({
        os: selectedOrder.id || '',
        data: selectedOrder.data ? selectedOrder.data.split('-').join('-') : new Date().toISOString().slice(0, 10),
        nome: selectedOrder.cliente || '',
        contato: cpfValue,
        valor: selectedOrder.valor || '',
        pagamento: extras.pagamento || 'Pix',
        observacao: '',
      });
      setServices([
        {
          desc: selectedOrder.servico || '',
          value: '',
        },
      ]);
    }
  };

  const total = useMemo(() => {
    const servicesTotal = services.reduce((sum, item) => sum + parseValue(item.value), 0);
    const osValue = parseValue(form.valor);
    return servicesTotal + osValue;
  }, [services, form.valor]);

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
    const pageWidth = '58mm';
    const fontSize = '11px';
    
    const itemsHtml = services
      .filter((item) => item.desc || item.value)
      .map((item) => {
        const price = formatCurrency(parseValue(item.value));
        return `<div>${item.desc || '-'} - ${price}</div>`;
      })
      .join('');

    const date = formatDate(form.data) || '-';

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Cupom OS</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: ${fontSize}; }
            .cupom { width: ${pageWidth}; margin: 0 auto; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #333; margin: 6px 0; }
            .bold { font-weight: bold; }
            table { width: 100%; }
            footer { font-size: 9px; text-align: justify; }
            @media print {
              @page { size: ${pageWidth} auto; margin: 6mm; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="cupom">
            <div class="center bold">D-Tech Utilities & Tools</div>
            <div class="center">Rua do Cruzeiro, 10 - Centro</div>
            <div class="center">CNPJ: 37.183.737/0001-05</div>
            <div class="line"></div>
            <div><strong>OS:</strong> ${form.os || '-'}</div>
            <div><strong>Data:</strong> ${date}</div>
            <div><strong>Cliente:</strong> ${form.nome || '-'}</div>
            <div><strong>CPF:</strong> ${form.contato || '-'}</div>
            <div class="line"></div>
            <div><strong>Servicos realizados:</strong></div>
            <div>${itemsHtml || '-'}</div>
            <div class="line"></div>
            <table>
              <tr>
                <td><strong>Total:</strong></td>
                <td style="text-align:right;">${formatCurrency(total)}</td>
              </tr>
              <tr>
                <td><strong>Pagamento:</strong></td>
                <td style="text-align:right;">${form.pagamento}</td>
              </tr>
            </table>
            <div class="line"></div>
            ${form.observacao ? `<div><strong>Observacao:</strong> ${form.observacao}</div>` : ''}
            <footer>
              Este servico possui garantia de 90 dias a partir da conclusao, valida apenas para o servico prestado.
              A garantia e anulada em casos de mau uso, quedas, oxidacao ou violacao do aparelho por terceiros.
            </footer>
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
          <div className="page-title">Finalizar Ordem de Servico</div>
          <div className="page-subtitle">Geracao de cupom e garantia.</div>
        </div>
      </div>

      <div className="page-card">
        <div className="form-grid">
          <label className="field full">
            <span>Selecione uma OS</span>
            <select
              className="input"
              value={selectedOrderId}
              onChange={handleOrderSelect}
            >
              <option value="">-- Selecione uma OS --</option>
              {filteredOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.cliente || 'Sem nome'}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Numero OS</span>
            <input
              className="input"
              value={form.os}
              onChange={(event) => setForm({ ...form, os: event.target.value })}
              placeholder="2025-001"
              readOnly
            />
          </label>
          <label className="field">
            <span>Data</span>
            <input
              className="input"
              type="date"
              value={form.data}
              onChange={(event) => setForm({ ...form, data: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Cliente</span>
            <input
              className="input"
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              placeholder="Nome completo"
            />
          </label>
          <label className="field">
            <span>CPF</span>
            <input
              className="input"
              value={form.contato}
              onChange={(event) => setForm({ ...form, contato: event.target.value })}
              placeholder="000.000.000-00"
            />
          </label>
          <label className="field">
            <span>Valor OS</span>
            <input
              className="input"
              value={form.valor}
              onChange={(event) => setForm({ ...form, valor: event.target.value })}
              placeholder="R$ 0,00"
            />
          </label>
          <label className="field">
            <span>Pagamento</span>
            <select
              className="input"
              value={form.pagamento}
              onChange={(event) => setForm({ ...form, pagamento: event.target.value })}
            >
              <option>Pix</option>
              <option>Debito</option>
              <option>Credito</option>
              <option>Dinheiro</option>
              <option>Credito parcelado (com taxa)</option>
            </select>
          </label>
          <label className="field full">
            <span>Observacao</span>
            <textarea
              className="input textarea"
              rows="3"
              value={form.observacao}
              onChange={(event) => setForm({ ...form, observacao: event.target.value })}
              placeholder="Observacoes finais"
            />
          </label>
        </div>

        <div className="section-title">Servicos realizados</div>
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
          <div className="summary-label">Total</div>
          <div className="summary-value">{formatCurrency(total)}</div>
        </div>

        <div className="form-actions">
          <button className="btn btn-accent" type="button" onClick={handlePrint}>Imprimir 58mm</button>
          <button className="btn btn-muted" type="button" onClick={onBack}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

export default CloseOrderForm;
