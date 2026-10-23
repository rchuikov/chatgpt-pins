# ChatGPT Pins

A lightweight [Tampermonkey](https://www.tampermonkey.net/) userscript that lets you add bookmarks to ChatGPT conversations and quickly navigate back to them **without opening another tab**.

ChatGPT creates and manages bookmark links through natural-language instructions. The userscript handles navigation, including scrolling through dynamically loaded conversation history.

No manual bookmark IDs, conversation URLs, or link copying required.

## Features

- Bookmark any point in a ChatGPT conversation.
- Jump to bookmarks in the current tab.
- Automatically scroll through older messages as ChatGPT loads conversation history.
- Display notifications while searching and when a bookmark is found or unavailable.
- Use natural-language commands to create, change, enable, or disable bookmarks.
- No dependencies, build tools, or external services.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open **[Install ChatGPT Pins](https://raw.githubusercontent.com/rchuikov/chatgpt-pins/main/chatgpt-pins.user.js)**.
3. Confirm the installation in Tampermonkey.
4. Open or reload [ChatGPT](https://chatgpt.com/).

The userscript can receive updates from GitHub through Tampermonkey.

## Configure ChatGPT

ChatGPT is responsible for generating bookmark markers and links. The userscript only handles navigation.

For the best experience, add the following instructions to your ChatGPT custom instructions under **Settings → Personalization**.

You only need to configure this once.

### Suggested prompt

```text
I have the ChatGPT Pins Tampermonkey userscript installed in my browser.

When I ask you to enable bookmarks in a conversation, start using them.

Whenever I ask you to create a new bookmark, add a unique heading marker in the format CHATGPT_PIN_YYYYMMDD_HASH, where HASH is an arbitrary unique identifier.

Do not repeat the marker in the visible text of other messages.

While bookmarks are enabled, append a compact link labeled "📌 Latest bookmark" to the end of your replies, using this URL format:

https://chatgpt.com/#chatgpt-pin=MARKER

When I ask you to create another bookmark, generate a new marker and use the new bookmark link in subsequent replies.

Do not ask me to provide conversation URLs, manually generate bookmark IDs, or copy links.

Do not enable bookmarks automatically in every conversation. Only enable them when I explicitly request it.

When I ask you to disable bookmarks, stop creating markers and displaying bookmark links until I explicitly enable them again.

Follow my instructions if I ask you to change the way bookmarks are created, displayed, or managed.
```

## Usage

Once configured, simply talk to ChatGPT.

**Enable bookmarks**

> Enable bookmarks in this conversation.

ChatGPT creates a bookmark for the current point and starts including a link to the latest bookmark in its replies.

**Create another bookmark**

> Create a new bookmark here.

ChatGPT generates a new unique marker and updates the link in subsequent replies.

**Return to a bookmark**

Click **📌 Latest bookmark** in any reply containing the link. The userscript searches the conversation history and scrolls to the bookmarked message without opening another tab.

**Disable bookmarks**

> Disable bookmarks.

ChatGPT stops appending bookmark links until you enable them again.

## Tips

- **Customize the behavior.** ChatGPT Pins is only a navigation tool. You are free to decide how ChatGPT creates bookmarks, when it creates them, how links are displayed, and what they are called.
- **Use your own language.** You don't need to use the exact example commands. Communicate with ChatGPT naturally.
- **Organize conversations your way.** Bookmarks can mark important explanations, decisions, code examples, completed tasks, topic changes, or anything else worth returning to.
- **Switch bookmarks whenever you want.** Simply ask ChatGPT to stop using the previous bookmark and create a new one.
- **Use global custom instructions.** Adding the suggested prompt to ChatGPT's personalization settings avoids repeating configuration instructions in every conversation.
- **Keep bookmarks optional.** Ask ChatGPT to enable or disable them whenever they are useful or unnecessary.
- **Modify the suggested prompt.** You can change the bookmark labels, activation commands, or other behavior to match your preferences.

## How It Works

ChatGPT generates a unique bookmark marker in a message heading:

```text
CHATGPT_PIN_20261023_A7B9C2 — Important explanation
```

Subsequent replies contain a link to that marker:

```text
https://chatgpt.com/#chatgpt-pin=CHATGPT_PIN_20261023_A7B9C2
```

When you click the link, the userscript:

1. Intercepts the click before ChatGPT handles it.
2. Extracts the bookmark marker from the URL.
3. Searches the rendered conversation for the matching heading.
4. Scrolls backward through conversation history if the heading is not currently loaded.
5. Navigates to the matching heading and displays a confirmation.

The search has a timeout to prevent endless scrolling.

## Limitations

- The userscript depends on ChatGPT's current DOM structure. Changes to the ChatGPT interface may require updates.
- Bookmarks work within the currently open conversation, not across different chats.
- Navigation depends on the bookmarked message remaining available in the conversation.
- ChatGPT generates bookmark markers and links according to its instructions; the userscript does not create or store bookmarks independently.
- Very long conversations may require additional time to load older messages.

## License

MIT License.

Copyright © 2026 Roman Chuikov.
