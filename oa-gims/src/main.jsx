import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Shell from './components/Shell';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import './index.css';

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Overview</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="mt-2 text-sm text-white/55">Your OA-GIMS workspace is ready.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Members', '1,250+', 'Organization directory'],
          ['Active loans', '183', 'Currently being serviced'],
          ['CSR projects', '86', 'Community initiatives'],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-2xl glass p-5">
            <p className="text-xs uppercase tracking-widest text-white/45">{label}</p>
            <p className="mt-3 font-display text-3xl font-bold text-gold-200">{value}</p>
            <p className="mt-1 text-xs text-white/45">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Shell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
