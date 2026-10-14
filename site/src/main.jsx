import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted via npm instead of Google Fonts: no visitor IPs go to a third party (GDPR)
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
