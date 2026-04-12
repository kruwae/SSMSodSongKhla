# SSM Attendance

Vite + React + TypeScript attendance dashboard deployed on Vercel.

## Available scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build the app for production
- `npm run lint` — run ESLint across the project
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
- `npm run preview` — preview the production build locally

## Google Sheets integration

This project saves check-in records through a Vercel Serverless Function at:

- `POST /api/check-in`

### Required environment variables

Set these in Vercel Project Settings → Environment Variables:

- `GOOGLE_SHEET_ID`  
  Spreadsheet ID of the target Google Sheet

- `GOOGLE_SHEET_TAB`  
  Sheet tab name to append rows to, default: `CheckIns`

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
  Service account email that has write access to the spreadsheet

- `GOOGLE_PRIVATE_KEY`  
  Private key for the service account  
  Use the exact private key value and keep newline escapes as `\n`

### Google Sheet column order

The serverless function appends rows in this order:

1. `capturedAt`
2. `requestId`
3. `userId`
4. `fullName`
5. `role`
6. `department`
7. `deviceId`
8. `imei`
9. `latitude`
10. `longitude`
11. `distanceMeters`
12. `gpsAccuracy`
13. `faceVerified`
14. `locationVerified`
15. `deviceVerified`
16. `status`
17. `reason`

### Security requirements

For maximum security:

- Never expose Google credentials in frontend code
- Store all secrets only in Vercel environment variables
- Use the serverless function as the only write path to Google Sheets
- Validate all request payloads before writing
- Reject requests without required fields
- Require `requestId` to help prevent duplicate writes
- Re-check device, GPS, and approval logic on the server
- Use HTTPS only
- Share the spreadsheet only with the service account email
- Limit spreadsheet access to the minimum required permissions
- Avoid storing raw face images unless absolutely necessary
- Prefer storing only verification results and minimal metadata

### Local development

Install dependencies and run:

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test