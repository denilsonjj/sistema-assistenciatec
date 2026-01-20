import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';

const parseValue = (value) => {
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
  return Number.isNaN(numeric) ? 0 : numeric;
};

function WarrantyForm() {
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    nome: '',
    cpf: '',
    produto: '',
    situacao: 'Produto Novo',
    valorProduto: '',
    desconto: '',
    imei: '',
    garantia: '90 dias',
    observacao: '',
    pagamento: 'Pix',
  });

  const valorFinal = useMemo(() => {
    return parseValue(form.valorProduto) - parseValue(form.desconto);
  }, [form.valorProduto, form.desconto]);

  const handlePrint = () => {
    const date = form.data ? form.data.split('-').reverse().join('/') : '-';

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Garantia</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; }
            .cupom { width: 58mm; margin: 0 auto; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #333; margin: 6px 0; }
            .bold { font-weight: bold; }
            footer { font-size: 10px; text-align: justify; }
          </style>
        </head>
        <body>
          <div class="cupom">
            <div class="center bold">D-Tech Utilities & Tools</div>
            <div class="center">Rua do Cruzeiro, 10 - Centro</div>
            <div class="center">CNPJ: 37.183.737/0001-05</div>
            <div class="line"></div>
            <div><strong>Data:</strong> ${date}</div>
            <div><strong>Cliente:</strong> ${form.nome || '-'}</div>
            <div><strong>CPF:</strong> ${form.cpf || '-'}</div>
            <div><strong>Produto:</strong> ${form.produto || '-'}</div>
            <div><strong>Situacao:</strong> ${form.situacao}</div>
            <div><strong>Valor:</strong> ${formatCurrency(parseValue(form.valorProduto))}</div>
            <div><strong>Desconto:</strong> ${formatCurrency(parseValue(form.desconto))}</div>
            <div><strong>IMEI/Serie:</strong> ${form.imei || '-'}</div>
            <div><strong>Garantia:</strong> ${form.garantia}</div>
            <div><strong>Pagamento:</strong> ${form.pagamento}</div>
            <div><strong>Valor final:</strong> ${formatCurrency(valorFinal)}</div>
            <div class="line"></div>
            <footer>
              Garantia limitada. Pode ser invalidada por mau uso, instalacao inadequada ou danos externos.
              Obrigado por escolher a D-Tech.
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
          <div className="page-title">Garantia de Produtos</div>
          <div className="page-subtitle">Emissao rapida de garantia 58mm.</div>
        </div>
      </div>

      <div className="page-card">
        <div className="form-grid">
          <label className="field">
            <span>Data de Emissao</span>
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
              value={form.cpf}
              onChange={(event) => setForm({ ...form, cpf: event.target.value })}
            />
          </label>
          <label className="field full">
            <span>Produto</span>
            <input
              className="input"
              value={form.produto}
              onChange={(event) => setForm({ ...form, produto: event.target.value })}
              placeholder="Produto"
            />
          </label>
          <label className="field">
            <span>Situacao</span>
            <select
              className="input"
              value={form.situacao}
              onChange={(event) => setForm({ ...form, situacao: event.target.value })}
            >
              <option>Produto Novo</option>
              <option>Produto Semi Novo</option>
              <option>Produto Usado</option>
              <option>Produto de Saldao</option>
              <option>Produto de Encomenda</option>
            </select>
          </label>
          <label className="field">
            <span>Valor do Produto</span>
            <input
              className="input"
              value={form.valorProduto}
              onChange={(event) => setForm({ ...form, valorProduto: event.target.value })}
              placeholder="0,00"
            />
          </label>
          <label className="field">
            <span>Desconto</span>
            <input
              className="input"
              value={form.desconto}
              onChange={(event) => setForm({ ...form, desconto: event.target.value })}
              placeholder="0,00"
            />
          </label>
          <label className="field">
            <span>IMEI / Serie</span>
            <input
              className="input"
              value={form.imei}
              onChange={(event) => setForm({ ...form, imei: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Garantia</span>
            <select
              className="input"
              value={form.garantia}
              onChange={(event) => setForm({ ...form, garantia: event.target.value })}
            >
              <option>7 dias</option>
              <option>15 dias</option>
              <option>30 dias</option>
              <option>90 dias</option>
              <option>180 dias</option>
            </select>
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
              placeholder="Observacoes adicionais"
            />
          </label>
        </div>

        <div className="summary-row">
          <div className="summary-label">Valor final</div>
          <div className="summary-value">{formatCurrency(valorFinal)}</div>
        </div>

        <div className="form-actions">
          <button className="btn btn-accent" type="button" onClick={handlePrint}>Imprimir 58mm</button>
        </div>
      </div>
    </div>
  );
}

export default WarrantyForm;



