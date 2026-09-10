import { useState } from 'react';
import { ALUMNI } from '../../data/alumni';
import { useMentorRelationships } from '../../context/MentorRelationshipsContext';
import MentorCard from './MentorCard';

const FILTERS = ['All', 'Connected', 'Saved'];

export default function MentorDirectory({ toast }) {
  const [filter, setFilter] = useState('All');
  const { getRelationship } = useMentorRelationships();

  const visible = ALUMNI.filter((alum) => {
    const rel = getRelationship(alum.id);
    if (filter === 'Connected') return rel.connected;
    if (filter === 'Saved') return rel.bookmarked;
    return true;
  });

  return (
    <section id="mentors">
      <div className="wrap">
        <div className="section-head">
          <h2>Every waypoint is a person</h2>
          <p>Browse alumni from your school, see what you can do with each one, and pick up the conversation exactly where you left it.</p>
        </div>

        <div className="m-filter-row">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`tag${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="results-empty">Nothing here yet — {filter === 'Saved' ? 'save a mentor to find them here.' : 'connect with a mentor to find them here.'}</p>
        ) : (
          <div className="m-grid">
            {visible.map((alum) => (
              <MentorCard key={alum.id} alum={alum} toast={toast} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
