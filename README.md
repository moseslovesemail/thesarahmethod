# The Sarah Method

V1 intake application for personalised Pilates programming.

## Current V1
- Seven-step mobile-first intake
- Goals, Pilates experience, equipment, schedule and movement preferences
- Automatic clear/review routing
- PostgreSQL submission storage
- Password-protected `/admin` view
- Simple black-on-white interface

## Environment variables
- `DATABASE_URL`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

## Local development
```bash
npm install
npm run dev
```

## Railway
Deploy this repository, reference the Railway PostgreSQL `DATABASE_URL`, set admin credentials, then expose the service with a Railway domain.
