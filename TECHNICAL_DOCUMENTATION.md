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
>
> **Update (v5 — Queue Rules, Alternative Booking, and Platform Admin Governance):**
> 1. **Service and Add-on Management:** Adding, editing, and deleting services and add-ons is NOT handled by the shop/center, but exclusively managed through the Platform Admin / Root account to ensure quality standards and prevent price manipulation.
> 2. **Elimination of Blocking Hours:** Slot/time-blocking (Blocking hours) has been removed; instead, the barber simply toggles their status between "Active" and "Inactive" during breaks, absence, or vacations.
> 3. **Pre-Selected Payment Method:** The payment method is already chosen by the customer during booking in the app, or pre-recorded by the barber when registering an off-app walk-in customer. It is not chosen from scratch upon checkout.
> 4. **Cancellation of Advance Pre-Opening Queue Entry:** Any concept of advance booking that automatically converts into a position in the queue upon shop opening is cancelled; scheduled target-time booking is deferred. The system is strictly a real-time Live Queue (FIFO) operational only when the shop is open and the barber is active.
> 5. **10-Minute Confirmation Window Breakdown:** The 10-minute confirmation window is split into: the first 5 minutes (exclusive confirmation for the original customer with protected turn), and the last 5 minutes (the turn becomes exposed/at-risk, notifying the customer and opening the alternative booking countdown window for other customers in the shop).
> 6. **Alternative Booking & No-Show Policies:** When an in-shop customer claims the alternative booking slot for a symbolic fee (5 LYD, strictly non-refundable), the seat is immediately and permanently assigned to them. The original customer **is NOT treated as a new arrival** (never pushed to the back of the queue); instead, their booking is cancelled. If paid via wallet, the full booking amount is refunded and customer support contacts them to record the reason (account is banned on a second occurrence); if booked with cash, cash payment is disabled on their next booking until they pay via wallet and successfully complete the service. If the 10-minute window expires without any claimant or confirmation, the queue sequentially advances to the next person in line.
>
> **Update (v6 — Business App Enhancements & Queue Governance):**
> 1. **Individual Barber Accounts & Team Queue Visibility:** Each barber has an individual account in the Business App to manage their chair/queue and view the salon team list with live waiting counts for every peer barber.
> 2. **Incoming Booking Notification (Accept/Reject):** When a customer submits a booking, an immediate notification is sent to the assigned barber with "Accept" or "Reject" options.
> 3. **All-or-Nothing Group Booking Rule:** If a group of companions books with a barber, the barber must accept or reject the entire group together; partial acceptance is prohibited.
> 4. **Customer Transfer Between Barbers (with 2-Minute Response Timeout & Load Balancing):** Barbers can transfer customers to another active barber to balance shop workload; walk-in guest customers are transferred immediately once approved by the target barber. For registered app customers, an interactive prompt is sent displaying the new barber name, calculated position, and estimated time saved, bound by a strict **2-minute response window** (`CUSTOMER_TRANSFER_TIMEOUT_SECONDS = 120`). If accepted within 2 minutes, they transfer; if rejected or timed out, the request is automatically cancelled and the customer retains their original queue position without idling the target barber's chair, with target barber consent always strictly required first.


> 5. **Direct Barber Cancellation:** Barbers have direct authority to cancel any customer booking in their queue with reason logging, instant customer notification, and automated wallet refund.
> 6. **Inactive Status & One-Tap Bulk Cancellation:** Upon switching to "Inactive", the barber can cancel all waiting queue bookings with a single button, broadcasting simultaneous cancellation notifications to all waiting customers; if left unclicked, waiting customers remain in queue to complete their turn.
> 7. **Customer Cancellation Rules & Proximity Self-Cancel Lock:** Customers can cancel their booking directly and independently via the app while still far back in the queue. However, as soon as the first proximity notification arrives stating **"There is 1 person ahead of you, be close to the shop"** (meaning 1 person is waiting in line ahead + 1 person in the chair), **self-service cancellation is permanently locked in the app**. From that point onward (including when the second notification "You are next, confirm your attendance" arrives), the customer cannot cancel on their own and can only request cancellation by **directly contacting Customer Support**, protecting barbers from malicious orders, queue disruption, and last-minute cancellations. Support also proactively contacts customers to document cancellation and non-confirmation reasons.
>
> **Update (v7 — Technical Support Alert on 3 Community Verification Votes):**
> Once any community status update reaches a total of **3 votes** (whether "Yes" or "No") on the verification question **"Still accurate?"**, the system automatically dispatches an instant notification to Platform Administration, specifically the **Technical Support Department**, instructing them to promptly contact the barber by phone to verify the shop's actual operational status and waiting count, and confirm the official state — see Section 4.11, Section 7, Section 9, Section 10, and Section 11.


---

## 1. Project Overview

A two-sided marketplace platform with two separate systems:

- **Customer App:** Discover nearby barbers, see their real-time status (open/closed, number of people waiting), book a turn (individual or group), track live queue progress, top up wallet via One Pay and LyPay, transfer funds between customers, redeem rewards, leave reviews, and participate in community-driven status updates.
- **Business App:** A dashboard for shop owners and individual barbers to manage schedules, team, queue boards, incoming bookings, and customer transfers — also used to administer the platform itself via a Root account (see Section 3).

**Key founding principle:** Barbering is a **Category**, not a fixed part of the system's structure. The system must be built so that categories and services are dynamic, extensible entities (women's beauty salons, car care centers, etc. in the future) without restructuring the database.

As an industry reference, we reviewed the structure of Fresha (a global salon/barber booking app) — which relies on a central calendar per team member, group bookings, automated reminders, and a client profile that stores history and preferences — and the mechanism of Tripoli Streets (tripolistreets.ly) for real-time community updates based on user reports that other users confirm or deny, with a feed, a map, and a personal account for each reporter.

---

## 2. System Actors

| Actor | Access | Permissions |
|---|---|---|
| **Customer** | Customer app (Mobile Web / React Native / PWA) | Search, individual & group booking, wallet management & P2P transfers, rewards redemption, reviews, and community updates |
| **Business Owner** | Business app | Full shop management: staff team, overall live queue board, reports & analytics, working hours, and verified status updates |
| **Barber (Staff)** | Business app (dedicated barber account) | Dedicated queue management, incoming booking accept/reject, customer transfer, direct cancellation, team & peer queue count visibility, and status toggle with one-tap bulk cancellation |
| **Platform Admin (Root / Platform Staff)** | The same Business app, via Root / Platform Staff accounts | System-wide permissions over all shops, central service & addon catalog, monitoring, dispute arbitration, and customer support outreach |

---

## 3. Business App — Feature Details

**Technology:** Built on **Thunder UI** (Huroof's internal framework: React + TypeScript + Vite + shadcn/ui) — see Section 12.

- **Login:** Phone/email + password, or OTP via SMS.
- **Individual Barber Account (حساب خاص لكل حلاق):** Every barber is provisioned their own individual login credentials in the Business App (`role: barber`). This allows each team member to manage their own chair, queue, and status independently, receive push notifications on their personal device, and execute operational queue decisions.
- **Main Screen (Live Queue Board):** A clean, simplified view showing the current customer in the chair (`in_progress`), the next customer up (`next_up`), and the sequential waiting list. A single prominent "Next" button completes the current customer and initiates the next one automatically, minimizing app distraction during rush hours.
- **Team Transparency & Peer Queue Counts (عرض قائمة الفريق وطوابير الزملاء):** Through their account, each barber can view the salon's team roster (if working in a multi-barber shop), displaying every peer barber alongside the live number of customers waiting in their queue. This transparent visibility allows staff to evaluate overall shop load and initiate customer transfers when chairs are idle.
- **Incoming Booking Notification & Accept/Reject Decision (إشعار الحجز بالقبول أو الرفض):** When a customer submits a booking, it does not bypass staff oversight; an immediate push notification is dispatched to the assigned barber's device presenting booking details, chosen services, and two clear actions:
  - **Accept (قبول):** Officially approves the booking; the customer is assigned their sequential position in the barber's live queue.
  - **Reject (رفض):** Rejects the booking; the customer receives an immediate notification of the rejection and any wallet payment is instantly refunded.
- **All-or-Nothing Group Booking Rule (حجز المجموعات: قبول الكل أو رفض الكل):** When a group booking is assigned to a barber (multiple companions under one booking request), the barber must make a unified decision for the entire group: either **accept the group as a whole** or **reject the group in its entirety**. The system strictly prohibits fractional acceptance (e.g. accepting one companion and rejecting another) to protect group party integrity.
- **Customer Transfer Between Barbers (نقل العملاء من حلاق إلى آخر):** A barber can initiate transferring a customer from their queue to another active colleague's queue through direct barber-to-barber coordination to balance workload and minimize customer wait times:
  - **Mandatory Target Barber Consent First:** An instant approval prompt is always dispatched to the target barber first (Accept / Decline) to ensure their readiness, prevent commission/percentage disputes, and avoid dumping excess work during intended breaks; no customer is ever transferred without the target barber's prior approval.
  - **Guest Walk-in Customers (الزبون الضيف):** Once approved by the target barber, walk-in guests present in the shop are transferred and seated immediately without electronic confirmation delays.

  - **Registered App Customers (with 2-Minute Response Timeout):**
    - Respecting customer loyalty to their regular barber, transfers are never forced. The booking enters a "Pending Customer Confirmation" (`pending_customer_approval`) state.
    - An interactive prompt is delivered to the customer's app detailing the offer transparently: the target barber's name, calculated new queue position, and estimated wait time saved (e.g. *"Would you like to switch to Barber Ahmed? You'll be #2 in line and save ~15 minutes"*).
    - **Strict 2-Minute Countdown Window:** The prompt is governed by a 2-minute countdown timer (`CUSTOMER_TRANSFER_TIMEOUT_SECONDS = 120`).
      - **If Confirmed within 2 minutes:** The customer is immediately placed into the target barber's queue at their fair sequential spot.
      - **If Rejected or Timed Out (No Response):** The transfer request is automatically aborted (`expired_timeout`) and the customer retains their original queue position and turn with zero disruption. Crucially, this ensures the target barber's chair is never held idle or blocked waiting on an unresponsive client.
  - **Price Consistency Guarantee:** Transferring between barbers never alters the prices of pre-selected services, protecting the customer from unexpected fee adjustments.

- **Direct Barber Cancellation (إلغاء حجز الزبون مباشرة من الحلاق):** The barber has the direct authority to cancel any customer's booking from their queue interface when operational circumstances require it. The barber logs the reason, the customer is immediately notified, and any wallet funds are refunded without marking a customer no-show.
- **Inactive Status & One-Tap Bulk Cancellation (التحول لغير نشط والإلغاء الجماعي بزر واحد):**
  - When a barber toggles their status to **"Inactive" (غير نشط)** (taking a break, leaving for an emergency, or ending their shift):
  - The app displays an explicit one-tap button: **"Cancel All Bookings" (إلغاء كل الحجوزات)**.
  - Tapping this button simultaneously cancels all remaining waiting bookings in their queue and broadcasts an instant push notification to all affected customers at the exact same moment, issuing automated wallet refunds.
  - **Continuity Option for Waiting Customers:** If the barber chooses NOT to press the bulk cancellation button (leaves bookings active), the customers remain in the queue to complete their turn (e.g. when the barber reactivates or decides to attend to remaining clients).
- **Customer Cancellation Rules & Support Follow-up (ضوابط إلغاء الحجز من الزبون وقفل الإلغاء الذاتي):**
  - **Early Self-Cancellation:** Customers have full freedom to cancel their booking directly and independently within the app as long as they are far back in the queue (2 or more customers waiting in line ahead).
  - **Proximity Self-Cancellation Lock (Anti-Trolling & Queue Protection):**
    - The customer receives two sequential proximity notifications as the queue progresses:
      1. First Notification: **"There is 1 person ahead of you, be close to the shop"** ("أمامك شخص، كن قريباً من المركز") — dispatched when there is exactly 1 person waiting in the queue ahead + 1 person in the barber chair.
      2. Second Notification: **"You're next, confirm your attendance"** ("أنت التالي، أكد حضورك") — dispatched when the customer becomes next in line (0 waiting in queue ahead, 1 in chair), opening the 10-minute confirmation window.
    - **Strict Policy:** From the exact moment the First Notification ("There is 1 person ahead of you, be close to the shop") is sent, **self-service cancellation is permanently locked and disabled in the app**. This prevents malicious fake bookings, disruptive last-minute cancellations, and empty chair downtime.
    - From that point onward (including when the second notification "You're next" arrives), **the customer cannot cancel on their own** and must contact Customer Support directly if they wish to cancel, explaining their circumstances for manual review and support cancellation.
  - **Mandatory Support Outreach & Documentation:** Customer support follows up directly with customers to document cancellation reasons, or investigates when a customer fails to confirm attendance during the 10-minute window, recording notes in the administrative log to monitor churn and deter abuse.

- **Team Management (Shop Owner):** A dedicated screen for the shop owner:
  - **Add a barber:** Full name, optional photo, and provisioning of their personal Business App login; their queue appears immediately as "Active".
  - **Change status (Active / Inactive):** Toggle switch between "Active" and "Inactive". An inactive barber accepts no new customers into their queue and appears to customers with an "Unavailable" badge.
  - **Delete a barber:** Soft delete preserving booking history, financial ledgers, and customer ratings.
  - **Queue rule:** A barber cannot be deactivated or deleted while a customer is in service (`in_progress`) — finish that customer first.
- **Service and Add-on Management (Centrally Managed by Platform Admin):** Adding, editing, and deleting services and add-ons is **NOT permitted at the shop/center level**, but is strictly handled through the **Platform Admin (Root / System Administrator)** account to ensure consistent pricing, taxonomy, and standards. The shop dashboard only displays its assigned catalog to toggle local availability without direct editing or deletion privileges.
- **Add-ons:** Centrally defined and priced by the Platform Admin (face masks, grooming oils, steamer treatments, etc.) as supplemental items selectable during booking.
- **Photo gallery:** Photos of the shop and previous work.
- **Manual booking by management:** To add a customer who walked in personally or booked by phone (registered as a Guest with pre-selected payment method — cash or wallet).
- **Daily working hours (display only):** The shop owner records, for each day of the week, the **opening time (from)** and **closing time (to)**, or marks the day as "Day off". Closing may fall after midnight. **These hours are informational only:** they do not open or close the shop automatically, do not change its status, and do not block entry to the queue — the actual status is changed manually by the supervisor. Their purpose is for customers to see them (shop page and map banner) and plan their day accordingly.
  - **Reminder to update the status:** The system sends the supervisor (the shop owner) a notification in two cases, once per occasion and without ever changing the status itself: (1) 30 minutes after the registered opening time, if the status has not been changed to "Open": "Have you opened the shop, or not yet?"; (2) 30 minutes after the registered closing time, if the status has not been changed to "Closed": "Have you closed the shop, or are you still working?". No reminders are sent on days off, or for a shop that has not enabled the verified status account (since the status is changed through it).
- **Checkout on turn completion:** When tapping a booking in the live queue — complete it and verify any extra add-ons delivered during the session. **Payment method is pre-determined:** Payment method (cash at shop or wallet debit) is not chosen at checkout; it was already chosen by the customer when confirming the booking in the app, or pre-recorded by the barber during manual entry for walk-in customers without the app.
- **Customer list:** A simple record of customers and their visit history (mini CRM).
- **Reports:** Revenue, number of bookings, no-show rate, peak times, rating per team member.
- **Status updates from the verified account:** The business owner (if they choose to enable the "verified" account) can update the "open/closed" status and the number of people waiting directly, and this update has **absolute priority** over any community update.
- **Barber points incentive (launch period):** To address the risk of the barber ignoring the app during rush hours, the barber earns points (separate from customer points) for updating the status, along with a periodic follow-up notification ("Have you finished the haircut?") that serves two purposes at once: a reminder for the barber, and a data-quality guard — because the live queue's estimated wait time calculation (Section 6) depends on the barber pressing the "Finish" button at the right moment.
- **Root account and Platform Staff accounts:** Instead of building a separate admin panel, the platform is administered from this same app via a **Root** account with full permissions over all registered shops, with **Platform Staff** accounts under it holding limited permissions (monitoring, statistics, reviewing new shops, customer support outreach, etc.). This is implemented through an RBAC (role-based access control) system that distinguishes between an account tied to a single shop (owner/staff/barber) and an account tied to the platform as a whole (root/platform_staff).

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
- **Alternative Booking Live Opportunity:** Opens exclusively during the final 5 minutes of the 10-minute confirmation window granted to the original customer (the first 5 minutes are protected and exclusive to the original customer). An animated banner with a real-time countdown timer (`altBooking.openWindowSeconds` - 5 minutes) appears on the barber card, allowing in-shop waiting customers to claim the slot immediately for a symbolic fee (5 LYD, strictly non-refundable). Claiming immediately locks the slot and cancels the original booking without re-adding them as a new arrival.

### 4.5 Booking Engine — Individual & Group Bookings (`BookingFlow`)
- **Step 1: Barber Selection (`barber`):** Select a specific barber (viewing their queue count and wait time) or choose **"Any Available Barber" (أول حلاق متاح)** for the fastest service. (Operational only in the real-time queue when the shop is open and the barber is active — scheduled pre-opening queue reservations are cancelled).
- **Step 2: Group Booking & Companion Management (`group_list`):**
  - The customer can book for themselves AND add one or more companions (e.g., "أحمد (ابني)", "صديق").
  - **Per-Person Customization:** For each companion, the customer can assign a different service, select add-ons via `ServiceSelectionBottomSheet`, and designate a specific barber or "Any barber".
  - **Itemized Overview:** Visual card per person with their selected services, assigned barber, and price, with full ability to edit or remove companions.
- **Step 3: Review & Payment Confirmation (`confirm`):**
  - Comprehensive cost breakdown: base services total + add-ons total - discounts/rewards.
  - Payment method selection: **Wallet balance** (رصيد المحفظة) or **Cash at shop** (دفع نقدي في الصالون). (Recorded upfront in the booking; not prompted at service finish).
  - **Cash Disablement Guard for No-Shows:** If a customer previously failed to show up for a cash booking, cash payment is disabled **on their next booking**, requiring wallet payment with completed service to reinstate cash privileges.
  - Promo code / points discount voucher application.
  - Deduction of the symbolic fee (5 LYD, strictly non-refundable) if the booking is claimed as an alternative slot.
- **Draft Auto-Save:** Every selection (services, addons, persons, step) is synced to `draft_booking_${shopId}` so accidental closure never loses progress.

### 4.6 The Live Queue Experience (`MyQueue`)
- **Real-Time Visual Queue Card:**
  - Barber chair graphic with live position badge ("دورك: 2 من 5").
  - Moving wait time countdown and barber status ("الحلاق يبدأ الحلاقة الآن").
- **Proximity Alerts System & Self-Cancellation Lock (إشعارات اقتراب الدور وقفل الإلغاء):**
  - **Notification 1 ("There is 1 person ahead of you, be close to the shop" — "أمامك شخص، كن قريباً من المركز"):** Dispatched when exactly 1 person is waiting in queue ahead + 1 person in the chair. **Upon dispatch of this notification, self-service cancellation is permanently disabled/locked** in the customer app UI. From this point forward, the customer cannot cancel on their own and can only request cancellation by contacting Customer Support.
  - **Notification 2 ("You're next, confirm your attendance" — "أنت التالي، أكد حضورك"):** Dispatched when the customer becomes next in line (0 waiting in queue ahead, 1 in chair), initiating the 10-minute confirmation countdown (self-service cancellation remains locked).
- **Attendance Confirmation & The 10-Minute Window (`showAttendanceSheet`):**

  - **First 5 Minutes (Exclusive Protected Window):** Notification arrives ("You're next, please confirm attendance"); the slot is exclusively protected for the original customer to confirm.
  - **Last 5 Minutes (At-Risk Alternative Booking Window):** A warning notification is sent to the customer alerting them that their turn has become **exposed to being taken** by other customers in the shop. Concurrently, the alternative booking countdown opens for other waiting customers in the shop to purchase the turn for a symbolic fee of 5 LYD.
  - **Spot Claim & Cancellation of Original Booking:** When an in-shop customer purchases the turn for 5 LYD (strictly non-refundable), the seat is permanently awarded to them. The original customer **is NOT treated as a new arrival** (never pushed to the end of the queue as a walk-in); instead, their booking is permanently cancelled.
  - **Financial & Account Policies for Cancelled Customers:** If paid by wallet, the full service amount is refunded to their wallet, and customer support contacts them to record the reason (account banned on repeat offense). If booked with cash, cash payment is blocked on their next booking until they pay via wallet and complete the session.
  - **Unclaimed Turn Expiry:** If the full 10 minutes elapse with no confirmation and no alternative claim, the queue sequentially advances to the next customer in line.
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
- **"Still Accurate?" Verification Voting & Confirmation Lock:** Each community report presents a verification prompt: *"Still accurate?"* with voting options (**"Yes"**, **"No"**, or **"Don't know"**). Clicking "Yes" or "No" opens an *"Are you sure?"* confirmation modal. Once confirmed, the choice is permanently locked and cannot be changed or toggled. Accumulating a total of **3 votes** (whether Yes or No) automatically triggers an urgent notification to Technical Support to phone the barber and verify status.
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
3. **Service & Add-ons:** Defined and managed centrally at the platform level via the **Platform Admin (Root)** account and assigned to the shop within its approved category (with standardized pricing, estimated duration, and target audience) to ensure quality control, pricing consistency, and fraud prevention. The shop displays its assigned offerings without local editing or deletion permissions.

---

## 6. Booking Engine — The Live Queue System

### 6.1 Why fixed time slots were abandoned

The first model (booking a fixed hourly slot, e.g. 2:00 for Muhammad and 2:30 for Ahmed) revealed several practical problems in discussion:
- If Muhammad takes longer than half an hour, he eats into Ahmed's booking time.
- If Muhammad finishes earlier than expected, a gap forms before Ahmed arrives.
- Several accumulated delays force a manual "shift" of the entire schedule.
- An off-app walk-in customer may actually occupy a booked slot, creating a dispute when the booking holder arrives.

Haircut duration is inherently variable — a human factor — so promising an exact hour is hard to honor no matter how small the slot. Even Fresha works with estimated durations and a moving calendar, not rigid slots.

### 6.2 The Live Queue per Team Member (FIFO) with Group Support & Cancellation of Future Bookings
- The customer books **a turn in a live virtual queue specific to the chosen team member** (or "Any Available Barber").
- **Complete Elimination of Future Bookings:** Any concept of future booking (Future Booking) or reserving slots for future days or upcoming hours is completely cancelled. Furthermore, pre-booking that automatically converts into a position in the queue upon shop opening is cancelled. The system operates strictly as a real-time FIFO Live Queue when the shop is open and the barber is active.
- **Barber Booking Notification & Accept/Reject Decision:** When a customer books a turn, an instant notification is dispatched to the assigned barber's device. The barber has the option to **Accept** the booking (officially entering the customer into the live queue) or **Reject** the booking (notifying the customer of the rejection and issuing an immediate refund for any wallet payment).
- **All-or-Nothing Group Booking Rule:** In the case of a group booking (multiple companions assigned to the same barber), the barber must accept the entire group or reject the entire group as a whole. Fractional acceptance is strictly disallowed to keep group parties intact.
- **Team Transparency & Peer Queue Counts:** Every barber can access their personal dashboard to manage their queue, view the shop's team roster, and observe real-time waiting queue counts for every colleague to coordinate workload and transfers.
- The customer sees their live position ("Your position: 2nd") and a moving estimated wait time computed from the **average duration of recent completed bookings**.
- **Group Booking Handling:** When booking for multiple persons, the group booking document holds an array of `persons`. If all companions are assigned to the same barber, they occupy sequential positions in that barber's queue. If companions pick different barbers, each companion is placed in their respective barber's queue while linked under the same master `GroupBookingData`.
- When the barber finishes a customer, they press a single "Next" button → the next customer begins automatically.
- **Draft Recovery:** In-progress booking setups are persisted locally (`draft_booking_${shopId}`) so customers never lose companion configurations on accidental page reloads.

### 6.3 Alternative Booking & Attendance Confirmation (الحجز البديل)
A parallel mechanism designed to keep barber chairs productive while maintaining absolute fairness:
- **Realistic Barbering Timing:** During the 10-minute confirmation window, the barber is typically still servicing the person currently in the chair and has not yet finished.
- **10-Minute Window Breakdown:**
  - **First 5 Minutes (Exclusive Protected Phase):** The confirmation prompt appears exclusively for the original customer to confirm attendance ("You're next, please confirm your attendance"). Their seat is fully protected and cannot be contested.
  - **Last 5 Minutes (At-Risk & Alternative Booking Phase):** The original customer is immediately notified that their turn has become **exposed to being claimed** by other customers. At that same moment, a 5-minute countdown (`altBooking.openWindowSeconds`) opens on the barber card, allowing in-shop waiting customers to purchase and take the slot.
- **Queue Slot Purchase Fee (5 LYD):** The claiming customer pays a symbolic fee of **5 LYD** (`ALTERNATIVE_BOOKING_FEE`) deducted from their wallet, guarded by an atomic backend lock. **This symbolic fee (5 LYD) for purchasing a queue spot is strictly NON-REFUNDABLE under any circumstances.**
- **Immediate Seat Award & Original Booking Cancellation:** Once purchased by an in-shop customer, the seat is permanently locked and awarded to the claimant. The original customer **is NOT treated as a new arrival** (the previous rule of pushing them to the end of the queue as a walk-in is cancelled); instead, their booking is **permanently cancelled**.
- **Financial & Account Policies for Cancelled Customers & Support Follow-up:**
  - **If paid via wallet:** The full booking amount is refunded to their wallet. Customer support proactively contacts them by phone to understand and record the reason for failing to confirm attendance (account is banned on a second occurrence).
  - **If booked with cash:** Cash payment is disabled **on their next booking**, and they are restricted to wallet-only payments until a booking is successfully completed.
- **Unclaimed Alternative Booking Scenario:** Even if the barber finishes servicing the client in the chair, and the original booking customer failed to confirm during the 10 minutes, and no other customer claimed the slot for the 5 LYD fee: **the queue sequentially advances to the next customer in line** (FIFO) without creating an idle gap, while the unconfirmed customer's booking is cancelled under the policies above with support outreach logged.

### 6.4 General Rules, Transfers, and Cancellations
- **Conflict Prevention:** A team member cannot have more than one "current" customer at the same moment in the queue.
- **Team Member Status:** Joining the queue of an inactive or deleted team member is rejected.
- **Customer Transfer Between Barbers (Fair Load Balancing):**
  - A barber can initiate transferring a customer to an active colleague's queue to relieve queue congestion and coordinate team workload.
  - **Mandatory Target Barber Consent First:** Prior approval from the target barber is strictly mandatory before proceeding, ensuring readiness and avoiding commission conflicts or overload during breaks.
  - **Guest Walk-in Customers:** Once approved by the target barber, walk-in guests are seated immediately at the new chair without electronic delay.

  - **Registered App Customers:**
    - The booking enters a "Pending Customer Confirmation" (`pending_customer_approval`) state via an interactive push notification.
    - **Queue Transparency:** The prompt clearly shows the new barber's name, calculated queue position, and estimated minutes saved, placing the customer in a fair sequential position without cutting ahead of preexisting waiting clients.
    - **2-Minute Response Deadline (`CUSTOMER_TRANSFER_TIMEOUT_SECONDS = 120`):** The customer has exactly 2 minutes to respond. If confirmed, they transfer immediately; if declined or if the 2-minute timer expires, the transfer request is automatically cancelled (`expired_timeout`) and the customer keeps their spot in the original queue, ensuring the target barber's chair is never held idle.
  - **Price Consistency Guarantee:** Service pricing remains completely identical across barbers; no additional fees are charged to the customer.

- **Direct Barber Cancellation:** A barber can directly cancel any booking in their queue with a mandatory recorded reason, notifying the customer immediately and executing an automatic wallet refund without penalizing the customer.
- **Inactive Status & One-Tap Bulk Cancellation:**
  - When a barber sets their status to "Inactive", the app provides a one-tap button: "Cancel All Bookings".
  - Tapping this button simultaneously cancels all remaining bookings and broadcasts an instant push notification to all affected customers with automatic wallet refunds.
  - **Continuity Option:** If the barber chooses NOT to click the bulk cancel button, waiting customers remain in queue to complete their turn normally.
- **Customer Cancellation Rules & Proximity Self-Cancel Lock (ضوابط إلغاء الحجز من الزبون وقفل الإلغاء):**
  - **Early Self-Cancellation:** Customers are permitted to cancel their booking directly and independently within the app while they remain further back in the queue (2 or more customers waiting in line ahead).
  - **Proximity Self-Cancellation Lock (Anti-Trolling & Queue Protection):**
    - The customer receives two sequential proximity notifications as the queue progresses:
      1. First Notification: **"There is 1 person ahead of you, be close to the shop"** ("أمامك شخص، كن قريباً من المركز") — dispatched when there is exactly 1 person waiting in the queue ahead + 1 person in the chair.
      2. Second Notification: **"You're next, confirm your attendance"** ("أنت التالي، أكد حضورك") — dispatched when the customer becomes next in line (0 waiting in queue ahead, 1 in chair), opening the 10-minute confirmation countdown.
    - **Strict Policy:** From the moment the First Notification ("There is 1 person ahead of you, be close to the shop") is dispatched, **self-service cancellation is permanently disabled/locked** in the customer app UI. From this point forward (including during the "You're next" notification window), the customer **cannot cancel on their own** and must contact Customer Support directly to explain their reasons for manual cancellation, protecting barbers from malicious orders, queue disruptions, and empty chair downtime.
- **Mandatory Customer Support Outreach:** Customer support contacts the customer to record the underlying reason in two scenarios: (1) when a booking is cancelled through support, and (2) when a customer fails to confirm attendance during the 10-minute confirmation window and the booking is forfeited or claimed.

- **Working Hours Are Informational Only:** They do not affect queue entry and never open or close the shop automatically.
- **Cancellation of Target-Time Advance Booking:** Target-time / scheduled advance bookings are currently **cancelled in full**, to be reconsidered and studied in a future phase.
- **Cancellation of Pre-Opening Queue Conversion:** Bookings cannot be created while closed to automatically queue upon opening; the queue is strictly live when the shop opens with active staff.
- **Alternative Booking Fee (5 LYD):** Non-refundable under all circumstances.
- Manual walk-ins added by management enter the queue directly as Guest customers without auto-cancel timers, with their payment method pre-selected by the barber.

---

## 7. Community Status System (Inspired by Tripoli Streets)

- Any registered user can submit a status update: open/closed, plus an estimated number of people waiting, crowd tag, note, and photo.
- **"Still Accurate?" Verification Voting Mechanism:**
  - The update appears to nearby users with the verification question: **"Still accurate?" (`rateThisUpdate`)** with quick voting buttons: **"Yes" (`correctVote`)**, **"No" (`incorrectVote`)**, or **"Don't know"**.
  - **Confirmation Modal Step:** Clicking either **"Yes"** or **"No"** triggers an *"Are you sure?"* modal with "Confirm" and "Cancel" buttons, reminding the user that this decision cannot be undone.
  - **Irreversible Vote Lock:** Upon clicking "Confirm", the vote is permanently registered, and the card's voting options are disabled (`isVoted = true`) with a locked badge. Users can no longer modify or toggle off their vote.
  - **Shop Detail Community Chip Dynamic Behavior & Cross-Page Sync:**
    - When an active community update exists for today and the user has not yet cast a vote on it (eligible to vote), the shop details chip pulses with an eye-catching live ping dot and displays **"New Community Update"** (`newCommunityUpdate`).
    - Once the user votes (confirming or refuting accuracy) and confirms in the modal, the chip ceases pulsing and automatically reverts back to its calm status showing the update time: **"Last update 7:31 PM"** (`communityUpdateWithTime`).
    - Whenever a subsequent new community report is submitted for the shop that the user hasn't voted on, the chip returns to the pulsing **"New Community Update"** state until voted upon.
    - All community reports, statuses, and votes are synchronized in real-time across all screens (Home, Shop Details, Map, and Favorites).
  - Visual statistics display the live tally and ratio of confirmation vs. denial votes.
- **Automated Technical Support Notification upon 3 Votes:**
  - As soon as a community update accumulates a total of **3 votes** (regardless of whether votes are "Yes" or "No") on the question "Still accurate?", the backend automatically sends a high-priority alert to Platform Administration, specifically directed to the **Technical Support Department**.
  - The alert includes the shop name, phone number, reporter details, and the vote breakdown.
  - **Mandatory Support Outreach to the Barber:** The Technical Support team is required to immediately place a phone call to the barber / shop owner to verify the real-world operational status (whether the shop is actually open or closed, and the true count of waiting customers).
  - Upon verifying with the barber, technical support updates and locks the shop's official status in the system, preventing discrepancies between crowd reports and real-world operations.
- When confirmations reach the threshold (`STATUS_UPDATE_CONFIRMATIONS_REQUIRED = 3`), the update is adopted in the UI unless officially overridden by the barber or platform support.
- **Updates from the business owner's verified account bypass this mechanism entirely** and are displayed immediately with an official verified badge and absolute priority.
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
- `_id` · `full_name` · `phone` (unique) · `email` (optional) · `customer_id` (unique 5-digit number, e.g. "84920") · `avatar_url` · `points_balance` · `wallet_balance` · `cash_payment_enabled` (bool, default true; disabled on next booking if customer no-shows on a cash booking, reinstated upon completing a wallet-paid service) · `no_show_count` · `credibility_score` · `created_at`

**BusinessAccounts** (Shop and platform level logins, including individual barber accounts)
- `_id` · `business_id` (ObjectId, null for root/platform_staff) · `staff_id` (ObjectId, reference to `StaffMembers` when role is `barber`) · `role` (`root` / `platform_staff` / `owner` / `barber`) · `name` · `phone/email` · `password_hash`

**Businesses**
- `_id` · `owner_account_id` · `name` · `name_ar` · `address` · `latitude` · `longitude` · `phone` · `gallery_urls` · `is_verified_status_account` · `approval_status` · `working_hours` (array: `{ day, is_open, open_time, close_time }`) · `created_at`

**Categories**
- `_id` · `name` · `name_ar` · `icon`

**BusinessCategories**
- `business_id` · `category_id`

**Services (Exclusively Managed by Platform Admin)**
- `_id` · `business_id` · `category_id` · `name` · `description` · `price` · `duration_minutes` · `target` (adult/child) · `is_active` · `managed_by_root` (bool)

**ServiceAddons (Exclusively Managed by Platform Admin)**
- `_id` · `business_id` · `name` · `price` · `is_active` · `managed_by_root` (bool)

**StaffMembers**
- `_id` · `business_id` · `account_id` (reference to `BusinessAccounts` for personal barber login) · `full_name` · `photo_url` · `avg_rating` · `points_balance` · `is_active` (bool) · `deleted_at` (nullable)

**Bookings** (Supports both Individual and Group Bookings)
- `_id` · `customer_id` (optional/null for off-app walk-in guest) · `is_guest` (bool) · `guest_name` · `guest_phone`
- `business_id` · `staff_id` (primary barber or null if mixed) · `service_id` · `addons` (array: `{ addon_id, price }`)
- **`is_group_booking`** (bool)
- **`persons`** (embedded array for group bookings: `[{ id, name, is_me, service_id, service_name, addon_ids, staff_id, staff_name, price, confirmed }]`)
- **`transfer_status`** (`none` / `pending_target_barber` / `pending_customer_approval` / `transferred` / `rejected_by_customer` / `expired_timeout`)
- **`transfer_target_staff_id`** (destination barber staff ID upon transfer)
- **`transfer_expires_at`** (timestamp for customer response deadline — 2 minutes to prevent idle chair lock)

- `queue_position` (int) · `queue_entered_at` · `service_started_at` · `service_completed_at`
- `status` (`in_queue` / `next_up` / `in_progress` / `completed` / `auto_cancelled` / `no_show` / `cancelled`)
- **`is_cancellation_locked`** (bool, locked to true when Notification 1 "There is 1 person ahead of you" is sent to disable self-cancellation and restrict cancellation to customer support only)
- `cancelled_by` (`customer_self` / `customer_via_support` / `barber` / `bulk_inactive` / `system_timeout` / `alternative_claimed`)
- `cancellation_reason` · `is_alternative_booking` (bool) · `original_booking_id` · `deposit_paid` (number) · `alternative_fee_non_refundable` (bool)

- **`support_outreach_status`** (`none` / `pending` / `contacted` / `resolved` — tracks support follow-up for cancellations and attendance non-confirmations)
- **`support_outreach_notes`** (documented reason recorded by customer support)
- `payment_method` (`cash` / `wallet` — pre-selected at booking) · `payment_status` (`unpaid` / `paid`) · `total_price` · `created_at`

**DraftBookings** (Syncs client-side drafts if logged in)
- `_id` · `user_id` · `shop_id` · `draft_payload` (JSON) · `updated_at`

**Reviews**
- `_id` · `booking_id` · `customer_id` · `business_id` · `rating` (1–5) · `comment` · `photos` (string array) · `created_at`

**StatusUpdates**
- `_id` · `business_id` · `submitted_by` · `is_open` · `waiting_count` · `crowd_level` · `note` · `photo_url` · `votes` (`[{ user_id, vote }]`) · `accuracy_votes_count` (int, total votes on "Still accurate?") · `support_notified` (bool, flagged true when 3 votes dispatch notification to Technical Support) · `support_contact_status` (`none` / `pending` / `contacted` / `verified`) · `created_at`

**WalletTransactions**
- `_id` · `user_id` · `type` (`topup` / `payment` / `refund` / `p2p_transfer_sent` / `p2p_transfer_received` / `alternative_booking_fee` / `qr_first_time_reward`) · `amount` · `provider` (`onepay` / `lypay` / `internal`) · `recipient_user_id` (for P2P) · `sender_user_id` (for P2P) · `related_booking_id` · `status` · `created_at`

**PointsTransactions**
- `_id` · `account_id` · `account_type` (`customer` / `staff`) · `amount` · `reason` · `created_at`

**RewardRules**
- `_id` · `title` · `title_ar` · `points_required` · `type` (`fixed_discount` / `percent_discount` / `free_service`) · `discount_value`

**Notifications**
- `_id` · `user_id` · `business_account_id` · `type` (includes: `community_update_verification_alert` alerting Technical Support to contact the barber after 3 community votes) · `payload` · `read_at`

**QrRewardClaims**
- `_id` · `user_id` · `business_id` · `claimed_at` · `paid_out` (bool)

**BookingDisputes**
- `_id` · `booking_id` · `raised_by` · `reason_text` · `status` · `resolution_notes` · `created_at`

---

## 10. Core Backend Functions (Thunder — Deno + MongoDB)

**Bookings & Queue Operations** (`routes/bookings.ts`)
- `joinQueue(customerId, businessId, bookingPayload)`: Creates individual or group bookings in the real-time queue, validates active staff, dispatches instant booking request notification to assigned barber for accept/reject, and records pre-selected payment method.
- `respondToBookingRequest(bookingId, staffId, decision: 'accept' | 'reject')`: Handles barber approval or rejection of an incoming booking; enforces the all-or-nothing rule for group bookings (accept all or reject all).
- `transferCustomer(bookingId, currentStaffId, targetStaffId)`: Initiates customer transfer to an active peer barber; immediately transfers Guest walk-in customers, or delivers a pending interactive confirmation prompt to registered app customers with target barber consent and a strict 2-minute deadline.
- `respondToTransferRequest(bookingId, customerId, decision: 'confirm' | 'reject')`: Customer confirms or declines transfer request; advances into target barber's queue at fair sequential spot on confirmation, or retains original position on decline or timeout expiration.

- `cancelBookingByBarber(bookingId, staffId, reason)`: Direct cancellation by barber with recorded reason, instant customer notification, and automated wallet refund.
- `cancelBookingByCustomer(bookingId, customerId, reason)`: Direct self-service cancellation by customer, permitted only before the first proximity notification ("There is 1 person ahead of you, be close to the shop", i.e. waiting position > 1). If attempted after this threshold, rejected programmatically with an error directing the user to Customer Support.
- `cancelBookingViaSupport(bookingId, supportStaffId, customerId, reason)`: Manual booking cancellation executed by Customer Support staff after the customer reaches out explaining the circumstances following the proximity self-cancellation lock.
- `recordSupportOutreach(bookingId, outreachType: 'cancellation' | 'attendance_non_confirmation', reasonNotes)`: Records results and reasons from Customer Support outreach calls following customer cancellation or attendance non-confirmation.

- `getEstimatedWaitTime(staffId)`: Rolling average of recent actual durations.
- `advanceQueue(staffId)`: Barber "Next" action: completes current session and moves queue forward sequentially.
- `confirmAttendance(bookingId, customerId)`: Called when customer taps "Confirm Attendance" in `showAttendanceSheet` or scans QR during the 10-minute confirmation window.
- `claimAlternativeBooking(originalBookingId, claimantCustomerId)`: Atomic lock reserving unconfirmed slot during the final 5 minutes with deduction of the non-refundable `ALTERNATIVE_BOOKING_FEE` (5 LYD). Permanently locks slot, cancels original booking without pushing them to queue end, refunds wallet balance with support follow-up, or disables cash payment on their next booking.

**Centralized Service Management** (`routes/services.ts`)
- `managePlatformService(adminAccountId, businessId, servicePayload, action)`: Adding, modifying, or deleting services and add-ons is restricted exclusively to the Platform Admin (Root / Platform Staff).

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
- `voteOnStatusUpdate(updateId, userId, vote: 'yes' | 'no' | 'not_sure')`: Records customer vote on the "Still accurate?" prompt. Once total votes (whether "Yes" or "No") reach 3, automatically invokes `notifySupportToContactBarber`.
- `notifySupportToContactBarber(updateId, businessId, votesSummary)`: Dispatches a high-priority ticket/notification to the Technical Support team in the admin dashboard to contact the barber via phone and verify shop status.

**Team Management** (`routes/staff.ts`)
- `addStaffMember(businessId, fullName, photoUrl?)`
- `setStaffActiveStatus(staffId, isActive, queueAction?)`
- `deleteStaffMember(staffId, queueAction?)`

---

## 11. Core Configuration Variables (Config)

- `DATABASE_URL` (MongoDB connection URI)
- `BOOKING_AUTO_CANCEL_MINUTES` (default: 10 min — split into 5 min exclusive confirmation + 5 min at-risk alternative booking window)
- `QUEUE_HEADS_UP_POSITION` (= 2 — sends "There is 1 person ahead of you, be close to the shop" notification when exactly 1 person is waiting in queue ahead + 1 person in chair; reaching this threshold permanently locks self-service cancellation)

- `QUEUE_NEXT_UP_POSITION` (= 1 — sends "You're next, confirm your attendance" notification when only the person in the chair is ahead, opening the 10-minute confirmation window)
- `CUSTOMER_TRANSFER_TIMEOUT_SECONDS` (= 120 seconds / 2 min — customer response deadline for transfer proposal before auto-aborting to avoid holding the target barber's chair idle)
- `QUEUE_ESTIMATE_SAMPLE_SIZE` (default: 15)


- `NO_SHOW_THRESHOLD_FOR_CASH_DISABLE` (= 1 — single no-show on cash booking disables cash on next booking until wallet checkout completes)
- `ALTERNATIVE_BOOKING_FEE` (default: 5 LYD — non-refundable symbolic fee for purchasing a queue spot)
- `STATUS_UPDATE_CONFIRMATIONS_REQUIRED` (= 3 — vote count threshold on "Still accurate?" (yes or no) triggering an automated notification to Technical Support to contact the barber and confirm the actual shop status)
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
| 7 | Alternative opportunity claimant failing to show | Medium | Medium | Strictly non-refundable symbolic fee (5 LYD `ALTERNATIVE_BOOKING_FEE`) |
| 8 | Disputes over fees or unfair no-show classification | Medium | Medium | Manual review path via `BookingDisputes` by Root/Platform Staff plus proactive customer support call upon cancellation |
| 9 | Notification delay causing unfair auto-cancellation | Medium | Medium | Secondary SMS trigger backup |
| 10 | Customer confusion with multi-person group queues | Normal | Medium | Clear companion cards in `MyQueue` showing assigned barber per person |
| 11 | Wrong P2P transfer recipient | Normal | Low–Medium | Real-time recipient name and avatar preview before transfer confirmation |
