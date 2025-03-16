import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../assets/css/reset.css';
import '../assets/css/properties.css';
import '../assets/css/layout.css';
import '../assets/css/links.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </StrictMode>
);
