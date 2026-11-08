import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './styles/index.css';
import { TaskProvider } from './lib/taskStore';

// Register PWA Service Worker only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.warn('PWA ServiceWorker registration failed: ', error);
      });
  });
} else if ('serviceWorker' in navigator && !import.meta.env.PROD) {
  // In development, unregister any active service worker so HMR and hot reloads are instant
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TaskProvider>
        <App />
      </TaskProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
