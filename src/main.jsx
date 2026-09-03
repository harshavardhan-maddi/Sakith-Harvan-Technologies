import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './styles/index.css';
import { TaskProvider } from './lib/taskStore';

// Register PWA Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.warn('PWA ServiceWorker registration failed: ', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // In development, also register if supported
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
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
