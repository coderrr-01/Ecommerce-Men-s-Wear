# Newsletter and contact

The home newsletter form and `/contact` submit validated server actions with honeypot fields and
process-local IP rate limits. Newsletter email addresses are normalized to lowercase and use an
upsert, so duplicate signups produce the same success response without email enumeration.

Contact submissions are stored as plain text in `ContactMessage`; the form confirms that the
message was saved and does not claim that an email was sent. No provider email is triggered.
STAFF/ADMIN can review newsletter subscriptions and contact messages at `/admin/messages` and
download CSV exports. CSV cells are escaped and protected against formula injection.
