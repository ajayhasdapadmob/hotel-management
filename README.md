# Hotel Management System V3.6

SPCK/browser-friendly hotel management frontend plus optional Node/Express server.

## Demo login
- Username: `admin`
- Password: `admin123`

## New in V3.6
- Renewal Requests module.
- Public `renewal.html` customer page.
- Customer pays renewal UPI QR `9353689775@upi`, then submits UTR/Transaction ID.
- Admin checks the UTR in bank/UPI statement and presses **Verify & Activate**.
- Server extends the license and changes it to ACTIVE.
- Optional SMTP email notification when a renewal request is submitted.
- Invoice print intentionally contains **NO QR code**. QR remains available on-screen through Pay/QR buttons.
- Payment QR uses the exact current amount.
- Restaurant unpaid orders can be charged to room; paid-now orders are not added as room outstanding.

## Online manual-renewal setup
1. Copy `server/.env.example` to `server/.env`.
2. Set a long random `ADMIN_ACTIVATION_TOKEN`.
3. Optionally configure SMTP for email notifications.
4. Deploy the server on a public HTTPS URL.
5. In Hotel Settings/Subscription, set Online Server API URL to that HTTPS URL.
6. Open `https://YOUR-DOMAIN/renewal.html?customerId=HOTEL-DEMO` for customers.
7. Admin opens **Renewal Requests**, enters the same admin activation token, refreshes requests, verifies UTR in the bank/UPI app, then clicks **Verify & Activate**.

## Automatic gateway renewal
Razorpay keys and webhook secret remain server-side in `.env`. The manual UTR flow works without a payment gateway. Gateway/webhook can be enabled later for fully automatic payment capture.

## Install server
```bash
cd server
npm install
npm start
```

Do not commit `.env` or any secret token to GitHub.
