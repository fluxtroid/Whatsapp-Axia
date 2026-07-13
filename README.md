<div align="center">
  <img src="https://i.ibb.co/G34JVMzV/PHOTO-2026-07-13-13-09-07.jpg" alt="WhatsApp Axia Banner" width="50%" />

  # 🚀 WhatsApp Axia
  *A fast, highly customizable, and modular WhatsApp Bot Boilerplate.*

  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?logo=node.js)](https://nodejs.org/)
  [![Baileys](https://img.shields.io/badge/Baileys-Latest-blue.svg)](https://github.com/WhiskeySockets/Baileys)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Author](https://img.shields.io/badge/Author-FluxTroid-orange.svg)](https://github.com/FluxTroid)
</div>

---

## Overview
**WhatsApp Axia** is a professionally structured WhatsApp Bot boilerplate built using Node.js and the [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) library. It is designed to be extremely lightweight and developer-friendly, featuring a dynamic plugin system that allows you to add new commands without touching the core code.

## Features
- 🔑 **Pairing Code Login:** No need to scan QR codes! Log in directly using your WhatsApp phone number.
- 🧩 **Dynamic Command Handler:** Drop a new `.js` file into the `commands` folder, and it automatically becomes a bot command.
- ⚙️ **In-Chat Configuration:** Change bot name, prefix, and public/private modes directly via WhatsApp commands (No need to restart).
- 📝 **Auto-Generated Menu:** The `!menu` command automatically updates itself based on your loaded plugins.
- 🛡️ **Public & Private Modes:** Restrict bot usage to just the owner or open it up to everyone.

---

## Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (Version 18 or higher) installed on your system.

### 2. Clone the Repository
```bash
git clone [https://github.com/FluxTroid/whatsapp-axia.git](https://github.com/FluxTroid/whatsapp-axia.git)
cd whatsapp-axia
```
(This will automatically install Baileys, Pino, and other required libraries).


### 3.Install Dependencies
```bash
npm install
```

## Usage
To start the bot, simply run:
```bash
npm start
```
(Or use npm run dev to start with Nodemon for auto-restarts during development).

## Login Process:
Check your terminal.

- **Enter your WhatsApp number with the country code (e.g., 947XXXXXXXX).

- **An 8-character Pairing Code will appear.

- **Open WhatsApp on your phone -> Linked Devices -> Link with phone number instead and enter the code.

## Creating New Plugins (Commands)
Creating a new command is incredibly easy. Just create a new `.js` file inside the `src/commands/` directory.

Example: `src/commands/hello.js`

```bash
module.exports = {
    name: 'hello',
    category: 'General 🛠️',
    desc: 'Replies with a friendly greeting',
    execute: async (sock, msg, args, commands, config) => {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Hello there! 👋' }, { quoted: msg });
    }
};
```
That's it! Type `!hello` in WhatsApp, and the bot will reply. It will also automatically appear in the `!menu`.

## Admin Commands (Owner Only)
You can manage the bot dynamically without editing the code:

- `!set botname [name]` | Changes the bot's display name
- `!set prefix [symbol]` | Changes the command prefix
- `!set mode [mode]` | Switches between public and private
- `set owner [number]` | Changes the bot owner

## Author
GitHub: @FluxTroid
