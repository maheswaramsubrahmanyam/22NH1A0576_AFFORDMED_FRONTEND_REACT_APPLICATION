# System Design Document — Affordmed URL Shortener (Frontend-only)

This concise document outlines architectural choices, data modeling, technology selections, and assumptions for a secure, client-side URL Shortener built for the Affordmed internship project.

## 1) Goals and Scope
- Provide a secure, frontend-only URL shortener with unique shortcodes, configurable validity, client-side redirection, analytics, and Material UI-based responsive UI.
- Respect confidentiality and replace console logging with a custom logging middleware.

Out of scope: Server-side storage, authentication, and external APIs (per instructions).

## 2) High-Level Architecture
- React SPA (Vite) with React Router for client-side routing.
- State and persistence are fully client-side using localStorage.
- Redirect flow: `/:shortCode` route resolves to original URL if not expired, records analytics, then redirects.
- Clean layering:
  - UI Layer: `components/*` built with Material UI.
  - Application/Domain Utilities: `utils/urlUtils.js` (validation, expiry, shortcode ops), `utils/storage.js` (persistence abstraction), `utils/logger.js` (custom logging middleware).
  - Routing Layer: Declared in `App.jsx`; BrowserRouter in `main.jsx` to avoid context bootstrapping issues.

Why this structure?
- Clear separation of concerns: UI, persistence, domain logic, and cross-cutting concerns (logging) are isolated and testable.
- Resilient to expansion: Utilities can be replaced by network-backed services later with minimal UI changes.

## 3) Key Design Decisions
- Frontend-only persistence: localStorage chosen over IndexedDB for simplicity and low write volume. `StorageManager` centralizes schema and error handling.
- Shortcode generation: Random alphanumeric (length 6 default) with collision checks in current dataset; user-supplied shortcodes validated and checked for uniqueness.
- Validity: Default 30 minutes; user-configurable up to 24 hours; `expiresAt` stored and evaluated on read.
- Redirect handling: Dedicated `RedirectHandler` component performs validation, analytics capture, and delayed redirect for UX feedback.
- Logging: Custom middleware (`logger.js`) instead of console, with levels (INFO/WARN/ERROR/DEBUG) and bounded in-memory store mirrored to localStorage for auditing.
- Error and state handling: Guard clauses, user-friendly alerts, and resilient parsing/serialization around storage I/O.
- Responsive UI/UX: Material UI theme, grid breakpoints, mobile-first layouts; card layout for mobile, tables for desktop.

## 4) Data Modeling
All data is stored in localStorage via `StorageManager` with namespaced keys.

### 4.1 Entities
- ShortenedUrl
  - `id: number` — unique local identifier
  - `shortCode: string` — unique shortcode
  - `originalUrl: string`
  - `createdAt: number` — epoch ms
  - `expiresAt: number` — epoch ms
  - `validity: number` — minutes
  - `isCustom: boolean` — whether shortcode is user-provided

- Analytics
  - Keyed by `shortCode: string` → `Click[]`
  - Click
    - `timestamp: number`
    - `referrer: { referrer: string, userAgent: string, timestamp: number }`
    - `location?: { latitude: number, longitude: number, accuracy: number } | null`

### 4.2 Storage Keys
- `affordmed_shortened_urls: ShortenedUrl[]`
- `affordmed_analytics: { [shortCode: string]: Click[] }`
- `affordmed_settings` (reserved for future preferences)
- `affordmed_logs` (last 100 log entries for diagnostics)

### 4.3 Validation Rules
- URL must be valid http/https; normalized to add protocol if missing.
- Custom shortcode: 3–20 alphanumeric chars; uniqueness enforced against current dataset.
- Validity: 1–1440 minutes; default 30.

## 5) Client-Side Routing
- Declared in `App.jsx`; BrowserRouter in `main.jsx`.
- Routes:
  - `/` — URL Shortener
  - `/statistics` — Analytics dashboard
  - `/:shortCode` — Redirection handler
  - Fallback to `/`

Rationale:
- Redirection must remain client-only; routing allows mapping shortcodes to records without a server.

## 6) Technology Selections and Justifications
- React + Vite: Fast dev experience, HMR, modern React features.
- Material UI: Mature component system, theming, accessibility, and responsive grid.
- React Router: Declarative client-side routing and parameterized paths.
- localStorage: Simple, synchronous persistence for small data volumes; no external dependencies.

Alternatives considered:
- IndexedDB for larger datasets; deferred due to project scope and added complexity.
- CSS-only approach; rejected in favor of MUI consistency, accessibility, and velocity.

## 7) Security, Privacy, and Compliance
- No network calls; all data remains on the client.
- Uses browser Geolocation only with explicit user permission; failures/logging handled gracefully.
- Avoids `console.log`; logs are stored locally and bounded to limit exposure.
- Input sanitation: URL normalization, strict regex validation for shortcodes, numeric bounds for validity.
- Confidentiality: Project logic and data are confined to evaluation scope.

## 8) Scalability and Maintainability
- Clear API boundaries (`StorageManager`, `URLUtils`, `Logger`) facilitate swapping storage with a backend later (e.g., REST/GraphQL) without UI rewrites.
- Data growth: localStorage limits (~5–10MB). For production scale, migrate to backend or IndexedDB; entity shapes already compatible.
- Performance: Minimal re-renders via localized state; batch operations; lazy/conditional rendering of analytics.
- Theming and layout tokens centralize visual design, enabling easy brand customization.

## 9) Error Handling and Observability
- Guard clauses for validation errors with inline helper text and alerts.
- Storage failures wrapped in try/catch with log entries.
- Redirect failures (not found / expired) show actionable UI with CTA back to home.
- Logger levels enable lightweight diagnostics without console noise.

## 10) Accessibility & UX
- MUI components provide baseline accessibility and keyboard support.
- Contrast-aware palette; focusable controls; large touch targets on mobile.
- Mobile-first layouts (cards) and desktop tables for dense data.

## 11) Testing Strategy (lightweight for scope)
- Manual validation of core flows: create → copy → redirect → analytics.
- Edge cases: invalid URL, shortcode collisions, expiry, localStorage quotas, denied geolocation.
- Future: Component/unit tests for `urlUtils` and `storage` using Vitest/Jest.

## 12) Assumptions
- Frontend-only requirement; no auth; all API-like access is pre-authorized.
- Single-user context on a single browser profile; persistence is per-browser.
- Analytics accuracy is best-effort; geolocation may be null.

## 13) Known Limitations & Future Enhancements
- localStorage size limits and synchronous I/O.
- No cross-device/link sharing persistence without a backend.
- Analytics are sampled only on client; prone to ad-blockers.

Future work:
- Replace localStorage with IndexedDB or remote backend (with rate limits and auth).
- Add service worker for offline UX and cache strategies.
- Export/import data; bulk management tools; richer analytics (unique users, UTM parsing).
- Add i18n and automated accessibility tests.


