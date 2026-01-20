function MenuScreen({ onMessage, onOpenOs, onOpenList, menuMessage }) {
  return (
    <section className="menu-panel">
      <div className="menu-title">D-Tech Utilities & Tools</div>
      <div className="menu-subtitle">CNPJ: 37.183.737/0001-05</div>
      <div className="menu-actions">
        <button className="btn btn-menu" onClick={() => onMessage('Funcionalidade em desenvolvimento.')}>Gerar Orcamento</button>
        <button className="btn btn-menu" onClick={() => onMessage('Funcionalidade em desenvolvimento.')}>Garantia de Produtos Diversos</button>
        <button className="btn btn-menu" onClick={onOpenOs}>Abrir Ordem de Servico</button>
        <button className="btn btn-menu" onClick={onOpenList}>Finalizar Ordem de Servico</button>
        <button className="btn btn-menu" onClick={() => onMessage('Integre com o PDV quando desejar.')}>Abrir PDV MarketUP</button>
        <button className="btn btn-menu btn-menu-outline" onClick={() => onMessage('Logout pronto para integrar com login.')}>Sair</button>
      </div>
      {menuMessage ? <div className="menu-note">{menuMessage}</div> : null}
      <div className="menu-footer">Sistema interno D-Tech - Versao 1.1</div>
      <button className="menu-link" onClick={() => onMessage('Logout pronto para integrar com login.')}>Sair</button>
    </section>
  );
}

export default MenuScreen;




