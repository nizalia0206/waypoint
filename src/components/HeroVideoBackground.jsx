import { useEffect, useRef, useState } from 'react';

const CLIPS = ['/videos/hero-1.mp4', '/videos/hero-2.mp4', '/videos/hero-3.mp4', '/videos/hero-4.mp4'];

export default function HeroVideoBackground() {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef([]);

  const goNext = () => setIndex((i) => (i + 1) % CLIPS.length);
  const nextIndex = (index + 1) % CLIPS.length;

  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === index) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [index]);

  return (
    <div className="hero-video-bg" aria-hidden="true">
      {CLIPS.map((src, i) => {
        const isActive = i === index;
        const isUpNext = i === nextIndex;
        // Efficiency: only the clip actually playing buffers fully ("auto").
        // The one queued to play next just fetches its metadata ("metadata")
        // so the handoff is instant without downloading the whole file early.
        // Everything else stays untouched ("none") until its turn comes.
        const preload = isActive ? 'auto' : isUpNext ? 'metadata' : 'none';
        return (
          <video
            key={src}
            ref={(el) => { videoRefs.current[i] = el; }}
            className={isActive ? 'active' : ''}
            src={src}
            muted
            playsInline
            preload={preload}
            poster={i === 0 ? '/videos/hero-poster.jpg' : undefined}
            onEnded={goNext}
          />
        );
      })}
      <div className="hero-scrim" />
      <button className="hero-video-next" onClick={goNext} aria-label="Next background clip" title="Next clip">
        <span className="hero-video-next-ring" />
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
