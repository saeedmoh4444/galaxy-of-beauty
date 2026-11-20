# Governance & Institutional Accreditation Framework — Kingdom of Saudi Arabia

**Platform:** Galaxy of Beauty (جالكسي بيوتي)
**Date:** 2026-11-20
**Scope:** Official government accreditation (Track A) + internal operational governance (Track B).
**Status:** Roadmap adopted — see the [platform status mapping](#appendix-platform-status-mapping) for what is already built vs. user-gated.

---

## 1. Legal Establishment and Official (Government) Accreditation

To obtain legal status and official accreditation for the platform as a commercial intermediary or an e-commerce store in Saudi Arabia:

- **Commercial Registration (CR):** Obtain a commercial registration for the operating entity through the Saudi Business Center. The registered business activities should include the operation of e-commerce/commercial brokerage platforms or the retail sale of cosmetics (depending on the platform's specific business model).
- **Platform Verification:** Link the commercial registration and the business bank account to officially verify the platform via the Saudi Business Center. This results in a verification certificate and a QR code to be displayed within the application.
- **E-Commerce Law Compliance:** Adhere to the E-Commerce Law issued by the Ministry of Commerce, which mandates disclosure of platform details, return policies (a 7-day return window for products), and mechanisms for resolving customer complaints.
- **E-Invoicing and Taxation:** Register for VAT and integrate technically with the "Fatoora" (e-invoicing) platform — managed by ZATCA — to issue tax-compliant invoices for commissions or sales.

## 2. Specialized Sectoral Governance (Beauty and Salon Sector)

Given that the platform's operations focus on the beauty sector, it is subject to strict sectoral oversight designed to protect consumers:

- **Product Listing (E-Cosma):** If the platform sells or markets cosmetic products, all items must be registered and approved by the Saudi Food and Drug Authority (SFDA) via the E-Cosma system. The circulation of unlicensed cosmetic mixtures or concoctions is strictly prohibited.
- **Verification of Service Providers (Salons and Experts):**
  - Salons and beauty centers registered on the platform must hold a valid municipal license (for women's or men's establishments, as applicable).
  - Independent beauty professionals (providing in-home services) must possess a valid "Freelance Certificate" (Wathiqat Al-Amal Al-Hur) for beauty, makeup, or hairstyling services.
- **Medical-Aesthetic Services:** If the platform includes dermatology or laser clinics, it must verify that the healthcare facility is licensed by the Ministry of Health and ensure compliance with regulations governing healthcare advertising.

## 3. Technical Governance and Data Protection

- **Personal Data Protection Law (PDPL):** Establish a privacy policy that complies with SDAIA regulations. Explicit user consent must be obtained before collecting personal data or geolocation information (required for in-home services).
- **Cybersecurity and Payment Gateways:** Partner with payment gateways licensed by the Saudi Central Bank (SAMA) and implement robust cybersecurity controls to protect payment card data and user communications.
- **Unified National Access (Nafath):** Integrating with "Nafath" (Unified National Access) is recommended to verify the identities of service providers and enhance the platform's overall credibility.

## 4. Internal Governance Charter (Policies and Processes)

Four essential internal documents must be drafted and adopted:

1. **Service Level Agreement (SLA) and Merchant Contracts:** Define the platform's commission rate, the schedule for transferring funds to salons/vendors, and the terms for contract termination.
2. **Cancellation, Refund, and Booking Policy:** Clear rules regarding the forfeiture of deposits in the event of a client's late arrival, as well as compensation for the client if a salon or beauty professional cancels an appointment.
3. **Content and Prohibited Goods Policy:** A list prohibiting the advertisement of counterfeit products, prescription-only medical items, or content that violates public decency.
4. **Dispute and Complaint Management Mechanism:** A technical support ticketing system that mandates responding to and resolving complaints within a specified timeframe (in compliance with Ministry of Commerce regulations).

## Summary of Required Accreditations by Service Type

| Service Type on the Platform          | Regulatory Authority                   | Document/Accreditation Required from Service Provider          |
| ------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| Salon and Beauty Studio Bookings      | Ministry of Municipalities and Housing | Commercial Registration + Valid Municipal License              |
| In-Home Beauty Services (Individuals) | Ministry of Human Resources            | Freelance Certificate (Beauty Professions) + Verified Identity |
| Sale of Beauty Products and Cosmetics | Saudi Food and Drug Authority (SFDA)   | Product Listing Certificate via the E-Cosma System             |
| Aesthetic and Laser Clinic Offers     | Ministry of Health                     | Healthcare Facility License + Healthcare Advertising Permit    |

---

## Executive Action Plan (Pre- and Post-Launch)

**First: Urgent Official Procedures (Prior to the Actual Launch)**

1. **Update Commercial Registration (CR) activities.** Ensure, via the Saudi Business Center, that the CR covers both: commercial intermediation via electronic platforms (salon and beauty specialist bookings) and online retail of cosmetics and beauty products (the product store).
2. **Obtain an E-commerce Certification (Mawthooq).** Upload the commercial registration and business bank account details to the Business Platform; display the authentication QR code in the footer of both website and application.
3. **Integration with E-invoicing (Fatoora):** Since the platform collects payments, deducts commissions, and sells products, the accounting system must be integrated with ZATCA for automated tax invoices — for customers (product purchases) and for salons (platform commission).
4. **Payment Gateway and Split Payment Integration:** Enable "split payment" through a SAMA-authorized provider (such as Moyasar, Tap, or HyperPay), transferring the salon's/merchant's share automatically while deducting the platform commission.

**Second: Onboarding Verification Gateways (Service Provider Governance)**

No salon, expert, or product vendor may publish content on the application until they pass the "verification gateway" within the dashboard:

- **Salons and women's centers:** must upload a valid Commercial Registration and a valid municipal business license.
- **Beauty professionals (in-home services):** must upload an approved Freelance Certificate for beauty-related professions.
- **Cosmetics merchants and suppliers:** must provide proof that each product is registered in the SFDA "E-Cosma" system. Homemade mixtures or unregistered products are strictly prohibited.

**Third: Mandatory Legal Framework within the Application (UI)**

Four clear legal pages, which the user must agree to upon registration:

1. **Terms and Conditions** (two sections):
   - _Booking Section:_ the platform acts as a technical intermediary; defines responsibility regarding the quality of services provided in salons or at home.
   - _Store Section:_ responsibilities of the merchant or the platform regarding product safety, expiration dates, and shipping.
2. **Cancellation, Exchange, and Return Policy:**
   - _Products:_ comply with the E-Commerce Law (7-day return window), with an explicit hygiene exception for opened/used cosmetics (clearly stated).
   - _Bookings:_ specify the timeframe for free cancellations (e.g., at least 24 hours before the appointment) and the procedures for deducting or refunding deposits.
3. **Privacy and Personal Data Protection Policy (PDPL):** compliant with SDAIA regulations; clearly outlines how geolocation (GPS) data (at-home services) and client photographs (consultations) are handled and never shared with third parties.
4. **Merchant and Service Provider Agreement** (signed electronically upon registration): specifies the commission rate, the financial settlement cycle (e.g., every two weeks), penalties for salon-initiated cancellations of confirmed appointments, and the platform's right to suspend accounts in the event of low ratings or recurring complaints.

**Fourth: Operational Framework for Risk and Quality Management**

- **Content Review Team/System:** All uploaded images and offers are reviewed to ensure no false medical claims (e.g., "permanently cures baldness", "whitens skin in two days") — such claims violate SFDA and Ministry of Commerce regulations.
- **Complaint Escalation Path:** A clear "File a Complaint or Dispute" option within each order or booking; a response is guaranteed within 24–48 hours to resolve disputes amicably before they are escalated to official regulatory authorities.

---

## Appendix: Platform Status Mapping

Honest mapping of this framework against the platform as it stands on `master` (2026-11-20). ✅ = built and verified · 🔧 = built, pending credentials · ⛔ = not built.

| Framework requirement                                      | Platform status | Notes                                                                                                                                                                        |
| ---------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR / Saudi Business Center / Mawthooq QR                   | ⛔              | Owner-side registrations; the footer slot is ready for the QR/verification badge                                                                                             |
| E-Commerce Law — platform disclosure + complaint mechanism | ✅              | Public legal pages exist; complaints reachable per order/booking                                                                                                             |
| E-Commerce Law — 7-day product returns                     | ✅              | Refund policy + `cancelOrder` with refunds built (B2a, audit 2026-10)                                                                                                        |
| ZATCA e-invoicing (Fatoora)                                | 🔧              | **Full lifecycle built**: CSID onboarding, invoice hash chain, TLV QR (6.1d) — in **sim mode** until the live Fatoorah token lands (user-gated)                              |
| VAT registration                                           | ⛔              | Owner-side (ZATCA portal)                                                                                                                                                    |
| SAMA-licensed payment gateway + split payment              | 🔧              | MyFatoorah (PayFort→MyFatoorah migration done #353) is the gateway; settlement/payout automation (A2) pays vendors on their cycle — **live mode pending the Fatoorah token** |
| PDPL consent (SDAIA)                                       | ✅              | Consent records, GDPR-style export/delete, explicit consent gates; privacy policy page exists                                                                                |
| Geolocation consent for at-home services                   | ✅              | Booking flow requests location consent (in-home services)                                                                                                                    |
| Nafath identity verification                               | ⛔              | Recommended, not integrated                                                                                                                                                  |
| Salon verification (CR + municipal license)                | 🔧              | Provider registration + admin approval gate exists (KSA registration fields); **document upload/verification workflow is a gap** — approval is currently admin-manual        |
| Freelance Certificate (in-home pros)                       | 🔧              | Same admin-approval gate; certificate upload/validation is a gap                                                                                                             |
| SFDA E-Cosma product listing                               | 🔧              | Product catalog built; **E-Cosma proof per product is a gap** (block-list of unlicensed items enforceable via the existing moderation gate)                                  |
| MoH license for medical-aesthetic offers                   | ⛔              | Clinics are onboardable as providers; license check for med-aesthetic services is a gap                                                                                      |
| SLA / Merchant contracts                                   | 🔧              | Commission rate editor + settlement cycles (weekly/monthly windows) exist in admin; the **signed electronic agreement** (UI + stored consent) is a gap                       |
| Cancellation/refund/booking policy                         | ✅              | Booking cancel + refund flows, deposit handling, dispute escalation (A4: 48h vendor-response deadline)                                                                       |
| Prohibited-goods/content policy                            | 🔧              | Moderation blocklist + review flows exist (F4, D5); a published prohibitions list is a gap                                                                                   |
| Dispute ticketing with 24–48h response                     | ✅              | A4 dispute escalation sweep enforces the 48h window; complaint path per order/booking                                                                                        |
| False-medical-claims content review                        | 🔧              | Moderation pipeline exists; SFDA-claim-specific rules (cure-baldness class) not yet codified                                                                                 |

**User-gated credentials needed to close the 🔧 rows:** Fatoorah live token (unlocks real charges + ZATCA CSID), SAMA gateway production keys, SFDA E-Cosma credentials (if product listings), Nafath API access (if adopted), MoH verification channel (if clinics stay on the platform).

**Immediate buildable follow-ups (engineering, no credentials needed):**

1. Provider document-upload + verification workflow in the dashboard (CR/license/Freelance Certificate fields → admin approve/reject with reasons).
2. Electronic Merchant & Provider Agreement page (commission %, settlement cycle, cancellation penalties, suspension policy) with stored consent timestamp.
3. Published Prohibited Content & Goods list + moderation rules for SFDA-class false claims.
4. Mawthooq QR badge slot in the web/mobile footers (placeholder until the certificate is issued).
