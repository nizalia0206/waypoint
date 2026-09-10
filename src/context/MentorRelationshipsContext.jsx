import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ALUMNI } from '../data/alumni';

const MentorRelationshipsContext = createContext(null);

// Canned mentor replies keyed by a rough intent guess, so the messaging
// drawer feels responsive without a real backend. Falls back to a warm
// generic reply when nothing matches.
const REPLY_BANK = [
  { match: /resume|cv/i, reply: "Happy to take a look — send it over whenever, I'll leave comments by the weekend." },
  { match: /intern/i, reply: "Honestly, most of it was cold-emailing alumni like you're doing right now. Persistence beat pedigree for me." },
  { match: /skill/i, reply: "Depends on where you want to land, but being able to explain your work simply mattered more than any one tool." },
  { match: /career|path/i, reply: "It wasn't a straight line at all — happy to walk you through the messy middle part on our call." },
];

function guessReply(text) {
  const hit = REPLY_BANK.find((r) => r.match.test(text));
  return hit ? hit.reply : "Thanks for reaching out — this is exactly the kind of question I wish I'd asked someone. Let's dig in on our call.";
}

const uid = () => Math.random().toString(36).slice(2, 10);

function emptyRelationship() {
  return {
    connected: false,
    bookmarked: false,
    call: null, // { id, purpose, dateLabel, timeLabel, duration, roomLink, targetAt, status, wasRescheduled }
    followUpRequested: false,
    messages: [],
    unreadMessages: 0,
  };
}

export function MentorRelationshipsProvider({ children }) {
  const [relationships, setRelationships] = useState(() =>
    Object.fromEntries(ALUMNI.map((a) => [a.id, emptyRelationship()]))
  );
  const [notifications, setNotifications] = useState([]);
  const tickRef = useRef(null);

  const getRelationship = useCallback((id) => relationships[id] || emptyRelationship(), [relationships]);

  const patch = useCallback((id, fn) => {
    setRelationships((prev) => ({ ...prev, [id]: fn(prev[id] || emptyRelationship()) }));
  }, []);

  const addNotification = useCallback((type, text, mentorId) => {
    setNotifications((prev) => [
      { id: uid(), type, text, mentorId, ts: Date.now(), read: false },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const connect = useCallback((alum) => {
    patch(alum.id, (r) => ({ ...r, connected: true }));
    addNotification('connection', `You connected with ${alum.name}.`, alum.id);
  }, [patch, addNotification]);

  const toggleBookmark = useCallback((alum) => {
    patch(alum.id, (r) => ({ ...r, bookmarked: !r.bookmarked }));
  }, [patch]);

  // Scheduling offsets are deliberately short so the "starting soon" → "live"
  // → "join" states are actually observable in a demo, while the label shown
  // to the user stays a realistic-looking future date/time.
  const scheduleCall = useCallback((alum, { purpose, dateLabel, timeLabel, secondsUntil = 90 }) => {
    const room = `meet.waypoint.app/${alum.name.toLowerCase().replace(/[^a-z]+/g, '-')}-${uid().slice(0, 5)}`;
    const call = {
      id: uid(),
      purpose,
      dateLabel,
      timeLabel,
      duration: 15,
      roomLink: room,
      targetAt: Date.now() + secondsUntil * 1000,
      status: 'scheduled',
      wasRescheduled: false,
    };
    patch(alum.id, (r) => ({ ...r, connected: true, call, followUpRequested: false }));
    addNotification('booking', `Your mentorship session with ${alum.name} has been confirmed.`, alum.id);
    return call;
  }, [patch, addNotification]);

  const rescheduleCall = useCallback((alum, { dateLabel, timeLabel, secondsUntil = 90 }) => {
    patch(alum.id, (r) => {
      if (!r.call) return r;
      return {
        ...r,
        call: {
          ...r.call,
          dateLabel,
          timeLabel,
          targetAt: Date.now() + secondsUntil * 1000,
          status: 'scheduled',
          wasRescheduled: true,
        },
      };
    });
    addNotification('booking', `Your call with ${alum.name} was rescheduled to ${dateLabel} · ${timeLabel}.`, alum.id);
  }, [patch, addNotification]);

  const cancelCall = useCallback((alum) => {
    patch(alum.id, (r) => ({ ...r, call: null }));
    addNotification('booking', `Your call with ${alum.name} was cancelled.`, alum.id);
  }, [patch, addNotification]);

  const setCallStatus = useCallback((alum, status) => {
    patch(alum.id, (r) => (r.call ? { ...r, call: { ...r.call, status } } : r));
  }, [patch]);

  const completeCall = useCallback((alum) => {
    patch(alum.id, (r) => (r.call ? { ...r, call: { ...r.call, status: 'completed' } } : r));
    addNotification('milestone', `Conversation with ${alum.name} completed — you unlocked a new waypoint.`, alum.id);
  }, [patch, addNotification]);

  const requestFollowUp = useCallback((alum) => {
    patch(alum.id, (r) => ({ ...r, followUpRequested: true, call: null }));
    addNotification('message', `Follow-up requested with ${alum.name}.`, alum.id);
  }, [patch, addNotification]);

  const openThread = useCallback((alum) => {
    patch(alum.id, (r) => ({ ...r, unreadMessages: 0 }));
  }, [patch]);

  const sendMessage = useCallback((alum, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const myMsg = { id: uid(), from: 'me', text: trimmed, ts: Date.now(), status: 'sent' };
    patch(alum.id, (r) => ({ ...r, connected: true, messages: [...r.messages, myMsg] }));

    setTimeout(() => {
      patch(alum.id, (r) => ({
        ...r,
        messages: r.messages.map((m) => (m.id === myMsg.id ? { ...m, status: 'read' } : m)),
      }));
    }, 500);

    const typingId = 'typing-' + myMsg.id;
    setTimeout(() => {
      patch(alum.id, (r) => ({ ...r, messages: [...r.messages, { id: typingId, from: 'mentor', typing: true, ts: Date.now() }] }));
    }, 1000);

    setTimeout(() => {
      const reply = { id: uid(), from: 'mentor', text: guessReply(trimmed), ts: Date.now() };
      patch(alum.id, (r) => ({
        ...r,
        messages: [...r.messages.filter((m) => m.id !== typingId), reply],
        unreadMessages: (r.unreadMessages || 0) + 1,
      }));
      addNotification('message', `${alum.name} replied to your message.`, alum.id);
    }, 2300);
  }, [patch, addNotification]);

  // Single ticking clock (1s) drives every call's live status transitions —
  // scheduled → starting soon (≤60s out) → live (0 to +15min) → past.
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const now = Date.now();
      setRelationships((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, r] of Object.entries(prev)) {
          if (!r.call || r.call.status === 'completed') continue;
          const remaining = r.call.targetAt - now;
          let status = r.call.status;
          if (remaining <= -15 * 60 * 1000) status = 'ended';
          else if (remaining <= 0) status = 'live';
          else if (remaining <= 60 * 1000) status = 'soon';
          else status = 'scheduled';
          if (status !== r.call.status) {
            changed = true;
            next[id] = { ...r, call: { ...r.call, status } };
            if (status === 'soon') {
              const alum = ALUMNI.find((a) => String(a.id) === String(id));
              if (alum) addNotification('reminder', `Your scheduled conversation with ${alum.name} starts soon.`, alum.id);
            }
            if (status === 'live') {
              const alum = ALUMNI.find((a) => String(a.id) === String(id));
              if (alum) addNotification('call', `Your mentorship call with ${alum.name.split(' ')[0]} is starting now.`, alum.id);
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    relationships,
    getRelationship,
    connect,
    toggleBookmark,
    scheduleCall,
    rescheduleCall,
    cancelCall,
    setCallStatus,
    completeCall,
    requestFollowUp,
    openThread,
    sendMessage,
    notifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return (
    <MentorRelationshipsContext.Provider value={value}>
      {children}
    </MentorRelationshipsContext.Provider>
  );
}

export function useMentorRelationships() {
  const ctx = useContext(MentorRelationshipsContext);
  if (!ctx) throw new Error('useMentorRelationships must be used within MentorRelationshipsProvider');
  return ctx;
}
