# ContentBuddy domain model

The UI is currently local-first, but its state is shaped around the backend model so persistence can move to PostgreSQL without changing the workflow.

## Core aggregates

### Agency and users

- `Agency` is the tenant boundary.
- `User` belongs to an agency and has one of `owner`, `social_manager`, `editor`, `variant_editor`, or `operator` roles.
- Every operational row carries `agency_id`.

### Creator and account

- `Creator` owns shoots, concepts, and media.
- `ChannelAccount` belongs to one creator and stores handle, niche, device, operator, cadence, and weekdays.
- An account is a destination for a schedule slot, not a property of the media filename.

### Shoot and concept

- `Shoot` belongs to a creator and has a shoot date.
- `Concept` is an ordered creative brief inside a shoot.
- Concept fields include title, location, props/outfit, frames, on-video text, caption, notes, category, and filmed state.
- The sequence number resets per creator per shoot date.

### Asset lineage

`Asset` is immutable media metadata pointing to an object in S3:

```text
Concept
  └── Raw takes
        ├── Full edit
        │     └── Variant 1..N
        └── Clean edit
```

The database stores parent IDs and derivative types. Filenames are generated exports, never the source of lineage.

### Work item

`WorkItem` assigns a concept or asset to a user and records stage, review state, rejection note, deadline, and completion time. Approval is explicit; a variant cannot enter the scheduling pool until its required parent outputs are approved.

### Schedule and usage

- `Schedule` stores the generation policy snapshot and seed.
- `ScheduleSlot` stores date, destination account, selected asset, caption, pinned state, and status.
- `UsageEvent` is append-only: posted, skipped, failed, or rescheduled.
- A successfully posted variant asset is globally consumed and cannot be selected again.
- The generator prevents the same concept from appearing on multiple accounts for one creator on the same day.

## First API boundary

```text
POST   /auth/session
GET    /creators
POST   /creators
GET    /creators/:id
GET    /shoots
POST   /shoots
POST   /shoots/:id/concepts
POST   /assets/upload-intent
POST   /assets/:id/complete
GET    /work-items?stage=review
POST   /work-items/:id/approve
POST   /work-items/:id/reject
POST   /schedules/generate
POST   /schedules/:id/publish
GET    /posting-queue?date=YYYY-MM-DD
POST   /posting-queue/:slotId/outcome
```

