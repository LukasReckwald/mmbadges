import { useState } from 'react';
import { snippet } from '../lib/urls.js';

const FORMATS = {
  markdown: { title: 'Markdown', hint: 'One URL. Follows the viewer’s system theme.' },
  html: { title: 'HTML', hint: 'A <picture> with two URLs. Follows the GitHub theme setting exactly.' },
};

// The code to paste, a format switch and a copy button
export default function SnippetBar({ alt, urlFor, theme }) {
  const [format, setFormat] = useState('markdown');
  const [copied, setCopied] = useState(false);
  const code = snippet(format, alt, urlFor, theme);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure context) – the code stays selectable
    }
  }

  return (
    <div className="snippet">
      <div className="snippet-tabs" role="tablist" aria-label="Snippet format">
        {Object.entries(FORMATS).map(([key, f]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={format === key}
            className={format === key ? 'active' : ''}
            onClick={() => setFormat(key)}
          >
            {f.title}
          </button>
        ))}
        <span className="snippet-hint">{FORMATS[format].hint}</span>
      </div>
      <div className="snippet-code">
        <code>{code}</code>
        <button type="button" className="copy" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
