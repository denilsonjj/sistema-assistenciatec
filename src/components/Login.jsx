import { useState } from 'react';
import Notice from './Notice';

function Login({ onSubmit, loading, notice }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div>
            <div className="login-title">Sistema de Assistencia</div>
            <div className="login-subtitle">Acesse com suas credenciais</div>
          </div>
        </div>

        <Notice notice={notice} />

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            Usuario
            <input
              className="input"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Seu usuario"
              required
            />
          </label>
          <label className="field">
            Senha
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
            />
          </label>
          <button className="btn btn-accent" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
