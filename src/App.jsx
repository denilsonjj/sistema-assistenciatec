import { useEffect, useMemo, useState } from 'react';
import {
  fetchOrders,
  login,
  saveOrder,
  deleteOrder,
  getStoredToken,
  setStoredToken,
} from './services/api';
import { CHECKLIST_ITEMS } from './constants/checklist';
import { STATUS_OPTIONS } from './constants/status';
import {
  buildOrderForPrint,
  buildPayload,
  buildPrintHtml,
  createEmptyChecklist,
  createEmptyForm,
  normalizeOrder,
  toFormFromOrder,
} from './utils/orders';
import { downloadCsv } from './utils/export';
import Sidebar from './components/Sidebar';
import Notice from './components/Notice';
import OsForm from './components/OsForm';
import OsList from './components/OsList';
import EstimateForm from './components/EstimateForm';
import WarrantyForm from './components/WarrantyForm';
import CloseOrderForm from './components/CloseOrderForm';
import BuyPhoneForm from './components/BuyPhoneForm';
import Login from './components/Login';
import './App.css';

function App() {
  const [view, setView] = useState('menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState(null);
  const [form, setForm] = useState(() => createEmptyForm());
  const viewLabels = {
    menu: 'Inicio',
    openOrder: 'Abrir OS',
    list: 'Listagem OS',
    closeOrder: 'Finalizar OS',
    estimate: 'Orcamento',
    warranty: 'Garantia',
    buyPhone: 'Compra de Aparelho',
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && (view === 'list' || view === 'closeOrder')) {
      loadOrders(false);
    }
  }, [isAuthenticated, view]);

  // Calcular valor total automaticamente quando peça ou mão de obra mudam
  useEffect(() => {
    const parseValue = (val) => {
      if (!val) return 0;
      const num = Number(String(val).replace(/[^0-9,-]/g, '').replace(',', '.'));
      return Number.isNaN(num) ? 0 : num;
    };
    const peca = parseValue(form.valorPeca);
    const maoDobra = parseValue(form.valorMaoDeObra);
    const total = peca + maoDobra;
    const formattedTotal = total > 0 ? `R$ ${total.toFixed(2).replace('.', ',')}` : '';
    
    if (form.valor !== formattedTotal) {
      setForm((prev) => ({ ...prev, valor: formattedTotal }));
    }
  }, [form.valorPeca, form.valorMaoDeObra]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      const extras = order.extras || {};
      return (
        String(order.id || '').toLowerCase().includes(term) ||
        String(order.cliente || '').toLowerCase().includes(term) ||
        String(extras.cpf || '').toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Recalcular valor total se peça ou mão de obra mudou
      if (field === 'valorPeca' || field === 'valorMaoDeObra') {
        const parseValue = (val) => {
          if (!val) return 0;
          const num = Number(String(val).replace(/[^0-9,-]/g, '').replace(',', '.'));
          return Number.isNaN(num) ? 0 : num;
        };
        const peca = parseValue(updated.valorPeca);
        const maoDobra = parseValue(updated.valorMaoDeObra);
        const total = peca + maoDobra;
        updated.valor = total > 0 ? `R$ ${total.toFixed(2).replace('.', ',')}` : '';
      }
      
      return updated;
    });
  };

  const handleChecklistStatusChange = (index, status) => {
    setForm((prev) => {
      const next = [...prev.checklist];
      const current = next[index] || { status: '', note: '' };
      const shouldClearNote = status !== 'alerta' && index !== next.length - 1;
      next[index] = {
        status,
        note: shouldClearNote ? '' : current.note,
      };

      // Se a opção 4 (índice 3) é "não", marcar o resto como "não"
      if (index === 3 && status === 'nao') {
        // Marcar todos os itens após o índice 3 como "não"
        for (let i = 4; i < next.length; i++) {
          next[i] = { status: 'nao', note: '' };
        }
      }

      return { ...prev, checklist: next };
    });
  };

  const handleChecklistNoteChange = (index, note) => {
    setForm((prev) => {
      const next = [...prev.checklist];
      const current = next[index] || { status: '', note: '' };
      next[index] = { ...current, note };
      return { ...prev, checklist: next };
    });
  };

  const handlePatternToggle = (pattern) => {
    setForm((prev) => ({
      ...prev,
      padrao: pattern,
    }));
  };

  const parseOrderDate = (value) => {
    if (!value) return 0;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) {
      return direct.getTime();
    }
    if (typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const normalized = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!Number.isNaN(normalized.getTime())) {
          return normalized.getTime();
        }
      }
    }
    return 0;
  };

  const parseOrderIdDate = (id) => {
    const match = String(id || '').match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) return 0;
    const parsed = new Date(`${match[1]}-${match[2]}-${match[3]}`);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const sortOrders = (list) => {
    return [...list].sort((a, b) => {
      const timeA = parseOrderDate(a.data) || parseOrderIdDate(a.id);
      const timeB = parseOrderDate(b.data) || parseOrderIdDate(b.id);
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return String(b.id || '').localeCompare(String(a.id || ''), 'pt-BR');
    });
  };

  const loadOrders = async (silent) => {
    setLoadingList(!silent);
    try {
      const data = await fetchOrders();
      const list = Array.isArray(data) ? sortOrders(data.map(normalizeOrder)) : [];
      setOrders(list);
      if (!silent) {
        setNotice(null);
      }
    } catch (error) {
      if (!silent) {
        setNotice({ type: 'error', text: error.message });
      }
      if (String(error.message || '').toLowerCase().includes('token')) {
        setStoredToken('');
        setIsAuthenticated(false);
      }
    } finally {
      setLoadingList(false);
    }
  };

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthNotice(null);
    try {
      const data = await login({ username, password });
      if (data && data.token) {
        setStoredToken(data.token);
        setIsAuthenticated(true);
        setAuthNotice(null);
      }
    } catch (error) {
      setAuthNotice({ type: 'error', text: error.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setStoredToken('');
    setIsAuthenticated(false);
    setOrders([]);
    setSearch('');
    setNotice(null);
    setView('menu');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const payload = buildPayload(form);
      const response = await saveOrder(payload);
      setNotice({ type: 'success', text: response?.message || 'OS salva com sucesso.' });
      setForm(createEmptyForm());
      if (view === 'list') {
        await loadOrders(false);
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
      if (String(error.message || '').toLowerCase().includes('token')) {
        setStoredToken('');
        setIsAuthenticated(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (order) => {
    setForm(toFormFromOrder(order));
    setView('openOrder');
    setSidebarOpen(false);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Tem certeza que deseja deletar a OS ${order.id}?`)) {
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await deleteOrder(order.id);
      setNotice({ type: 'success', text: `OS ${order.id} deletada com sucesso.` });
      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      await loadOrders(false);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
      if (String(error.message || '').toLowerCase().includes('token')) {
        setStoredToken('');
        setIsAuthenticated(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (order, nextStatus) => {
    if (!order || !nextStatus || order.status === nextStatus) return;
    const prevStatus = order.status;
    setOrders((prev) =>
      prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item))
    );
    try {
      const formData = { ...toFormFromOrder(order), status: nextStatus };
      await saveOrder(buildPayload(formData));
      setNotice({ type: 'success', text: `Status atualizado para ${nextStatus}.` });
    } catch (error) {
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? { ...item, status: prevStatus } : item))
      );
      setNotice({ type: 'error', text: error.message });
      if (String(error.message || '').toLowerCase().includes('token')) {
        setStoredToken('');
        setIsAuthenticated(false);
      }
    }
  };

  const handleResetForm = () => {
    setForm(createEmptyForm());
    setNotice(null);
  };

  const handleResetChecklist = () => {
    setForm((prev) => ({
      ...prev,
      checklist: createEmptyChecklist(),
    }));
  };

  const handlePrint = (order, mode) => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      setNotice({ type: 'error', text: 'Pop-up bloqueado. Libere o navegador para imprimir.' });
      return;
    }
    win.document.write(buildPrintHtml(order, mode));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const handleExport = () => {
    if (!filteredOrders.length) {
      setNotice({ type: 'info', text: 'Nenhum dado visivel para exportar.' });
      return;
    }
    downloadCsv(filteredOrders);
  };

  const handleOpenPdv = () => {
    setSidebarOpen(false);
    window.open('https://dtechcapela.marketup.com/muppos/#/iniciar_venda', '_blank');
  };

  const handleNavigate = (nextView) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  const pageTitle = viewLabels[view] || 'Inicio';
  const isMenu = view === 'menu';

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Login onSubmit={handleLogin} loading={authLoading} notice={authNotice} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`app-shell ${isMenu ? 'menu-shell' : ''}`}>
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          activeView={view}
          isOpen={sidebarOpen}
          onNavigate={handleNavigate}
          onOpenPdv={handleOpenPdv}
          onLogout={handleLogout}
        />
        {!isMenu ? (
          <main className="main">
            <header className="topbar">
              <button
                className="hamburger"
                type="button"
                aria-label="Abrir menu"
                aria-expanded={sidebarOpen}
                aria-controls="app-sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <span />
                <span />
                <span />
              </button>
              <div className="topbar-title">{pageTitle}</div>
            </header>
            <Notice notice={notice} />
            {view === 'openOrder' ? (
              <OsForm
                form={form}
                orders={orders}
                statusOptions={STATUS_OPTIONS}
                checklistItems={CHECKLIST_ITEMS}
                saving={saving}
                onFieldChange={handleFieldChange}
                onChecklistStatusChange={handleChecklistStatusChange}
                onChecklistNoteChange={handleChecklistNoteChange}
                onPatternToggle={handlePatternToggle}
                onSubmit={handleSubmit}
                onBack={() => handleNavigate('menu')}
                onPrint={(mode) => handlePrint(buildOrderForPrint(form), mode)}
                onResetChecklist={handleResetChecklist}
                onResetForm={handleResetForm}
              />
            ) : null}
          {view === 'list' ? (
            <OsList
              orders={filteredOrders}
              search={search}
              loading={loadingList}
              onSearchChange={(event) => setSearch(event.target.value)}
              onRefresh={() => loadOrders(false)}
              onExport={handleExport}
              onEdit={handleEdit}
              onPrint={handlePrint}
              onDelete={handleDelete}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={handleStatusChange}
              onBack={() => handleNavigate('menu')}
            />
          ) : null}
            {view === 'estimate' ? <EstimateForm onBack={() => handleNavigate('menu')} /> : null}
            {view === 'warranty' ? <WarrantyForm onBack={() => handleNavigate('menu')} /> : null}
            {view === 'closeOrder' ? <CloseOrderForm orders={orders} onBack={() => handleNavigate('menu')} /> : null}
            {view === 'buyPhone' ? <BuyPhoneForm onBack={() => handleNavigate('menu')} /> : null}
          </main>
        ) : null}
      </div>
    </div>
  );
}

export default App;
