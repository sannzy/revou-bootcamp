# Design Document — Cat Clicker App

## Overview

Cat Clicker App is a single-page, self-contained web application delivered as one `index.html` file. There are no build tools, no bundlers, and no server-side dependencies. Tailwind CSS is loaded from CDN, Google Fonts are loaded via a `<link>` tag, and all logic lives in a `<script>` block at the bottom of the page.

The experience is simple: a large, cute cat SVG sits centred on a soft pastel gradient background. Every click (or keyboard activation) on the cat triggers a randomly selected reaction from a fixed pool, increments a persistent pat counter, and — when a milestone is reached — throws up a congratulatory banner. State is minimal and lives entirely in memory, with the pat count mirrored to `localStorage` for persistence across refreshes.

### Design Decisions

| Decision | Rationale |
|---|---|
| Single `index.html`, no build tools | Matches the stated tech stack; zero friction to open and run |
| Inline SVG for the cat | No external asset requests; SVG is scriptable and animatable with CSS |
| Plain JS modules (IIFE or top-level script) | Avoids ESM complexity without a bundler while still keeping concerns separate |
| `localStorage` for persistence | Sufficient for a single counter value; no backend required |
| CSS keyframes for all animation | Guarantees hardware-accelerated, jank-free motion without a library |
| Tailwind CDN | Provides utility classes and responsive breakpoints instantly |

---

## Architecture

The app follows a **single-file, event-driven** architecture with no framework. All application state lives in one plain JavaScript object. DOM mutations are performed by small, focused render functions that are called after state changes.

```
┌─────────────────────────────────────────────────┐
│                   index.html                    │
│                                                 │
│  ┌──────────────┐   ┌──────────────────────┐   │
│  │  Static HTML │   │   <style> block       │   │
│  │  (markup)    │   │   CSS keyframes       │   │
│  └──────────────┘   │   Glassmorphism vars  │   │
│                     └──────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │              <script> block              │   │
│  │                                          │   │
│  │  CONSTANTS (REACTIONS, MILESTONES)       │   │
│  │       ↓                                  │   │
│  │  STATE object  ←──── localStorage read  │   │
│  │       ↓                                  │   │
│  │  Event Listeners (click, keydown)        │   │
│  │       ↓                                  │   │
│  │  handlePet()                             │   │
│  │    ├─ selectReaction()                   │   │
│  │    ├─ applyReaction()                    │   │
│  │    ├─ incrementCounter()                 │   │
│  │    ├─ renderCounter()                    │   │
│  │    ├─ checkMilestone()                   │   │
│  │    └─ persistCount()                     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. User fires a `click` or `keydown` (Enter/Space) event on `#cat`.
2. `handlePet()` is the single entry point — it orchestrates all downstream effects.
3. State is mutated in memory, the DOM is updated synchronously, and `localStorage` is written.
4. Animations and timeouts manage their own cleanup via `setTimeout` / `animationend` listeners.

---

## Components and Interfaces

### Cat SVG Button (`#cat`)

- Rendered as an inline `<svg>` wrapped in a `<button>` element for native keyboard focus and `aria-label` support.
- Receives `click` and `keydown` event listeners (Enter / Space activation).
- CSS classes for animations are added/removed programmatically: `animate-bounce-cat`, `animate-wiggle-cat`, `animate-squish-cat`.
- Cursor is always `pointer` via Tailwind `cursor-pointer`.
- `tabindex="0"` is implicit on `<button>`; explicit `aria-label="Pet the cat"` is set in markup.

```
┌─────────────────────────────────────────────────┐
│  <button id="cat"                               │
│          aria-label="Pet the cat"               │
│          class="cursor-pointer aspect-square …"> │
│    <svg …> … </svg>                             │
│  </button>                                      │
└─────────────────────────────────────────────────┘
```

### Speech Bubble (`#speech-bubble`)

- A `<div>` positioned absolutely relative to the cat container.
- Hidden by default (`opacity-0 pointer-events-none`).
- When shown: text is set, opacity transitions to 1, a `setTimeout` fades it back out after the display duration (1500–2500 ms) plus a 300 ms fade-out.
- Clamped to viewport via CSS `max-width` and overflow checks.

### Pat Counter (`#pat-counter`)

- A `<div>` styled as a Glassmorphism container (`bg-white/30 backdrop-blur-lg rounded-full border border-white/40`).
- Contains a `<span id="pat-count">` for the numeric value and a static label.
- On each update, the class `pop` is added and removed after 200 ms to trigger a scale keyframe.

### Milestone Banner (`#milestone-banner`)

- A fixed-position overlay `<div>` covering the full viewport.
- Hidden by default. When shown, it fades in, displays for 2500 ms, then fades out over 400 ms.
- Text is dynamically set to include the milestone number.
- After the animation completes, `display: none` is restored.

---

## Data Models

### State Object

```js
const state = {
  count: 0,            // current pat count (Number, non-negative integer)
  lastReactionId: null // id of the last reaction shown (String | null)
};
```

### REACTIONS Array

Each element is a plain object conforming to the following shape:

```js
{
  id: String,          // unique identifier, e.g. "bounce", "purr"
  type: 'animation' | 'speech',
  // animation reactions:
  cssClass: String,    // CSS class to apply to #cat, e.g. "animate-bounce-cat"
  durationMs: Number,  // how long the class stays on (≤ 800)
  // speech reactions:
  message: String,     // text to show in the bubble, e.g. "purr~"
  displayMs: Number    // how long to show bubble (1500–2500)
}
```

A minimum of 8 entries must be present (≥ 3 animation, ≥ 4 speech):

```js
const REACTIONS = [
  { id: 'bounce',  type: 'animation', cssClass: 'animate-bounce-cat',  durationMs: 600 },
  { id: 'wiggle',  type: 'animation', cssClass: 'animate-wiggle-cat',  durationMs: 500 },
  { id: 'squish',  type: 'animation', cssClass: 'animate-squish-cat',  durationMs: 700 },
  { id: 'purr',    type: 'speech',    message: 'purr~',                displayMs: 1800 },
  { id: 'nya',     type: 'speech',    message: 'nya ♡',                displayMs: 2000 },
  { id: 'headpat', type: 'speech',    message: 'headpat!',             displayMs: 1500 },
  { id: 'floofy',  type: 'speech',    message: 'so floofy ✨',         displayMs: 2200 },
  { id: 'biscuit', type: 'speech',    message: 'making biscuits…',     displayMs: 2500 },
];
```

### MILESTONES Set

```js
const MILESTONES = new Set([10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
```

`MILESTONES.has(count)` is called after every increment; O(1) lookup.

---

## Persistence

`localStorage` is the sole persistence mechanism. The key is `cat-clicker-pat-count`.

```js
// Read on init
function loadCount() {
  const raw = localStorage.getItem('cat-clicker-pat-count');
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

// Write after every pet event
function persistCount(count) {
  localStorage.setItem('cat-clicker-pat-count', String(count));
}
```

`parseInt` with radix 10 is used to handle edge cases such as `null`, `""`, `"abc"`, and negative values. The check `Number.isFinite(parsed) && parsed >= 0` guards against `NaN` and negative stored values.

---

## Animation Strategy

All animations are defined as CSS `@keyframes` in the `<style>` block. JavaScript only adds and removes CSS classes — it never touches `element.style` for animation properties. This keeps animations hardware-accelerated and decoupled from JS logic.

### Keyframes

```css
@keyframes bounce-cat {
  0%, 100% { transform: translateY(0);  }
  40%       { transform: translateY(-20px) scale(1.05); }
  70%       { transform: translateY(-8px);  }
}

@keyframes wiggle-cat {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-8deg) scale(1.05); }
  75%      { transform: rotate(8deg)  scale(1.05); }
}

@keyframes squish-cat {
  0%, 100% { transform: scale(1, 1); }
  30%      { transform: scale(1.15, 0.85); }
  60%      { transform: scale(0.9,  1.1);  }
}

@keyframes pop {
  0%   { transform: scale(1);    }
  50%  { transform: scale(1.25); }
  100% { transform: scale(1);    }
}

@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0);     }
}

@keyframes fade-out-up {
  from { opacity: 1; transform: translateY(0);      }
  to   { opacity: 0; transform: translateY(-20px);  }
}
```

### Animation Cleanup

For cat animations (≤ 800 ms), a `setTimeout` removes the CSS class after `reaction.durationMs`. This ensures the cat always returns to its default state:

```js
function applyAnimationReaction(reaction) {
  cancelActiveReaction();          // clear any in-flight class/timeout
  catEl.classList.add(reaction.cssClass);
  activeReactionTimer = setTimeout(() => {
    catEl.classList.remove(reaction.cssClass);
  }, reaction.durationMs);
}
```

For speech bubbles, a two-phase timer handles display + fade:

```js
function applySpeechReaction(reaction) {
  cancelActiveReaction();
  bubbleEl.textContent = reaction.message;
  bubbleEl.classList.remove('opacity-0', 'pointer-events-none');
  activeReactionTimer = setTimeout(() => {
    bubbleEl.classList.add('opacity-0');
    setTimeout(() => {
      bubbleEl.classList.add('pointer-events-none');
    }, 300);
  }, reaction.displayMs);
}
```

`cancelActiveReaction()` clears the pending `setTimeout` and immediately removes any active class / hides any visible bubble, enabling the rapid-click replacement behaviour required by Requirement 1.3.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Reaction always comes from the pool

*For any* non-empty `REACTIONS` array, every reaction returned by `selectReaction()` must have an `id` that is present in that array. No reaction may be returned that was not declared in the pool.

**Validates: Requirements 1.1**

---

### Property 2: Pat counter increments by exactly 1

*For any* non-negative integer starting count `N`, after one call to `handlePet()`, the `state.count` must equal `N + 1`.

**Validates: Requirements 1.2**

---

### Property 3: No-repeat reaction selection

*For any* `REACTIONS` pool with 2 or more entries and any `lastReactionId` that is a valid id in that pool, `selectReaction(pool, lastReactionId)` must return a reaction whose `id` differs from `lastReactionId`.

**Validates: Requirements 1.5**

---

### Property 4: Animation reactions restore the cat within 800 ms

*For any* animation-type reaction in `REACTIONS`, after `applyAnimationReaction(reaction)` is called, the animation CSS class must be absent from the cat element within 800 ms.

**Validates: Requirements 2.3**

---

### Property 5: Speech bubble display and fade timing

*For any* speech-type reaction, after `applySpeechReaction(reaction)` is called: the bubble element must be visible (opacity > 0) immediately after the call and must be invisible (opacity-0 class present) no later than `reaction.displayMs + 350 ms` after the call.

**Validates: Requirements 2.4**

---

### Property 6: Speech bubble stays within viewport bounds

*For any* speech-type reaction, after display, the speech bubble element's `getBoundingClientRect()` must satisfy: `top >= 0`, `bottom <= window.innerHeight`, `left >= 0`, `right <= window.innerWidth`.

**Validates: Requirements 2.5**

---

### Property 7: Pat counter DOM update within 50 ms

*For any* starting count `N`, after `handlePet()` returns, the text content of `#pat-count` must equal `String(N + 1)` and this update must have occurred within 50 ms of the event firing.

**Validates: Requirements 3.2**

---

### Property 8: Counter pop animation clears within 200 ms

*For any* starting count, after `handlePet()`, the `pop` animation class must be absent from the pat counter element within 200 ms.

**Validates: Requirements 3.5**

---

### Property 9: Milestone banner appears at every milestone threshold

*For any* milestone value `M` in `MILESTONES`, when `state.count` transitions from `M - 1` to `M` via `handlePet()`, the milestone banner element must become visible (not hidden).

**Validates: Requirements 4.2**

---

### Property 10: Milestone banner message contains the threshold number

*For any* milestone value `M` in `MILESTONES`, the string returned by `getMilestoneBannerText(M)` must contain the string representation of `M` (i.e., `String(M)` is a substring of the output).

**Validates: Requirements 4.4**

---

### Property 11: No milestone banner fires above 1000

*For any* count value `N > 1000`, calling `handlePet()` when `state.count === N` must not cause the milestone banner to become visible.

**Validates: Requirements 4.5**

---

### Property 12: Keyboard Pet_Event produces identical state delta as mouse click

*For any* starting state, dispatching a `keydown` event with `key === 'Enter'` or `key === ' '` on the cat element must produce the same `state.count` increment and the same class of reaction (animation or speech) as a `click` event dispatched from the same starting state.

**Validates: Requirements 7.4**

---

### Property 13: localStorage write reflects new count after every pet

*For any* starting count `N`, after `handlePet()`, `localStorage.getItem('cat-clicker-pat-count')` must equal `String(N + 1)`.

**Validates: Requirements 8.1**

---

### Property 14: App init restores count from localStorage

*For any* non-negative integer `N` stored as a numeric string under `cat-clicker-pat-count` in `localStorage`, calling `loadCount()` must return `N`.

**Validates: Requirements 8.2**

---

### Property 15: Invalid localStorage values initialise count to 0

*For any* value stored under `cat-clicker-pat-count` that is absent, an empty string, a non-numeric string, or a negative number, `loadCount()` must return `0`.

**Validates: Requirements 8.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` unavailable (private browsing, quota exceeded) | Wrap `localStorage` calls in `try/catch`; gracefully degrade — count still works in memory |
| `localStorage` contains corrupt/unexpected value | `parseInt` + `isFinite` guard resets to 0 (see `loadCount()`) |
| Rapid successive clicks | `cancelActiveReaction()` called at start of every `handlePet()` — in-flight timers cleared, classes removed |
| REACTIONS pool has 1 entry | `selectReaction()` skips the no-repeat check when pool length < 2 (per Requirement 1.5) |
| Milestone banner while another banner is animating | `showMilestoneBanner()` cancels any pending hide timer before starting a new display cycle |
| Viewport resize while bubble is visible | Bubble uses CSS `max-width: calc(100vw - 2rem)` to self-constrain; position is recalculated on display, not on resize |

---

## Testing Strategy

### Unit Tests (Example-Based)

Framework: **Vitest** (or Jest-compatible, run via `npx vitest --run` — no watch mode needed for CI).

Test targets:

- `loadCount()` — concrete examples: `null`, `""`, `"abc"`, `"-5"`, `"42"` → expected outputs `0`, `0`, `0`, `0`, `42`.
- `selectReaction()` with pool of 1 — must return that single reaction regardless of `lastReactionId`.
- `getMilestoneBannerText(M)` — spot-check for M=10, M=100, M=1000.
- Rapid-click cancellation — trigger two pet events synchronously; assert only one reaction class is on the cat.
- REACTIONS static shape — `REACTIONS.length >= 8`, ≥3 animation, ≥4 speech, all `id`s unique, all speech messages unique.
- MILESTONES static content — exact set check.
- DOM element presence on init — `#cat`, `#pat-counter`, `#speech-bubble`, `#milestone-banner` all exist.

### Property-Based Tests (fast-check)

Library: **[fast-check](https://github.com/dubzzz/fast-check)** (`import fc from 'fast-check'`).
Minimum **100 iterations** per property. Each test is tagged with a comment referencing its design property.

```js
// Feature: cat-clicker-app, Property 2: Pat counter increments by exactly 1
fc.assert(
  fc.property(fc.nat({ max: 1_000_000 }), (startCount) => {
    state.count = startCount;
    handlePet();
    return state.count === startCount + 1;
  }),
  { numRuns: 100 }
);

// Feature: cat-clicker-app, Property 3: No-repeat reaction selection
fc.assert(
  fc.property(
    fc.array(fc.record({ id: fc.uuid(), type: fc.constant('animation'), cssClass: fc.constant(''), durationMs: fc.nat() }), { minLength: 2 }),
    fc.nat(),
    (pool, idx) => {
      const lastId = pool[idx % pool.length].id;
      const result = selectReaction(pool, lastId);
      return result.id !== lastId;
    }
  ),
  { numRuns: 200 }
);

// Feature: cat-clicker-app, Property 13: localStorage write reflects new count
fc.assert(
  fc.property(fc.nat({ max: 999 }), (startCount) => {
    state.count = startCount;
    handlePet();
    return localStorage.getItem('cat-clicker-pat-count') === String(startCount + 1);
  }),
  { numRuns: 100 }
);

// Feature: cat-clicker-app, Property 14: loadCount restores valid stored count
fc.assert(
  fc.property(fc.nat({ max: 1_000_000 }), (n) => {
    localStorage.setItem('cat-clicker-pat-count', String(n));
    return loadCount() === n;
  }),
  { numRuns: 100 }
);

// Feature: cat-clicker-app, Property 15: Invalid localStorage values → 0
fc.assert(
  fc.property(
    fc.oneof(
      fc.constant(null),
      fc.constant(''),
      fc.string().filter(s => isNaN(parseInt(s, 10))),
      fc.integer({ max: -1 }).map(String)
    ),
    (badValue) => {
      if (badValue === null) localStorage.removeItem('cat-clicker-pat-count');
      else localStorage.setItem('cat-clicker-pat-count', badValue);
      return loadCount() === 0;
    }
  ),
  { numRuns: 100 }
);

// Feature: cat-clicker-app, Property 10: Milestone banner message contains threshold number
fc.assert(
  fc.property(
    fc.constantFrom(...Array.from(MILESTONES)),
    (m) => getMilestoneBannerText(m).includes(String(m))
  ),
  { numRuns: 13 } // exhaustive over 13 milestones
);

// Feature: cat-clicker-app, Property 11: No banner fires above 1000
fc.assert(
  fc.property(fc.integer({ min: 1001, max: 2000 }), (n) => {
    state.count = n;
    const bannerEl = document.getElementById('milestone-banner');
    handlePet();
    return bannerEl.style.display === 'none' || bannerEl.classList.contains('opacity-0');
  }),
  { numRuns: 100 }
);
```

### Smoke / Static Checks

These run once as part of the unit test suite and verify static structure:

- `REACTIONS.length >= 8`
- Animation reactions: `filter(r => r.type === 'animation').length >= 3`
- Speech reactions: unique messages, `filter(r => r.type === 'speech').length >= 4`
- `MILESTONES` equals `new Set([10,25,50,100,200,300,400,500,600,700,800,900,1000])`
- `#cat` has `aria-label`, `cursor-pointer` class, and is a `<button>`
- `#pat-counter` has Glassmorphism classes: `bg-white/30`, `backdrop-blur-lg`, `rounded-full`

### Accessibility Checks

- Run [axe-core](https://github.com/dequelabs/axe-core) against the rendered HTML to catch ARIA and contrast violations.
- Manually verify focus ring visibility on the cat button at default browser zoom.
- Verify keyboard flow: Tab → cat focused → Enter fires pet event → counter increments.

### Visual / Responsive Checks (Manual)

- Render at 320px viewport width: cat ≥ 200×200 px.
- Render at 768px viewport width: cat ≥ 320×320 px.
- Speech bubble does not overflow at narrow viewports with long messages.
- Milestone banner legible at all breakpoints.
