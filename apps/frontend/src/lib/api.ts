// ✅ CORREÇÃO: Usa variável de ambiente, fallback para localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let token: string | null = null;

export const setToken = (t: string) => {
  token = t;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', t);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined' && !token) {
    token = localStorage.getItem('token');
  }
  return token;
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as any;

  const t = getToken();
  if (t) {
    headers['Authorization'] = `Bearer ${t}`;
  }

  // ✅ CORREÇÃO: Remove barra inicial se houver para evitar // duplo
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }

  // ✅ CORREÇÃO: Trata respostas vazias (alguns endpoints não retornam JSON)
  try {
    return await res.json();
  } catch {
    return null;
  }
}

