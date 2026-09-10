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
  const withId = {
    ...req,
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    status: 'pending',
    reply: null,
    replySeenByStudent: false,
    statusSeenByStudent: true,
  };
  list.push(withId);
  save(list);
  return withId;
}

export function updateRequest(id, patch) {
  const list = load();
  const next = list.map((r) => {
    if (r.id !== id) return r;
    const merged = { ...r, ...patch };
    // A new reply or a status change (accepted/declined) is something the
    // student hasn't seen yet, unless the caller explicitly says otherwise.
    if ('reply' in patch && !('replySeenByStudent' in patch)) {
      merged.replySeenByStudent = false;
    }
    if ('status' in patch && !('statusSeenByStudent' in patch)) {
      merged.statusSeenByStudent = false;
    }
    return merged;
  });
  save(next);
  return next;
}

// Marks every reply and status change addressed to this student as seen —
// called once they've actually looked at their messages, so the nav
// notification clears.
export function markRepliesSeen(studentName) {
  const list = load();
  const next = list.map((r) => (
    r.studentName === studentName && (r.reply || r.status !== 'pending')
      ? { ...r, replySeenByStudent: true, statusSeenByStudent: true }
      : r
  ));
  save(next);
  return next;
}
