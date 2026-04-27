import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tailwind.css';
import { supabase } from './services/supabase';
import { setupSecurityMonitoring } from './security/monitoring';

setupSecurityMonitoring(supabase);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
