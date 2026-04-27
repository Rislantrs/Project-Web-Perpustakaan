import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tailwind.css';
import { supabase } from './services/supabase';
import { setupSecurityMonitoring } from './security/monitoring';

try {
  setupSecurityMonitoring(supabase);
} catch (err) {
  console.warn('Security monitoring dinonaktifkan sementara:', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
