import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../context/SiteContext';

export default function TrailNotes({ toast, setNotesHelped }) {
  const { t } = useSite();
  const [notes, setNotes] = useState(t.notes.items);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [given, setGiven] = useState({});

  useEffect(() => {
    setNotes(t.notes.items);
    setGiven({});
  }, [t]);

  const filterKeys = ['all', 'First-gen', 'Disability', 'International'];

  const filtered = useMemo(() => {
    let list = notes;
    if (activeFilter !== 'all') list = list.filter(n => n.exp === activeFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(n => (n.topic + ' ' + n.text + ' ' + n.author + ' ' + (n.exp || '')).toLowerCase().includes(q));
    return list;
  }, [notes, search, activeFilter]);

  const markHelpful = (note) => {
    if (given[note.topic]) return;
    setNotes(prev => prev.map(n => n.topic === note.topic ? { ...n, helpful: n.helpful + 1 } : n));
    setGiven(prev => ({ ...prev, [note.topic]: true }));
    setNotesHelped((c) => c + 1);
    const authorFirstName = note.author.split(',')[0].split('،')[0].trim();
    toast(t.notes.pointsToAuthor(authorFirstName));
  };

  return (
    <section id="notes">
      <div className="wrap">
        <div className="section-head">
          <h2>{t.notes.head}</h2>
          <p>{t.notes.sub}</p>
        </div>
        <input
          type="text"
          placeholder={t.notes.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-notes-search"
        />
        <div className="tag-row" style={{ marginBottom: 40 }}>
          {filterKeys.map(f => (
            <button
              key={f}
              className={`tag-filter${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {t.notes.filters[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="results-empty">{t.notes.noMatch}</p>
        ) : (
          <div className="notes-card-grid">
            {filtered.map((n, i) => (
              <div className="note-card" key={n.topic}>
                <span className="note-card-num">NOTE {String(i + 1).padStart(2, '0')}</span>
                <h4 className="note-card-topic">{n.topic}</h4>
                <p className="note-card-text">&ldquo;{n.text}&rdquo;</p>
                <div className="note-card-footer">
                  <span className="note-card-author">— {n.author}</span>
                  {n.exp && <span className="note-card-tag">{t.notes.filters[n.exp]}</span>}
                </div>
                <button
                  className={`note-card-helpful-btn${given[n.topic] ? ' given' : ''}`}
                  onClick={() => markHelpful(n)}
                >
                  {t.notes.helpful(n.helpful)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
