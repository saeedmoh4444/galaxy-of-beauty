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
import { serviceWarrantyRouter } from './serviceWarranty';
import { liveStreamRouter } from './liveStream';
import { boxBuilderRouter } from './boxBuilder';
import { aiRoutineRouter } from './aiRoutine';
import { beautyCoursesRouter } from './beautyCourses';
import { vipMembershipRouter } from './vipMembership';
import { productScannerRouter } from './productScanner';
import { styleMatchRouter } from './styleMatch';
import { giftQuizRouter } from './giftQuiz';
import { techCalendarRouter } from './techCalendar';
import { productCompareRouter } from './productCompare';
import { skinDiaryRouter } from './skinDiary';
import { penPalRouter } from './penPal';
import { techLeaderboardRouter } from './techLeaderboard';
import { beforeAfterRouter } from './beforeAfter';
import { saleAlertsRouter } from './saleAlerts';
import { ingredientAnalyzerRouter } from './ingredientAnalyzer';
import { bookingChecklistRouter } from './bookingChecklist';
import { beautyPodcastRouter } from './beautyPodcast';
import { hairColorSimRouter } from './hairColorSim';
import { spaPlannerRouter } from './spaPlanner';
import { restockReminderRouter } from './restockReminder';
import { serviceMatchmakerRouter } from './serviceMatchmaker';
import { bookingHeatmapRouter } from './bookingHeatmap';
import { expiryTrackerRouter } from './expiryTracker';
import { beautyFaqRouter } from './beautyFaq';
import { priceDropAlertsRouter } from './priceDropAlerts';
import { loyaltyPunchCardRouter } from './loyaltyPunchCard';
import { routineSchedulerRouter } from './routineScheduler';
import { featuredTechRouter } from './featuredTech';
import { ingredientSubRouter } from './ingredientSub';
import { lookOfTheDayRouter } from './lookOfTheDay';
import { referralRaceRouter } from './referralRace';
import { techWaitlistRouter } from './techWaitlist';
import { videoTestimonialsRouter } from './videoTestimonials';
import { serviceTrendsRouter } from './serviceTrends';
import { nightModeRouter } from './nightMode';
import { travelKitRouter } from './travelKit';
import { liveChatRouter } from './liveChat';
import { vendorPortalRouter } from './vendorPortal';
import { serviceMenuQrRouter } from './serviceMenuQr';
import { certificationQuizRouter } from './certificationQuiz';
import { geofenceOffersRouter } from './geofenceOffers';
import { salonManagementRouter } from './salonManagement';
import { newsletterRouter } from './newsletter';
import { aiAssistantRouter } from './aiAssistant';
import { groupBuyRouter } from './groupBuy';
import { beautyBingoRouter } from './beautyBingo';
import { serviceWishlistRouter } from './serviceWishlist';
import { beautyAwardsRouter } from './beautyAwards';
import { giftCardMarketRouter } from './giftCardMarket';
import { behindScenesRouter } from './behindScenes';
import { beautyExpoRouter } from './beautyExpo';
import { corporateWellnessRouter } from './corporateWellness';
import { techOnboardingRouter } from './techOnboarding';
import { adminAnalyticsV2Router } from './adminAnalyticsV2';
import { calendarSyncRouter } from './calendarSync';
import { whatsappBotRouter } from './whatsappBot';
import { bnplRouter } from './bnpl';
import { beautyStoriesRouter } from './beautyStories';
import { audioRoomsRouter } from './audioRooms';
import { beautyShortsRouter } from './beautyShorts';
import { adminReportsRouter } from './adminReports';
import { apiDocsRouter } from './apiDocs';

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
  serviceWarranty: serviceWarrantyRouter,
  liveStream: liveStreamRouter,
  boxBuilder: boxBuilderRouter,
  aiRoutine: aiRoutineRouter,
  beautyCourses: beautyCoursesRouter,
  vipMembership: vipMembershipRouter,
  productScanner: productScannerRouter,
  styleMatch: styleMatchRouter,
  giftQuiz: giftQuizRouter,
  techCalendar: techCalendarRouter,
  productCompare: productCompareRouter,
  skinDiary: skinDiaryRouter,
  penPal: penPalRouter,
  techLeaderboard: techLeaderboardRouter,
  beforeAfter: beforeAfterRouter,
  saleAlerts: saleAlertsRouter,
  ingredientAnalyzer: ingredientAnalyzerRouter,
  bookingChecklist: bookingChecklistRouter,
  beautyPodcast: beautyPodcastRouter,
  hairColorSim: hairColorSimRouter,
  spaPlanner: spaPlannerRouter,
  restockReminder: restockReminderRouter,
  serviceMatchmaker: serviceMatchmakerRouter,
  bookingHeatmap: bookingHeatmapRouter,
  expiryTracker: expiryTrackerRouter,
  beautyFaq: beautyFaqRouter,
  priceDropAlerts: priceDropAlertsRouter,
  loyaltyPunchCard: loyaltyPunchCardRouter,
  routineScheduler: routineSchedulerRouter,
  featuredTech: featuredTechRouter,
  ingredientSub: ingredientSubRouter,
  lookOfTheDay: lookOfTheDayRouter,
  referralRace: referralRaceRouter,
  techWaitlist: techWaitlistRouter,
  videoTestimonials: videoTestimonialsRouter,
  serviceTrends: serviceTrendsRouter,
  nightMode: nightModeRouter,
  travelKit: travelKitRouter,
  liveChat: liveChatRouter,
  vendorPortal: vendorPortalRouter,
  serviceMenuQr: serviceMenuQrRouter,
  certificationQuiz: certificationQuizRouter,
  geofenceOffers: geofenceOffersRouter,
  salonManagement: salonManagementRouter,
  newsletter: newsletterRouter,
  aiAssistant: aiAssistantRouter,
  groupBuy: groupBuyRouter,
  beautyBingo: beautyBingoRouter,
  serviceWishlist: serviceWishlistRouter,
  beautyAwards: beautyAwardsRouter,
  giftCardMarket: giftCardMarketRouter,
  behindScenes: behindScenesRouter,
  beautyExpo: beautyExpoRouter,
  corporateWellness: corporateWellnessRouter,
  techOnboarding: techOnboardingRouter,
  adminAnalyticsV2: adminAnalyticsV2Router,
  calendarSync: calendarSyncRouter,
  whatsappBot: whatsappBotRouter,
  bnpl: bnplRouter,
  beautyStories: beautyStoriesRouter,
  audioRooms: audioRoomsRouter,
  beautyShorts: beautyShortsRouter,
  adminReports: adminReportsRouter,
  apiDocs: apiDocsRouter,
});

export type AppRouter = typeof appRouter;
