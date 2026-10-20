# Leads Tracker

A Manifest V3 Chrome extension for saving URLs from the current tab or a text field. Leads are stored locally in the popup's `localStorage`; there is no account, server, or analytics.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select the repository folder.
4. Open the extension from the toolbar. Enter a full HTTP(S) address or choose **Save Tab**.

Double-click **Delete All** to clear saved leads. Only this extension's lead key is removed. The extension requests `activeTab`, so it can read the current page URL when you open it without persistent access to every tab.

## Develop

Use Node.js 22.12 or newer:

```sh
npm ci
npm run dev
npm test
npm run build
```

The browser preview supports manual URL entry; **Save Tab** is disabled outside the installed extension. Load the repository folder directly for extension testing; the Vite output is a web preview, not an extension package.

Only HTTP(S) URLs are accepted, duplicates are ignored, and saved values render through DOM text nodes. Up to 500 URLs are retained. Uninstalling the extension or clearing its site data removes them; export and synchronization are not implemented.
