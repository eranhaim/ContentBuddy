# ContentBuddy

ContentBuddy is a content-operations workspace for agencies. It replaces the manual folder, filename, spreadsheet, and handoff work around a creator’s content lifecycle:

`shoot plan → raw takes → Full/Clean edit → variants → schedule → posting queue`

## Current build

The first vertical slice is a local-first React app with realistic workflow data:

- Dashboard with review, scheduling, posting, and creator workload summaries
- Creator workspaces with account/device/operator mappings
- Shoot plans and concept creation
- Searchable content library with asset type filters and parent lineage
- Review queue with approve/request-changes actions
- Draft schedule generation from approved, globally unused variants
- Daily posting queue with posted/failed outcomes
- Browser persistence through `localStorage` so the prototype survives reloads

The seeded data mirrors the current operating model: multiple accounts per creator, shared variant pool, global consumption after posting, separate Full and Clean outputs, and manual posting rather than direct Instagram publishing.

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

## Product decisions encoded

- Database IDs will be canonical; filenames are generated exports.
- Captions and on-video text are separate fields.
- Full and Clean are separate derivative types and both must be approved before variant work.
- Variants are a shared pool for the creator; the destination account is stored on the schedule slot.
- A successfully posted variant file is consumed globally.
- Concept sequence numbers reset per shoot day.
- Generated schedules are drafts; pinned/manual dates survive regeneration.
- Historical Drive migration, sales/chatter workflows, direct Instagram publishing, and AI variants are outside the first release.

## Next implementation slice

The UI is intentionally backed by typed local state so the next step can replace the persistence adapter without changing the workflows:

1. NestJS modular monolith API
2. PostgreSQL schema for agencies, creators, concepts, assets, work items, accounts, slots, usage events, and audit events
3. S3 multipart upload and signed download URLs
4. Auth and role-based access
5. Worker jobs for media metadata, thumbnails, notifications, and schedule generation

See the product and decision canvases under the Cursor project canvas directory for the evidence and detailed scope.
