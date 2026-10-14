import { useEffect } from 'react';
import Builder from './components/Builder.jsx';
import Compare from './components/Compare.jsx';
import Features from './components/Features.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Usage from './components/Usage.jsx';

export default function App() {
  // Links like "/#usage" can't scroll on load because React renders the sections afterwards
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, []);

  return (
    <div className="page">
      <Header />
      <main>
        <Hero />
        <Builder />
        <Compare />
        <Features />
        <Usage />
      </main>
      <footer className="footer">
        <p>
          Open source under the MIT license · <a href="https://github.com/LukasReckwald/mmbadges">GitHub</a>
        </p>
        <p>
          Brand icons by <a href="https://simpleicons.org">Simple Icons</a> (CC0). Brand names and logos are trademarks
          of their respective owners. Line icons by <a href="https://lucide.dev">Lucide</a> (ISC).
        </p>
      </footer>
    </div>
  );
}
