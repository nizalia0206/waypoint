import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { addRedemption } from '../data/rewardsStore';

export default function Rewards({ toast, points, setPoints, callsScheduled, milestonesCompleted, notesHelped }) {
  const { t } = useSite();
  const { user } = useAuth();
  const [redeemed, setRedeemed] = useState({});

  const displayName = (user && user.role === 'student') ? user.name : t.rewards.guestName;
  const earnedBadges = t.rewards.studentBadges.filter((b) => points >= b.threshold);

  const handleRedeem = (item, i) => {
    if (redeemed[i]) return;
    if (points < item.cost) {
      toast(t.rewards.notEnoughPoints);
      return;
    }
    setPoints(p => p - item.cost);
    setRedeemed(prev => ({ ...prev, [i]: true }));
    addRedemption(item);
    toast(t.rewards.redeemedToast(item.title));
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(t.rewards.linkedinTitle)}&summary=${encodeURIComponent(t.rewards.linkedinSummary)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const marks = [
    { count: callsScheduled, label: t.rewards.callsLabel(callsScheduled) },
    { count: milestonesCompleted, label: t.rewards.milestonesLabel(milestonesCompleted) },
    { count: notesHelped, label: t.rewards.notesLabel(notesHelped) },
  ];

  return (
    <section id="rewards">
      <div className="wrap">
        <div className="section-head section-head-narrow">
          <span className="eyebrow-page">{t.rewards.trailRecordTag}</span>
          <h2 style={{ marginTop: 10 }}>{t.rewards.head}</h2>
          <p>{t.rewards.sub}</p>
        </div>

        <div className="rewards-grid">
          <div className="trail-record">
            <div className="trail-record-name">{t.rewards.trailPtsLabel(displayName)}</div>
            <div className="trail-record-route">
              {marks.map((mk, i) => (
                <div className={`trail-record-mark${mk.count > 0 ? ' active' : ''}`} key={i}>
                  <span className="trail-record-dot">{mk.count}</span>
                  <span className="trail-record-mark-label">{mk.label}</span>
                </div>
              ))}
            </div>
            <p className="trailpts-contribution">{t.rewards.contributionLine}</p>

            <div className="stamp-row">
              {earnedBadges.length > 0
                ? earnedBadges.map((b) => (
                  <span className="stamp" key={b.label}>{b.label}</span>
                ))
                : <span className="badge-empty">{t.rewards.noBadgesYet}</span>}
            </div>
            <div className="trail-record-points">{t.rewards.pointsSecondary(points)}</div>
          </div>

          <div className="redeem-list">
            {t.rewards.redeem.map((r, i) => {
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
