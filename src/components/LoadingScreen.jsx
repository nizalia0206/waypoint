import { useEffect, useState } from 'react';
import Mascot from './Mascot';
import { useSite } from '../context/SiteContext';

export default function LoadingScreen({ fadeOut }) {
  const { t } = useSite();
  const words = t.loading.flipWords;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 650);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`} role="status" aria-live="polite">
      <div className="loading-ticker-wrap">
        <span key={wordIndex} className="loading-ticker-word">{words[wordIndex]}</span>
      </div>
      <div className="loading-screen-mascot">
        <Mascot className="loading-screen-img" alt={t.loading.brand} />
      </div>
      <div className="loading-screen-text">{t.loading.text}</div>
    </div>
  );
}
