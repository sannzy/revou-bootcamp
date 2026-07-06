# Implementation Plan: Cat Clicker App

## Overview

Build a single `index.html` file using HTML5, Tailwind CSS (CDN), and Vanilla JavaScript. All markup, styles, and logic live in one file. Tasks are ordered so each step extends the previous one; nothing is left unintegrated.

---

## Tasks

- [x] 1. Project scaffold — `index.html` skeleton
  - [x] 1.1 Create `index.html` with HTML5 boilerplate, `<meta charset>`, `<meta name="viewport">`, and `<title>`
    - Add the Tailwind CSS CDN `<script>` tag in `<head>`
    - Add the Google Fonts `<link>` for `Quicksand` (weights 400, 600, 700)
    - Apply `font-family: 'Quicksand', sans-serif` to `html` or `body` via an inline `<style>` block
    - Add empty `<style>` and `<script>` blocks as placeholders for subsequent tasks
    - _Requirements: 5.3, 5.4_

- [x] 2. Pastel gradient background and centered layout
  - [x] 2.1 Add full-viewport pastel gradient background and Flexbox centering
    - Set `min-h-screen` `flex flex-col items-center justify-center` on `<body>`
    - Apply static CSS gradient from `#FFDEE9` to `#B5FFFC` (use `background: linear-gradient(135deg, #FFDEE9, #B5FFFC)`) in the `<style>` block
    - Verify the gradient covers the full viewport with no scroll bars on a blank page
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Cat inline SVG + button wrapper
  - [x] 3.1 Create the cat button and SVG illustration
    - Add `<button id="cat" aria-label="Pet the cat" class="cursor-pointer aspect-square focus:outline-none focus:ring-4 focus:ring-pink-300">` centered inside body
    - Embed a minimalist inline SVG cat (sitting pose: rounded body, ears, eyes, whiskers, small blush marks — no text or labels)
    - Add a soft surface element (e.g., a wide ellipse or rounded rectangle) beneath the cat SVG to represent a cushion or mat
    - Apply responsive sizing: `w-48 h-48 sm:w-80 sm:h-80` (≥200 px mobile, ≥320 px desktop) on the `<button>`
    - Verify `aria-label`, `cursor-pointer`, `aspect-square`, and focus ring are present
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.5, 5.5, 5.6_

- [x] 4. CSS keyframes for animations
  - [x] 4.1 Write all animation keyframes in the `<style>` block
    - Define `@keyframes bounce-cat` (translateY with 0/40/70/100% stops and slight scale)
    - Define `@keyframes wiggle-cat` (rotate ±8 deg with scale)
    - Define `@keyframes squish-cat` (scale X/Y compression then spring)
    - Define `@keyframes pop` (scale 1 → 1.25 → 1 over 200 ms)
    - Define `@keyframes fade-in-down` and `@keyframes fade-out-up` (opacity + translateY)
    - Bind each keyframe to a class: `.animate-bounce-cat`, `.animate-wiggle-cat`, `.animate-squish-cat`, `.pop`, `.fade-in-down`, `.fade-out-up`
    - Set `animation-fill-mode: forwards` where needed and `animation-timing-function: ease-in-out`
    - _Requirements: 2.3, 3.5, 4.3_

- [x] 5. Speech bubble component markup
  - [x] 5.1 Add the speech bubble element to HTML and style it
    - Add `<div id="speech-bubble" class="absolute opacity-0 pointer-events-none …">` near the cat container
    - Style with rounded corners, pastel background, drop shadow, and `transition: opacity 300ms`
    - Set `max-width: calc(100vw - 2rem)` to prevent viewport overflow
    - Position it above or beside the cat using absolute CSS positioning relative to a wrapping container
    - _Requirements: 2.5_

- [x] 6. Pat counter display
  - [x] 6.1 Add the Pat Counter HTML element with Glassmorphism styling
    - Add `<div id="pat-counter" class="bg-white/30 backdrop-blur-lg rounded-full border border-white/40 px-6 py-3 mt-6 flex items-center gap-2">`
    - Inside, add `<span id="pat-count">0</span>` and a static label (`🐾 Pats`)
    - Apply the `pop` keyframe class definition so it can be toggled by JS
    - Verify Glassmorphism classes (`bg-white/30`, `backdrop-blur-lg`, `rounded-full`) are present
    - _Requirements: 3.1, 3.3, 3.4_

- [x] 7. Milestone banner component markup
  - [x] 7.1 Add the Milestone Banner HTML element
    - Add `<div id="milestone-banner" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style="display:none">`
    - Inside, add a styled card `<div>` with congratulatory text placeholder `<p id="milestone-text"></p>`
    - Style the card with large font, Glassmorphism background, rounded corners, and padding
    - _Requirements: 4.2, 4.4_

- [x] 8. JavaScript constants and state
  - [x] 8.1 Define `REACTIONS` array and `MILESTONES` set in the `<script>` block
    - Declare `const REACTIONS = [...]` with exactly 8+ entries (≥3 animation, ≥4 speech) matching the design shape
    - Each animation entry: `{ id, type: 'animation', cssClass, durationMs }` with `durationMs ≤ 800`
    - Each speech entry: `{ id, type: 'speech', message, displayMs }` with `displayMs` 1500–2500
    - Declare `const MILESTONES = new Set([10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])`
    - Declare `const state = { count: 0, lastReactionId: null }`
    - Cache DOM references: `catEl`, `bubbleEl`, `patCountEl`, `patCounterEl`, `milestoneBannerEl`, `milestoneTextEl`
    - Declare `let activeReactionTimer = null`
    - _Requirements: 1.4, 2.1, 2.2, 4.1_

- [x] 9. `selectReaction()` function with no-repeat logic
  - [x] 9.1 Implement `selectReaction(pool, lastId)` pure function
    - If `pool.length < 2`, return `pool[0]` directly (no-repeat rule waived per Requirement 1.5)
    - Otherwise filter out any entry whose `id === lastId`, then pick randomly from the filtered list
    - Return the selected reaction object
    - _Requirements: 1.1, 1.5_
  - [ ]* 9.2 Write property test for `selectReaction()` (Property 1 and Property 3)
    - **Property 1: Reaction always comes from the pool** — for any non-empty array, result id must be in the pool
    - **Property 3: No-repeat reaction selection** — for any pool with ≥2 entries and any valid `lastId`, result id must differ from `lastId`
    - **Validates: Requirements 1.1, 1.5**
    - Use `fast-check`: `fc.array(reactionArb, { minLength: 2 })` + `fc.nat()` to select `lastId` index

- [x] 10. `cancelActiveReaction()` and reaction application functions
  - [x] 10.1 Implement `cancelActiveReaction()`, `applyAnimationReaction(reaction)`, and `applySpeechReaction(reaction)`
    - `cancelActiveReaction()`: clear `activeReactionTimer`, remove all animation CSS classes from `catEl`, set `bubbleEl` to `opacity-0 pointer-events-none`
    - `applyAnimationReaction(reaction)`: call `cancelActiveReaction()`, add `reaction.cssClass` to `catEl`, set timer to remove it after `reaction.durationMs`
    - `applySpeechReaction(reaction)`: call `cancelActiveReaction()`, set `bubbleEl.textContent`, remove `opacity-0`/`pointer-events-none`, set two-phase timer for fade-out after `reaction.displayMs` + 300 ms cleanup
    - _Requirements: 1.3, 2.3, 2.4_
  - [ ]* 10.2 Write property tests for animation and speech timing (Properties 4 and 5)
    - **Property 4: Animation reactions restore cat within 800 ms** — animation CSS class must be absent ≤800 ms after `applyAnimationReaction()`
    - **Property 5: Speech bubble display and fade timing** — bubble visible immediately; `opacity-0` present ≤ `displayMs + 350 ms`
    - **Validates: Requirements 2.3, 2.4**
    - Use fake timers (`vi.useFakeTimers()`) with `fc.constantFrom(...animationReactions)` and `fc.constantFrom(...speechReactions)`

- [x] 11. `renderCounter()` and `incrementCounter()` functions
  - [x] 11.1 Implement counter rendering with pop animation
    - `incrementCounter()`: `state.count += 1`
    - `renderCounter()`: set `patCountEl.textContent = String(state.count)`, add class `pop` to `patCounterEl`, `setTimeout` to remove `pop` after 200 ms
    - _Requirements: 3.1, 3.2, 3.5_
  - [ ]* 11.2 Write property tests for counter increment and DOM update (Properties 2 and 7)
    - **Property 2: Pat counter increments by exactly 1** — `state.count` must equal `startCount + 1` after `handlePet()`
    - **Property 7: Pat counter DOM update within 50 ms** — `#pat-count` text must equal `String(N+1)` immediately after `handlePet()` returns
    - **Validates: Requirements 1.2, 3.2**
    - Use `fc.nat({ max: 1_000_000 })` for start count
  - [ ]* 11.3 Write property test for pop animation clearance (Property 8)
    - **Property 8: Counter pop animation clears within 200 ms**
    - **Validates: Requirements 3.5**
    - Use fake timers; advance clock 200 ms and assert `pop` class is absent

- [x] 12. `getMilestoneBannerText()` and `showMilestoneBanner()` functions
  - [x] 12.1 Implement milestone text helper and banner display
    - `getMilestoneBannerText(m)`: return a string that includes `String(m)` (e.g., `"🎉 ${m} pats! Amazing!"`)
    - `showMilestoneBanner(m)`: cancel any pending hide timer, set `milestoneTextEl.textContent`, remove `display:none`, add `fade-in-down` class, `setTimeout` 2500 ms → add `fade-out-up`, `setTimeout` 400 ms → set `display:none`, remove animation classes
    - `checkMilestone(count)`: if `MILESTONES.has(count)`, call `showMilestoneBanner(count)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 12.2 Write property tests for milestone banner (Properties 9, 10, and 11)
    - **Property 9: Milestone banner appears at every milestone threshold** — banner becomes visible when count transitions to a milestone value
    - **Property 10: Milestone banner message contains threshold number** — `getMilestoneBannerText(M)` must include `String(M)` for all M in MILESTONES
    - **Property 11: No milestone banner fires above 1000** — banner must not appear for count > 1000
    - **Validates: Requirements 4.2, 4.4, 4.5**
    - Use `fc.constantFrom(...Array.from(MILESTONES))` for properties 9 and 10; `fc.integer({ min: 1001, max: 2000 })` for property 11

- [x] 13. `persistCount()` and `loadCount()` — localStorage persistence
  - [x] 13.1 Implement `loadCount()` and `persistCount(count)` with error handling
    - `loadCount()`: wrap in `try/catch`; `parseInt(raw, 10)`; return value only if `Number.isFinite(parsed) && parsed >= 0`, else `0`
    - `persistCount(count)`: wrap in `try/catch`; `localStorage.setItem('cat-clicker-pat-count', String(count))`; silently swallow errors (graceful degradation)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 13.2 Write property tests for localStorage persistence (Properties 13, 14, and 15)
    - **Property 13: localStorage write reflects new count after every pet** — `localStorage.getItem('cat-clicker-pat-count')` must equal `String(N+1)` after `handlePet()`
    - **Property 14: App init restores count from localStorage** — `loadCount()` must return `N` for any valid stored `N`
    - **Property 15: Invalid localStorage values initialise count to 0** — absent, empty, non-numeric, or negative stored values must yield `0`
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Use `fc.nat({ max: 1_000_000 })` for property 14; `fc.oneof(fc.constant(null), fc.constant(''), ...)` for property 15

- [x] 14. `handlePet()` orchestration function
  - [x] 14.1 Implement `handlePet()` as the single entry-point for all pet events
    - Call `selectReaction(REACTIONS, state.lastReactionId)` and store result
    - Call `applyAnimationReaction(reaction)` or `applySpeechReaction(reaction)` depending on `reaction.type`
    - Update `state.lastReactionId = reaction.id`
    - Call `incrementCounter()` then `renderCounter()`
    - Call `checkMilestone(state.count)`
    - Call `persistCount(state.count)`
    - _Requirements: 1.1, 1.2, 1.3, 3.2, 4.2, 8.1_

- [x] 15. App initialisation and event wiring
  - [x] 15.1 Implement `initApp()` and attach all event listeners
    - `initApp()`: call `state.count = loadCount()`, call `renderCounter()` (displays restored count without animation)
    - Add `click` listener on `catEl` → `handlePet()`
    - Add `keydown` listener on `catEl` → if `event.key === 'Enter' || event.key === ' '` → `event.preventDefault()` + `handlePet()`
    - Call `initApp()` at the bottom of the script
    - _Requirements: 7.3, 7.4, 8.2_
  - [ ]* 15.2 Write property test for keyboard/mouse parity (Property 12)
    - **Property 12: Keyboard Pet_Event produces identical state delta as mouse click**
    - **Validates: Requirements 7.4**
    - For any starting state, dispatching `keydown` Enter vs `click` from the same start should yield the same `state.count` delta and same reaction type class

- [x] 16. Responsive sizing verification and viewport-safe speech bubble
  - [x] 16.1 Verify and fix responsive cat sizing and speech bubble overflow
    - Confirm `w-48 h-48` (192 px ≥ 200 px) on mobile and `sm:w-80 sm:h-80` (320 px) on desktop are correctly applied
    - If Tailwind CDN does not pick up the exact classes, add explicit CSS override in `<style>`: `@media (max-width:639px) { #cat { min-width:200px; min-height:200px; } }` and `@media (min-width:640px) { #cat { min-width:320px; min-height:320px; } }`
    - Verify `#speech-bubble` has `max-width: calc(100vw - 2rem)` and does not overflow at 320 px viewport width
    - _Requirements: 5.5, 5.6, 2.5_

- [-] 17. Checkpoint — full smoke pass
  - Open `index.html` in a browser. Click the cat 10 times and confirm: counter increments, reactions fire, milestone banner appears at count 10, localStorage value updates, page reload restores count.
  - Run unit + property tests: `npx vitest --run`
  - Ensure all tests pass; ask the user if any questions arise.

- [ ] 18. Unit test suite setup and static checks
  - [-] 18.1 Set up Vitest test file with static shape checks
    - Create `cat-clicker.test.js` (or `.ts`) adjacent to `index.html` (or in a `__tests__` folder)
    - Install `vitest` and `fast-check` as dev dependencies: `npm install --save-dev vitest fast-check`
    - Add `"test": "vitest --run"` to `package.json` scripts
    - Export the testable pure functions (`loadCount`, `selectReaction`, `getMilestoneBannerText`, `persistCount`) from a separate `catClicker.js` module, or use a test-only export pattern via `window.__test__` if keeping single-file
    - _Requirements: 1.4, 2.1, 2.2, 4.1_
  - [ ]* 18.2 Write unit tests for static invariants
    - `REACTIONS.length >= 8`
    - `filter(r => r.type === 'animation').length >= 3` and all `durationMs <= 800`
    - `filter(r => r.type === 'speech').length >= 4` and all `displayMs` in 1500–2500
    - All reaction `id`s are unique; all speech `message`s are unique
    - `MILESTONES` equals `new Set([10,25,50,100,200,300,400,500,600,700,800,900,1000])`
    - `loadCount()` concrete examples: `null` → 0, `""` → 0, `"abc"` → 0, `"-5"` → 0, `"42"` → 42
    - `getMilestoneBannerText` spot-checks for M=10, M=100, M=1000
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 4.1, 8.2, 8.3_
  - [ ]* 18.3 Write axe-core accessibility check
    - Install `@axe-core/vitest` or use `axe-core` with jsdom
    - Assert zero critical/serious violations on the rendered `index.html`
    - _Requirements: 7.1, 7.2, 7.5_

- [~] 19. Final checkpoint — all tests pass
  - Run `npx vitest --run` and confirm all test suites pass (unit + property-based).
  - Verify no console errors appear on page load in the browser.
  - Ensure all tests pass; ask the user if any questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- All property tests reference a specific design property number (Property N) for traceability.
- `fast-check` property tests should use `numRuns: 100` minimum (Property 10 uses 13 to be exhaustive over all milestones).
- If staying truly single-file, expose pure functions via `window.__test__ = { loadCount, selectReaction, getMilestoneBannerText }` only in test environments to keep the production file clean.
- Wrap all `localStorage` access in `try/catch` so the app degrades gracefully in private browsing.
- Tailwind CDN JIT may not include all arbitrary values — add explicit `<style>` overrides for any class that doesn't render as expected.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["4.1", "5.1", "6.1", "7.1"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["9.1", "13.1"] },
    { "id": 6, "tasks": ["9.2", "10.1", "13.2"] },
    { "id": 7, "tasks": ["10.2", "11.1", "12.1"] },
    { "id": 8, "tasks": ["11.2", "11.3", "12.2", "14.1"] },
    { "id": 9, "tasks": ["15.1", "16.1"] },
    { "id": 10, "tasks": ["15.2", "18.1"] },
    { "id": 11, "tasks": ["18.2", "18.3"] }
  ]
}
```
