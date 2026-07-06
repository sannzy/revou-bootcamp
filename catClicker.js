/**
 * Pure functions from Cat Clicker App — extracted for testability.
 * These functions have no DOM dependencies.
 */

export const REACTIONS = [
  { id: 'bounce',  type: 'animation', cssClass: 'animate-bounce-cat', durationMs: 600 },
  { id: 'wiggle',  type: 'animation', cssClass: 'animate-wiggle-cat', durationMs: 500 },
  { id: 'squish',  type: 'animation', cssClass: 'animate-squish-cat', durationMs: 700 },
  { id: 'purr',    type: 'speech',    message: 'purr~',               displayMs: 1800 },
  { id: 'nya',     type: 'speech',    message: 'nya \u2661',          displayMs: 2000 },
  { id: 'headpat', type: 'speech',    message: 'headpat!',            displayMs: 1500 },
  { id: 'floofy',  type: 'speech',    message: 'so floofy \u2728',    displayMs: 2200 },
  { id: 'biscuit', type: 'speech',    message: 'making biscuits\u2026', displayMs: 2500 },
];

export const MILESTONES = new Set([10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);

/**
 * Selects a reaction from the pool, avoiding repeating the last reaction id.
 * @param {Array} pool - array of reaction objects
 * @param {string|null} lastId - id of the last reaction (or null)
 * @returns {Object} selected reaction
 */
export function selectReaction(pool, lastId) {
  if (pool.length < 2) return pool[0];
  const filtered = pool.filter(r => r.id !== lastId);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Loads the pat count from localStorage.
 * Returns 0 if the stored value is absent, non-numeric, or negative.
 */
export function loadCount() {
  try {
    const raw = localStorage.getItem('cat-clicker-pat-count');
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Persists the pat count to localStorage.
 * Silently swallows errors (graceful degradation for private browsing, quota exceeded, etc.)
 */
export function persistCount(count) {
  try {
    localStorage.setItem('cat-clicker-pat-count', String(count));
  } catch (e) {
    // graceful degradation
  }
}

/**
 * Returns a congratulatory message string for a given milestone.
 * Always contains String(m).
 * @param {number} m - the milestone threshold
 * @returns {string}
 */
export function getMilestoneBannerText(m) {
  return `\uD83C\uDF89 ${m} pats! You're amazing!`;
}
