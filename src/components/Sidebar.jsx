const NAV_ITEMS = [
  // { id: 'dashboard', label: 'Dashboard' }, // Oculto temporariamente
  { id: 'openOrder', label: 'Abrir OS' },
  { id: 'list', label: 'Listagem OS' },
  { id: 'closeOrder', label: 'Finalizar OS' },
  { id: 'estimate', label: 'Orcamento' },
  { id: 'warranty', label: 'Garantia' },
  { id: 'buyPhone', label: 'Compra aparelho' },
];

function Sidebar({ activeView, isOpen, onNavigate, onOpenPdv, onLogout }) {
  return (
    <aside id="app-sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand">
        <img className="brand-logo" src="/logo.png" alt="D-Tech" />
        <div className="brand-text">
          <div className="brand-title">D-Tech Utilities</div>
          <div className="brand-subtitle">Sistema interno</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-actions">
        <button type="button" className="nav-item" onClick={onOpenPdv}>Abrir PDV MarketUP</button>
        <button type="button" className="nav-item nav-item-muted" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  );
}

export default Sidebar;



