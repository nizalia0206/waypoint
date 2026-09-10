import { useState } from 'react';
import { initialsFor, paletteFor } from './avatarUtils';

const DAYS = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'];
const TIMES = ['9:00 AM', '11:00 AM', '2:30 PM', '4:00 PM', '6:30 PM'];
const PURPOSES = ['Career conversation', 'Resume review', 'Mock interview', 'General advice'];
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';

export default function SchedulingModal({ alum, defaultPurpose, initialSlot, onClose, onConfirm }) {
  const [purpose, setPurpose] = useState(defaultPurpose || PURPOSES[0]);
  const [day, setDay] = useState(initialSlot?.day || DAYS[1]);
  const [time, setTime] = useState(initialSlot?.time || TIMES[3]);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm({ purpose, dateLabel: day, timeLabel: time });
    }, 550);
  };

  return (
    <div className="sheet-overlay" onMouseDown={onClose}>
      <div className="sheet sheet-schedule" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Schedule a call with ${alum.name}`}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>

        {!confirmed ? (
          <>
            <div className="sheet-mentor-head">
              <span className={`m-avatar m-avatar-${paletteFor(alum.id)}`}>{initialsFor(alum.name)}</span>
              <div>
                <div className="sheet-mentor-name">{alum.name}</div>
                <div className="sheet-mentor-role">{alum.major}, Class of {alum.gradYear}</div>
              </div>
            </div>

            <label className="sheet-label">Meeting purpose</label>
            <div className="chip-row">
              {PURPOSES.map((p) => (
                <button key={p} type="button" className={`chip${purpose === p ? ' active' : ''}`} onClick={() => setPurpose(p)}>
                  {p}
                </button>
              ))}
            </div>

            <label className="sheet-label">Date</label>
            <div className="chip-row">
              {DAYS.map((d) => (
                <button key={d} type="button" className={`chip${day === d ? ' active' : ''}`} onClick={() => setDay(d)}>
                  {d}
                </button>
              ))}
            </div>

            <label className="sheet-label">Available times</label>
            <div className="chip-row">
              {TIMES.map((tm) => (
                <button key={tm} type="button" className={`chip chip-time${time === tm ? ' active' : ''}`} onClick={() => setTime(tm)}>
                  {tm}
                </button>
              ))}
            </div>

            <div className="sheet-meta-row">
              <span><strong>Duration</strong> · 15 min</span>
              <span><strong>Timezone</strong> · {TIMEZONE}</span>
            </div>

            <button className="ask-btn primary sheet-confirm" onClick={handleConfirm}>
              Confirm · {day} · {time}
            </button>
          </>
        ) : (
          <div className="sheet-confirming">
            <div className="sheet-confirming-check">✓</div>
            <p>Booking your 15-minute chat with {alum.name.split(' ')[0]}…</p>
          </div>
        )}
      </div>
    </div>
  );
}
