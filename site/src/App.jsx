import { useEffect } from 'react';
import Builder from './components/Builder.jsx';
import Comparison from './components/Comparison.jsx';
import Header from './components/Header.jsx';
import Reference from './components/Reference.jsx';

export default function App() {
  // Links like "/#reference" can't scroll on load because React renders the sections afterwards
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, []);

  return (
    <div className="page">
      <Header />
      <main>
        <Builder />
        <Comparison />
        <Reference />
      </main>
      <footer className="footer">
        <p>
          MIT licensed · <a href="https://github.com/LukasReckwald/mmbadges">Source on GitHub</a>
        </p>
        <p>
          Brand icons by <a href="https://simpleicons.org">Simple Icons</a> (CC0). Brand names and logos are trademarks
          of their respective owners. Line icons by <a href="https://lucide.dev">Lucide</a> (ISC).
        </p>
      </footer>
    </div>
  );
}
