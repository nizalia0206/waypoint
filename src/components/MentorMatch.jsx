import { useState } from 'react';
import { ALUMNI } from '../data/alumni';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { addRequest, addFeedback } from '../data/requestsStore';
import MagneticButton from './MagneticButton';
import Mascot from './Mascot';

const MAJOR_VALUES = ['Computer Science', 'Marketing', 'Mechanical Engineering', 'Finance', 'Graphic Design'];
const YEAR_VALUES = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const EXP_VALUES = ['First-gen student', 'ADHD', 'Hearing/visual', 'International student'];
const COMM_VALUES = ['Text-first', 'Video call', 'Extra response time', 'Captions', 'Sign language interpreter'];
const ASK_VALUES = ['15-minute chat', 'mock interview', 'resume review'];
const FEEDBACK_OUTCOME_KEYS = ['understood', 'cv', 'internship', 'interview', 'courseAdvice', 'decision', 'another'];

const STOPWORDS = new Set(['a', 'an', 'the', 'at', 'in', 'on', 'of', 'for', 'to', 'and', 'my', 'me', 'become', 'be', 'as', 'is']);
function keywords(text) {
  return (text || '').toLowerCase().match(/[a-z]+/g)?.filter((w) => w.length > 2 && !STOPWORDS.has(w)) || [];
}
function responseSpeedScore(responseTime) {
  if (!responseTime) return 0;
  if (/a day/.test(responseTime)) return 6;
  if (/2 days/.test(responseTime)) return 3;
  return 1;
}

// A real weighted match, not just "first alum with the same major" — this is
// what actually runs during a live demo, since the direct API call is
// usually blocked by CORS outside the claude.ai sandbox.
function scoreAlum(alum, { major, goal, expTags }) {
  let score = 0;
  if (alum.major === major) score += 50;

  const goalWords = new Set(keywords(goal));
  const alumWords = new Set(keywords([alum.industry, alum.currentRole, alum.path[alum.path.length - 1]].join(' ')));
  let overlap = 0;
  goalWords.forEach((w) => { if (alumWords.has(w)) overlap += 1; });
  score += overlap * 18;

  if (expTags && expTags.length && alum.experienceTags) {
    const shared = expTags.filter((t) => alum.experienceTags.includes(t));
    score += shared.length * 25;
  }

  score += (alum.studentsHelped || 0) * 1;
  score += responseSpeedScore(alum.responseTime);
  return score;
}
function bestLocalMatch(major, goal, expTags) {
  return ALUMNI.slice()
    .map((alum) => ({ alum, score: scoreAlum(alum, { major, goal, expTags }) }))
    .sort((a, b) => b.score - a.score)[0].alum;
}

// The route shows an alum's actual dated history, but a checklist item like
// "BSc Computer Science, 2019" reads oddly as something for a student to
// follow today — strip the trailing year so it reads as a general milestone.
function genericizeMilestone(step) {
  return step.replace(/,\s*\d{4}\s*$/, '');
}

function TagButton({ label, active, onClick, multi }) {
  return (
    <button className={`tag${active ? ' active' : ''}${multi ? ' tag-multi' : ''}`} type="button" onClick={onClick}>
      {multi && <span className="tag-check" aria-hidden="true">{active ? '✓' : ''}</span>}
      {label}
    </button>
  );
}

function MentorRoute({ steps }) {
  const [hovered, setHovered] = useState(null);
  const litUpTo = hovered === null ? steps.length - 1 : hovered;
  return (
    <div className="mentor-route">
      <div className="mentor-route-line">
        <div className="mentor-route-line-fill" style={{ height: `${((litUpTo + 0.5) / steps.length) * 100}%` }} />
      </div>
      <div className="mentor-route-points">
        {steps.map((s, i) => {
          const isFinal = i === steps.length - 1;
          const lit = hovered !== null && i <= hovered;
          return (
            <div
              key={i}
              className={`mentor-route-point${lit ? ' lit' : ''}${isFinal ? ' final' : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <span className="mentor-route-dot">{isFinal ? '★' : ''}</span>
              <span className="mentor-route-label">{s}</span>
              {hovered === i && <Mascot className="mentor-route-firefly" alt="" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MentorResult({ alum, match, askType, commLabel, goal, aslEnabled, m, onRequestSent }) {
  const { t, toast, setPoints, setCallsScheduled, setMilestonesCompleted } = m;
  const { user } = useAuth();
  const [chosenAsk, setChosenAsk] = useState(askType);
  const [schedOpen, setSchedOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [draftMsg, setDraftMsg] = useState(match.icebreaker || '');
  const [msgSent, setMsgSent] = useState(false);
  const [pickedSlot, setPickedSlot] = useState(null);
  const [roomLink, setRoomLink] = useState(null);
  const [done, setDone] = useState(() => alum.path.map(() => false));
  const [feedbackChecked, setFeedbackChecked] = useState({});
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [thankYouSent, setThankYouSent] = useState(false);

  const slots = ['Tue 4:00 PM', 'Wed 11:00 AM', 'Thu 6:30 PM'];
  const doneCount = done.filter(Boolean).length;
  const firstName = alum.name.split(' ')[0];
  const chosenAskLabel = t.match.ask[chosenAsk];

  const selectAsk = (v) => {
    setChosenAsk(v);
    setSchedOpen(true);
    setPickedSlot(null);
    setRoomLink(null);
  };

  const sendMessage = () => {
    const text = draftMsg.trim();
    if (!text || msgSent) return;
    const studentName = (user && user.role === 'student') ? user.name : 'A student (guest)';
    addRequest({
      studentName,
      isRealUser: !!(user && user.role === 'student'),
      goal: goal || '',
      askType: chosenAsk,
      commPref: commLabel || '',
      message: text,
      mentorName: alum.name,
      slot: null,
      createdAt: Date.now(),
    });
    setMsgSent(true);
    toast(t.match.messageSent);
    onRequestSent?.();
  };

  const pickSlot = (slot) => {
    setPickedSlot(slot);
    const room = 'waypoint-' + Math.random().toString(36).slice(2, 8);
    const link = `meet.waypoint.app/${room}`;
    setRoomLink(link);
    setPoints((p) => p + 40);
    setCallsScheduled((c) => c + 1);
    toast('+40 Trail Points');

    // Real persisted request the mentor will actually see in Mentor View —
    // uses the logged-in student's real name when one exists, per the "never
    // show someone else's name as though they are the logged-in user" rule.
    const studentName = (user && user.role === 'student') ? user.name : 'A student (guest)';
    addRequest({
      studentName,
      isRealUser: !!(user && user.role === 'student'),
      goal: goal || '',
      askType: chosenAsk,
      commPref: commLabel || '',
      message: match.icebreaker || '',
      mentorName: alum.name,
      slot,
      roomLink: link,
      createdAt: Date.now(),
    });
    onRequestSent?.();
  };

  const toggleDone = (i) => {
    setDone(prev => {
      const next = [...prev];
      next[i] = !next[i];
      if (next[i]) {
        setPoints((p) => p + 15);
        setMilestonesCompleted((c) => c + 1);
        toast('+15 Trail Points');
      }
      return next;
    });
  };

  const toggleFeedback = (key) => {
    setFeedbackChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const submitFeedback = () => {
    addFeedback(feedbackChecked);
    setFeedbackSaved(true);
    toast(t.match.feedbackSaved);
  };
  const sendThankYou = () => {
    setThankYouSent(true);
    toast(t.match.thankYouSent(firstName));
  };

  return (
    <div className="mentor-card">
      <div className="mentor-reveal">
        <p className="mentor-reveal-line">{t.match.someoneWalked}</p>
        <p className="mentor-reveal-name">{t.match.didStatement(firstName)}</p>
      </div>
      <div className="mentor-meta">{alum.name} · {alum.major}, Class of {alum.gradYear}</div>
      <div className="mentor-trust-row">
        <span className="mentor-verified-badge">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {t.match.verifiedBadge}
        </span>
        {alum.studentsHelped >= 10 && (
          <span className="mentor-verified-badge gold">{t.match.reliableMentor}</span>
        )}
        {alum.activeRecently && <span className="mentor-trust-item">● {t.match.activeRecently}</span>}
        {alum.studentsHelped != null && <span className="mentor-trust-item">{t.match.studentsHelpedLabel(alum.studentsHelped)}</span>}
        {alum.responseTime && <span className="mentor-trust-item">{alum.responseTime}</span>}
      </div>

      <MentorRoute steps={alum.path} />

      <div className="mentor-field-note">
        <span className="mentor-field-note-label">{t.match.fieldNoteLabel(firstName)}</span>
        <p className="mentor-field-note-quote">&ldquo;{match.reason}&rdquo;</p>
      </div>

      <div className="next-waypoints">
        <span className="eyebrow">{t.match.nextWaypoints}</span>
        <div className="next-waypoint-list">
          {ASK_VALUES.map((v, i) => (
            <button
              key={v}
              type="button"
              className={`next-waypoint${chosenAsk === v && schedOpen ? ' chosen' : ''}`}
              onClick={() => selectAsk(v)}
            >
              <span className="next-waypoint-num">{String(alum.path.length + i + 1).padStart(2, '0')}</span>
              <span className="next-waypoint-body">
                <span className="next-waypoint-name">{t.match.ask[v]}</span>
                <span className="next-waypoint-desc">{t.match.askDescriptions[v]}</span>
              </span>
              <span className="next-waypoint-dot" />
            </button>
          ))}
        </div>
        <button className="mentor-draft-link" onClick={() => setMsgOpen(o => !o)}>{t.match.draftMsg}</button>
      </div>

      {schedOpen && (
        <div className="mentor-book-route">
          <div className="mentor-book-step done">
            <span className="mentor-book-dot" />
            <span className="mentor-book-label">{firstName}</span>
          </div>
          <div className="mentor-book-step done">
            <span className="mentor-book-dot" />
            <span className="mentor-book-label">{chosenAskLabel}{commLabel ? ` · ${commLabel}` : ''}</span>
          </div>
          <div className={`mentor-book-step${pickedSlot ? ' done' : ' active'}`}>
            <span className="mentor-book-dot" />
            {pickedSlot ? (
              <span className="mentor-book-label">{pickedSlot}</span>
            ) : (
              <div className="slot-row">
                {slots.map(slot => (
                  <button key={slot} className="slot-btn" onClick={() => pickSlot(slot)}>{slot}</button>
                ))}
              </div>
            )}
          </div>
          {roomLink && (
            <div className="mentor-book-step done final">
              <span className="mentor-book-dot">★</span>
              <div className="mentor-book-confirm">
                <Mascot className="mentor-book-mascot" />
                <div>
                  <span className="eyebrow mentor-book-confirm-label">{t.match.routeConfirmed}</span>
                  <div>{t.match.scheduledFor} <strong>{pickedSlot}</strong>.</div>
                  <div>{t.match.linkLabel} <span className="link">{roomLink}</span></div>
                  {aslEnabled && <div className="asl-confirm-note">🤟 {t.match.aslRequested}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {roomLink && (
        <div className="mentor-feedback">
          <span className="eyebrow">{t.match.feedbackTitle}</span>
          <p className="mentor-feedback-sub">{t.match.feedbackSub}</p>
          {feedbackSaved ? (
            <p className="mentor-feedback-saved">{t.match.feedbackSaved}</p>
          ) : (
            <>
              <div className="mentor-feedback-list">
                {FEEDBACK_OUTCOME_KEYS.map((key) => (
                  <label key={key} className="mentor-feedback-item">
                    <input
                      type="checkbox"
                      checked={!!feedbackChecked[key]}
                      onChange={() => toggleFeedback(key)}
                    />
                    {t.match.feedbackOutcomes[key]}
                  </label>
                ))}
              </div>
              <button className="ask-btn primary" onClick={submitFeedback}>{t.match.submitFeedback}</button>
            </>
          )}
          <button className="mentor-draft-link" onClick={sendThankYou} disabled={thankYouSent} style={{ marginTop: 14 }}>
            {thankYouSent ? t.match.thankYouSent(firstName) : t.match.sendThankYou(firstName)}
          </button>
        </div>
      )}

      {msgOpen && (
        <div className="panel">
          <span className="label">{t.match.suggestedMsg}</span>
          {msgSent ? (
            <p className="mentor-msg-sent">{t.match.messageSent}</p>
          ) : (
            <>
              <textarea
                className="mentor-msg-input"
                value={draftMsg}
                onChange={(e) => setDraftMsg(e.target.value)}
              />
              <MagneticButton className="btn-trail mentor-msg-send" onClick={sendMessage}>{t.match.sendMessage}</MagneticButton>
            </>
          )}
        </div>
      )}

      <div className="mentor-follow">
        <h4 className="mentor-follow-title">{t.match.followTitle}</h4>
        <p className="mentor-follow-sub">{t.match.followSub(firstName)}</p>
        <div className="follow-list">
          {alum.path.map((step, i) => (
            <div
              key={i}
              className={`follow-item${done[i] ? ' done' : ''}`}
              onClick={() => toggleDone(i)}
            >
              <div className="follow-check">✓</div>
              <div className="follow-text">{genericizeMilestone(step)}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(doneCount / alum.path.length) * 100}%` }}></div>
        </div>
        <div className="progress-label">{t.match.progressLabel(doneCount, alum.path.length)}</div>
      </div>
    </div>
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MentorMatch({ goal, setGoal, toast, points, setPoints, setCallsScheduled, setMilestonesCompleted, onRequestSent }) {
  const { t, lang, aslEnabled } = useSite();
  const [major, setMajor] = useState(MAJOR_VALUES[0]);
  const [year, setYear] = useState('Sophomore');
  const [expTags, setExpTags] = useState([]);
  const [commPref, setCommPref] = useState('Text-first');
  const [askType, setAskType] = useState('15-minute chat');
  const [stage, setStage] = useState(null); // null | 'destination' | 'scanning' | 'found'
  const [result, setResult] = useState(null);
  const matchPoolCount = ALUMNI.filter((a) => a.major === major).length || ALUMNI.length;

  const toggleExp = (v) => {
    setExpTags(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const findMentor = async () => {
    const g = goal.trim() || 'their next step';
    setResult(null);
    setStage('destination');

    const languageInstruction = lang === 'ar'
      ? 'Write "reason" and "icebreaker" in Arabic.'
      : 'Write "reason" and "icebreaker" in English.';

    const prompt = `You are finding the single best mentor match for a university student on an app called Waypoint.
Student: ${year}, majoring in ${major}, goal: "${g}". Shared experience: ${expTags.join(', ') || 'none stated'}.
Alumni pool (JSON): ${JSON.stringify(ALUMNI.map(a => ({ id: a.id, name: a.name, major: a.major, gradYear: a.gradYear, path: a.path, industry: a.industry, currentRole: a.currentRole, experienceTags: a.experienceTags })))}
Pick the SINGLE best-fit alum. If the student stated a shared experience, treat an alum who shares it as a strong signal — students explicitly want someone who understands that situation. Write "reason" (max 30 words) as an explicit, factor-based explanation — name the SPECIFIC concrete reasons this alum matches (same major, same university, shared experience if relevant, how they entered this field, their current role) so the student can see exactly why this person and not someone else. Write "icebreaker" (max 35 words, warm and specific). ${languageInstruction}
Return ONLY valid JSON, no markdown fences: {"alumniId":1,"reason":"...","icebreaker":"..."}`;

    const apiPromise = (async () => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const data = await response.json();
        const textBlock = (data.content || []).find(b => b.type === 'text');
        const raw = textBlock ? textBlock.text : '';
        const clean = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        const alum = ALUMNI.find(a => a.id === parsed.alumniId);
        if (!alum) throw new Error('no match');
        return { alum, match: parsed };
      } catch (err) {
        console.warn('Waypoint matching: falling back to local weighted match (API call unavailable in this environment).', err);
        const alum = bestLocalMatch(major, g, expTags);
        const sameMajor = alum.major === major;
        const goalWords = new Set(keywords(g));
        const alumWords = keywords([alum.industry, alum.currentRole].join(' '));
        const sharedWord = alumWords.find((w) => goalWords.has(w));
        const sharedExp = (alum.experienceTags || []).find((tg) => expTags.includes(tg));
        const reasonBits = [];
        if (sameMajor) reasonBits.push(`studied ${alum.major} like you`);
        reasonBits.push('graduated from your university');
        if (sharedWord) reasonBits.push(`their path led through ${sharedWord}`);
        if (sharedExp) reasonBits.push(`also identifies as ${sharedExp.toLowerCase()}`);
        reasonBits.push(`now working as ${alum.currentRole || 'a professional in the field'}`);
        return {
          alum,
          match: {
            reason: `Matched on ${reasonBits.length} factors: ${reasonBits.join(', ')} — the closest journey to "${g}" in the pool.`,
            icebreaker: `Hi ${alum.name.split(' ')[0]}, I'm a ${year.toLowerCase()} ${major} student aiming for ${g} — would love 15 minutes to hear how your path started.`,
          },
        };
      }
    })();

    // Choreograph the reveal: destination → scanning (with a floor so it never
    // feels instant) → route found → the actual card.
    await sleep(650);
    setStage('scanning');
    const [found] = await Promise.all([apiPromise, sleep(900)]);
    setStage('found');
    await sleep(550);
    setStage(null);
    setResult(found);
  };

  return (
    <section id="match">
      <div className="wrap">
        <div className="section-head section-head-wide">
          <h2>{t.match.head}</h2>
          <p>{t.match.sub}</p>
        </div>
        <div className="match-shell">
          <div className="match-form">
            <label htmlFor="goalInput">{t.match.goalLabel}</label>
            <input id="goalInput" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} />

            <label htmlFor="majorInput">{t.match.majorLabel}</label>
            <select id="majorInput" value={major} onChange={(e) => setMajor(e.target.value)}>
              {MAJOR_VALUES.map(m => <option key={m} value={m}>{t.match.majors[m]}</option>)}
            </select>

            <label htmlFor="yearInput">{t.match.yearLabel}</label>
            <select id="yearInput" value={year} onChange={(e) => setYear(e.target.value)}>
              {YEAR_VALUES.map(y => <option key={y} value={y}>{t.match.years[y]}</option>)}
            </select>

            <label>{t.match.sharedLabel} <span style={{ fontWeight: 400 }}>{t.match.sharedOptional}</span></label>
            <div className="tag-row">
              {EXP_VALUES.map(v => (
                <TagButton key={v} label={t.match.exp[v]} active={expTags.includes(v)} onClick={() => toggleExp(v)} multi />
              ))}
            </div>
            <p className="tag-note">{t.match.sharedHelp}</p>

            <label>{t.match.commLabel}</label>
            <div className="tag-row">
              {COMM_VALUES.map(v => (
                <TagButton key={v} label={t.match.comm[v]} active={commPref === v} onClick={() => setCommPref(v)} />
              ))}
            </div>

            <label>{t.match.askLabel}</label>
            <div className="ask-waypoint-row">
              {ASK_VALUES.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  className={`ask-waypoint${askType === v ? ' chosen' : ''}`}
                  onClick={() => setAskType(v)}
                  aria-pressed={askType === v}
                >
                  <span className="ask-waypoint-dot" />
                  {i < ASK_VALUES.length - 1 && <span className="ask-waypoint-connector" />}
                  <span className="ask-waypoint-label">{t.match.ask[v]}</span>
                </button>
              ))}
            </div>

            <div className="match-preview">
              <div className="match-preview-item">
                <span className="match-preview-label">{t.match.previewGoal}</span>
                <span className="match-preview-value">{goal.trim() || t.match.previewGoalEmpty}</span>
              </div>
              <div className="match-preview-item">
                <span className="match-preview-label">{t.match.previewUni}</span>
                <span className="match-preview-value">{t.match.previewUniValue}</span>
              </div>
              <div className="match-preview-item">
                <span className="match-preview-label">{t.match.previewMatch}</span>
                <span className="match-preview-value">{t.match.previewMatchValue(matchPoolCount)}</span>
              </div>
            </div>

            <MagneticButton className="match-submit" disabled={stage !== null} onClick={findMentor}>
              {stage !== null ? t.match.searching : t.match.submit}
            </MagneticButton>
          </div>

          <div className="match-results">
            {stage === 'destination' ? (
              <div className="match-stage">
                <span className="eyebrow">{t.match.destinationLabel}</span>
                <div className="match-stage-goal">{goal.trim() || t.match.emptyState}</div>
              </div>
            ) : stage === 'scanning' ? (
              <div className="match-stage">
                <span className="eyebrow">{t.match.scanningLabel}</span>
                <div className="scan-dots"><span></span><span></span><span></span></div>
              </div>
            ) : stage === 'found' ? (
              <div className="match-stage match-stage-found">
                <Mascot className="match-found-mascot" />
                <span className="eyebrow">{t.match.routeFoundLabel}</span>
              </div>
            ) : result ? (
              <MentorResult
                alum={result.alum}
                match={result.match}
                askType={askType}
                commLabel={t.match.comm[commPref]}
                goal={goal}
                aslEnabled={aslEnabled}
                m={{ t, toast, setPoints, setCallsScheduled, setMilestonesCompleted }}
                onRequestSent={onRequestSent}
              />
            ) : (
              <div className="results-empty">{t.match.emptyState}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
