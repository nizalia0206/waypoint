const KEY = 'waypoint_requests_v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    return [];
  }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  try { window.dispatchEvent(new Event('waypoint-requests-updated')); } catch (e) { /* ignore */ }
}

export function getRequests() {
  return load();
}

export function addRequest(req) {
  const list = load();
  const withId = { ...req, id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), status: 'pending', reply: null, replySeenByStudent: false };
  list.push(withId);
  save(list);
  return withId;
}

export function updateRequest(id, patch) {
  const list = load();
  const next = list.map((r) => (r.id === id ? { ...r, ...patch } : r));
  save(next);
  return next;
}

// Marks every reply addressed to this student as seen — called once they've
// actually looked at their messages, so the nav notification clears.
export function markRepliesSeen(studentName) {
  const list = load();
  const next = list.map((r) => (r.studentName === studentName && r.reply ? { ...r, replySeenByStudent: true } : r));
  save(next);
  return next;
}

// Persists a student's post-call "thank-you" onto the actual request record
// (rather than a UI-only confirmation toast), so the mentor genuinely sees it
// on their side — reinforcing the mentoring relationship for real.
export function sendThankYou(id) {
  const list = load();
  const next = list.map((r) => (r.id === id ? { ...r, thankYouSentAt: Date.now(), thankYouSeenByMentor: false } : r));
  save(next);
  return next;
}

// Clears the mentor-side "new thank-you" notification once they've viewed it.
// Not filtered by mentor name, matching the existing (unfiltered) pending-request
// count convention used elsewhere for the single-demo-mentor setup.
export function markThankYousSeen() {
  const list = load();
  const next = list.map((r) => (r.thankYouSentAt && !r.thankYouSeenByMentor ? { ...r, thankYouSeenByMentor: true } : r));
  save(next);
  return next;
}

const FEEDBACK_KEY = 'waypoint_feedback_v1';

function loadFeedback() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFeedback(list) {
  try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

// Post-session outcome feedback — kept separate from the requests themselves
// since it's about impact, not the booking. This is what would eventually
// let Waypoint show real "students who used this were X% more likely to..."
// numbers to the university.
export function addFeedback(outcomes) {
  const list = loadFeedback();
  list.push({ outcomes, timestamp: Date.now() });
  saveFeedback(list);
  return list;
}

export function getFeedback() {
  return loadFeedback();
}
