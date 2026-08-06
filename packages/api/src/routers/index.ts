import { router, publicProcedure } from '../trpc';
import { prisma } from '@galaxy/db';
import { getRedis } from '../lib/redis';

// ── Domain exports ──
// Each domain groups related feature routers.
// Import from domains/<name> to get all routers in that domain.

// Auth
import { authRouter, userRouter, uploadRouter } from '../domains/auth';

// Booking
import {
  bookingRouter, slotRouter, calendarRouter, rescheduleRouter,
  recurringBookingRouter, emergencyBookingRouter, advancedBookingRouter,
  groupBookingRouter, waitlistRouter, calendarSyncRouter,
  bookingChecklistRouter, bookingHeatmapRouter,
} from '../domains/booking';

// Catalog
import {
  categoryRouter, serviceRouter, searchRouter, galleryRouter,
  recommendationsRouter, favoriteRouter, serviceRecommenderRouter,
  serviceMatchmakerRouter, serviceTrendsRouter, serviceWishlistRouter,
  serviceMenuQrRouter, priceEstimatorRouter, productCompareRouter,
} from '../domains/catalog';

// Payments
import {
  walletRouter, paymentRouter, payoutRouter, savedCardRouter,
  promoRouter, giftCardRouter, giftCardMarketRouter, cashbackRouter, bnplRouter,
} from '../domains/payments';

// Loyalty
import {
  loyaltyRouter, streakRouter, referralRouter, customerAchievementsRouter,
  loyaltyPunchCardRouter, birthdayRewardRouter, vipMembershipRouter, referralRaceRouter,
} from '../domains/loyalty';

// Social
import {
  reviewRouter, disputeRouter, communityRouter, socialRouter,
  socialChallengesRouter, challengesRouter, inspirationRouter,
  technicianFollowRouter, technicianQARouter, beautyPartyRouter,
  penPalRouter, moodBoardRouter, beautyCirclesRouter, kindnessPointsRouter, sisterhoodComplimentsRouter, beautyBankRouter, sheLeadsRouter, communityEventsRouter, accountabilityRouter, visionBoardRouter, gratitudeRouter, conciergeRouter, timeCapsuleRouter, secretSantaRouter, affirmationsRouter, socialImpactRouter, dvSupportRouter, subscriptionGiftRouter, customerFeedbackRouter, beautySurveysRouter, beautyScrapbookRouter, classPassRouter, technicianSpotlightRouter, beautyPartnerRouter, technicianRatingsRouter,
} from '../domains/social';

// Safety
import { safetyRouter } from '../domains/safety';

// Admin
import {
  adminRouter, adminAnalyticsV2Router, adminReportsRouter, adminToolsRouter,
  analyticsRouter, cmsRouter, featureFlagRouter, monitoringRouter,
  platformRouter, predictiveDemandRouter, smartPricingRouter,
  performanceRouter, apiDocsRouter,
} from '../domains/admin';

// AI
import {
  aiRouter, aiAssistantRouter, aiFeaturesRouter, aiRoutineRouter,
  skinAnalysisRouter, virtualTryOnRouter, hairColorSimRouter,
  personalizedFeedRouter, styleMatchRouter, beautyAnalyticsRouter,
} from '../domains/ai';

// ZATCA
import { zatcaRouter } from '../domains/zatca';

// Realtime
import {
  notificationRouter, notificationPrefsRouter, chatRouter,
  liveChatRouter, videoRouter, whatsappBotRouter, audioRoomsRouter,
} from '../domains/realtime';

// Content
import {
  blogRouter, campaignRouter, beautyEventRouter, tutorialsRouter,
  liveStreamRouter, beautyCoursesRouter, beautyStoriesRouter,
  beautyShortsRouter, beautyPodcastRouter, beautyAwardsRouter,
  beautyExpoRouter, beautyFaqRouter, videoTestimonialsRouter,
  beforeAfterRouter, behindScenesRouter, beautyHeritageRouter, beautyMythsRouter, beautyQuizRouter, dailyBeautyTipRouter, lookbookRouter, weatherBeautyRouter, beautyPlaylistRouter, beautyRecipesRouter, bookClubRouter, languageExchangeRouter, nightOutRouter, expertTalksRouter, certificationPathsRouter,
} from '../domains/content';

// Market
import {
  marketplaceRouter, vendorPortalRouter, subscriptionRouter,
  subscriptionBoxRouter, boxBuilderRouter, flashDealRouter,
  groupBuyRouter, beautyPackageRouter, bridalConciergeRouter,
  giftRegistryRouter, giftQuizRouter, beautyBingoRouter, eventTicketsRouter,
} from '../domains/market';

// Wellness
import {
  selfCareRouter, wellnessTrackerRouter, wellnessHubRouter,
  beautyBudgetRouter, beautyBudgetPlannerRouter, beautyDashboardRouter,
  beautyDiscoveryRouter, beautyExpensesRouter, beautyJournalRouter,
  beautyProfileRouter, beautyRemindersRouter, beautyClosetRouter,
  skinDiaryRouter, cycleTrackerRouter, spaPlannerRouter,
  routineSchedulerRouter, expiryTrackerRouter, restockReminderRouter,
  allergenCheckerRouter, savingsGoalRouter, nightModeRouter, beautyHabitsRouter, sleepTrackerRouter, skillTreeRouter, careerBeautyRouter, savingsMilestonesRouter, beautyAchievementsRouter, beautyInsightsRouter, beautyOnboardingRouter, customerPreferencesRouter,
} from '../domains/wellness';

// Operations
import {
  addressRouter, homeServiceRouter, serviceWarrantyRouter,
  salonManagementRouter, salonMapRouter, salonMembershipRouter,
  rideHailingRouter, lastMileDeliveryRouter, clinicConnectRouter,
  corporateWellnessRouter, franchisePortalRouter, virtualConsultationRouter,
  dnaBeautyRouter, iotSyncRouter, beautyMetaverseRouter,
  geofenceOffersRouter, ingredientAnalyzerRouter, ingredientSubRouter, greenSalonRouter, sensoryFriendlyRouter, ruralOutreachRouter, exportProgramRouter, investorRelationsRouter, beautyTrendsRouter,
} from '../domains/operations';

// ── Additional feature routers not yet domain-grouped ──
import { technicianRouter } from './technicians';
import { technicianBadgeRouter } from './technicianBadges';
import { techCalendarRouter } from './techCalendar';
import { techLeaderboardRouter } from './techLeaderboard';
import { techOnboardingRouter } from './techOnboarding';
import { techWaitlistRouter } from './techWaitlist';
import { featuredTechRouter } from './featuredTech';
import { pricingRulesRouter } from './pricingRules';
import { beautyBundlesRouter } from './beautyBundles';
import { beautyPlansRouter } from './beautyPlans';
import { productScannerRouter } from './productScanner';
import { wishlistRouter } from './wishlist';
import { lookOfTheDayRouter } from './lookOfTheDay';
import { saleAlertsRouter } from './saleAlerts';
import { priceDropAlertsRouter } from './priceDropAlerts';
import { newsletterRouter } from './newsletter';
import { certificationQuizRouter } from './certificationQuiz';
import { travelKitRouter } from './travelKit';
import { familyAccountRouter } from './familyAccount';
import { postCareRouter } from './postCare';
import { womensServicesRouter } from './womensServices';
import { kidsServicesRouter } from './kidsServices';
import { beautyStatsRouter } from './beautyStats';

export const appRouter = router({
  // Health — checks DB + Redis connectivity for load balancers / Docker healthchecks
  health: publicProcedure.query(async () => {
    const checks: Record<string, string> = {};

    // Database check
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    // Redis check
    try {
      const redis = getRedis();
      if (redis && (redis.status === 'ready' || redis.status === 'connecting')) {
        await redis.ping();
        checks.redis = 'ok';
      } else {
        checks.redis = 'unavailable';
      }
    } catch {
      checks.redis = 'error';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'ok');
    return {
      status: allHealthy ? ('ok' as const) : ('degraded' as const),
      timestamp: new Date().toISOString(),
      version: '2.2.0',
      uptime: Math.round(process.uptime()),
      checks,
    };
  }),

  // ── Domain routers ──
  // Auth
  auth: authRouter,
  users: userRouter,
  uploads: uploadRouter,

  // Booking
  bookings: bookingRouter,
  slots: slotRouter,
  calendar: calendarRouter,
  reschedule: rescheduleRouter,
  recurringBookings: recurringBookingRouter,
  emergencyBooking: emergencyBookingRouter,
  advancedBooking: advancedBookingRouter,
  groupBookings: groupBookingRouter,
  waitlist: waitlistRouter,
  calendarSync: calendarSyncRouter,
  bookingChecklist: bookingChecklistRouter,
  bookingHeatmap: bookingHeatmapRouter,

  // Catalog
  categories: categoryRouter,
  services: serviceRouter,
  search: searchRouter,
  gallery: galleryRouter,
  recommendations: recommendationsRouter,
  favorites: favoriteRouter,
  serviceRecommender: serviceRecommenderRouter,
  serviceMatchmaker: serviceMatchmakerRouter,
  serviceTrends: serviceTrendsRouter,
  serviceWishlist: serviceWishlistRouter,
  serviceMenuQr: serviceMenuQrRouter,
  priceEstimator: priceEstimatorRouter,
  productCompare: productCompareRouter,

  // Payments
  wallet: walletRouter,
  payments: paymentRouter,
  payouts: payoutRouter,
  savedCards: savedCardRouter,
  promo: promoRouter,
  giftCards: giftCardRouter,
  giftCardMarket: giftCardMarketRouter,
  cashback: cashbackRouter,
  bnpl: bnplRouter,

  // Loyalty
  loyalty: loyaltyRouter,
  streaks: streakRouter,
  referrals: referralRouter,
  customerAchievements: customerAchievementsRouter,
  loyaltyPunchCard: loyaltyPunchCardRouter,
  birthdayRewards: birthdayRewardRouter,
  vipMembership: vipMembershipRouter,
  referralRace: referralRaceRouter,

  // Social
  reviews: reviewRouter,
  disputes: disputeRouter,
  community: communityRouter,
  social: socialRouter,
  socialChallenges: socialChallengesRouter,
  challenges: challengesRouter,
  inspiration: inspirationRouter,
  technicianFollows: technicianFollowRouter,
  technicianQA: technicianQARouter,
  beautyParty: beautyPartyRouter,
  penPal: penPalRouter,
  moodBoard: moodBoardRouter,
  beautyCircles: beautyCirclesRouter,
  kindnessPoints: kindnessPointsRouter,
  sisterhoodCompliments: sisterhoodComplimentsRouter,
  beautyBank: beautyBankRouter,
  sheLeads: sheLeadsRouter,
  communityEvents: communityEventsRouter,
  accountability: accountabilityRouter,
  visionBoard: visionBoardRouter,
  gratitude: gratitudeRouter,
  concierge: conciergeRouter,
  timeCapsule: timeCapsuleRouter,
  secretSanta: secretSantaRouter,
  affirmations: affirmationsRouter,
  socialImpact: socialImpactRouter,
  dvSupport: dvSupportRouter,
  subscriptionGift: subscriptionGiftRouter,
  customerFeedback: customerFeedbackRouter,
  beautySurveys: beautySurveysRouter,
  beautyScrapbook: beautyScrapbookRouter,
  classPass: classPassRouter,
  technicianSpotlight: technicianSpotlightRouter,
  beautyPartner: beautyPartnerRouter,
  technicianRatings: technicianRatingsRouter,
  sensoryFriendly: sensoryFriendlyRouter,
  ruralOutreach: ruralOutreachRouter,
  exportProgram: exportProgramRouter,
  investorRelations: investorRelationsRouter,
  beautyTrends: beautyTrendsRouter,
  safety: safetyRouter,

  // Admin
  admin: adminRouter,
  adminAnalyticsV2: adminAnalyticsV2Router,
  adminReports: adminReportsRouter,
  adminTools: adminToolsRouter,
  analytics: analyticsRouter,
  cms: cmsRouter,
  featureFlags: featureFlagRouter,
  monitoring: monitoringRouter,
  platform: platformRouter,
  predictiveDemand: predictiveDemandRouter,
  smartPricing: smartPricingRouter,
  performance: performanceRouter,
  apiDocs: apiDocsRouter,

  // AI
  ai: aiRouter,
  aiAssistant: aiAssistantRouter,
  aiFeatures: aiFeaturesRouter,
  aiRoutine: aiRoutineRouter,
  skinAnalysis: skinAnalysisRouter,
  virtualTryOn: virtualTryOnRouter,
  hairColorSim: hairColorSimRouter,
  personalizedFeed: personalizedFeedRouter,
  styleMatch: styleMatchRouter,
  beautyAnalytics: beautyAnalyticsRouter,

  // ZATCA
  zatca: zatcaRouter,

  // Realtime
  notifications: notificationRouter,
  notificationPrefs: notificationPrefsRouter,
  chat: chatRouter,
  liveChat: liveChatRouter,
  video: videoRouter,
  whatsappBot: whatsappBotRouter,
  audioRooms: audioRoomsRouter,

  // Content
  blog: blogRouter,
  campaigns: campaignRouter,
  beautyEvents: beautyEventRouter,
  tutorials: tutorialsRouter,
  liveStream: liveStreamRouter,
  beautyCourses: beautyCoursesRouter,
  beautyStories: beautyStoriesRouter,
  beautyShorts: beautyShortsRouter,
  beautyPodcast: beautyPodcastRouter,
  beautyAwards: beautyAwardsRouter,
  beautyExpo: beautyExpoRouter,
  beautyFaq: beautyFaqRouter,
  videoTestimonials: videoTestimonialsRouter,
  beforeAfter: beforeAfterRouter,
  behindScenes: behindScenesRouter,
  beautyHeritage: beautyHeritageRouter,
  beautyMyths: beautyMythsRouter,
  beautyQuiz: beautyQuizRouter,
  dailyBeautyTip: dailyBeautyTipRouter,
  lookbook: lookbookRouter,
  weatherBeauty: weatherBeautyRouter,
  beautyPlaylist: beautyPlaylistRouter,
  beautyRecipes: beautyRecipesRouter,
  bookClub: bookClubRouter,
  languageExchange: languageExchangeRouter,
  nightOut: nightOutRouter,
  expertTalks: expertTalksRouter,
  certificationPaths: certificationPathsRouter,

  // Market
  marketplace: marketplaceRouter,
  vendorPortal: vendorPortalRouter,
  subscriptions: subscriptionRouter,
  subscriptionBoxes: subscriptionBoxRouter,
  boxBuilder: boxBuilderRouter,
  flashDeals: flashDealRouter,
  groupBuy: groupBuyRouter,
  beautyPackages: beautyPackageRouter,
  bridalConcierge: bridalConciergeRouter,
  giftRegistry: giftRegistryRouter,
  giftQuiz: giftQuizRouter,
  beautyBingo: beautyBingoRouter,
  eventTickets: eventTicketsRouter,

  // Wellness
  selfCare: selfCareRouter,
  wellnessTracker: wellnessTrackerRouter,
  wellnessHub: wellnessHubRouter,
  beautyBudget: beautyBudgetRouter,
  beautyBudgetPlanner: beautyBudgetPlannerRouter,
  beautyDashboard: beautyDashboardRouter,
  beautyDiscovery: beautyDiscoveryRouter,
  beautyExpenses: beautyExpensesRouter,
  beautyJournal: beautyJournalRouter,
  beautyProfile: beautyProfileRouter,
  beautyReminders: beautyRemindersRouter,
  beautyCloset: beautyClosetRouter,
  skinDiary: skinDiaryRouter,
  cycleTracker: cycleTrackerRouter,
  spaPlanner: spaPlannerRouter,
  routineScheduler: routineSchedulerRouter,
  expiryTracker: expiryTrackerRouter,
  restockReminder: restockReminderRouter,
  allergenChecker: allergenCheckerRouter,
  savingsGoals: savingsGoalRouter,
  nightMode: nightModeRouter,
  beautyHabits: beautyHabitsRouter,
  sleepTracker: sleepTrackerRouter,
  skillTree: skillTreeRouter,
  careerBeauty: careerBeautyRouter,
  savingsMilestones: savingsMilestonesRouter,
  beautyAchievements: beautyAchievementsRouter,
  beautyInsights: beautyInsightsRouter,
  beautyOnboarding: beautyOnboardingRouter,
  customerPreferences: customerPreferencesRouter,

  // Operations
  addresses: addressRouter,
  homeService: homeServiceRouter,
  serviceWarranty: serviceWarrantyRouter,
  salonManagement: salonManagementRouter,
  salonMap: salonMapRouter,
  salonMembership: salonMembershipRouter,
  rideHailing: rideHailingRouter,
  lastMileDelivery: lastMileDeliveryRouter,
  clinicConnect: clinicConnectRouter,
  corporateWellness: corporateWellnessRouter,
  franchisePortal: franchisePortalRouter,
  virtualConsultation: virtualConsultationRouter,
  dnaBeauty: dnaBeautyRouter,
  iotSync: iotSyncRouter,
  beautyMetaverse: beautyMetaverseRouter,
  geofenceOffers: geofenceOffersRouter,
  ingredientAnalyzer: ingredientAnalyzerRouter,
  ingredientSub: ingredientSubRouter,
  greenSalon: greenSalonRouter,

  // ── Ungrouped feature routers ──
  technicians: technicianRouter,
  technicianBadges: technicianBadgeRouter,
  techCalendar: techCalendarRouter,
  techLeaderboard: techLeaderboardRouter,
  techOnboarding: techOnboardingRouter,
  techWaitlist: techWaitlistRouter,
  featuredTech: featuredTechRouter,
  pricingRules: pricingRulesRouter,
  beautyBundles: beautyBundlesRouter,
  beautyPlans: beautyPlansRouter,
  productScanner: productScannerRouter,
  wishlist: wishlistRouter,
  lookOfTheDay: lookOfTheDayRouter,
  saleAlerts: saleAlertsRouter,
  priceDropAlerts: priceDropAlertsRouter,
  newsletter: newsletterRouter,
  certificationQuiz: certificationQuizRouter,
  travelKit: travelKitRouter,
  familyAccount: familyAccountRouter,
  postCare: postCareRouter,
  womensServices: womensServicesRouter,
  kidsServices: kidsServicesRouter,
  beautyStats: beautyStatsRouter,
});

export type AppRouter = typeof appRouter;
