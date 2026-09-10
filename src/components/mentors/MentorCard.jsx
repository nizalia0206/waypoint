import { useEffect, useState } from 'react';
import { useMentorRelationships } from '../../context/MentorRelationshipsContext';
import { initialsFor, paletteFor } from './avatarUtils';
import SchedulingModal from './SchedulingModal';
import VideoCallPanel from './VideoCallPanel';
import MessagingDrawer from './MessagingDrawer';

const AVAILABILITY = [
  { day: 'Tomorrow', time: '4:00 PM' },
  { day: 'Wed', time: '11:00 AM' },
  { day: 'Thu', time: '6:30 PM' },
];

function deriveStatus(rel) {
  if (rel.call) {
    if (rel.call.status === 'completed') return 'completed';
    if (rel.call.status === 'live') return 'live';
    if (rel.call.status === 'soon') return 'soon';
    return 'scheduled';
  }
  if (rel.followUpRequested) return 'follow-up';
  if (rel.connected) return 'connected';
  return 'none';
}

const STATUS_LABEL = {
  none: 'Not connected',
  connected: 'Connected',
  scheduled: 'Call scheduled',
  soon: 'Call starting soon',
  live: 'Call is live',
  completed: 'Conversation completed',
  'follow-up': 'Follow-up requested',
};

export default function MentorCard({ alum, matchReason, icebreaker, toast, defaultExpanded = false, children }) {
  const {
    getRelationship, connect, toggleBookmark, scheduleCall, rescheduleCall,
    cancelCall, completeCall, requestFollowUp, openThread, sendMessage,
  } = useMentorRelationships();

  const rel = getRelationship(alum.id);
  const status = deriveStatus(rel);

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [availOpen, setAvailOpen] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [prefillSlot, setPrefillSlot] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (status === 'completed' && !justCompleted) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 2600);
      return () => clearTimeout(t);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = () => {
    connect(alum);
    toast?.(`Connected with ${alum.name.split(' ')[0]}`);
  };

  const openSchedule = (slot) => {
    setPrefillSlot(slot || null);
    setAvailOpen(false);
    setSchedOpen(true);
  };

  const openReschedule = () => {
    setRescheduling(true);
    setSchedOpen(true);
  };

  const handleScheduleConfirm = (details) => {
    if (rescheduling) {
      rescheduleCall(alum, details);
      toast?.('Call rescheduled');
    } else {
      scheduleCall(alum, details);
      toast?.('+40 Trail Points · Call booked');
    }
    setSchedOpen(false);
    setRescheduling(false);
  };

  const handleOpenChat = () => {
    openThread(alum);
    setChatOpen(true);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleBookmark(alum);
  };

  return (
    <div className={`m-card m-card-${status}${justCompleted ? ' m-card-flash' : ''}`}>
      <div className="m-card-accent" aria-hidden="true" />

      <button
        type="button"
        className={`m-bookmark${rel.bookmarked ? ' saved' : ''}`}
        onClick={handleBookmark}
        aria-pressed={rel.bookmarked}
        aria-label={rel.bookmarked ? 'Remove bookmark' : 'Save mentor'}
        title={rel.bookmarked ? 'Saved' : 'Save mentor'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill={rel.bookmarked ? 'currentColor' : 'none'}>
          <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="m-card-head">
        <span className={`m-avatar m-avatar-${paletteFor(alum.id)}`}>
          {initialsFor(alum.name)}
          {(status === 'soon' || status === 'live') && <span className="m-avatar-pulse" />}
        </span>
        <div className="m-card-headtext">
          <div className="m-card-name">{alum.name}</div>
          <div className="m-card-role">{alum.major}, Class of {alum.gradYear}</div>
        </div>
        <span className={`m-status-pill m-status-${status}`}>{STATUS_LABEL[status]}</span>
      </div>

      {matchReason && <p className="mentor-reason">{matchReason}</p>}
      {children}

      {rel.unreadMessages > 0 && (
        <button className="m-unread-chip" onClick={handleOpenChat}>
          {rel.unreadMessages} new {rel.unreadMessages === 1 ? 'reply' : 'replies'} from {alum.name.split(' ')[0]}
        </button>
      )}

      {/* UPCOMING CALL STATE */}
      {rel.call && rel.call.status !== 'completed' ? (
        <div className="m-upcoming">
          <span className="eyebrow">Upcoming</span>
          <div className="m-upcoming-purpose">{rel.call.purpose}</div>
          <div className="m-upcoming-when">{rel.call.dateLabel} · {rel.call.timeLabel} · {rel.call.duration} min</div>
          <div className="m-card-actions">
            <button className={`ask-btn primary${status === 'live' ? ' pulse' : ''}`} onClick={() => setCallOpen(true)}>
              Join call
            </button>
            <button className="ask-btn" onClick={openReschedule}>Reschedule</button>
            <button className="ask-btn" onClick={() => { cancelCall(alum); toast?.('Call cancelled'); }}>Cancel</button>
          </div>
        </div>
      ) : status === 'completed' ? (
        <div className="m-completed">
          <span className="m-completed-check">✓ New waypoint added to your route</span>
          <div className="m-card-actions">
            <button className="ask-btn" onClick={handleOpenChat}>Message</button>
            <button className="ask-btn primary" onClick={() => { requestFollowUp(alum); toast?.('Follow-up requested'); }}>
              Request follow-up
            </button>
          </div>
        </div>
      ) : status === 'follow-up' ? (
        <div className="m-card-actions">
          <button className="ask-btn" onClick={handleOpenChat}>Message</button>
          <button className="ask-btn primary" onClick={() => openSchedule()}>Schedule a 15-min call</button>
        </div>
      ) : status === 'connected' ? (
        <>
          <div className="m-card-actions">
            <button className="ask-btn primary" onClick={() => openSchedule()}>Schedule a 15-min call</button>
            <button className="ask-btn" onClick={handleOpenChat}>Message</button>
            <button className="ask-btn" onClick={() => setAvailOpen((o) => !o)} aria-expanded={availOpen}>
              See availability
            </button>
          </div>
          {availOpen && (
            <div className="m-availability">
              {AVAILABILITY.map((slot) => (
                <button key={slot.day + slot.time} className="m-avail-slot" onClick={() => openSchedule(slot)}>
                  <span>{slot.day}</span><span>{slot.time}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="m-card-actions">
          <button className="ask-btn primary" onClick={handleConnect}>Connect</button>
          <button className="ask-btn" onClick={() => setExpanded((o) => !o)} aria-expanded={expanded}>
            View profile
          </button>
        </div>
      )}

      {expanded && status === 'none' && (
        <div className="m-profile-panel">
          <span className="eyebrow" style={{ marginBottom: 10, display: 'block' }}>Their route</span>
          <div className="m-profile-path">
            {alum.path.map((step, i) => (
              <div className="m-profile-step" key={i}>
                <span className="mile">MILE {i + 1}</span>{step}
              </div>
            ))}
          </div>
          {icebreaker && (
            <div className="panel" style={{ marginTop: 14 }}>
              <span className="label">Suggested opener</span>
              <div className="text">{icebreaker}</div>
            </div>
          )}
        </div>
      )}

      {schedOpen && (
        <SchedulingModal
          alum={alum}
          defaultPurpose={rescheduling ? rel.call?.purpose : undefined}
          initialSlot={prefillSlot}
          onClose={() => { setSchedOpen(false); setRescheduling(false); }}
          onConfirm={handleScheduleConfirm}
        />
      )}

      {callOpen && rel.call && (
        <VideoCallPanel
          alum={alum}
          call={rel.call}
          toast={toast}
          onClose={() => setCallOpen(false)}
          onEnd={() => { completeCall(alum); setCallOpen(false); toast?.('Marked as completed'); }}
        />
      )}

      {chatOpen && (
        <MessagingDrawer
          alum={alum}
          messages={rel.messages}
          onSend={(text) => sendMessage(alum, text)}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
