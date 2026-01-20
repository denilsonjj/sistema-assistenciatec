function OsForm({
  form,
  statusOptions,
  checklistItems,
  saving,
  onFieldChange,
  onChecklistStatusChange,
  onChecklistNoteChange,
  onPatternToggle,
  onSubmit,
  onBack,
  onPrint,
  onResetChecklist,
  onResetForm,
}) {
  const lastChecklistIndex = checklistItems.length - 1;

  const shouldShowNote = (item, index) => {
    if (index === lastChecklistIndex) return item.status !== '';
    return item.status === 'alerta';
  };

  const notePlaceholder = (index) =>
    index === lastChecklistIndex ? 'Detalhar acessorio' : 'Descreva o problema';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Abrir Ordem de Servico</div>
          <div className="page-subtitle">Cadastro completo com checklist inicial.</div>
        </div>
      </div>

      <div className="page-card">
        <form id="form-cadastro-os" className="os-form" onSubmit={onSubmit}>
          <div className="section">
            <div className="section-header">Ordem de Servico</div>
            <div className="section-body">
              <div className="form-grid">
                <label className="field">
                  <span>Numero OS</span>
                  <input
                    className="input"
                    type="text"
                    value={form.id}
                    onChange={onFieldChange('id')}
                    placeholder="Auto"
                  />
                </label>
                <label className="field">
                  <span>Data de Abertura</span>
                  <input
                    className="input"
                    type="date"
                    value={form.data}
                    onChange={onFieldChange('data')}
                  />
                </label>
                <label className="field">
                  <span>Data de Termino</span>
                  <input
                    className="input"
                    type="date"
                    value={form.dataTermino}
                    onChange={onFieldChange('dataTermino')}
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select className="input" value={form.status} onChange={onFieldChange('status')}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="field full">
                  <span>Nome do Cliente</span>
                  <input
                    id="input-nome-cliente"
                    className="input"
                    type="text"
                    value={form.cliente}
                    onChange={onFieldChange('cliente')}
                    placeholder="Nome do Cliente"
                    required
                  />
                </label>
                <label className="field">
                  <span>Celular</span>
                  <input
                    className="input"
                    type="text"
                    value={form.contato}
                    onChange={onFieldChange('contato')}
                    placeholder="(00) 90000-0000"
                  />
                </label>
                <label className="field">
                  <span>Recado</span>
                  <input
                    className="input"
                    type="text"
                    value={form.recado}
                    onChange={onFieldChange('recado')}
                    placeholder="Recado para o cliente"
                  />
                </label>
              </div>
              <div className="form-grid form-grid-tight">
                <label className="field">
                  <span>Marca</span>
                  <input
                    className="input"
                    type="text"
                    value={form.marca}
                    onChange={onFieldChange('marca')}
                    placeholder="Marca"
                  />
                </label>
                <label className="field">
                  <span>Modelo</span>
                  <input
                    className="input"
                    type="text"
                    value={form.modelo}
                    onChange={onFieldChange('modelo')}
                    placeholder="Modelo"
                  />
                </label>
                <label className="field full">
                  <span>Defeito Relatado</span>
                  <input
                    className="input"
                    type="text"
                    value={form.defeito}
                    onChange={onFieldChange('defeito')}
                    placeholder="Descreva o defeito"
                  />
                </label>
                <label className="field full">
                  <span>Servico</span>
                  <input
                    className="input"
                    type="text"
                    value={form.servico}
                    onChange={onFieldChange('servico')}
                    placeholder="Servico a realizar"
                  />
                </label>
                <label className="field">
                  <span>Valor</span>
                  <input
                    className="input"
                    type="text"
                    value={form.valor}
                    onChange={onFieldChange('valor')}
                    placeholder="R$ 0,00"
                  />
                </label>
                <label className="field">
                  <span>Pagamento</span>
                  <select className="input" value={form.pagamento} onChange={onFieldChange('pagamento')}>
                    <option>Pix</option>
                    <option>Debito</option>
                    <option>Credito</option>
                    <option>Dinheiro</option>
                    <option>Credito parcelado (com taxa)</option>
                  </select>
                </label>
              </div>
              <div className="pin-grid">
                <div className="pin-box">
                  <div className="pin-title">Senha / PIN</div>
                  <input
                    className="input"
                    type="text"
                    value={form.senha}
                    onChange={onFieldChange('senha')}
                    placeholder="Digite a senha/PIN"
                  />
                </div>
                <div className="pattern-box">
                  <div className="pattern-title">Padrao de Desbloqueio</div>
                  <div className="pattern-grid">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <button
                        type="button"
                        key={`pattern-${index + 1}`}
                        className={`pattern-dot ${form.padrao.includes(index + 1) ? 'active' : ''}`}
                        onClick={() => onPatternToggle(index + 1)}
                        aria-label={`Padrao ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">Check List Inicial</div>
            <div className="section-body checklist">
              {checklistItems.map((item, index) => {
                const entry = form.checklist[index] || { status: '', note: '' };
                return (
                  <div key={item} className="checklist-row checklist-row-advanced">
                    <div className="checklist-item">
                      <span className="checklist-index">{index + 1}.</span> {item}
                    </div>
                    <label className="checklist-choice">
                      <input
                        type="radio"
                        name={`check-${index}`}
                        value="ok"
                        checked={entry.status === 'ok'}
                        onChange={() => onChecklistStatusChange(index, 'ok')}
                      />
                      <span>Ok</span>
                    </label>
                    <label className="checklist-choice">
                      <input
                        type="radio"
                        name={`check-${index}`}
                        value="alerta"
                        checked={entry.status === 'alerta'}
                        onChange={() => onChecklistStatusChange(index, 'alerta')}
                      />
                      <span>Atencao</span>
                    </label>
                    <label className="checklist-choice">
                      <input
                        type="radio"
                        name={`check-${index}`}
                        value="nao"
                        checked={entry.status === 'nao'}
                        onChange={() => onChecklistStatusChange(index, 'nao')}
                      />
                      <span>Nao</span>
                    </label>
                    {shouldShowNote(entry, index) ? (
                      <input
                        className="input input-inline"
                        type="text"
                        value={entry.note}
                        onChange={(event) => onChecklistNoteChange(index, event.target.value)}
                        placeholder={notePlaceholder(index)}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <div className="section-header">Observacoes</div>
            <div className="section-body">
              <textarea
                className="input textarea"
                rows="4"
                value={form.obs}
                onChange={onFieldChange('obs')}
                placeholder="Digite observacoes aqui..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-accent" type="submit" disabled={saving}>
              {saving ? <span className="loader" /> : null}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button className="btn btn-muted" type="button" onClick={onBack}>Voltar</button>
            <button className="btn btn-outline" type="button" onClick={() => onPrint('a4')}>Imprimir A4</button>
            <button className="btn btn-outline" type="button" onClick={() => onPrint('thermal')}>Imprimir 58mm</button>
            <button className="btn btn-ghost" type="button" onClick={onResetChecklist}>Reiniciar Checklist</button>
            <button className="btn btn-ghost" type="button" onClick={onResetForm}>Limpar Formulario</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OsForm;


