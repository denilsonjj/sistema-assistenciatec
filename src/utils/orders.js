import { CHECKLIST_ITEMS } from '../constants/checklist';
import { formatCurrency, formatDate, normalizeDateInput } from './format';

const DEFAULT_PAYMENT = 'Pix';

export const createEmptyChecklist = () =>
  CHECKLIST_ITEMS.map(() => ({ status: '', note: '' }));

export const createEmptyForm = () => ({
  id: '',
  data: new Date().toISOString().slice(0, 10),
  dataTermino: '',
  cliente: '',
  contato: '',
  recado: '',
  marca: '',
  modelo: '',
  senha: '',
  padrao: [],
  defeito: '',
  servico: '',
  valor: '',
  pagamento: DEFAULT_PAYMENT,
  status: 'Aberta',
  obs: '',
  checklist: createEmptyChecklist(),
});

export const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('andamento')) return 'status-andamento';
  if (normalized.includes('finalizada')) return 'status-finalizada';
  return 'status-aberta';
};

const normalizeChecklistItem = (value) => {
  if (!value) return { status: '', note: '' };
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'sim' || lower === 'ok') return { status: 'ok', note: '' };
    if (lower === 'nao') return { status: 'nao', note: '' };
    if (lower === 'alerta' || lower === 'atencao') return { status: 'alerta', note: '' };
    return { status: '', note: value };
  }
  if (typeof value === 'object') {
    return {
      status: value.status || value.value || '',
      note: value.note || value.extra || '',
    };
  }
  return { status: '', note: '' };
};

export const normalizeChecklist = (list) => {
  if (!Array.isArray(list)) return createEmptyChecklist();
  const base = createEmptyChecklist();
  return base.map((item, index) => {
    return normalizeChecklistItem(list[index]);
  });
};

const parseObs = (value) => {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (error) {
    return null;
  }
  return null;
};

const parseLegacyObsString = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') || trimmed.indexOf('=') === -1) return null;
  const result = {};
  const regex = /(\w+)=([\s\S]*?)(?=,\s*\w+=|}$)/g;
  let match;
  while ((match = regex.exec(trimmed)) !== null) {
    const key = match[1];
    const val = match[2] ? match[2].trim() : '';
    result[key] = val;
  }
  return result;
};

const parseLegacyChecklistSelected = (value) => {
  if (!value || typeof value !== 'string') return null;
  const items = [];
  const regex = /\{label=([^,}]+),\s*status=([^,}]+),\s*note=([^}]*)\}/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    items.push({
      label: match[1].trim(),
      status: match[2].trim(),
      note: match[3] ? match[3].trim() : '',
    });
  }
  return items.length ? items : null;
};

const parsePadraoValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {
        return [];
      }
    }
    return trimmed
      .split(/[-,]/)
      .map((item) => parseInt(item, 10))
      .filter((item) => !Number.isNaN(item));
  }
  return [];
};

const parseChecklistValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return [];
    }
  }
  if (typeof value === 'object') return value;
  return [];
};

const setIfPresent = (extras, key, value) => {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    if (!value.length) return;
    extras[key] = value;
    return;
  }
  if (value === '') return;
  extras[key] = value;
};

export const normalizeOrder = (item) => {
  const obsRaw = item.Obs ?? item.obs ?? '';
  const parsed = parseObs(obsRaw);
  const legacy = parsed ? null : parseLegacyObsString(obsRaw);
  const extras = parsed ? { ...parsed } : {};

  if (legacy) {
    const legacyChecklist = parseLegacyChecklistSelected(legacy.checklistSelected);
    setIfPresent(extras, 'marca', legacy.marca || '');
    setIfPresent(extras, 'modelo', legacy.modelo || '');
    setIfPresent(extras, 'recado', legacy.recado || '');
    setIfPresent(extras, 'pagamento', legacy.pagamento || '');
    setIfPresent(extras, 'dataTermino', legacy.dataTermino || '');
    setIfPresent(extras, 'senha', legacy.senha || '');
    setIfPresent(extras, 'padrao', parsePadraoValue(legacy.padrao));
    setIfPresent(extras, 'checklist', legacyChecklist || []);
    setIfPresent(extras, 'notes', legacy.notes || '');
  }

  const marcaColumn = item.Marca ?? item.marca ?? '';
  const modeloColumn = item.Modelo ?? item.modelo ?? '';
  const recadoColumn = item.Recado ?? item.recado ?? '';
  const pagamentoColumn = item.Pagamento ?? item.pagamento ?? '';
  const dataTerminoColumn = item.DataTermino ?? item.dataTermino ?? '';
  const senhaColumn = item.Senha ?? item.senha ?? '';
  const padraoColumn = parsePadraoValue(item.Padrao ?? item.padrao ?? parsed?.padrao);
  const checklistColumn = parseChecklistValue(item.Checklist ?? item.checklist ?? parsed?.checklist);

  setIfPresent(extras, 'marca', marcaColumn || parsed?.marca || '');
  setIfPresent(extras, 'modelo', modeloColumn || parsed?.modelo || '');
  setIfPresent(extras, 'recado', recadoColumn || parsed?.recado || '');
  setIfPresent(extras, 'pagamento', pagamentoColumn || parsed?.pagamento || '');
  setIfPresent(extras, 'dataTermino', dataTerminoColumn || parsed?.dataTermino || '');
  setIfPresent(extras, 'senha', senhaColumn || parsed?.senha || '');
  setIfPresent(extras, 'padrao', padraoColumn || parsed?.padrao || []);
  setIfPresent(extras, 'checklist', checklistColumn || parsed?.checklist || []);

  const marca = extras.marca || '';
  const modelo = extras.modelo || '';
  const aparelhoRaw = item.Aparelho ?? item.aparelho ?? '';
  const aparelho = aparelhoRaw || [marca, modelo].filter(Boolean).join(' ');

  return {
    id: item.ID ?? item.id ?? '',
    data: item.Data ?? item.data ?? '',
    cliente: item.Cliente ?? item.cliente ?? '',
    contato: item.Contato ?? item.contato ?? '',
    aparelho,
    defeito: item.Defeito ?? item.defeito ?? '',
    servico: item.Servico ?? item.servico ?? '',
    valor: item.Valor ?? item.valor ?? '',
    status: item.Status ?? item.status ?? 'Aberta',
    obs: parsed ? parsed.notes || '' : (legacy?.notes || ''),
    extras,
  };
};

export const toFormFromOrder = (order) => {
  const extras = order.extras || {};
  return {
    id: order.id || '',
    data: normalizeDateInput(order.data),
    dataTermino: normalizeDateInput(extras.dataTermino),
    cliente: order.cliente || '',
    contato: order.contato || '',
    recado: extras.recado || '',
    marca: extras.marca || '',
    modelo: extras.modelo || '',
    senha: extras.senha || '',
    padrao: Array.isArray(extras.padrao) ? extras.padrao : [],
    defeito: order.defeito || '',
    servico: order.servico || '',
    valor: order.valor || '',
    pagamento: extras.pagamento || DEFAULT_PAYMENT,
    status: order.status || 'Aberta',
    obs: order.obs || '',
    checklist: normalizeChecklist(extras.checklist),
  };
};

const buildObsPayload = (form) => ({
  notes: form.obs || '',
  marca: form.marca || '',
  modelo: form.modelo || '',
  recado: form.recado || '',
  pagamento: form.pagamento || DEFAULT_PAYMENT,
  dataTermino: form.dataTermino || '',
  senha: form.senha || '',
  padrao: Array.isArray(form.padrao) ? form.padrao : [],
  checklist: normalizeChecklist(form.checklist),
});

const buildChecklistForSheet = (form) => {
  return (form.checklist || [])
    .map((entry, index) => ({
      label: CHECKLIST_ITEMS[index] || `Item ${index + 1}`,
      status: entry.status,
      note: entry.note || '',
    }))
    .filter((item) => item.status);
};

export const buildPayload = (form) => {
  const aparelho = [form.marca, form.modelo].filter(Boolean).join(' ');
  return {
    id: form.id ? String(form.id).trim() : '',
    data: form.data || new Date().toISOString().slice(0, 10),
    cliente: form.cliente || '',
    contato: form.contato || '',
    aparelho,
    defeito: form.defeito || '',
    servico: form.servico || '',
    valor: form.valor || '',
    status: form.status || 'Aberta',
    obs: {
      ...buildObsPayload(form),
      checklistSelected: buildChecklistForSheet(form),
    },
  };
};

export const buildOrderForPrint = (form) => ({
  ...buildPayload(form),
  obs: form.obs || '',
  extras: buildObsPayload(form),
});

const statusLabel = (status) => {
  if (status === 'ok') return 'OK';
  if (status === 'alerta') return 'ATENCAO';
  if (status === 'nao') return 'NAO';
  return '-';
};

const buildChecklistRows = (checklist, onlyIssues) => {
  return checklist
    .map((item, index) => ({
      label: CHECKLIST_ITEMS[index] || '',
      status: item.status || '',
      note: item.note || '',
    }))
    .filter((item) => {
      if (!onlyIssues) return true;
      return item.status === 'alerta' || item.status === 'nao';
    })
    .map((item, index) => {
      const note = item.note ? ` - ${item.note}` : '';
      return `<div class="check-item">${index + 1}. ${item.label}: <strong>${statusLabel(item.status)}</strong>${note}</div>`;
    })
    .join('');
};

export const buildPrintHtml = (order, mode) => {
  const checklist = normalizeChecklist(order.extras?.checklist || []);
  const notes = order.obs || order.extras?.notes || '';
  const aparelho = order.aparelho || [order.extras?.marca, order.extras?.modelo].filter(Boolean).join(' ');
  const recado = order.extras?.recado || '';
  const pagamento = order.extras?.pagamento || '';
  const dataTermino = order.extras?.dataTermino || '';
  const baseStyles = `
    body { font-family: Arial, sans-serif; color: #111; }
    h1, h2 { margin: 0 0 8px; }
    .print-body { margin: 0 auto; width: ${mode === 'thermal' ? '58mm' : '210mm'}; }
    .divider { border-bottom: 1px dashed #999; margin: 8px 0; }
    .line { display: flex; justify-content: space-between; font-size: ${mode === 'thermal' ? '11px' : '13px'}; }
    .block { margin-bottom: 8px; }
    .check-item { font-size: ${mode === 'thermal' ? '10px' : '12px'}; margin-bottom: 4px; }
    @media print {
      @page { size: ${mode === 'thermal' ? '58mm auto' : 'A4'}; margin: 6mm; }
      body { margin: 0; }
    }
  `;

  const checklistSection = mode === 'a4'
    ? `
    <div class="divider"></div>
    <h2>Check List Inicial</h2>
    <div class="block">${buildChecklistRows(checklist, false)}</div>
  `
    : `
    <div class="divider"></div>
    <strong>Checklist - Itens em atencao</strong>
    <div class="block">${buildChecklistRows(checklist, true) || '<div>-</div>'}</div>
  `;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Impressao OS</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="print-body">
          <h1>Ordem de Servico</h1>
          <div class="line"><span>OS:</span><span>${order.id || '-'}</span></div>
          <div class="line"><span>Data:</span><span>${formatDate(order.data) || '-'}</span></div>
          ${dataTermino ? `<div class="line"><span>Data Termino:</span><span>${formatDate(dataTermino)}</span></div>` : ''}
          <div class="divider"></div>
          <div class="block">
            <div class="line"><span>Cliente:</span><span>${order.cliente || '-'}</span></div>
            <div class="line"><span>Contato:</span><span>${order.contato || '-'}</span></div>
            ${recado ? `<div class="line"><span>Recado:</span><span>${recado}</span></div>` : ''}
            <div class="line"><span>Aparelho:</span><span>${aparelho || '-'}</span></div>
            <div class="line"><span>Defeito:</span><span>${order.defeito || '-'}</span></div>
            <div class="line"><span>Servico:</span><span>${order.servico || '-'}</span></div>
            <div class="line"><span>Valor:</span><span>${formatCurrency(order.valor) || '-'}</span></div>
            ${pagamento ? `<div class="line"><span>Pagamento:</span><span>${pagamento}</span></div>` : ''}
            <div class="line"><span>Status:</span><span>${order.status || '-'}</span></div>
          </div>
          ${checklistSection}
          <div class="divider"></div>
          <div class="block">
            <strong>Observacoes</strong>
            <div>${notes || '-'}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

