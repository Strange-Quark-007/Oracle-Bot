# Oracle Bot

A custom Discord bot built for a friend's server.

### What It Does

- **Event Reminders**:

  - Sends an `@everyone` notifications at specified time (hard-coded) every alternate day for an event.

- **Translation via Flag Reactions**:

  - Translates text when users react with a country's flag emoji to the corresponding native language.

- **Translation Commands**:

  - Use `/translate to=<language> text=<message>` to translate text.
  - Use `/list-languages` to show list of supported languages. (supports 100+)

- **Schedule Controls**:

  - `/stop`: Stop event reminders.
  - `/reset-schedule`: Reset the reminder schedule.
  - `/get-schedule-date`: Sends the next schedule date.

## **License**

This project is licensed under the [MIT License](LICENSE).
