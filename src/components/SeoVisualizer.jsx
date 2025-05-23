import React from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { load } from 'cheerio';

const SEO_TAGS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Meta Description' },
  { key: 'robots', label: 'Meta Robots' },
  { key: 'og:title', label: 'Open Graph Title' },
  { key: 'og:description', label: 'Open Graph Description' },
  { key: 'twitter:card', label: 'Twitter Card' },
];

function getColor(score) {
  if (score > 80) return 'var(--green-500)';
  if (score > 50) return 'var(--yellow-500)';
  return 'var(--red-500)';
}

const fetchHTML = async (url) => {
  try {
    const res = await fetch(`http://localhost:4000/api/fetch?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

const analyzeSEO = ($) => {
  const results = {};
  results.title = $('title').text();
  results.description = $('meta[name="description"]').attr('content') || '';
  results.robots = $('meta[name="robots"]').attr('content') || '';
  results['og:title'] = $('meta[property="og:title"]').attr('content') || '';
  results['og:description'] = $('meta[property="og:description"]').attr('content') || '';
  results['twitter:card'] = $('meta[name="twitter:card"]').attr('content') || '';
  // Try to get CSP from meta tag
  results['csp'] = $('meta[http-equiv="Content-Security-Policy"]').attr('content') || '';
  // Try to get CSP from HTTP headers (if available in the fetched data)
  // Note: allorigins API does not expose headers, so this is a limitation for client-side only
  // If you want to support real HTTP headers, you need a custom backend proxy
  return results;
};

const calcScore = (results) => {
  let score = 0;
  if (results.title) score += 20;
  if (results.description) score += 20;
  if (results.robots) score += 10;
  if (results['og:title']) score += 15;
  if (results['og:description']) score += 15;
  if (results['twitter:card']) score += 20;
  return score;
};

export default function SeoVisualizer() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const [error, setError] = React.useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    setScore(0);
    const data = await fetchHTML(url);
    if (!data || !data.html) {
      setError('Failed to fetch or parse the site. Make sure the backend proxy (node server.js) is running.');
      setLoading(false);
      return;
    }
    const $ = load(data.html);
    const seoResults = analyzeSEO($);
    seoResults.csp = data.csp || seoResults.csp; // Prefer header CSP if available
    const seoScore = calcScore(seoResults);
    setResults(seoResults);
    setScore(seoScore);
    setLoading(false);
  };

  return (
    <div className="p-m-4" style={{ maxWidth: 900, margin: 'auto', width: '70%' }}>
      <h2>SEO Tag Visual Inspector</h2>
      <div className="p-inputgroup" style={{ marginBottom: 16 }}>
        <InputText
          placeholder="Enter website URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ width: '100%' }}
        />
        <Button label="Analyze" icon="pi pi-search" onClick={handleAnalyze} loading={loading} disabled={!url} />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Card title="SEO Analysis">
              <div style={{ marginBottom: 12 }}>
                <b>SEO Health Score:</b>
                <ProgressBar value={score} showValue style={{ background: getColor(score) }} />
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {SEO_TAGS.map(tag => (
                  <li key={tag.key} style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 500 }}>{tag.label}:</span>
                    <span style={{ marginLeft: 8, color: results[tag.key] ? 'var(--green-700)' : 'var(--red-700)' }}>
                      {results[tag.key] ? results[tag.key] : 'Missing'}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            {results.csp ? (
              <Card title="Content Security Policy">
                <div style={{ fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {results.csp}
                </div>
              </Card>
            ) : (
              <Card title="Content Security Policy">
                <div style={{ color: 'var(--red-700)' }}>
                  No Content Security Policy (CSP) meta tag found in the site header.
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
      {/* Preview cards for Google, Facebook, Twitter */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Google Preview */}
          <Card title="Google Search Preview">
            <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 4 }}>
              {results.title || 'Page Title'}
            </div>
            <div style={{ color: '#006621', fontSize: 14, marginBottom: 2 }}>
              {url.replace(/^https?:\/\//, '')}
            </div>
            <div style={{ color: '#545454', fontSize: 14 }}>
              {results.description || 'Meta description will appear here.'}
            </div>
          </Card>
          {/* Facebook Preview */}
          <Card title="Facebook Link Preview">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 60, height: 60, background: '#eee', borderRadius: 8 }} />
              <div>
                <div style={{ color: '#1877f2', fontWeight: 600, fontSize: 16 }}>
                  {results['og:title'] || results.title || 'Open Graph Title'}
                </div>
                <div style={{ color: '#050505', fontSize: 14 }}>
                  {results['og:description'] || results.description || 'Open Graph description will appear here.'}
                </div>
                <div style={{ color: '#65676b', fontSize: 12, marginTop: 4 }}>
                  {url.replace(/^https?:\/\//, '')}
                </div>
              </div>
            </div>
          </Card>
          {/* Twitter Preview */}
          <Card title="Twitter Card Preview">
            <div style={{ border: '1px solid #e1e8ed', borderRadius: 8, padding: 12, background: '#f7f9fa' }}>
              <div style={{ color: '#1da1f2', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                {results['og:title'] || results.title || 'Twitter Card Title'}
              </div>
              <div style={{ color: '#14171a', fontSize: 14, marginBottom: 4 }}>
                {results['og:description'] || results.description || 'Twitter card description will appear here.'}
              </div>
              <div style={{ color: '#657786', fontSize: 12 }}>
                {url.replace(/^https?:\/\//, '')}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
