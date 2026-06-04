# `/api/v1/events`

Analytics intake from the HealthOS mobile app. Accepts a batch of
events, dedupes by client-supplied id, writes to MongoDB.

## Schema (one event)

| Field            | Type   | Notes                                                  |
|------------------|--------|--------------------------------------------------------|
| `id`             | string | UUID v4 from the device. Used as Mongo `_id`.          |
| `install_id`     | string | Anonymous per-install UUID. **No PII.**                |
| `session_id`     | string | App-session UUID. Rotates on cold launch + 30m idle.   |
| `event`          | string | `log_created`, `pattern_confirmed`, etc.               |
| `tier`           | enum   | `reliability` \| `engagement`                          |
| `event_datetime` | ISO    | When the action happened (local timezone embedded).    |
| `created_at`     | ISO    | When the device queued the event.                      |
| `app_version`    | string | `1.0.5`                                                |
| `platform`       | enum   | `ios` \| `android` \| ...                              |
| `props`          | object | Per-event schema (counts, buckets, enums — never PII). |

## Setup

The route reuses `lib/mongodb.ts` and the existing `MONGODB_URI`
env var. No new env vars required.

### Recommended Mongo indexes

Run once via Atlas UI or `mongosh`:

```js
use healthos
db.events.createIndex({ install_id: 1, event_datetime: -1 })   // per-user timeline / retention
db.events.createIndex({ session_id: 1, event_datetime: 1 })    // per-session funnel
db.events.createIndex({ event: 1, event_datetime: -1 })        // event-type rollups
db.events.createIndex({ tier: 1, event_datetime: -1 })         // crash-only queries
```

All cheap (single-field equality + range scan).

## Idempotency

Client uses `event.id` as `_id`, so a retry after a partial
network failure won't double-count. Duplicate inserts throw a
`code: 11000` which we silently absorb.

## Limits

- `MAX_BATCH_SIZE = 200` events per POST (mobile already caps at 100)
- 1 MB request body (Vercel default)
- `nodejs` runtime (mongo driver doesn't run on edge)

## Useful queries

```js
// Last 20 events for one install
db.events.find({ install_id: "<id>" })
  .sort({ event_datetime: -1 })
  .limit(20)

// Daily active installs in the last 7 days
db.events.aggregate([
  { $match: {
      event: "app_open",
      event_datetime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  } },
  { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$event_datetime" } },
      installs: { $addToSet: "$install_id" }
  } },
  { $project: { date: "$_id", dau: { $size: "$installs" }, _id: 0 } },
  { $sort: { date: 1 } }
])

// Funnel: open → tab_opened → log_created in one session
db.events.aggregate([
  { $match: { session_id: { $ne: null } } },
  { $group: {
      _id: "$session_id",
      events: { $push: "$event" }
  } },
  { $project: {
      opened: { $in: ["app_open", "$events"] },
      visited_tab: { $in: ["tab_opened", "$events"] },
      logged: { $in: ["log_created", "$events"] }
  } },
  { $group: {
      _id: null,
      total: { $sum: 1 },
      step_open: { $sum: { $cond: ["$opened", 1, 0] } },
      step_tab: { $sum: { $cond: ["$visited_tab", 1, 0] } },
      step_log: { $sum: { $cond: ["$logged", 1, 0] } }
  } }
])

// Notification opens per type, last 30 days
db.events.aggregate([
  { $match: {
      event: { $in: ["notification_fired", "notification_opened"] },
      event_datetime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  } },
  { $group: {
      _id: { event: "$event", type: "$props.type" },
      count: { $sum: 1 }
  } }
])

// Crash count by app_version (reliability tier)
db.events.aggregate([
  { $match: { event: "app_crash" } },
  { $group: { _id: "$app_version", crashes: { $sum: 1 } } },
  { $sort: { crashes: -1 } }
])
```

## Privacy invariants enforced upstream (mobile app)

These should **never** appear in `props`:

- Transcripts, voice audio, signal values (mood/stress/confidence numbers)
- Topic strings, symptom_kind, trigger_kind, active_conditions
- Email, name, phone, IP, geolocation

If they ever do — that's a client bug, drop the field server-side
and open an issue.
