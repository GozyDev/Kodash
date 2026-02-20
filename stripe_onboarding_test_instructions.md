Manual Stripe Onboarding Test Instructions

Prerequisites
- Set environment variable NEXT_PUBLIC_APP_URL to your app origin (e.g., http://localhost:3000)
- Set Stripe keys in env: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
- Start dev server: `npm run dev`

1) Start app and log in as a freelancer
- Open http://localhost:3000 and sign in with a test user that has a profile record.

2) Click Connect Bank / Finish Setup
- In the sidebar (`components/OrgSidebar.tsx`) click the CTA. It should POST to `/api/stripe/onboard` and redirect you to Stripe onboarding.

3) Complete onboarding (or cancel)
- Follow the Stripe Express onboarding flow. When it returns it should redirect back to the app with `?stripe_return=true`.

4) Verify client return handling
- `components/StripeReturnListener.tsx` will call `/api/stripe/check_status` and show a toast for `completed`/`pending`/`failed`.
- Confirm the toast appears and the app data refreshes when `completed`.

5) Verify DB updates via webhook
- Run Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

- Trigger or wait for an `account.updated` event (Stripe will send these when onboarding is updated). Confirm `profiles.stripe_onboarding_status` in DB is set to `completed` or `failed` depending on account fields.

6) Simulate check_status
- Manually call the check endpoint if needed:

```bash
curl http://localhost:3000/api/stripe/check_status
```

- Expect JSON `{ "status": "completed" | "pending" | "failed" }`.

Notes
- The new onboarding endpoint is `POST /api/stripe/onboard` and returns `{ url }`.
- Client components `OrgSidebar` and `WriteProposalDialog` now use the onboard API and redirect the browser.
- The webhook now updates `profiles.stripe_onboarding_status` on `account.updated` events.

If anything fails, collect server logs and the Stripe CLI forwarded payloads and I can help debug.