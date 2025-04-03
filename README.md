# **Oracle Bot**

A custom-built Discord bot designed for a friend, offering **custom event reminders, real-time translations, and now showcasing bot stats**.

## 🚀 **Bot Stats**

Stay updated with **translation stats** using the **`/stats` command in Discord** or by viewing an **auto-updating SVG** for stats directly via the **REST API**.

<br/>

![Bot Stats](http://129.154.238.15:3000/api/stats)

## 🎯 **What It Does**

### ⏰ **Event Reminders**

- Sends an **`@everyone` notification** at a specified time (hard-coded) every alternate day for event reminder.

### 🌍 **Translation via Flag Reactions**

- **Translates text** when users react with a country's flag emoji to the corresponding native language.

### 📝 **Translation Commands**

- **`/translate to=<language> text=<message>`** - **Translates text** to the specified language.
- **`/list-languages`** - **Shows a list** of supported languages (**100+**).

### 🔧 **Schedule Controls**

- **`/stop`** - **Stops event reminders.**
- **`/reset-schedule`** - **Resets the reminder schedule.**
- **`/get-schedule-date`** - **Sends the next schedule date.**

## 📜 **License**

This project is licensed under the **[MIT License](LICENSE)**.
