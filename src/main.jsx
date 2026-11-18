import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import './styles/global.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes every framer-motion animation honour prefers-reduced-motion */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);

// Tell the intro in index.html that the page is ready to be revealed.
requestAnimationFrame(() => {
  window.__appReady = true;
  window.dispatchEvent(new Event('app-ready'));
});
