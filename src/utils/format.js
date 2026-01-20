export const normalizeDateInput = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};




