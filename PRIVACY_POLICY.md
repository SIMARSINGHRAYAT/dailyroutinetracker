# Privacy Policy for Daily Routine Tracker

**Last Updated:** October 2026

Welcome to **Daily Routine Tracker**. We respect your privacy and are committed to transparently protecting your personal and routine tracking data. This Privacy Policy explains what information is collected, how it is used, and how your privacy is safeguarded.

---

## 1. Summary

- **Zero Personal Identifiers**: Daily Routine Tracker does not collect names, email addresses, phone numbers, passwords, payment info, or government identifiers.
- **Anonymous Operation**: Routine data is keyed to an anonymous, locally generated device identifier so you can use the app without creating an account.
- **No Selling or Advertising**: We do not sell, rent, monetize, or share your data with advertisers or third-party data brokers.

---

## 2. Information We Access and Collect

Daily Routine Tracker collects only the minimal data strictly necessary to deliver routine tracking functionality:

1. **Routine & Task Data**:
   - Routine/tracker titles and descriptions
   - Number of active days and routine duration
   - Task lists, task sorting order, and icon/color preferences
   - Daily completion checkmarks (true/false completion states)
2. **Anonymous Device Identifier**:
   - A randomly generated UUID stored in your device's local storage (`localStorage`) to isolate your routine dashboard without requiring an account.
3. **Local Application Settings**:
   - Visual display preferences and notification reminder intervals.
4. **Data We DO NOT Collect**:
   - No personally identifiable information (PII).
   - No contact lists, location/GPS data, financial data, or sensitive device sensors.

---

## 3. How We Use the Information

Your data is used solely to provide and improve the application experience:
- Calculating consistency scores, habit completion percentages, and active streaks.
- Displaying your visual routine matrix and daily logs.
- Triggering local scheduled notifications and routine reminders (if enabled by you).
- Generating downloadable routine reports and printable PDFs upon your request.

---

## 4. Data Storage and Security

- **Encryption in Transit**: All communication between the app and the backend server uses standard HTTPS (TLS/SSL) encryption.
- **Data Persistence**: Trackers and habit history are securely stored in an isolated PostgreSQL database.
- **Local Storage**: Preferences and notification tokens remain on your local device.

---

## 5. Permissions (Notifications & Network)

- **Network Access**: Used to synchronize your trackers and task states with the backend database.
- **Notifications**: When enabled, notifications are used solely to alert you of scheduled routine check-ins. You can revoke notification permissions at any time through your device or browser settings.

---

## 6. User Control and Data Deletion

You maintain complete ownership of your data at all times:
- You can add, edit, or remove any routine, task, or completion checkmark at any time.
- Deleting a tracker permanently removes the routine and all its completions from the database.

---

## 7. Contact Information

If you have questions, feedback, or concerns regarding this Privacy Policy, please open an issue or contact the maintainer through the GitHub repository:  
https://github.com/SIMARSINGHRAYAT/dailyroutinetracker
