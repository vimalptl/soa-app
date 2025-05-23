import React from 'react';
import { Card } from 'primereact/card';
import { Link } from 'react-router-dom';
import SeoVisualizer from '../components/SeoVisualizer';

export default function Home() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <Card title="Welcome to SEO Tag Visual Inspector" style={{ maxWidth: 500, width: '100%' }}>
        <p>This tool helps you analyze and visualize SEO meta tags and Content Security Policy of any public website.</p>
        <p>
          <Link to="/seo-visualizer" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>
            Go to SEO Tag Visualizer
          </Link>
        </p>
      </Card>
    </div>
  );
}
