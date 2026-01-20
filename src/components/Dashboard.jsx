const ACTIONS = [
  { id: 'openOrder', title: 'Abrir Ordem de Servico', desc: 'Registrar uma nova OS com checklist.' },
  { id: 'list', title: 'Listagem de OS', desc: 'Consultar, editar e imprimir ordens.' },
  { id: 'closeOrder', title: 'Finalizar OS', desc: 'Gerar cupom e fechar atendimento.' },
  { id: 'estimate', title: 'Gerar Orcamento', desc: 'Criar orcamentos rapidos para o cliente.' },
  { id: 'warranty', title: 'Garantia', desc: 'Emitir garantia de produtos diversos.' },
  { id: 'buyPhone', title: 'Compra de Aparelho', desc: 'Registrar compra com fotos e termo.' },
];

function Dashboard({ onNavigate }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Atalhos rapidos para o dia a dia.</div>
        </div>
      </div>
      <div className="action-grid">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="action-card"
            onClick={() => onNavigate(action.id)}
          >
            <div className="action-title">{action.title}</div>
            <div className="action-desc">{action.desc}</div>
            <div className="action-cta">Abrir</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;



