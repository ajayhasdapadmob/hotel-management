# Hotel Management Software

एक simple और editable Hotel Management Software, जिसे GitHub Pages, SPCK Editor और बाद में online server पर चलाया जा सकता है।

## Demo Login

- Username: `admin`
- Password: `admin123`

> Production में login credentials और authentication को secure backend authentication से replace करें।

---

## Main Modules

- Dashboard
- Rooms Management
- Bookings
- Guests & KYC
- Billing & Invoice
- Restaurant / POS
- Housekeeping
- Reports
- Subscription / Renewal
- Settings
- UPI / QR Payment

---

## Booking Features

- New Guest registration
- Existing Guest search
- Guest KYC
- Full Name
- Mobile Number
- ID Type
- ID Number
- Full Address
- Room availability
- Check-in
- Check-out
- Advance payment
- Later payment
- Automatic invoice
- Same booking invoice में multiple payments
- Room में कौन guest रह रहा है, इसकी search

---

## Restaurant Features

Restaurant order दो प्रकार से लिया जा सकता है:

### 1. Paid at Restaurant

Guest restaurant में payment करता है।

यह amount hotel invoice में outstanding नहीं रहेगा।

### 2. Charge to Room

Guest का restaurant bill उसके room पर charge किया जा सकता है।

यह amount उसी hotel booking के invoice में automatically जुड़ सकता है।

बाद में restaurant payment receive होने पर outstanding amount update किया जाता है।

---

## Payment

Supported payment methods:

- Cash
- UPI
- Card
- Other

UPI ID:

`9353689775@upi`

Payment QR में exact outstanding amount generate किया जा सकता है।

> Invoice print में QR code intentionally नहीं दिखाया जाता।

---

## Renewal System

Customer software को घर बैठे renew कर सकता है।

Renewal page पर:

1. Customer details
2. License ID
3. Renewal plan
4. UPI QR
5. Payment
6. UTR / Transaction ID
7. Payment date
8. Payment note

submit किया जा सकता है।

Current renewal plans:

- 30 Days — ₹299
- 1 Year — ₹1999

Renewal request initially `Pending` status में save होती है।

Admin UTR को अपने bank/UPI statement से verify करके license activate/extend कर सकता है।

> अभी यह frontend/manual verification flow है। Automatic payment verification के लिए बाद में payment gateway/API + webhook backend जोड़ा जा सकता है।

---

## Reports

Reports में date filters उपलब्ध हैं:

- Today
- Yesterday
- Last 7 Days
- This Month
- Last 2 Months
- Custom Date Range

Reports में:

- Incoming
- Outgoing
- Net
- Room Revenue
- Restaurant Revenue
- GST
- Outstanding
- Payments
- Expenses
- Bookings
- Guests
- Invoices

देखे जा सकते हैं।

---

## Project Structure

```text
hotel-management/
│
├── index.html
├── renewal.html
├── README.md
├── .gitignore
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── rooms.js
│   ├── bookings.js
│   ├── guests.js
│   ├── billing.js
│   ├── restaurant.js
│   ├── housekeeping.js
│   ├── reports.js
│   ├── subscription.js
│   ├── renewal.js
│   ├── settings.js
│   └── qr.js
│
├── assets/
│   ├── logo.png
│   └── icons/
│
├── data/
│   └── demo-data.json
│
└── server/
    ├── package.json
    ├── server.js
    ├── .env.example
    │
    ├── routes/
    │   ├── renewal.js
    │   ├── license.js
    │   ├── payments.js
    │   └── notifications.js
    │
    ├── data/
    │   ├── licenses.json
    │   ├── renewal-requests.json
    │   └── payments.json
    │
    └── services/
        ├── email.js
        ├── license.js
        └── payment.js