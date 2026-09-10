import { useEffect, useState } from 'react';
import { initialsFor, paletteFor } from './avatarUtils';

function formatCountdown(ms) {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STATUS_COPY = {
  scheduled: 'Not started',
  soon: 'Starting soon',
  live: 'Live now',
  ended: 'Call window ended',
  completed: 'Completed',
};

export default function VideoCallPanel({ alum, call, onClose, onEnd, toast }) {
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = call.targetAt - now;
  const status = call.status;
  const canJoin = status === 'live';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${call.roomLink}`);
    } catch (e) { /* clipboard may be unavailable in this environment */ }
    setCopied(true);
    toast?.('Meeting link copied');
    setTimeout(() => setCopied(false), 1800);
  };

  const addToCalendar = () => {
    const start = new Date(call.targetAt);
    const end = new Date(call.targetAt + 15 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `UID:${call.id}@waypoint.app`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${call.purpose} with ${alum.name}`,
      `DESCRIPTION:Waypoint mentorship call. Join at https://${call.roomLink}`,
      `LOCATION:https://${call.roomLink}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waypoint-${alum.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.('Added to calendar');
  };

  return (
    <div className="sheet-overlay" onMouseDown={onClose}>
      <div className="sheet sheet-call" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Video call with ${alum.name}`}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>

        <div className="call-status-row">
          <span className={`call-status-dot call-status-${status}`} />
          <span className="call-status-text">{STATUS_COPY[status] || 'Scheduled'}</span>
        </div>

        <div className="sheet-mentor-head">
          <span className={`m-avatar m-avatar-${paletteFor(alum.id)} m-avatar-lg`}>{initialsFor(alum.name)}</span>
          <div>
            <div className="sheet-mentor-name">{call.purpose}</div>
            <div className="sheet-mentor-role">with {alum.name} · {call.dateLabel} · {call.timeLabel}</div>
          </div>
        </div>

        {!canJoin && status !== 'ended' && status !== 'completed' && (
          <div className="call-countdown">
            <span className="call-countdown-label">Starts in</span>
            <span className="call-countdown-num">{formatCountdown(remaining)}</span>
          </div>
        )}

        <div className="call-link-row">
          <span className="call-link">{call.roomLink}</span>
          <button className="ask-btn" onClick={copyLink}>{copied ? 'Copied ✓' : 'Copy link'}</button>
        </div>

        <button className={`call-join-btn${canJoin ? ' live' : ''}`} disabled={!canJoin} onClick={() => { toast?.('Joining call…'); }}>
          {canJoin ? 'Join call now' : status === 'ended' ? 'Window closed' : 'Join call'}
        </button>

        <div className="call-secondary-row">
          <button className="ask-btn" onClick={addToCalendar}>Add to calendar</button>
          {(canJoin || status === 'soon') && (
            <button className="ask-btn primary" onClick={onEnd}>Mark as completed</button>
          )}
        </div>
      </div>
    </div>
  );
}
