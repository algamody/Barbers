# Technical Documentation for the "Barbers" (حلاقين) Project — Pre-Development

A comprehensive planning document covering features, database design, and backend architecture, before writing the first line of code.

> **Update (v2):** Following an in-depth discussion of real-world booking scenarios and no-shows, the "fixed time-slot" model has been replaced with a **Live Queue** system — see the revised Section 6. Also added: the "Alternative Booking" mechanism with a symbolic fee, tiered guest rewards, a barber points incentive, and a risk table ordered by impact and likelihood (Section 14).

---

## 1. Project Overview

A two-sided marketplace platform with two separate systems:

- **Customer App:** Discover nearby barbers, see their real-time status (open/closed, number of people waiting), book a turn, leave reviews, and participate in community-driven status updates.
- **Business App:** A dashboard for the shop owner to manage the schedule, services, team, and bookings — also used to administer the platform itself via a Root account (see Section 3).

**Key founding principle:** Barbering is a **Category**, not a fixed part of the system's structure. The system must be built so that categories and services are dynamic, extensible entities (women's beauty salons, car care centers, etc. in the future) without restructuring the database.

As an industry reference, we reviewed the structure of Fresha (a global salon/barber booking app) — which relies on a central calendar per team member, group bookings, automated reminders, and a client profile that stores history and preferences — and the mechanism of Tripoli Streets (tripolistreets.ly) for real-time community updates based on user reports that other users confirm or deny, with a feed, a map, and a personal account for each reporter.

---

## 2. System Actors

| Actor | Access |
|---|---|
| **Customer** | Customer app (React Native) |
| **Business Owner/Staff** | Business app, with permissions restricted to their own shop only |
| **Platform Admin (Root / Platform Staff)** | The same Business app, but via a Root account with full permissions over all shops, with "Platform Staff" accounts under it holding limited permissions for monitoring and statistics — there is no separate app or codebase for an admin panel |

---

## 3. Business App — Feature Details

**Technology:** Built on **Thunder UI** (Huroof's internal framework: React + TypeScript + Vite + shadcn/ui) — see Section 12.

- **Login:** Phone/email + password, or OTP via SMS.
- **Main screen (Live Queue board):** A column per team member showing the current customer, the next one, and the waiting list (instead of a fixed hourly-slot grid — see Section 6 for the rationale behind the switch). The barber's interaction is simplified to the extreme: a single "Next" button that finishes the current customer and automatically starts the next one, to reduce the risk of the barber ignoring the app during rush hours (the project's biggest human risk — see Section 14).
- **Service management:** Add/edit/delete services within the categories enabled for the shop (price, estimated duration, description).
- **Add-ons:** Face/hair creams, masks, etc. — separately priced items added on top of the base service at checkout.
- **Photo gallery:** Photos of the shop and previous work.
- **Manual booking by management:** To add a customer who walked in personally or booked by phone.
- **Blocking hours:** Vacations, breaks, closed hours for a specific team member or the whole shop.
- **Checkout on turn completion:** When tapping a booking in the live queue — complete it, add extra services requested during the session, and record the payment method (cash at the shop, or deducted from the customer's wallet).
- **Customer list:** A simple record of customers and their visit history (mini CRM).
- **Reports:** Revenue, number of bookings, no-show rate, peak times, rating per team member.
- **Status updates from the verified account:** The business owner (if they choose to enable the "verified" account) can update the "open/closed" status and the number of people waiting directly, and this update has **absolute priority** over any community update.
- **Barber points incentive (launch period):** To address the risk of the barber ignoring the app during rush hours, the barber earns points (separate from customer points) for updating the status, along with a periodic follow-up notification ("Have you finished the haircut?") that serves two purposes at once: a reminder for the barber, and a data-quality guard — because the live queue's estimated wait time calculation (Section 6) depends on the barber pressing the "Finish" button at the right moment.
- **Root account and Platform Staff accounts:** Instead of building a separate admin panel, the platform is administered from this same app via a **Root** account with full permissions over all registered shops, with **Platform Staff** accounts under it holding limited permissions (monitoring, statistics, reviewing new shops, etc.). This is implemented through an RBAC (role-based access control) system that distinguishes between an account tied to a single shop (owner/staff) and an account tied to the platform as a whole (root/platform_staff).

---

## 4. Customer App — Feature Details

**Technology:** React Native + TypeScript.

- **Login:** Phone/OTP preferred (spreads more easily locally than email).
- **Home:** Main service category filter (currently disabled since barbering is the only category, but the structure is ready for adding more).
- **Search:** By a specific shop name.
- **Map:** Display all registered shops as pins on the map (Google Maps SDK); tapping a pin shows a brief banner: name, address, working hours.
- **Shop page:** Real-time status (open/closed + number waiting), list of services and prices (kids/adults, head only/head and beard, hairstyle consultation only), available add-ons and their prices, photos, star ratings.
- **Booking and payment (Live Queue system):** Choose the service (and a team member if the customer wishes), then join a **live FIFO queue** specific to the chosen team member instead of booking a fixed hourly slot — the customer sees their live position ("Your position: 3rd") and a moving estimated wait time (see Section 6). Two payment methods: cash at the shop, or deduction from the in-app wallet balance. An advance booking (for a future time) automatically converts into a position in the live queue when the shop opens. If the customer does not confirm attendance within a preconfigured window (default 10 minutes) starting from the "You're next" notification (not from a fixed clock time), the booking is automatically cancelled and the queue moves to the next person.
- **Protection against fake bookings:** If the customer fails to show up for their booking (whether they cancelled it themselves or simply didn't show) — even a single time — the "pay cash at the shop" option is automatically disabled for that customer, obligating them to pay from their wallet balance for future bookings.
- **Alternative Booking on non-confirmation:** If the turn holder does not confirm attendance within the set window, their "opportunity" is offered as a notification to the first other person waiting (whether in the queue or a walk-in present at the shop); the first to complete the claim (with an atomic lock on the backend to prevent conflicts) pays a symbolic fee (default 5 dinars, `ALTERNATIVE_BOOKING_FEE`) from their wallet balance to confirm seriousness, and the queue moves to them immediately. If the original turn holder shows up later, they are treated as a new arrival and added to the end of the live queue, with an explanatory message that their turn was given away and any amount owed to them has been refunded. The symbolic fee is automatically refunded to the alternative-booking claimant only if a classification error is proven through the dispute path (see Section 14); otherwise it is non-refundable if the claimant themselves fails to show — entirely separate logic from `no_show_count`, since it is a different behavior (exploiting an opportunity that wasn't their original booking).
- **Adding a walk-in guest by the barber:** A two-tier structure to close the loophole of registering fake walk-ins for money:
  1. **Manual registration without QR:** The barber adds the customer directly to the live queue (name/number optional) with no monetary reward for anyone — points only for the barber, accumulated and paid out after a certain threshold, since points alone aren't tempting enough to fake data.
  2. **Registration via scanning the shop's QR:** If the customer actually downloads the app and scans the shop's QR, both parties (customer and barber) receive a monetary reward **once only per `user_id` across the entire platform** (not per shop), paid out after completing the first actual booking — not merely downloading or scanning — turning the barber himself into a low-cost customer-acquisition channel for the platform.
- **Wallet and electronic payment:** The customer can top up their in-app wallet via the **One Pay** service provided by [ezone.ly](https://ezone.ly/ar), transferring from their bank account to their in-app balance, and use this balance later for payments.
- **Community status updates:** Any customer can submit an update ("The shop is open now", "4 people waiting"), which appears to other nearby users to confirm or deny (same logic as Tripoli Streets).
- **Points:** A rewards points balance (separate from the monetary wallet balance) earned from confirmed updates, reviews, and completed bookings, redeemable as discounts at participating shops.
- **Profile:** Wallet balance, points balance, booking history, available discounts.
- **Notifications:** A threshold sequence based on live queue position instead of a fixed time:
  1. **"3 people ahead of you"** (or per `QUEUE_HEADS_UP_POSITION`) — a general notification requiring no action.
  2. **"You're next — you have 10 minutes to confirm attendance"** — fired when only one person remains before them (not when their turn actually arrives), so the `BOOKING_AUTO_CANCEL_MINUTES` window becomes real travel time instead of wasted waiting at the shop.
  3. **"It's your turn now"** — fired when the barber actually finishes the customer before them.

  Plus: booking confirmation, wallet top-up confirmation, and a fee-refund confirmation notification when the original booking holder shows up — via Firebase notifications, with Huroof's ready-made SMS Trigger as a complementary channel (a second line of defense against a failed/delayed notification that could cause an unfair cancellation).

---

## 5. Categories and Services Mechanism (Future Flexibility)

The model is designed in three layers so that expanding the system to new categories never requires restructuring:

1. **Category:** A platform-level entity (barbering, women's beauty salon, ...). Appears as a filter in the customer app.
2. **BusinessCategory:** A link between the business and the category/categories it offers (one business may serve more than one category in the future).
3. **Service:** An actual service defined by the business owner within a given category (with their own price and duration) — not standardized across all shops, though it can be built from a suggested "service template" per category to speed up initial setup for a new business owner.

---

## 6. Booking Engine — The Live Queue System

### 6.1 Why fixed time slots were abandoned

The first model (booking a fixed hourly slot, e.g. 2:00 for Muhammad and 2:30 for Ahmed) revealed several practical problems in discussion:

- If Muhammad takes longer than half an hour, he eats into Ahmed's booking time.
- If Muhammad finishes earlier than expected, a gap forms before Ahmed arrives.
- Several accumulated delays force a manual "shift" of the entire schedule.
- An off-app walk-in customer may actually occupy a booked slot, creating a dispute when the booking holder arrives.

Haircut duration is inherently variable — a human factor — so promising an exact hour is hard to honor no matter how small the slot. Even Fresha (the industry reference in Section 1) works with estimated durations and a moving calendar, not rigid slots.

### 6.2 The alternative model: a live queue per team member (FIFO)

Instead of booking "2:30", the customer books **a turn in a live virtual queue specific to the chosen team member**:

- The customer sees their live position ("Your position: 3rd") and a moving estimated time, computed from the **average of the last 10–20 actual completed bookings for that member** (a live, self-updating number, not a fixed estimate).
- When the barber finishes a customer, they press a single "Next" button → the next one starts automatically, with no gap and no manual shift.
- An advance booking (for a future time) automatically converts into a live-queue position as soon as the shop opens.
- An off-app customer is registered immediately as a guest in the same queue (see Section 4), so everyone sees their actual position in real time with no dispute over an imaginary "slot".
- Multiple team members means separate queues per member within the same physical waiting area — the UI must make it clear that ordering is per team member to avoid customer confusion.

### 6.3 Alternative Booking on non-confirmation

A parallel mechanism that handles real queue gaps (a barber finished quickly and the next customer hasn't arrived yet): full details in Section 4 ("Alternative Booking") — in brief: the first to complete the claim pays a symbolic fee (`ALTERNATIVE_BOOKING_FEE`), with an atomic lock on the backend to prevent two people conflicting over the same opportunity at the same instant.

### 6.4 General rules

- Conflict prevention: a team member cannot have more than one "current" customer at the same moment in the queue.
- **Auto-cancellation:** The timer (`BOOKING_AUTO_CANCEL_MINUTES`) starts from the "You're next" notification (i.e., when only one person remains ahead of them in the queue), not from a fixed clock time, so it becomes real travel time. If attendance is not confirmed within the window, the queue moves to the alternative-booking opportunity and the booking is recorded as a "no-show" (see its effect on the cash payment feature in Section 4).
- Bookings added manually by management (a walk-in registered with the barber's knowledge) enter the queue directly with no auto-cancel timer (because the customer is physically present or phone-booked under management's follow-up).
- Every booking carries a payment method (cash/wallet) and a payment status (unpaid/paid).
- The "advance booking with a target time" option remains available for those who need a rough time commitment, but it itself converts into a live-queue turn upon actual arrival — it is not treated as a separate rigid slot.

---

## 7. Community Status System (Inspired by Tripoli Streets)

- Any registered user can submit a status update for a shop: open/closed, plus an estimated number of people waiting.
- The update appears to other users with "confirm" or "deny" options.
- When confirmations reach 2–3 (`STATUS_UPDATE_CONFIRMATIONS_REQUIRED`), the update is adopted as the shop's current status in the UI.
- When denials reach the same threshold, the update is dropped and not adopted.
- **Updates from the business owner's verified account bypass this mechanism entirely** and are displayed immediately as the official status.
- **UI indicator:** Any displayed status sourced from a community update (not a verified account) is shown with a clear badge indicating "status updated by the public", distinguishing it from the official status issued by the business owner.
- An implicit "credibility score" is computed per user based on the ratio of their confirmed vs. denied updates — usable later to weight their updates (a trusted user = their updates get adopted with fewer votes).

---

## 8. Points and Rewards System

### 8.1 Customer points

- **Earning sources:** A status update that gets adopted (community-confirmed), completing an actual booking, writing a review after a visit.
- **Redemption:** Each shop (or the platform centrally) defines discount rules against certain point thresholds (Reward Rules), and the customer redeems points for a discount at booking/checkout.
- It is recommended to make reward rules configurable from the Root account rather than hard-coded, as they will change as the platform grows.

### 8.2 Barber points (StaffMembers) — launch-period incentive

- A source entirely separate from customer points: the barber is awarded points for updating the shop's status (reason `status_updated_by_staff`), to motivate actual app usage during rush hours — the project's biggest human risk (Section 14).
- Barber points accumulate and are paid out after a certain threshold (payout details to be defined later), separate from the real monetary balance.
- Manual guest registration without QR (Section 4) grants the barber points only, with no monetary reward — closing the loophole of registering fake walk-ins for money.

### 8.3 One-time monetary reward (QR)

When a customer scans the shop's QR after downloading the app, both parties (customer and barber) receive a monetary reward **once only per `user_id`** across the entire platform, paid out after completing the first actual booking — a mechanism inherently resistant to repetition, and separate from both points systems above (details in Section 4).

**Note:** The points system (for both customer and barber) is fully independent of the monetary wallet balance (next section) — points are for rewards and discounts only, while the wallet holds a real, spendable cash balance.

---

## 9. Database Design (MongoDB)

The database is **MongoDB** (via Huroof's internal Thunder framework). The model here is **document-based**, not relational: reference fields between collections are stored as referential `ObjectId`s instead of strict foreign keys, and small, permanently-attached sub-data can be embedded rather than split into a separate collection (example: booking add-ons inside the booking document itself). Each collection is defined with a Zod schema inside the `schemas/` folder per Thunder's convention.

**Users**
- \_id · full_name · phone (unique) · email (optional) · points_balance (reward points) · wallet_balance (cash wallet balance) · cash_payment_enabled (bool, default true) · no_show_count · credibility_score · created_at

**BusinessAccounts** (login accounts for the Business app — covers both shop and platform levels)
- \_id · business_id (ObjectId, **empty/null for root and platform_staff accounts**) · role (root / platform_staff / owner / staff) · name · phone/email · password_hash

**Businesses**
- \_id · owner_account_id (ref → BusinessAccounts) · name · address · latitude · longitude · phone · gallery_urls (embedded photo array) · is_verified_status_account (bool) · approval_status (pending/active/suspended) · created_at

**Categories**
- \_id · name · name_ar · icon

**BusinessCategories** (link)
- business_id (ref) · category_id (ref)

**Services**
- \_id · business_id (ref) · category_id (ref) · name · description · price · duration_minutes · target (adult/child) · is_active

**ServiceAddons**
- \_id · business_id (ref) · name (face/hair cream, mask...) · price

**StaffMembers**
- \_id · business_id (ref) · full_name · photo_url · avg_rating · **points_balance** (incentive points separate from customer points — Section 8.2)

**StaffSchedule / BlockedSlots**
- \_id · staff_id (ref) · start_time · end_time · type (working_hours/blocked/leave) — used only for working hours and vacations/breaks, **not** for booking customer time slots (replaced by the live queue, Section 6)

**Bookings**
- \_id · customer_id (ref) · business_id (ref) · staff_id (ref) · service_id (ref) · addons (embedded array: `{ addon_id, price_at_booking }`)
- **requested_time** (optional, for the "advance booking with a target time" option — converts into a queue position upon actual arrival)
- **queue_position** (int, the booking's current live position within the team member's queue — recalculated on every queue movement)
- **queue_entered_at / service_started_at / service_completed_at** (timestamps used to compute the average of the last 10–20 actual bookings for the wait-time estimate — Section 6.2)
- status (in_queue/next_up/in_progress/completed/auto_cancelled/no_show/cancelled)
- **is_alternative_booking** (bool — whether this booking was claimed as an alternative opportunity from another unconfirmed booking)
- **original_booking_id** (ref, only if `is_alternative_booking = true` — links to the original unconfirmed booking)
- payment_method (cash/wallet) · payment_status (unpaid/paid) · source (customer_app/manual_admin/qr_guest) · created_at

**Reviews**
- \_id · booking_id (ref) · customer_id (ref) · business_id (ref) · rating (1-5) · comment · created_at

**StatusUpdates**
- \_id · business_id (ref) · submitted_by (ref Users, empty if from a verified account) · is_open (bool) · queue_count (int) · votes (embedded array: `{ user_id, vote }`) · created_at

**PointsTransactions**
- \_id · account_id (ref Users or StaffMembers) · account_type (customer/staff) · amount · reason (status_confirmed/review/booking_completed/redeemed/**status_updated_by_staff**/**guest_registered_manual**) · related_entity_id · created_at

**WalletTransactions**
- \_id · user_id (ref) · type (topup/payment/refund/**alternative_booking_fee**/**qr_first_time_reward**) · amount · one_pay_reference (external One Pay transaction ID, for topup-type operations) · related_booking_id (for payment or alternative_booking_fee operations) · status (pending/completed/failed) · created_at

**RewardRules**
- \_id · business_id (ref, empty = platform-wide rule) · points_required · discount_type · discount_value

**Notifications**
- \_id · user_id (ref) · type (queue_heads_up/next_up/your_turn/booking_confirmed/wallet_topup_confirmed/**fee_refunded**/...) · payload · read_at

**QrRewardClaims** (guarantees the QR-scan monetary reward is paid out only once per user platform-wide)
- \_id · user_id (ref, unique) · business_id (ref of the shop where the scan happened) · claimed_at · paid_out (bool, becomes true after the first actual booking is completed, not at scan time)

**BookingDisputes** (the dispute path for contesting a no-show classification or the symbolic fee charge — Section 14)
- \_id · booking_id (ref) · raised_by (ref Users) · reason_text · status (open/under_review/upheld/rejected) · resolved_by (ref BusinessAccounts, root/platform_staff role) · resolution_notes · created_at · resolved_at

---

## 10. Core Backend Functions (Thunder — Deno + MongoDB)

Organized by route files (`routes/`), leveraging `createCRUD` for basic read/write operations, with custom handlers for non-standard logic. Authentication and permissions (root/platform_staff/owner/staff) should preferably be built on top of the official **thunder-core** plugin rather than written from scratch.

**Bookings and live queue** (`routes/bookings.ts`)
- `joinQueue(customerId, businessId, serviceId, staffId, paymentMethod)` — adds the customer to the end of the chosen team member's live queue and computes the current `queue_position`
- `getEstimatedWaitTime(staffId)` — average of `service_completed_at - service_started_at` across the last 10–20 completed bookings for that member
- `advanceQueue(staffId)` — called when the barber presses the "Next" button: completes the current booking (`service_completed_at`), starts the next one (`service_started_at`), and recalculates `queue_position` for everyone remaining in the queue
- `checkoutBooking(bookingId, addonIds[], paymentMethod)`
- `claimAlternativeBooking(originalBookingId, claimantCustomerId)` — **atomic lock** (e.g. `findOneAndUpdate` with a status condition) to guarantee only the first to complete the transaction wins the opportunity; creates a new booking with `is_alternative_booking = true` and `original_booking_id`, and deducts `ALTERNATIVE_BOOKING_FEE` from the wallet
- `handleOriginalCustomerArrival(originalBookingId)` — if the original booking holder shows up after their opportunity was given away: they are added as a new arrival at the end of the live queue, and an explanatory notification fires stating that their turn was given away and any amount owed to them was refunded
- `markNoShow(bookingId)` — called by the periodic Worker (see below); updates the booking status, increments the customer's `no_show_count`, and calls `disableCashPayment` directly from the very first no-show (not applied to `is_alternative_booking` under the same logic — its symbolic fee is simply non-refundable instead of escalating it as a regular no-show)

**Community system** (`routes/status-updates.ts`)
- `submitStatusUpdate(businessId, userId, isOpen, queueCount)`
- `voteOnStatusUpdate(updateId, userId, vote)`
- `computeCurrentBusinessStatus(businessId)` — merges the latest community-adopted update with the verified account's update (the latter always takes priority)
- `recalculateUserCredibility(userId)`

**Points** (`routes/points.ts`)
- `awardPoints(accountId, accountType, amount, reason, relatedEntityId)` — unified for both customers (`Users`) and barbers (`StaffMembers`), including the new `status_updated_by_staff` reason for the launch-period incentive
- `redeemPointsForDiscount(userId, businessId, rewardRuleId)`

**Wallet and payment** (`routes/wallet.ts`)
- `initiateOnePayTopUp(userId, amount)` — initiates a top-up via One Pay (ezone.ly) and creates a `WalletTransaction` with pending status
- `handleOnePayWebhook(payload)` — receives payment confirmation from One Pay and updates `wallet_balance` and the transaction to completed
- `payBookingWithWallet(userId, bookingId, amount)`
- `chargeAlternativeBookingFee(userId, bookingId)` — deducts `ALTERNATIVE_BOOKING_FEE` during `claimAlternativeBooking`
- `refundAlternativeBookingFee(bookingId)` — called only upon a successful dispute via `BookingDisputes` (not automatically when the claimant fails to show)
- `disableCashPayment(userId)` — disables the cash payment feature immediately upon the first no-show
- `payoutQrFirstTimeReward(userId, businessId)` — called after the QR-scanning user completes their first actual booking (not at scan time); first verifies no prior record exists in `QrRewardClaims` for the same `user_id`

**Administration/Platform** (`routes/admin.ts`, restricted to root/platform_staff roles via an authorization hook)
- `getAllBusinessesOverview()`
- `approveBusiness(businessId)` / `suspendBusiness(businessId)`
- `generateBusinessReport(businessId, dateRange)`
- `reviewBookingDispute(disputeId, decision, resolutionNotes)` — manual review by root/platform_staff of "unfair no-show" objections or disputes over the alternative-booking fee; upon acceptance, calls `refundAlternativeBookingFee` and/or clears the associated `no_show_count`

**Periodic tasks (Workers)**
Thunder is a serverless-first, stateless framework and does not run scheduled tasks within the same process — therefore `autoCancelUnconfirmedBooking` (detecting bookings that were never confirmed despite reaching "You're next") and `markNoShow` must be built as a separate script/Worker running every minute (an external Cron or an independent process), not as part of an HTTP request handler.

**Real-time (WebSocket)**
Real-time updates of the live queue board and shop status will be via WebSocket — every queue movement (`advanceQueue`, `claimAlternativeBooking`) must be broadcast immediately to everyone waiting in the same queue. Since Thunder is stateless and geared primarily toward short-lived HTTP requests, the WebSocket server will most likely need to run as an independent long-lived process (not on the short serverless pattern), following the same logic as the Worker above — to be determined precisely when setting up the actual runtime environment.

---

## 11. Core Configuration Variables (Config)

- `DATABASE_URL` (MongoDB connection string)
- `BOOKING_AUTO_CANCEL_MINUTES` (default: 10 — the countdown starts from the "You're next" notification, not a fixed clock time; configurable per shop later)
- `QUEUE_HEADS_UP_POSITION` (default: 3 — the number of people remaining at which the "X people ahead of you" notification fires)
- `QUEUE_ESTIMATE_SAMPLE_SIZE` (default: 10–20 — the number of most recent completed bookings used to compute each team member's average estimated wait time)
- `NO_SHOW_THRESHOLD_FOR_CASH_DISABLE` (= 1 — the first no-show disables cash payment for that customer)
- `ALTERNATIVE_BOOKING_FEE` (default: 5 dinars — the symbolic fee for claiming an unconfirmed booking's opportunity; non-refundable except via a successful dispute)
- `STATUS_UPDATE_CONFIRMATIONS_REQUIRED` / `STATUS_UPDATE_DISPUTES_REQUIRED` (= 2–3)
- `POINTS_PER_CONFIRMED_UPDATE` / `POINTS_PER_REVIEW` / `POINTS_PER_COMPLETED_BOOKING`
- `STAFF_POINTS_PER_STATUS_UPDATE` (the barber's launch-period points incentive — Section 8.2)
- `QR_FIRST_TIME_REWARD_AMOUNT` (the one-time-per-user monetary reward for scanning QR and completing the first booking — Section 8.3)
- `GOOGLE_MAPS_API_KEY`
- `FCM_SERVER_KEY` (push notifications)
- `SMS_TRIGGER_ENDPOINT` (Huroof's ready-made SMS Trigger — a second line of defense when queue notifications fail/lag)
- `ONE_PAY_MERCHANT_ID` / `ONE_PAY_API_KEY` / `ONE_PAY_WEBHOOK_SECRET` (ezone.ly integration)
- `WEBSOCKET_PORT` / WebSocket server connection settings

---

## 12. Technical Architecture

| Layer | Technology | Notes |
|---|---|---|
| **Customer app** | React Native + TypeScript | |
| **Business app** | Thunder UI (React + TypeScript + Vite + shadcn/ui) | Huroof's internal framework; includes android/ios folders and a Capacitor setup enabling it to be wrapped as a mobile app later if needed |
| **Backend (both apps)** | Thunder (Deno + MongoDB + Zod) | Huroof's internal framework; file-based routing, Zod validation, and a `createCRUD` helper for rapid REST generation |
| **Permissions/Auth** | `thunder-core` plugin | Provides Auth, RBAC, CORS, and security headers — a suitable foundation for distinguishing root/platform_staff/owner/staff roles |
| **Maps** | Google Maps SDK | |
| **Electronic payment** | One Pay via ezone.ly | Customer wallet top-up from their bank account |
| **Notifications** | Firebase Cloud Messaging + SMS Trigger (Huroof) | Firebase as primary, SMS as a complementary channel via Huroof's ready-made Trigger |
| **Periodic tasks (auto-cancel/no-show)** | Separate external Worker/Cron | Because Thunder doesn't support scheduled tasks within the same process (see Section 10) |
| **Real-time (live queue and shop status)** | WebSocket | Most likely run as an independent long-lived process separate from Thunder's short requests (see Section 10) |

---

## 13. Practical Steps Before the First Line of Code

1. Approve this documentation in its current form.
2. ~~Draw low-fidelity wireframes for the core screens of both apps.~~ **Done:** 6 screens for the customer app and 5 for the business app, built on the live-queue design (a "current + next" board per team member) instead of the old grid.
3. Finalize the Zod schemas for the MongoDB collections based on Section 9.
4. Set up the Thunder backend project and install the `thunder-core` plugin (Auth/RBAC).
5. Set up the two frontend projects: React Native for the customer app, and Thunder UI for the business app.
6. Open a sandbox account with One Pay/ezone.ly to start the electronic payment integration early.

---

## 14. Risk Table (Ordered by Impact, Then Likelihood)

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | Barber ignores the app during rush hours | Catastrophic | High | Maximum simplification of their interaction (single "Next" button) + launch-period points incentive (Section 8.2) + initial training |
| 2 | Two people claiming the same alternative opportunity at the same instant | Catastrophic | Medium | Atomic lock on the backend (`claimAlternativeBooking`, Section 10) |
| 3 | Barber exceeding the service's allotted time | Major | Very high | The switch to the live queue system (Section 6) |
| 4 | Entire schedule drifting when several customers are late | Major | Medium–high (peak) | Same live-queue solution |
| 5 | Off-app customer occupying a booked slot, in-shop dispute | Major | Medium | Register them immediately in the same queue as a guest |
| 6 | Barber gaming the system by registering fake walk-ins for money | Medium–major | Medium | Tiered rewards: manual registration earns points only, real money only via QR once (Sections 4, 8.3) |
| 7 | The alternative-opportunity claimant failing to show | Medium | Medium | The non-refundable symbolic fee (`ALTERNATIVE_BOOKING_FEE`) |
| 8 | Disputes over fees / unfair no-show classification | Medium | Medium | A dispute path with manual review from the Root account (`BookingDisputes`) |
| 9 | Notification failure/delay causing an unfair cancellation | Medium | Medium | SMS Trigger as a backup channel |
| 10 | Idle time between customers (under the old slot system) | Normal–medium | High | Disappears with the live queue |
| 11 | Confusion between multiple barbers' queues and a single waiting area | Normal | Medium | Clear UI indication that ordering is per individual team member |
| 12 | Multiple fake accounts to exploit the QR reward | Normal | Low | Monitor anomalous patterns from the Root account later (not a launch priority) |

**Note on risk #8** (clarification): It means any automatic penalty from the system (deducting the symbolic fee, or a "no-show" classification that disables cash payment) may occur in a situation the customer perceives as unfair — such as an internet outage or dead battery so the "You're next" notification never arrived, or the barber pressing "Finish/no-show" by mistake, or a dispute over who completed the alternative-opportunity transaction first. Without a dispute path, the result is a bad review and a loss of trust out of proportion to the actual incident — which is why `BookingDisputes` and the `reviewBookingDispute` review by Root/platform_staff are essential before launch, not a later enhancement.
