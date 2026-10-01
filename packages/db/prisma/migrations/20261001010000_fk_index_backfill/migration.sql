-- CreateIndex
CREATE INDEX "technicians_userId_idx" ON "technicians"("userId");
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");
CREATE INDEX "bookings_addressId_idx" ON "bookings"("addressId");
CREATE INDEX "reviews_bookingId_idx" ON "reviews"("bookingId");
CREATE INDEX "disputes_bookingId_idx" ON "disputes"("bookingId");
CREATE INDEX "zatca_invoices_bookingId_idx" ON "zatca_invoices"("bookingId");
CREATE INDEX "customer_ai_subscriptions_planId_idx" ON "customer_ai_subscriptions"("planId");
CREATE INDEX "streaks_customerId_idx" ON "streaks"("customerId");
CREATE INDEX "vendors_userId_idx" ON "vendors"("userId");
CREATE INDEX "event_certificates_registrationId_idx" ON "event_certificates"("registrationId");
CREATE INDEX "kindness_accounts_userId_idx" ON "kindness_accounts"("userId");
CREATE INDEX "class_pass_purchases_passId_idx" ON "class_pass_purchases"("passId");
CREATE INDEX "seasonal_services_categoryId_idx" ON "seasonal_services"("categoryId");
