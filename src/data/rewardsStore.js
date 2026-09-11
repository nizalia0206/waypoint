const POINTS_KEY = 'waypoint_points_v1';
const REDEMPTIONS_KEY = 'waypoint_redemptions_v1';
const DEFAULT_POINTS = 1240;
const EVENT = 'waypoint-points-updated';

function loadPoints() {
  try {
    const raw = localStorage.getItem(POINTS_KEY);
    return raw === null ? DEFAULT_POINTS : JSON.parse(raw);
  } catch (e) {
    return DEFAULT_POINTS;
  }
}

function savePoints(points) {
  try { localStorage.setItem(POINTS_KEY, JSON.stringify(points)); } catch (e) { /* ignore */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch (e) { /* ignore */ }
}

export function getPoints() {
  return loadPoints();
}

// Accepts either a plain number or an updater function, same shape as
// React's setState, so existing `setPoints(p => p + 40)` call sites keep
// working while the value itself now lives in shared storage.
export function updatePoints(updater) {
  const current = loadPoints();
  const next = typeof updater === 'function' ? updater(current) : updater;
  savePoints(next);
  return next;
}

function loadRedemptions() {
  try {
    return JSON.parse(localStorage.getItem(REDEMPTIONS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveRedemptions(list) {
  try { localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

export function getRedemptions() {
  return loadRedemptions();
}

// Records a redeemed reward and fires the same event points listeners use,
// so the nav bell/dialog can react immediately.
export function addRedemption(item) {
  const list = loadRedemptions();
  const entry = { title: item.title, cost: item.cost, timestamp: Date.now() };
  list.unshift(entry);
  saveRedemptions(list.slice(0, 20));
  try { window.dispatchEvent(new Event(EVENT)); } catch (e) { /* ignore */ }
  return entry;
}

export const POINTS_UPDATED_EVENT = EVENT;
