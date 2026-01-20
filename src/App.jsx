import { useEffect, useMemo, useState } from 'react';
import {
  fetchOrders,
  login,
  saveOrder,
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
import Dashboard from './components/Dashboard';
import OsForm from './components/OsForm';
import OsList from './components/OsList';
import EstimateForm from './components/EstimateForm';
import WarrantyForm from './components/WarrantyForm';
import CloseOrderForm from './components/CloseOrderForm';
import BuyPhoneForm from './components/BuyPhoneForm';
import Login from './components/Login';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
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
    dashboard: 'Dashboard',
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
    if (isAuthenticated && view === 'list') {
      loadOrders(false);
    }
  }, [isAuthenticated, view]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      return (
        String(order.id || '').toLowerCase().includes(term) ||
        String(order.cliente || '').toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
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

  const handlePatternToggle = (index) => {
    setForm((prev) => {
      const next = new Set(prev.padrao || []);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return { ...prev, padrao: Array.from(next) };
    });
  };

  const loadOrders = async (silent) => {
    setLoadingList(!silent);
    try {
      const data = await fetchOrders();
      const list = Array.isArray(data) ? data.map(normalizeOrder) : [];
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
    setView('dashboard');
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

  const pageTitle = viewLabels[view] || 'Dashboard';

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Login onSubmit={handleLogin} loading={authLoading} notice={authNotice} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-shell">
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
          {view === 'dashboard' ? <Dashboard onNavigate={handleNavigate} /> : null}
          {view === 'openOrder' ? (
            <OsForm
              form={form}
              statusOptions={STATUS_OPTIONS}
              checklistItems={CHECKLIST_ITEMS}
              saving={saving}
              onFieldChange={handleFieldChange}
              onChecklistStatusChange={handleChecklistStatusChange}
              onChecklistNoteChange={handleChecklistNoteChange}
              onPatternToggle={handlePatternToggle}
              onSubmit={handleSubmit}
              onBack={() => handleNavigate('dashboard')}
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
            />
          ) : null}
          {view === 'estimate' ? <EstimateForm /> : null}
          {view === 'warranty' ? <WarrantyForm /> : null}
          {view === 'closeOrder' ? <CloseOrderForm /> : null}
          {view === 'buyPhone' ? <BuyPhoneForm /> : null}
        </main>
      </div>
    </div>
  );
}

export default App;



