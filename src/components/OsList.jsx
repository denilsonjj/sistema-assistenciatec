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

        <div className="table-wrap">
          <table id="tabela-lista-os" className="os-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Aparelho</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={`${order.id}-${order.cliente}`} className={getStatusClass(order.status)}>
                  <td>{order.id}</td>
                  <td>{formatDate(order.data)}</td>
                  <td>{order.cliente}</td>
                  <td>{order.aparelho}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{formatCurrency(order.valor)}</td>
                  <td className="actions">
                    <button className="btn btn-outline btn-small" type="button" onClick={() => onEdit(order)}>Editar</button>
                    <button className="btn btn-ghost btn-small" type="button" onClick={() => onPrint(order, 'thermal')}>58mm</button>
                    <button className="btn btn-ghost btn-small" type="button" onClick={() => onPrint(order, 'a4')}>A4</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!orders.length && !loading ? (
          <div className="empty-state">Nenhuma OS encontrada.</div>
        ) : null}
      </div>
    </div>
  );
}

export default OsList;



