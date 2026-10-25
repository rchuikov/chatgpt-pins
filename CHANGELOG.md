# Changelog

All notable changes to ChatGPT Pins are documented in this file.

## [1.0.1] - 2026-10-25

### Added

- A **Cancel search** button to stop an active search. The close button continues to dismiss only the notification.
- Screen reader support for search notifications through `role="status"` and `aria-live="polite"`, plus an accessible label for the close button.

### Fixed

- Prevented searches from ending prematurely when scrolling reaches the top while older messages are still loading. Searches now continue until the bookmark is found, the search is cancelled, the conversation changes, the scroll container is removed, or the 120-second timeout expires.
- Stopped active searches silently when the conversation URL changes or the scroll container is removed, preventing the old search from continuing in another conversation.
- Changed the timeout notification to **Bookmark not found. Search timed out.**

## [1.0.0] - 2026-10-23

### Added

- Initial public release of ChatGPT Pins, a standalone Tampermonkey userscript for ChatGPT conversations.
- Navigation to AI-assisted bookmarks identified by `CHATGPT_PIN_...` headings and matching bookmark links.
- In-page navigation without opening a new tab when a bookmark link is clicked normally.
- Upward search through dynamically loaded conversation history, with a configured 120-second timeout.
- Search progress and result notifications with a close button.
- Replacement of an active search when another bookmark link is clicked.
- Tampermonkey update and download URLs for automatic updates from GitHub.

[1.0.1]: https://github.com/rchuikov/chatgpt-pins/releases/tag/1.0.1
[1.0.0]: https://github.com/rchuikov/chatgpt-pins/releases/tag/1.0.0
