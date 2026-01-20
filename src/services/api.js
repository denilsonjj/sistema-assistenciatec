const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_STORAGE_KEY = 'dtech_token';

function ensureApiUrl() {
  if (!API_URL) {
    throw new Error('VITE_API_URL nao configurada');
  }
  return API_URL;
}

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setStoredToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function buildApiUrl(withToken) {
  const url = new URL(ensureApiUrl());
  if (withToken) {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Token nao encontrado.');
    }
    url.searchParams.set('token', token);
  }
  return url.toString();
}

export async function login({ username, password }) {
  const url = buildApiUrl(false);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'login',
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao autenticar: ${response.status}`);
  }

  const data = await response.json();
  if (data && data.ok === false) {
    throw new Error(data.message || 'Login invalido.');
  }
  return data;
}

export async function fetchOrders() {
  const url = buildApiUrl(true);
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar OS: ${response.status}`);
  }

  const data = await response.json();
  if (data && data.ok === false) {
    throw new Error(data.message || 'Token invalido.');
  }
  return data;
}

export async function saveOrder(payload) {
  const url = buildApiUrl(true);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar OS: ${response.status}`);
  }

  const data = await response.json();
  if (data && data.ok === false) {
    throw new Error(data.message || 'Token invalido.');
  }
  return data;
}
