# Why this folder is empty

Your original spec listed a FastAPI backend. For the **mobile app**, it's been
intentionally dropped:

A phone has nowhere to run a persistent Python server. "Local only, no cloud" for a
mobile app means the data lives **on the device itself** — so `mobile/` talks
directly to an on-device SQLite file through Drizzle ORM. There is no HTTP call
anywhere in the app; `mobile/database/client.ts` opens the file and that's the
entire "backend."

If you also want the **desktop version** from your first spec (Next.js + FastAPI +
SQLite, running on a computer instead of a phone), that's a separate build — FastAPI
makes complete sense there, since a desktop app can run a local server process. Just
ask and I'll scaffold `backend/` for that version specifically.
