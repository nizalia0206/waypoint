import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../data/requestsStore';
import TraceJourney from '../components/TraceJourney';
import MentorMatch from '../components/MentorMatch';
import TrailNotes from '../components/TrailNotes';
import Rewards from '../components/Rewards';
import TrailDivider from '../components/TrailDivider';

export default function FeaturesPage({ toast }) {
  const { t } = useSite();
  const { user } = useAuth();
  const [goal, setGoal] = useState('Product management at a tech startup');
  const [points, setPoints] = useState(1240);
  const [callsScheduled, setCallsScheduled] = useState(0);
  const [milestonesCompleted, setMilestonesCompleted] = useState(0);
  const [notesHelped, setNotesHelped] = useState(0);
  const [msgRefresh, setMsgRefresh] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const myMessages = useMemo(() => {
    if (!user || user.role !== 'student') return [];
    return getRequests().filter((r) => r.studentName === user.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgRefresh, user]);

  // Arrived here carrying a goal typed on the home page, and/or a section to
  // scroll straight to (from a nav click made elsewhere).
  useEffect(() => {
    const state = location.state || {};
    if (state.goal) setGoal(state.goal);
    if (state.scrollTo) {
      const timer = setTimeout(() => {
        document.getElementById(state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      navigate('.', { replace: true, state: {} });
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onRequestSent={() => setMsgRefresh((n) => n + 1)}
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
