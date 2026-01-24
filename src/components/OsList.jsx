import { formatCurrency, formatDate } from '../utils/format';
import { getStatusClass } from '../utils/orders';

function OsList({
  orders,
  search,
  loading,
  onSearchChange,
  onRefresh,
  onExport,
  onEdit,
  onPrint,
  onDelete,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Listagem de OS</div>
          <div className="page-subtitle">Busque e gerencie as ordens em andamento.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" type="button" onClick={onRefresh} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button className="btn btn-accent" type="button" onClick={onExport}>Exportar Excel</button>
        </div>
      </div>

      <div className="page-card">
        <input
          id="filtro-busca"
          className="input search"
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por ID ou cliente"
        />

        <div className="table-responsive">
          <table id="tabela-lista-os" className="os-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Cliente</th>
                <th className="hide-mobile">Aparelho</th>
                <th>Status</th>
                <th className="hide-mobile">Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={`${order.id}-${order.cliente}`} className={getStatusClass(order.status)}>
                  <td data-label="ID">
                    <strong>{order.id}</strong>
                  </td>
                  <td data-label="Data">{formatDate(order.data)}</td>
                  <td data-label="Cliente">{order.cliente}</td>
                  <td data-label="Aparelho" className="hide-mobile">{order.aparelho}</td>
                  <td data-label="Status">
                    <span className={`status-pill ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Valor" className="hide-mobile">{formatCurrency(order.valor)}</td>
                  <td data-label="Ações" className="actions">
                    <div className="action-buttons">
                      <div className="action-group print-group">
                        <button 
                          className="btn btn-ghost btn-small" 
                          type="button" 
                          onClick={() => onPrint(order, 'thermal')}
                          title="Imprimir 58mm"
                        >
                          58mm
                        </button>
                        <button 
                          className="btn btn-ghost btn-small" 
                          type="button" 
                          onClick={() => onPrint(order, 'thermal38')}
                          title="Imprimir 38mm"
                        >
                          38mm
                        </button>
                        <button 
                          className="btn btn-ghost btn-small" 
                          type="button" 
                          onClick={() => onPrint(order, 'a4')}
                          title="Imprimir A4"
                        >
                          A4
                        </button>
                      </div>
                      <div className="action-group edit-group">
                        <button 
                          className="btn btn-outline btn-small" 
                          type="button" 
                          onClick={() => onEdit(order)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {onDelete && (
                          <button 
                            className="btn btn-danger btn-small" 
                            type="button" 
                            onClick={() => onDelete(order)} 
                            title="Deletar OS"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OsList;
