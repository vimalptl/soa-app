import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SeoVisualizer from './components/SeoVisualizer';
import App from './App';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './styles.css';

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/seo-visualizer" element={<SeoVisualizer />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Root />);
