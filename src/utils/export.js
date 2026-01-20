const cleanNotes = (value) => {
  if (!value) return '';
  const text = String(value).trim();
  if (!text) return '';
  if (text.startsWith('{') && (text.includes('=') || text.includes(':'))) return '';
  if (text.includes('marca=') || text.includes('modelo=') || text.includes('checklist=')) return '';
  return text;
};

export const downloadCsv = (rows) => {
  const headers = [
    'ID',
    'Data',
    'Cliente',
    'Contato',
    'Aparelho',
    'Marca',
    'Modelo',
    'Defeito',
    'Servico',
    'Valor',
    'Status',
    'Recado',
    'Pagamento',
    'DataTermino',
    'Senha',
    'Padrao',
    'Obs',
  ];

  const content = [headers]
    .concat(
      rows.map((order) => {
        const extras = order.extras || {};
        const padrao = Array.isArray(extras.padrao) ? extras.padrao.join('-') : (extras.padrao || '');
        const notes = cleanNotes(extras.notes || order.obs || '');

        return [
          order.id,
          order.data,
          order.cliente,
          order.contato,
          order.aparelho,
          extras.marca || '',
          extras.modelo || '',
          order.defeito,
          order.servico,
          order.valor,
          order.status,
          extras.recado || '',
          extras.pagamento || '',
          extras.dataTermino || '',
          extras.senha || '',
          padrao,
          notes,
        ];
      })
    )
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ordens-servico-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
