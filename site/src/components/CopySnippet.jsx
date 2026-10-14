import { useState } from 'react';
import Segmented from './Segmented.jsx';
import { snippet } from '../lib/urls.js';

const HINTS = {
  markdown: 'One URL. Follows the viewer’s system theme.',
  html: 'Two URLs in a <picture>. Follows the GitHub theme setting exactly.',
};

// Format toggle + code block + copy button for one badge
export default function CopySnippet({ alt, urlFor, theme }) {
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
      <div className="snippet-head">
        <Segmented label="Format" value={format} options={['markdown', 'html']} onChange={setFormat} />
        <button type="button" className="copy" onClick={copy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      <p className="hint">{HINTS[format]}</p>
    </div>
  );
}
