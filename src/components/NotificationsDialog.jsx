import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests, markRepliesSeen } from '../data/requestsStore';
import { getRedemptions } from '../data/rewardsStore';
import { usePoints } from '../hooks/usePoints';

export default function NotificationsDialog({ onClose }) {
  const { t } = useSite();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [points] = usePoints();

  const lastRedeemed = useMemo(() => getRedemptions()[0] || null, []);

  const isMentor = user && user.role === 'mentor';

  const messages = useMemo(() => {
    if (!user) return [];
    const requests = getRequests();
    if (isMentor) {
      return requests.filter((r) => r.status === 'pending');
    }
    return requests.filter((r) => r.studentName === user.name && r.reply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const thankYous = useMemo(() => {
    if (!isMentor || !user) return [];
    return getRequests()
      .filter((r) => r.thankYouSentAt)
      .sort((a, b) => b.thankYouSentAt - a.thankYouSentAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isMentor]);

  const handleViewAll = () => {
    if (isMentor) {
      navigate('/mentor');
    } else {
      if (user) markRepliesSeen(user.name);
      navigate('/features', { state: { scrollTo: 'match' } });
    }
    onClose();
  };

  return (
    <>
      <div className="notif-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="notif-dialog" role="dialog" aria-modal="true" aria-label={t.notif.title}>
        <div className="notif-dialog-head">
          <span className="notif-dialog-title">{t.notif.title}</span>
          <button className="notif-dialog-close" onClick={onClose} aria-label={t.notif.close}>&times;</button>
        </div>

        <div className="notif-section">
          <div className="notif-points-row">
            <span className="notif-points-value">{points.toLocaleString()}</span>
            <span className="notif-points-label">{t.notif.pointsLabel}</span>
          </div>
          {lastRedeemed ? (
            <p className="notif-redeemed-line">{t.notif.lastRedeemed(lastRedeemed.title, lastRedeemed.cost)}</p>
          ) : (
            <p className="notif-empty-line">{t.notif.noRedemptions}</p>
          )}
        </div>

        <div className="notif-section">
          <span className="notif-section-title">{t.notif.messagesTitle}</span>
          {messages.length > 0 ? (
            <div className="notif-message-list">
              {messages.map((r) => (
                <div className="notif-message-item" key={r.id}>
                  {isMentor ? (
                    <>
                      <strong>{r.studentName}</strong>
                      <span className="notif-message-sub">{t.match.ask[r.askType] || r.askType}</span>
                    </>
                  ) : (
                    <>
                      <strong>{r.mentorName}</strong>
                      {r.reply && <span className="notif-message-sub">&ldquo;{r.reply}&rdquo;</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="notif-empty-line">{isMentor ? t.notif.noMessagesMentor : t.notif.noMessagesStudent}</p>
          )}
        </div>

        {isMentor && (
          <div className="notif-section">
            <span className="notif-section-title">{t.notif.thankYouTitle}</span>
            {thankYous.length > 0 ? (
              <div className="notif-message-list">
                {thankYous.map((r) => (
                  <div className="notif-message-item" key={'ty-' + r.id}>
                    <strong>{r.studentName}</strong>
                    <span className="notif-message-sub">{t.notif.thankYouSub}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="notif-empty-line">{t.notif.noThankYous}</p>
            )}
          </div>
        )}

        <button className="notif-view-all" onClick={handleViewAll}>{t.notif.viewAll}</button>
      </div>
    </>
  );
}
