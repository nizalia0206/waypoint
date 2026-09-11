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
