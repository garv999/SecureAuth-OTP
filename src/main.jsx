import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { runHealthCheck } from './utils/healthCheck';
import { monitoring } from './utils/monitoring';

runHealthCheck();
monitoring.init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
