# Technical Documentation for the "Barbers" (حلاقين) Project — Pre-Development

A comprehensive planning document covering features, database design, and backend architecture, before writing the first line of code.

> **Update (v2):** Following an in-depth discussion of real-world booking scenarios and no-shows, the "fixed time-slot" model has been replaced with a **Live Queue** system — see the revised Section 6. Also added: the "Alternative Booking" mechanism with a symbolic fee, tiered guest rewards, a barber points incentive, and a risk table ordered by impact and likelihood (Section 14).
>
> **Update (v3):** Added **Team Management** to the Business app: adding barbers, deleting them (soft delete), and switching their status between "Active" (present) and "Inactive" (not present) — see Section 3, Section 6.4, Section 9 (`StaffMembers`), and Section 10 (`routes/staff.ts`). Also added: the shop's **daily working hours** (from/to per day), for display to customers only — see Section 3, Section 6.4, Section 9 (`Businesses`, `Notifications`), Section 10 (`routes/business.ts`), and Section 11.
>
> **Update (v4 — Customer App Implementation Alignment):** Updated the Customer App architecture and feature set to reflect the full mobile app implementation:
> 1. Dedicated **5-Tab Core Bottom Navigation** (`Home`, `Bookings`, `Map`, `Wallet`, `Profile`).
> 2. Full **Group Booking (حجز جماعي)** engine allowing multi-person bookings with custom names, individual service/barber assignment, and persistent **Draft Booking** recovery.
> 3. Visual **Live Queue Tracker** with in-app **QR Code Scanner**, attendance confirmation sheet, customer QR display, and post-service review sheet.
> 4. Electronic wallet with dual gateway support (**One Pay** & **LyPay**) and **Peer-to-Peer (P2P) Balance Transfer** between customer IDs with recipient verification.
> 5. Comprehensive **Rewards Catalog** (fixed discounts, percentage vouchers, free add-ons/services).
> 6. Dedicated **Change Phone Number** screen with OTP verification, interactive **Community Updates** screen with voting bars & crowd levels, and bilingual RTL/LTR theme system.

---

## 1. Project Overview

A two-sided marketplace platform with two separate systems:

- **Customer App:** Discover nearby barbers, see their real-time status (open/closed, number of people waiting), book a turn (individual or group), track live queue progress, top up wallet via One Pay and LyPay, transfer funds between customers, redeem rewards, leave reviews, and participate in community-driven status updates.
- **Business App:** A dashboard for the shop owner to manage the schedule, services, team, and bookings — also used to administer the platform itself via a Root account (see Section 3).

**Key founding principle:** Barbering is a **Category**, not a fixed part of the system's structure. The system must be built so that categories and services are dynamic, extensible entities (women's beauty salons, car care centers, etc. in the future) without restructuring the database.

As an industry reference, we reviewed the structure of Fresha (a global salon/barber booking app) — which relies on a central calendar per team member, group bookings, automated reminders, and a client profile that stores history and preferences — and the mechanism of Tripoli Streets (tripolistreets.ly) for real-time community updates based on user reports that other users confirm or deny, with a feed, a map, and a personal account for each reporter.

---

## 2. System Actors

| Actor | Access |
|---|---|
| **Customer** | Customer app (Mobile Web / React Native / PWA) |
| **Business Owner/Staff** | Business app, with permissions restricted to their own shop only |
| **Platform Admin (Root / Platform Staff)** | The same Business app, but via a Root account with full permissions over all shops, with "Platform Staff" accounts under it holding limited permissions for monitoring and statistics — there is no separate app or codebase for an admin panel |

---

## 3. Business App — Feature Details

**Technology:** Built on **Thunder UI** (Huroof's internal framework: React + TypeScript + Vite + shadcn/ui) — see Section 12.

- **Login:** Phone/email + password, or OTP via SMS.
- **Main screen (Live Queue board):** A column per team member showing the current customer, the next one, and the waiting list (instead of a fixed hourly-slot grid — see Section 6 for the rationale behind the switch). The barber's interaction is simplified to the extreme: a single "Next" button that finishes the current customer and automatically starts the next one, to reduce the risk of the barber ignoring the app during rush hours (the project's biggest human risk — see Section 14).
- **Team management (barbers):** A dedicated screen for the shop owner:
  - **Add a barber:** Full name and an optional photo; their column appears on the live queue board immediately with status "Active".
  - **Change status (present / not present):** A toggle between "Active" (present at the shop and accepting customers) and "Inactive" (temporarily not present: leave, long break, absence). An inactive barber accepts no new customers into their queue and appears to customers with an "Unavailable" label that cannot be selected, while their data, ratings, and history remain unchanged. Their column on the live queue board appears dimmed with an "Inactive" badge and a quick "Activate" button.
  - **Delete a barber:** They disappear from all screens, but technically this is a **soft delete**, to preserve the integrity of the booking history, reports, and ratings linked to them.
  - **Queue rule:** A barber cannot be deactivated or deleted while a customer is in service (`in_progress`) — finish that customer first. If customers are waiting in their queue, the app requires the owner to choose: (1) transfer them to another active barber's queue, or (2) cancel their bookings with a notification (any amount paid from the wallet is refunded, and it is not counted as a customer no-show). If no other active barber exists, only cancellation is offered.
  - **Permissions:** Adding and deleting: shop owner only; changing status: the owner or a staff account of the same shop.
- **Service management:** Add/edit/delete services within the categories enabled for the shop (price, estimated duration, description).
- **Add-ons:** Face/hair creams, masks, etc. — separately priced items added on top of the base service at checkout.
- **Photo gallery:** Photos of the shop and previous work.
- **Manual booking by management:** To add a customer who walked in personally or booked by phone.
- **Daily working hours (display only):** The shop owner records, for each day of the week, the **opening time (from)** and **closing time (to)**, or marks the day as "Day off". Closing may fall after midnight. **These hours are informational only:** they do not open or close the shop automatically, do not change its status, and do not block entry to the queue — the actual status is changed manually by the supervisor. Their purpose is for customers to see them (shop page and map banner) and plan their day accordingly.
  - **Reminder to update the status:** The system sends the supervisor (the shop owner) a notification in two cases, once per occasion and without ever changing the status itself: (1) 30 minutes after the registered opening time, if the status has not been changed to "Open": "Have you opened the shop, or not yet?"; (2) 30 minutes after the registered closing time, if the status has not been changed to "Closed": "Have you closed the shop, or are you still working?". No reminders are sent on days off, or for a shop that has not enabled the verified status account (since the status is changed through it).
- **Blocking hours:** Vacations, breaks, closed hours for a specific team member or the whole shop.
- **Checkout on turn completion:** When tapping a booking in the live queue — complete it, add extra services requested during the session, and record the payment method (cash at the shop, or deducted from the customer's wallet).
- **Customer list:** A simple record of customers and their visit history (mini CRM).
- **Reports:** Revenue, number of bookings, no-show rate, peak times, rating per team member.
- **Status updates from the verified account:** The business owner (if they choose to enable the "verified" account) can update the "open/closed" status and the number of people waiting directly, and this update has **absolute priority** over any community update.
- **Barber points incentive (launch period):** To address the risk of the barber ignoring the app during rush hours, the barber earns points (separate from customer points) for updating the status, along with a periodic follow-up notification ("Have you finished the haircut?") that serves two purposes at once: a reminder for the barber, and a data-quality guard — because the live queue's estimated wait time calculation (Section 6) depends on the barber pressing the "Finish" button at the right moment.
- **Root account and Platform Staff accounts:** Instead of building a separate admin panel, the platform is administered from this same app via a **Root** account with full permissions over all registered shops, with **Platform Staff** accounts under it holding limited permissions (monitoring, statistics, reviewing new shops, etc.). This is implemented through an RBAC (role-based access control) system that distinguishes between an account tied to a single shop (owner/staff) and an account tied to the platform as a whole (root/platform_staff).

---

## 4. Customer App — Feature Details (Updated & Aligned)

**Technology:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide & Tabler Icons (configured with a modular UI design system, bottom-sheets, and Capacitor / React Native mobile packaging capability).

### 4.1 Layout, Theme & Navigation Architecture
- **Persistent 5-Tab Bottom Navigation:** Clear, thumb-friendly navigation across the primary application surfaces:
  1. **الرئيسية (Home):** Discovery, search, active booking status banner, and quick actions.
  2. **حجوزاتي (Bookings):** Active live queue card, past visit history, review triggers, and re-booking.
  3. **الخريطة (Map):** Interactive map with shop markers, quick info preview, and direct navigation.
  4. **المحفظة (Wallet):** Balance management, One Pay & LyPay top-up, P2P money transfers, and transaction ledger.
  5. **حسابي (Profile):** User details, phone change flow, points balance, language & theme settings.
- **Bilingual & Directional Support (RTL / LTR):** Full support for Arabic (default, RTL) and English (LTR) with seamless View Transitions.
- **Theme Switching:** Sleek dark mode (charcoal/warm black `#1a1714`) and clean light mode (`#fcfbf9`) with coordinated CSS design tokens.
- **Modular Bottom Sheets:** Reusable slide-up interactive sheets for service selection, QR code scanning, community reports, reviews, and attendance confirmation.

### 4.2 Authentication & Profile Security
- **Phone Number + OTP Login:** 4-digit verification code with resend countdown timer and clean input grouping.
- **Dedicated Phone Change Flow (`ChangePhoneScreen`):** A secure, two-step screen allowing customers to update their registered phone number by verifying the new number via an SMS OTP before persisting changes.
- **Customer Identity:** Each user receives a unique 5-digit digital Customer ID (e.g. `84920`) with a one-tap copy button for receiving balance transfers and quick in-shop identification.

### 4.3 Home Screen & Discovery
- **Active Booking Floating Banner:** Whenever the customer has a confirmed turn in a queue, a persistent dynamic banner appears at the top of the Home screen showing the shop name, current position ("حجزك نشط - دورك رقم 2"), and a direct shortcut button to view their live queue card.
- **Search & Filtering:** Real-time search by shop name or location in both Arabic and English.
- **Category Filter Pills:** Quick filters (e.g. All, Barbers, VIP Care).
- **Favorites System (`Favorites`):** Toggle favorite shops with heart icon; quick shortcut on Home to view the dedicated Favorites screen.
- **Shop Cards:** Display cover images, verified status badge, distance, rating, open/closed chip, waiting crowd estimate, and working hours preview.

### 4.4 Shop Profile (`ShopDetail`)
- **Header & Visuals:** Gallery banner, back navigation, favorite toggle, and a Community Updates shortcut button with an unread badge indicating fresh updates from today.
- **Draft Booking Recovery Banner:** If the customer previously started picking services or companions and left, an alert banner offers: "Resume draft booking" or "Discard".
- **Organized Tabs:**
  - **الخدمات (Services):** Categorized list (Adults, Children, Grooming packages) with price and duration, plus expandable Add-ons (face masks, beard oils, steamers) with instant price aggregation.
  - **الحلاقين (Staff):** Cards for each team member displaying their active/busy status, current waiting count, estimated wait time, and rating. Inactive barbers are clearly badged as "Unavailable".
  - **التقييمات (Reviews):** Overall star rating, rating distribution bars, customer comments, and submitted haircut photos.
  - **معلومات الصالون (Info):** Shop location on map, phone contact, and full weekly working hours table with today prominently highlighted.
- **Alternative Booking Live Opportunity:** When an unconfirmed booking window opens for a barber, an animated banner with a real-time countdown timer (`altBooking.openWindowSeconds`) appears on the staff tab, allowing instant claim.

### 4.5 Booking Engine — Individual & Group Bookings (`BookingFlow`)
- **Step 1: Barber Selection (`barber`):** Select a specific barber (viewing their queue count and wait time) or choose **"Any Available Barber" (أول حلاق متاح)** for the fastest service.
- **Step 2: Group Booking & Companion Management (`group_list`):**
  - The customer can book for themselves AND add one or more companions (e.g., "أحمد (ابني)", "صديق").
  - **Per-Person Customization:** For each companion, the customer can assign a different service, select add-ons via `ServiceSelectionBottomSheet`, and designate a specific barber or "Any barber".
  - **Itemized Overview:** Visual card per person with their selected services, assigned barber, and price, with full ability to edit or remove companions.
- **Step 3: Review & Payment Confirmation (`confirm`):**
  - Comprehensive cost breakdown: base services total + add-ons total - discounts/rewards.
  - Payment method selection: **Wallet balance** (رصيد المحفظة) or **Cash at shop** (دفع نقدي في الصالون).
  - Promo code / points discount voucher application.
  - Deposit handling for claimed alternative slots.
- **Draft Auto-Save:** Every selection (services, addons, persons, step) is synced to `draft_booking_${shopId}` so accidental closure never loses progress.

### 4.6 The Live Queue Experience (`MyQueue`)
- **Real-Time Visual Queue Card:**
  - Barber chair graphic with live position badge ("دورك: 2 من 5").
  - Moving wait time countdown and barber status ("الحلاق يبدأ الحلاقة الآن").
  - Multi-person cards for group bookings showing the assigned barber and service for each person.
- **Attendance Confirmation (`showAttendanceSheet`):** When reaching "You're next" (أنت التالي) or approaching the shop, the customer can open the Attendance Sheet to confirm their physical readiness.
- **In-App Shop QR Scanner (`QrScannerBottomSheet`):** A camera-enabled scanner allowing the customer to scan the shop's physical QR code upon arrival to instantly confirm attendance and trigger the one-time monetary reward.
- **Customer QR Code Modal:** Displays the customer's personal QR code for quick scanning by the barber chair tablet.
- **Post-Service Review Prompt (`ReviewBottomSheet`):** Automatically appears after the barber marks the turn completed, allowing star rating (1–5), quick tag selection (clean, punctual, professional), and written feedback.

### 4.7 Bookings Screen (`BookingsScreen`)
- **Active Booking Section:** Prominently highlights the currently running queue booking with status badges and quick "View Live Queue" action.
- **Past Bookings History:** Filterable accordion list of previous visits with date, barber name, services, and price.
- **Review Retrospective:** Customers can review unrated past visits or view their submitted feedback and photo attachments.
- **Quick Re-Book:** One-tap button to book again at the same shop.

### 4.8 Interactive Map (`MapScreen`)
- Full-screen interactive map (Leaflet / OpenStreetMap / Google Maps) with custom barbershop markers.
- Tapping a pin opens a floating card displaying the shop's name, verified badge, real-time waiting count, and direct buttons to "Book / View Shop" or "Community Updates".

### 4.9 Digital Wallet & Financial Services (`WalletScreen`)
- **Wallet Balance Card:** Displays current Libyan Dinar balance (`د.ل`) and copyable 5-digit Customer ID.
- **Dual Electronic Top-up Gateways:**
  - **One Pay (وان باي):** Top-up via ezone.ly bank integration.
  - **LyPay (لي باي):** Direct top-up via local Libyan bank cards.
- **Peer-to-Peer (P2P) Balance Transfer:**
  - Send money instantly to any other customer using their Customer ID.
  - **Live Recipient Verification:** Entering the recipient ID fetches and displays their name and avatar, preventing accidental transfers to wrong numbers.
- **Filterable Transaction Ledger:** Full transaction history filterable by All, Credit (green deposit/transfers/cashback), and Debit (red booking payments/transfers).

### 4.10 Points & Rewards System (`PointsScreen`)
- Real-time display of accumulated loyalty points.
- **Tiered Rewards Catalog:**
  - Fixed-value cash vouchers (e.g. 5 LYD or 15 LYD off next booking).
  - Percentage discounts (e.g. 10% off total service cost).
  - Free service & add-on vouchers (e.g. Free Facial Mask, 100% Free Haircut).
- **Voucher Generation:** Redeeming points generates a unique coupon code with one-tap copy to use during booking checkout.

### 4.11 Community Status System (`CommunityUpdates`)
- **Status Overview Card:** Displays total community votes today, last updated timestamp, and an interactive voting gauge showing Open vs. Closed percentage.
- **Community Reports Feed:** Scrollable stream of reports submitted by users, featuring user avatars, timestamps, crowd level badge (فاضي، متوسط، زحمة), notes, and uploaded shop photos.
- **Interactive Report Sheet (`CommunityUpdateBottomSheet`):** Allows users to submit a status update with open/closed toggle, estimated waiting count, optional note, and camera photo.
- **Credibility & Official Priority:** Official status from the shop's verified account always takes absolute precedence and displays a gold "Verified Official Status" badge, distinguishing it from public crowd reports.

### 4.12 User Profile & Settings (`Profile`)
- User profile info (Name, Avatar, Phone, Email).
- Account summary chips: Total Points, Wallet Balance, Total Completed Visits.
- Navigation links to: Bookings, Wallet, Points Rewards.
- Dedicated "Change Phone Number" flow.
- Theme switcher (Dark / Light) and Language selector (Arabic / English).
- In-app Customer Feedback & Support bottom sheet.
- Logout and session management.

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

Haircut duration is inherently variable — a human factor — so promising an exact hour is hard to honor no matter how small the slot. Even Fresha works with estimated durations and a moving calendar, not rigid slots.

### 6.2 The Live Queue per Team Member (FIFO) with Group Support
- The customer books **a turn in a live virtual queue specific to the chosen team member** (or "Any Available Barber").
- The customer sees their live position ("Your position: 2nd") and a moving estimated wait time computed from the **average duration of recent completed bookings**.
- **Group Booking Handling:** When booking for multiple persons, the group booking document holds an array of `persons`. If all companions are assigned to the same barber, they occupy sequential positions in that barber's queue. If companions pick different barbers, each companion is placed in their respective barber's queue while linked under the same master `GroupBookingData`.
- When the barber finishes a customer, they press a single "Next" button → the next customer begins automatically.
- **Draft Recovery:** In-progress booking setups are persisted locally (`draft_booking_${shopId}`) so customers never lose companion configurations on accidental page reloads.

### 6.3 Alternative Booking on Non-Confirmation
A parallel mechanism that handles real queue gaps (a barber finished quickly and the next customer hasn't arrived yet):
- The turn opportunity is broadcast with a countdown timer (`altBooking.openWindowSeconds`).
- The first claimant to complete checkout pays a symbolic fee (`ALTERNATIVE_BOOKING_FEE`, default 5 LYD) deducted from their wallet, secured via an atomic backend lock.
- If the original turn holder shows up later, they are added to the end of the queue, with an explanatory message that their turn was transferred and any deposit owed was refunded.

### 6.4 General Rules
- Conflict prevention: a team member cannot have more than one "current" customer at the same moment in the queue.
- **Team member status:** Joining the queue of an inactive or deleted team member is rejected.
- **Working hours are informational only:** They do not affect queue entry and never open or close the shop automatically.
- **Auto-cancellation:** The timer (`BOOKING_AUTO_CANCEL_MINUTES`) starts from the "You're next" notification. If attendance is not confirmed, the queue advances and a no-show is recorded.
- Manual walk-ins added by management enter the queue directly without auto-cancel timers.

---

## 7. Community Status System (Inspired by Tripoli Streets)

- Any registered user can submit a status update: open/closed, plus an estimated number of people waiting, crowd tag, and note.
- The update appears to other users with confirmation votes and visual statistics (open vs closed ratio).
- When confirmations reach the threshold (`STATUS_UPDATE_CONFIRMATIONS_REQUIRED`), the update is adopted in the UI.
- **Updates from the business owner's verified account bypass this mechanism entirely** and are displayed immediately with an official verified badge.
- An implicit credibility score is computed per user based on confirmed vs. denied updates.

---

## 8. Points and Rewards System

### 8.1 Customer Points & Rewards Catalog
- **Earning sources:** A community status update that gets confirmed, completing a booking, writing a review with photos, and scanning the shop's QR code.
- **Rewards Catalog (`PointsScreen`):**
  1. **Fixed cash vouchers:** E.g., 5 LYD or 15 LYD instant discount at checkout.
  2. **Percentage discount vouchers:** E.g., 10% off total service cost.
  3. **Free service add-ons:** E.g., Free Facial Mask, or 100% Free Grooming session.
- Points redemption generates a promo voucher code that is applied during the `confirm` step of the booking flow.

### 8.2 Barber Points (StaffMembers) — Launch Incentive
- Barbers earn points for updating the shop's status (`status_updated_by_staff`), motivating app usage during peak hours.
- Accumulated barber points are redeemable or paid out according to platform incentive rules.

### 8.3 One-Time Monetary Reward (QR Scan)
- When a customer scans the shop's physical QR code upon arrival via the in-app `QrScannerBottomSheet`, both customer and barber receive a monetary reward once per `user_id` platform-wide, credited upon completing their first booking.

---

## 9. Database Design (MongoDB)

**Users**
- `_id` · `full_name` · `phone` (unique) · `email` (optional) · `customer_id` (unique 5-digit number, e.g. "84920") · `avatar_url` · `points_balance` · `wallet_balance` · `cash_payment_enabled` (bool, default true) · `no_show_count` · `credibility_score` · `created_at`

**BusinessAccounts** (Shop and platform level logins)
- `_id` · `business_id` (ObjectId, null for root/platform_staff) · `role` (root / platform_staff / owner / staff) · `name` · `phone/email` · `password_hash`

**Businesses**
- `_id` · `owner_account_id` · `name` · `name_ar` · `address` · `latitude` · `longitude` · `phone` · `gallery_urls` · `is_verified_status_account` · `approval_status` · `working_hours` (array: `{ day, is_open, open_time, close_time }`) · `created_at`

**Categories**
- `_id` · `name` · `name_ar` · `icon`

**BusinessCategories**
- `business_id` · `category_id`

**Services**
- `_id` · `business_id` · `category_id` · `name` · `description` · `price` · `duration_minutes` · `target` (adult/child) · `is_active`

**ServiceAddons**
- `_id` · `business_id` · `name` · `price`

**StaffMembers**
- `_id` · `business_id` · `full_name` · `photo_url` · `avg_rating` · `points_balance` · `is_active` (bool) · `deleted_at` (nullable)

**Bookings** (Supports both Individual and Group Bookings)
- `_id` · `customer_id` · `business_id` · `staff_id` (primary barber or null if mixed) · `service_id` · `addons` (array: `{ addon_id, price }`)
- **`is_group_booking`** (bool)
- **`persons`** (embedded array for group bookings: `[{ id, name, is_me, service_id, service_name, addon_ids, staff_id, staff_name, price, confirmed }]`)
- `queue_position` (int) · `queue_entered_at` · `service_started_at` · `service_completed_at`
- `status` (`in_queue` / `next_up` / `in_progress` / `completed` / `auto_cancelled` / `no_show` / `cancelled`)
- `cancellation_reason` · `is_alternative_booking` (bool) · `original_booking_id` · `deposit_paid` (number)
- `payment_method` (`cash` / `wallet`) · `payment_status` (`unpaid` / `paid`) · `total_price` · `created_at`

**DraftBookings** (Syncs client-side drafts if logged in)
- `_id` · `user_id` · `shop_id` · `draft_payload` (JSON) · `updated_at`

**Reviews**
- `_id` · `booking_id` · `customer_id` · `business_id` · `rating` (1–5) · `comment` · `photos` (string array) · `created_at`

**StatusUpdates**
- `_id` · `business_id` · `submitted_by` · `is_open` · `waiting_count` · `crowd_level` · `note` · `photo_url` · `votes` (`[{ user_id, vote }]`) · `created_at`

**WalletTransactions**
- `_id` · `user_id` · `type` (`topup` / `payment` / `refund` / `p2p_transfer_sent` / `p2p_transfer_received` / `alternative_booking_fee` / `qr_first_time_reward`) · `amount` · `provider` (`onepay` / `lypay` / `internal`) · `recipient_user_id` (for P2P) · `sender_user_id` (for P2P) · `related_booking_id` · `status` · `created_at`

**PointsTransactions**
- `_id` · `account_id` · `account_type` (`customer` / `staff`) · `amount` · `reason` · `created_at`

**RewardRules**
- `_id` · `title` · `title_ar` · `points_required` · `type` (`fixed_discount` / `percent_discount` / `free_service`) · `discount_value`

**Notifications**
- `_id` · `user_id` · `business_account_id` · `type` · `payload` · `read_at`

**QrRewardClaims**
- `_id` · `user_id` · `business_id` · `claimed_at` · `paid_out` (bool)

**BookingDisputes**
- `_id` · `booking_id` · `raised_by` · `reason_text` · `status` · `resolution_notes` · `created_at`

---

## 10. Core Backend Functions (Thunder — Deno + MongoDB)

**Bookings & Queue Operations** (`routes/bookings.ts`)
- `joinQueue(customerId, businessId, bookingPayload)`: Creates individual or group bookings, validates active staff, computes queue positions, and deducts wallet balance if selected.
- `getEstimatedWaitTime(staffId)`: Rolling average of recent actual durations.
- `advanceQueue(staffId)`: Barber "Next" action: completes current session and moves queue forward.
- `confirmAttendance(bookingId, customerId)`: Called when customer taps "Confirm Attendance" in `showAttendanceSheet` or scans QR.
- `claimAlternativeBooking(originalBookingId, claimantCustomerId)`: Atomic lock reserving unconfirmed slot with `ALTERNATIVE_BOOKING_FEE` deduction.

**Wallet & Electronic Payment** (`routes/wallet.ts`)
- `initiateOnePayTopUp(userId, amount)`: Initiates One Pay top-up (ezone.ly).
- `initiateLyPayTopUp(userId, amount)`: Initiates LyPay local banking payment.
- `transferWalletBalance(senderUserId, recipientCustomerId, amount)`: Performs atomic P2P balance transfer between customers after verifying recipient ID.
- `verifyRecipient(recipientCustomerId)`: Looks up recipient name and avatar by their 5-digit Customer ID.
- `payBookingWithWallet(userId, bookingId, amount)`

**User & Profile Management** (`routes/users.ts`)
- `sendPhoneChangeOtp(userId, newPhone)`: Sends verification SMS to the new phone number.
- `verifyAndChangePhone(userId, newPhone, otpCode)`: Validates OTP and updates customer phone number.
- `submitFeedback(userId, message)`: Records customer feedback.

**Community Updates** (`routes/status-updates.ts`)
- `submitStatusUpdate(businessId, userId, isOpen, waitingCount, note?, photoUrl?)`
- `voteOnStatusUpdate(updateId, userId, vote)`

**Team Management** (`routes/staff.ts`)
- `addStaffMember(businessId, fullName, photoUrl?)`
- `setStaffActiveStatus(staffId, isActive, queueAction?)`
- `deleteStaffMember(staffId, queueAction?)`

---

## 11. Core Configuration Variables (Config)

- `DATABASE_URL` (MongoDB connection URI)
- `BOOKING_AUTO_CANCEL_MINUTES` (default: 10 min)
- `QUEUE_HEADS_UP_POSITION` (default: 3)
- `QUEUE_ESTIMATE_SAMPLE_SIZE` (default: 15)
- `NO_SHOW_THRESHOLD_FOR_CASH_DISABLE` (= 1)
- `ALTERNATIVE_BOOKING_FEE` (default: 5 LYD)
- `STATUS_UPDATE_CONFIRMATIONS_REQUIRED` (= 3)
- `STATUS_REMINDER_DELAY_MINUTES` (default: 30)
- `ONE_PAY_MERCHANT_ID` / `ONE_PAY_API_KEY` (ezone.ly)
- `LYPAY_MERCHANT_ID` / `LYPAY_SECRET_KEY`
- `FCM_SERVER_KEY` (Push notifications)
- `SMS_TRIGGER_ENDPOINT` (Huroof SMS backup)

---

## 12. Technical Architecture

| Layer | Technology | Notes |
|---|---|---|
| **Customer App** | React 19 + TypeScript + Vite + Tailwind CSS v4 | High-performance mobile web app, modular UI components, bottom-sheets, Capacitor-compatible for iOS/Android packaging |
| **Business App** | Thunder UI (React + TypeScript + Vite + shadcn/ui) | Huroof's internal framework for the shop owner dashboard & root admin |
| **Backend** | Thunder (Deno + MongoDB + Zod) | High-speed REST APIs with file-based routing and Zod schema validations |
| **Payment Gateways** | One Pay (ezone.ly) + LyPay | Electronic top-up via local banking channels and P2P transfers |
| **Maps** | Leaflet / OpenStreetMap / Google Maps | Shop discovery and location preview |
| **Push Notifications** | Firebase Cloud Messaging + SMS Trigger | Dual-layer notification delivery |
| **Background Workers** | Scheduled Cron / Deno Worker | Auto-cancellation, no-show flagging, and working hours status reminders |
| **Real-time** | WebSocket server | Real-time queue board updates, slot countdowns, and community votes |

---

## 13. Practical Steps & Implementation Roadmap

1. ✅ **Customer App UI & Workflows:** Completed core screens (Home, ShopDetail, BookingFlow with Group Bookings, MyQueue, Wallet with P2P & LyPay, Points Catalog, Map, Bookings History, Profile, Change Phone, Community Updates).
2. **Backend API Integration:** Wire frontends with Thunder endpoints for bookings, live queue events, and wallet transactions.
3. **Electronic Payment Integration:** Finalize One Pay webhook listeners and LyPay sandbox testing.
4. **WebSocket Server Setup:** Deploy the persistent WebSocket service for real-time queue position broadcasts.
5. **Business App Wireframes:** Complete the Team Management and Working Hours wireframes in Thunder UI.

---

## 14. Risk Table (Ordered by Impact, Then Likelihood)

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | Barber ignores the app during rush hours | Catastrophic | High | Maximum simplification (single "Next" button) + launch points incentive (Section 8.2) + initial training |
| 2 | Two people claiming the same alternative opportunity at once | Catastrophic | Medium | Atomic lock on backend (`claimAlternativeBooking`) |
| 3 | Barber exceeding allotted service duration | Major | Very high | Live Queue system with rolling average wait times |
| 4 | Schedule drifting when multiple customers are late | Major | Medium–high | FIFO Live Queue replaces rigid hourly slots |
| 5 | Off-app customer occupying a slot | Major | Medium | Register walk-in immediately into the live queue |
| 6 | Barber gaming the system by registering fake walk-ins | Medium–major | Medium | Manual walk-ins earn points only; monetary rewards require QR scan once per user |
| 7 | Alternative opportunity claimant failing to show | Medium | Medium | Non-refundable symbolic fee (`ALTERNATIVE_BOOKING_FEE`) |
| 8 | Disputes over fees or unfair no-show classification | Medium | Medium | Manual review path via `BookingDisputes` by Root/Platform Staff |
| 9 | Notification delay causing unfair auto-cancellation | Medium | Medium | Secondary SMS trigger backup |
| 10 | Customer confusion with multi-person group queues | Normal | Medium | Clear companion cards in `MyQueue` showing assigned barber per person |
| 11 | Wrong P2P transfer recipient | Normal | Low–Medium | Real-time recipient name and avatar preview before transfer confirmation |
