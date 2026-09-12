import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests, updateRequest } from '../data/requestsStore';

const SLOTS = ['Tue 4:00 PM', 'Wed 11:00 AM', 'Thu 6:30 PM'];

export default function MentorPage({ toast }) {
  const { t } = useSite();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [points, setPoints] = useState(1240);
  const [pending, setPending] = useState(t.mentor.requests);
  const [accepted, setAccepted] = useState([]);
  const [redeemed, setRedeemed] = useState({});
  const [realRequests, setRealRequests] = useState(() => getRequests());
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyId, setOpenReplyId] = useState(null);

  const mentorName = (user && user.role === 'mentor') ? user.name : 'Zobia Khan';
  const mentorOutcome = (user && user.role === 'mentor') ? user.outcome : null;
  const pendingReal = realRequests.filter((r) => r.status === 'pending');
  const thankYous = realRequests
    .filter((r) => r.thankYouSentAt)
    .sort((a, b) => b.thankYouSentAt - a.thankYouSentAt);

  // Keep this page's view of real requests live — a thank-you (or a new
  // request) can land while the mentor is already sitting on this page,
  // not just on next navigation.
  useEffect(() => {
    const onUpdate = () => setRealRequests(getRequests());
    window.addEventListener('waypoint-requests-updated', onUpdate);
    return () => window.removeEventListener('waypoint-requests-updated', onUpdate);
  }, []);

  // "View all" from the notification dropdown lands here with a section to
  // jump to — keyed on location.state itself, not just mount, so it still
  // fires even when the mentor was already on this page.
  useEffect(() => {
    const state = location.state || {};
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

  const accept = (req) => {
    setPending((prev) => prev.filter((r) => r.name !== req.name));
    const slot = SLOTS[accepted.length % SLOTS.length];
    const roomLink = 'meet.waypoint.app/waypoint-' + Math.random().toString(36).slice(2, 8);
    setAccepted((prev) => [...prev, { ...req, slot, roomLink }]);
    setPoints((p) => p + 40);
    toast(t.mentor.acceptedToast(req.name));
  };

  const decline = (req) => {
    setPending((prev) => prev.filter((r) => r.name !== req.name));
    toast(t.mentor.declinedToast(req.name));
  };

  const acceptReal = (req) => {
    updateRequest(req.id, { status: 'accepted' });
    setRealRequests(getRequests());
    setAccepted((prev) => [...prev, { name: req.studentName, ask: req.askType, slot: req.slot, roomLink: req.roomLink }]);
    setPoints((p) => p + 40);
    toast(t.mentor.acceptedToast(req.studentName));
  };

  const declineReal = (req) => {
    updateRequest(req.id, { status: 'declined' });
    setRealRequests(getRequests());
    toast(t.mentor.declinedToast(req.studentName));
  };

  const sendReply = (req) => {
    const text = (replyDrafts[req.id] || '').trim();
    if (!text) return;
    updateRequest(req.id, { reply: text });
    setRealRequests(getRequests());
    setOpenReplyId(null);
    toast(t.mentor.replySent);
  };

  const handleRedeem = (item, i) => {
    if (redeemed[i]) return;
    if (points < item.cost) {
      toast(t.rewards.notEnoughPoints);
      return;
    }
    setPoints((p) => p - item.cost);
    setRedeemed((prev) => ({ ...prev, [i]: true }));
    toast(t.rewards.redeemedToast(item.title));
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(t.rewards.linkedinTitle)}&summary=${encodeURIComponent(t.rewards.linkedinSummary)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  return (
    <section style={{ paddingTop: 48, paddingBottom: 30 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-page">{t.mentor.tag}</span>
          <h2 style={{ marginTop: 10 }}>{t.mentor.head}</h2>
          <p>{t.mentor.sub}</p>
        </div>

        <div className="mentor-grid">
          <div className="mentor-summary">
            <div className="mentor-summary-name">{t.rewards.trailPtsLabel(mentorName)}</div>
            {mentorOutcome && <div className="mentor-outcome">{mentorOutcome}</div>}
            <div className="mentor-summary-route">
              <div className={`trail-record-mark${accepted.length > 0 ? ' active' : ''}`}>
                <span className="trail-record-dot">{accepted.length}</span>
                <span>{t.mentor.callsAcceptedLabel(accepted.length)}</span>
              </div>
            </div>
            <p className="trailpts-contribution">{t.mentor.contributionLine}</p>
            <div className="stamp-row">
              {t.rewards.badges.map((b) => <span className="stamp" key={b}>{b}</span>)}
            </div>
            <div className="trail-record-points">{t.rewards.pointsSecondary(points)}</div>
          </div>

          <div className="mentor-requests" id="requests">
            <h4>{t.mentor.pendingTitle}</h4>

            {pendingReal.length > 0 && (
              <div className="mentor-request-list" style={{ marginBottom: 18 }}>
                {pendingReal.map((r) => (
                  <div className="mentor-request-row" key={r.id}>
                    <span className="mentor-request-num live" title="Live request">●</span>
                    <div className="mentor-request-body">
                      <strong>{r.studentName}</strong>
                      <span className="mentor-request-goal">{t.mentor.goalPrefix} {r.goal}</span>
                      <span className="mentor-request-ask">{t.match.ask[r.askType] || r.askType}</span>
                      {r.message && <p className="mentor-request-message">&ldquo;{r.message}&rdquo;</p>}
                      {r.reply ? (
                        <p className="mentor-request-reply-sent">{t.mentor.repliedLabel} &ldquo;{r.reply}&rdquo;</p>
                      ) : openReplyId === r.id ? (
                        <div className="mentor-reply-box">
                          <textarea
                            className="mentor-reply-input"
                            placeholder={t.mentor.replyPlaceholder}
                            value={replyDrafts[r.id] || ''}
                            onChange={(e) => setReplyDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                          />
                          <button className="mentor-request-accept" onClick={() => sendReply(r)}>{t.mentor.sendReply}</button>
                        </div>
                      ) : (
                        <button className="mentor-draft-link" onClick={() => setOpenReplyId(r.id)}>{t.mentor.replyLabel}</button>
                      )}
                    </div>
                    <div className="mentor-request-actions">
                      <button className="mentor-request-accept" onClick={() => acceptReal(r)}>{t.mentor.accept}</button>
                      <button className="mentor-request-decline" onClick={() => declineReal(r)}>{t.mentor.decline}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pending.length === 0 && pendingReal.length === 0 ? (
              <p className="results-empty">{t.mentor.pendingEmpty}</p>
            ) : pending.length > 0 && (
              <>
                {pending.length > 0 && <span className="mile" style={{ display: 'block', marginBottom: 10 }}>{t.mentor.sampleLabel}</span>}
                <div className="mentor-request-list">
                  {pending.map((r, i) => (
                    <div className="mentor-request-row" key={r.name}>
                      <span className="mentor-request-num">{String(i + 1).padStart(2, '0')}</span>
                      <div className="mentor-request-body">
                        <strong>{r.name}</strong>
                        <span className="mentor-request-goal">{t.mentor.goalPrefix} {r.goal}</span>
                        <span className="mentor-request-ask">{t.match.ask[r.ask]}</span>
                      </div>
                      <div className="mentor-request-actions">
                        <button className="mentor-request-accept" onClick={() => accept(r)}>{t.mentor.accept}</button>
                        <button className="mentor-request-decline" onClick={() => decline(r)}>{t.mentor.decline}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mentor-upcoming">
          <h4>{t.mentor.upcomingTitle}</h4>
          {accepted.length === 0 ? (
            <p className="results-empty">{t.mentor.upcomingEmpty}</p>
          ) : accepted.map((r, i) => (
            <div className="mentor-upcoming-item" key={r.name + i}>
              <div className="mentor-upcoming-main">
                <strong>{r.name}</strong>
                <span className="mentor-upcoming-ask">{t.match.ask[r.ask]}</span>
              </div>
              <div className="mentor-upcoming-meta">
                <span className="mentor-upcoming-time">{r.slot}</span>
                {r.roomLink && <span className="mentor-upcoming-link">{r.roomLink}</span>}
              </div>
            </div>
          ))}
        </div>

        {thankYous.length > 0 && (
          <div className="mentor-thankyous" id="thankyous">
            <h4>{t.mentor.thankYouTitle}</h4>
            {thankYous.map((r) => (
              <div className="mentor-thankyou-item" key={r.id}>
                <span className="mentor-thankyou-icon" aria-hidden="true">♥</span>
                <div className="mentor-thankyou-body">
                  <strong>{r.studentName}</strong>
                  <span className="mentor-thankyou-sub">{t.mentor.thankYouLine}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mentor-redeem-preview">
          <h4>{t.mentor.redeemTitle}</h4>
          <p>{t.mentor.redeemSub}</p>
          <div className="redeem-list">
            {t.mentor.redeem.map((r, i) => {
              const isRedeemed = redeemed[i];
              const canAfford = points >= r.cost;
              return (
                <div className="redeem-item" key={r.title}>
                  <div>
                    <h5>{r.title}</h5>
                    <p>{r.desc}</p>
                    {isRedeemed && r.linkedin && (
                      <button className="linkedin-btn" onClick={shareOnLinkedIn}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
                        </svg>
                        {t.rewards.postLinkedIn}
                      </button>
                    )}
                  </div>
                  <div className="redeem-action">
                    <span className="redeem-pts">{r.cost.toLocaleString()} {t.rewards.ptsSuffix}</span>
                    <button
                      className={`redeem-btn${isRedeemed ? ' redeemed' : ''}`}
                      disabled={isRedeemed || !canAfford}
                      onClick={() => handleRedeem(r, i)}
                    >
                      {isRedeemed ? t.rewards.redeemedLabel : t.rewards.redeemLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
