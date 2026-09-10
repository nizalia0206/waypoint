import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const USERS_KEY = 'waypoint_users_v1';
const SESSION_KEY = 'waypoint_session_v1';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  const persistSession = useCallback((u) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  }, []);

  const signUp = useCallback((payload) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, error: 'exists' };
    }
    const newUser = { ...payload };
    users.push(newUser);
    saveUsers(users);
    persistSession(newUser);
    return { ok: true, user: newUser };
  }, [persistSession]);

  const signIn = useCallback(({ email, password }) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: 'invalid' };
    persistSession(found);
    return { ok: true, user: found };
  }, [persistSession]);

  const signOut = useCallback(() => persistSession(null), [persistSession]);

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
