import { router, publicProcedure } from '../trpc';

// Feature routers — imported as they are created
import { authRouter } from './auth';
import { userRouter } from './users';
import { technicianRouter } from './technicians';
import { categoryRouter } from './categories';
import { serviceRouter } from './services';
import { slotRouter } from './slots';
import { bookingRouter } from './bookings';
import { paymentRouter } from './payments';
import { walletRouter } from './wallet';
import { payoutRouter } from './payouts';
import { addressRouter } from './addresses';
import { reviewRouter } from './reviews';
import { disputeRouter } from './disputes';
import { notificationRouter } from './notifications';
import { waitlistRouter } from './waitlist';
import { wishlistRouter } from './wishlist';
import { adminRouter } from './admin';
import { analyticsRouter } from './analytics';
import { aiRouter } from './ai';
import { zatcaRouter } from './zatca';
import { calendarRouter } from './calendar';
import { subscriptionRouter } from './subscriptions';
import { platformRouter } from './platform';
import { streakRouter } from './streaks';
import { referralRouter } from './referrals';
import { uploadRouter } from './uploads';
import { searchRouter } from './search';
import { loyaltyRouter } from './loyalty';
import { rescheduleRouter } from './reschedule';
import { savedCardRouter } from './savedCards';
import { galleryRouter } from './gallery';
import { promoRouter } from './promo';
import { subscriptionBoxRouter } from './subscriptionBoxes';
import { featureFlagRouter } from './featureFlags';
import { chatRouter } from './chat';
import { performanceRouter } from './performance';
import { cmsRouter } from './cms';
import { videoRouter } from './video';
import { skinAnalysisRouter } from './skinAnalysis';
import { marketplaceRouter } from './marketplace';
import { advancedBookingRouter } from './advancedBooking';
import { socialRouter } from './social';
import { aiFeaturesRouter } from './aiFeatures';
import { adminToolsRouter } from './adminTools';
import { giftCardRouter } from './giftCards';
import { groupBookingRouter } from './groupBookings';
import { beautyPackageRouter } from './beautyPackages';
import { favoriteRouter } from './favorites';
import { campaignRouter } from './campaigns';
import { blogRouter } from './blog';
import { beautyProfileRouter } from './beautyProfile';
import { priceEstimatorRouter } from './priceEstimator';
import { emergencyBookingRouter } from './emergencyBooking';
import { bridalConciergeRouter } from './bridalConcierge';
import { technicianBadgeRouter } from './technicianBadges';
import { beautyEventRouter } from './beautyEvents';
import { selfCareRouter } from './selfCare';
import { beautyBudgetRouter } from './beautyBudget';
import { inspirationRouter } from './inspiration';
import { recurringBookingRouter } from './recurringBookings';
import { communityRouter } from './community';
import { giftRegistryRouter } from './giftRegistry';
import { notificationPrefsRouter } from './notificationPrefs';
import { birthdayRewardRouter } from './birthdayRewards';
import { cashbackRouter } from './cashback';
import { savingsGoalRouter } from './savingsGoals';
import { recommendationsRouter } from './recommendations';
import { technicianFollowRouter } from './technicianFollows';
import { beautyJournalRouter } from './beautyJournal';
import { challengesRouter } from './challenges';
import { flashDealRouter } from './flashDeals';
import { virtualTryOnRouter } from './virtualTryOn';
import { tutorialsRouter } from './tutorials';
import { salonMapRouter } from './salonMap';
import { familyAccountRouter } from './familyAccount';
import { moodBoardRouter } from './moodBoard';
import { postCareRouter } from './postCare';
import { beautyAnalyticsRouter } from './beautyAnalytics';
import { wellnessTrackerRouter } from './wellnessTracker';
import { eventTicketsRouter } from './eventTickets';
import { technicianQARouter } from './technicianQA';
import { homeServiceRouter } from './homeService';

export const appRouter = router({
  // Health
  health: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
  })),

  // Feature routers
  auth: authRouter,
  users: userRouter,
  technicians: technicianRouter,
  categories: categoryRouter,
  services: serviceRouter,
  slots: slotRouter,
  bookings: bookingRouter,
  payments: paymentRouter,
  wallet: walletRouter,
  payouts: payoutRouter,
  addresses: addressRouter,
  reviews: reviewRouter,
  disputes: disputeRouter,
  notifications: notificationRouter,
  waitlist: waitlistRouter,
  wishlist: wishlistRouter,
  admin: adminRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
  zatca: zatcaRouter,
  calendar: calendarRouter,
  subscriptions: subscriptionRouter,
  platform: platformRouter,
  streaks: streakRouter,
  referrals: referralRouter,
  uploads: uploadRouter,
  search: searchRouter,
  loyalty: loyaltyRouter,
  reschedule: rescheduleRouter,
  savedCards: savedCardRouter,
  gallery: galleryRouter,
  promo: promoRouter,
  subscriptionBoxes: subscriptionBoxRouter,
  featureFlags: featureFlagRouter,
  chat: chatRouter,
  performance: performanceRouter,
  cms: cmsRouter,
  video: videoRouter,
  skinAnalysis: skinAnalysisRouter,
  marketplace: marketplaceRouter,
  advancedBooking: advancedBookingRouter,
  social: socialRouter,
  aiFeatures: aiFeaturesRouter,
  adminTools: adminToolsRouter,
  giftCards: giftCardRouter,
  groupBookings: groupBookingRouter,
  beautyPackages: beautyPackageRouter,
  favorites: favoriteRouter,
  campaigns: campaignRouter,
  blog: blogRouter,
  beautyProfile: beautyProfileRouter,
  priceEstimator: priceEstimatorRouter,
  emergencyBooking: emergencyBookingRouter,
  bridalConcierge: bridalConciergeRouter,
  technicianBadges: technicianBadgeRouter,
  beautyEvents: beautyEventRouter,
  selfCare: selfCareRouter,
  beautyBudget: beautyBudgetRouter,
  inspiration: inspirationRouter,
  recurringBookings: recurringBookingRouter,
  community: communityRouter,
  giftRegistry: giftRegistryRouter,
  notificationPrefs: notificationPrefsRouter,
  birthdayRewards: birthdayRewardRouter,
  cashback: cashbackRouter,
  savingsGoals: savingsGoalRouter,
  recommendations: recommendationsRouter,
  technicianFollows: technicianFollowRouter,
  beautyJournal: beautyJournalRouter,
  challenges: challengesRouter,
  flashDeals: flashDealRouter,
  virtualTryOn: virtualTryOnRouter,
  tutorials: tutorialsRouter,
  salonMap: salonMapRouter,
  familyAccount: familyAccountRouter,
  moodBoard: moodBoardRouter,
  postCare: postCareRouter,
  beautyAnalytics: beautyAnalyticsRouter,
  wellnessTracker: wellnessTrackerRouter,
  eventTickets: eventTicketsRouter,
  technicianQA: technicianQARouter,
  homeService: homeServiceRouter,
});

export type AppRouter = typeof appRouter;
