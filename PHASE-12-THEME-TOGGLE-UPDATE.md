# Phase 12 refinement — Light/Dark toggle

- Added a quick Light/Dark toggle to the top navigation.
- Replaced the appearance dropdown in Settings with an accessible switch.
- Theme changes are saved immediately when using the top navigation toggle and saved with Settings when using the settings switch.
- Existing `system` preferences remain supported for users whose saved setting is still `system`; changing the switch selects explicit Light or Dark mode.
- Preserved the `subtrack.v1` storage key and existing subscription data.

Run `npm install`, `npm test`, and `npm run dev` to verify locally.
