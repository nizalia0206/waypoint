import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../data/requestsStore';
import { usePoints } from '../hooks/usePoints';
import TraceJourney from '../components/TraceJourney';
import MentorMatch from '../components/MentorMatch';
import TrailNotes from '../components/TrailNotes';
import Rewards from '../components/Rewards';
import TrailDivider from '../components/TrailDivider';

export default function FeaturesPage({ toast }) {
  const { t } = useSite();
  const { user } = useAuth();
  const [goal, setGoal] = useState('Product management at a tech startup');
  const [points, setPoints] = usePoints();
  const [callsScheduled, setCallsScheduled] = useState(0);
  const [milestonesCompleted, setMilestonesCompleted] = useState(0);
  const [notesHelped, setNotesHelped] = useState(0);
  const [msgRefresh, setMsgRefresh] = useState(0);
  const [mySentRequestIds, setMySentRequestIds] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const myMessages = useMemo(() => {
    const requests = getRequests();
    if (user && user.role === 'student') {
      return requests.filter((r) => r.studentName === user.name);
    }
    // Guests aren't identifiable by name, so track exactly which requests
    // *this browser tab* created this session instead of matching on the
    // generic "A student (guest)" label (which every guest shares).
    return requests.filter((r) => mySentRequestIds.includes(r.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgRefresh, user, mySentRequestIds]);

  // Keep "Your Messages" live: a mentor reply or a thank-you can land while
  // the student is already sitting on this page, not just on next visit.
  useEffect(() => {
    const onUpdate = () => setMsgRefresh((n) => n + 1);
    window.addEventListener('waypoint-requests-updated', onUpdate);
    return () => window.removeEventListener('waypoint-requests-updated', onUpdate);
  }, []);

  // Arrived here carrying a goal typed on the home page, and/or a section to
  // scroll straight to (from a nav click made elsewhere). Keyed on
  // location.state itself (not just mount) so clicking something like
  // "View all" while already on this page still re-triggers the scroll.
  useEffect(() => {
    const state = location.state || {};
    if (state.goal) setGoal(state.goal);
    if (state.scrollTo) {
      const timer = setTimeout(() => {
        document.getElementById(state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
        // Clear the state only *after* the scroll fires — clearing it up
        // front re-triggers this same effect (new location.state), and its
        // cleanup would cancel this very timer before it ever runs.
        navigate('.', { replace: true, state: {} });
      }, 60);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <>
      <section style={{ paddingBottom: 8 }}>
        <div className="wrap section-head">
          <span className="eyebrow-page">{t.features.tag}</span>
          <h2 style={{ marginTop: 10 }}>{t.features.head}</h2>
          <p>{t.features.sub}</p>
        </div>
      </section>
      <TraceJourney />
      <TrailDivider />
      <MentorMatch
        goal={goal} setGoal={setGoal} toast={toast}
        points={points} setPoints={setPoints}
        setCallsScheduled={setCallsScheduled}
        setMilestonesCompleted={setMilestonesCompleted}
        onRequestSent={(id) => { setMsgRefresh((n) => n + 1); if (id) setMySentRequestIds((prev) => (prev.includes(id) ? prev : [...prev, id])); }}
      />
      {myMessages.length > 0 && (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 620 }}>
            <span className="eyebrow">{t.match.yourMessagesTitle}</span>
            <div className="your-messages-list">
              {myMessages.map((r) => (
                <div className="your-message-item" key={r.id}>
                  <div className="your-message-to">{r.mentorName} · {t.match.ask[r.askType] || r.askType}</div>
                  {r.message && <p className="your-message-text">&ldquo;{r.message}&rdquo;</p>}
                  {r.reply ? (
                    <p className="your-message-reply">{t.match.replyFrom(r.mentorName.split(' ')[0])} &ldquo;{r.reply}&rdquo;</p>
                  ) : (
                    <p className="your-message-waiting">{t.match.awaitingReply(r.mentorName.split(' ')[0])}</p>
                  )}
                  {r.thankYouSentAt && <p className="your-message-thanked">{t.match.thankYouLoggedNote}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <TrailDivider />
      <TrailNotes toast={toast} setNotesHelped={setNotesHelped} />
      <TrailDivider />
      <Rewards
        toast={toast} points={points} setPoints={setPoints}
        callsScheduled={callsScheduled} milestonesCompleted={milestonesCompleted} notesHelped={notesHelped}
      />
    </>
  );
}
