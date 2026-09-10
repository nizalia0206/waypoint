import { useEffect, useRef, useState } from 'react';
import { initialsFor, paletteFor } from './avatarUtils';

const STARTERS = [
  'Could you review my resume?',
  'How did you get your first internship?',
  'What skills should I focus on?',
  'Can I ask you about your career path?',
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessagingDrawer({ alum, messages, onSend, onClose }) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text) => {
    const trimmed = (text ?? draft).trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  };

  return (
    <div className="sheet-overlay" onMouseDown={onClose}>
      <div className="sheet sheet-chat" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Message ${alum.name}`}>
        <div className="chat-header">
          <span className={`m-avatar m-avatar-${paletteFor(alum.id)}`}>{initialsFor(alum.name)}</span>
          <div>
            <div className="sheet-mentor-name">{alum.name}</div>
            <div className="sheet-mentor-role">{alum.major}, Class of {alum.gradYear}</div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="chat-body" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="chat-empty">Start the conversation — {alum.name.split(' ')[0]} usually replies quickly.</div>
          )}
          {messages.map((m) =>
            m.typing ? (
              <div className="chat-row mentor" key="typing">
                <div className="chat-bubble typing"><span /><span /><span /></div>
              </div>
            ) : (
              <div className={`chat-row ${m.from}`} key={m.id}>
                <div className="chat-bubble">{m.text}</div>
                <div className="chat-meta">
                  {formatTime(m.ts)}
                  {m.from === 'me' && <span className={`chat-tick ${m.status}`}>{m.status === 'read' ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            )
          )}
        </div>

        {messages.length === 0 && (
          <div className="chat-starters">
            {STARTERS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <input
            type="text"
            value={draft}
            placeholder={`Message ${alum.name.split(' ')[0]}…`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button className="chat-send-btn" onClick={() => send()} aria-label="Send message" disabled={!draft.trim()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 12L20 4L13 20L11 13L4 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
