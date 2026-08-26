import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register PWA Service Worker if available
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        if (confirm('New version available. Reload to update?')) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }).catch((err) => {
    console.warn('PWA service worker register error:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
