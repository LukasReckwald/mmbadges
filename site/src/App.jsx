import { useEffect } from 'react';
import BrandGallery from './components/BrandGallery.jsx';
import Hero from './components/Hero.jsx';
import StatusBuilder from './components/StatusBuilder.jsx';

export default function App() {
  // Links like "/#status" can't scroll on load because React renders the sections afterwards
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, []);

  return (
    <>
      <main className="container">
        <Hero />
        <BrandGallery />
        <StatusBuilder />
      </main>
      <footer className="container footer">
        <p>
          Open source under the MIT license · <a href="https://github.com/LukasReckwald/mmbadges">GitHub</a>
        </p>
        <p className="muted">
          Brand icons by <a href="https://simpleicons.org">Simple Icons</a> (CC0). Brand names and logos are trademarks
          of their respective owners. Line icons by <a href="https://lucide.dev">Lucide</a> (ISC).
        </p>
      </footer>
    </>
  );
}
