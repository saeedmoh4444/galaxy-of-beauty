import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

// =============================================================================
// Onboarding Quiz
// =============================================================================

export async function saveQuizResponse(userId, responses) {
  const existing = await prisma.customerQuizResponse.findUnique({ where: { userId } });

  if (existing) {
    return prisma.customerQuizResponse.update({
      where: { userId },
      data: { responses },
    });
  }

  return prisma.customerQuizResponse.create({
    data: { userId, responses },
  });
}

export async function getQuizResponse(userId) {
  return prisma.customerQuizResponse.findUnique({ where: { userId } });
}

// =============================================================================
// Rule-Based Recommendations
// =============================================================================

/**
 * Generate recommendations based on:
 * 1. Quiz responses (skin type, preferred services, budget)
 * 2. Past bookings (similar services)
 * 3. Popular services in same categories
 * 4. Feedback history (avoid disliked items)
 */
export async function getRecommendations(userId, limit = 6) {
  // Get quiz data
  const quiz = await prisma.customerQuizResponse.findUnique({ where: { userId } });
  const quizData = quiz?.responses || {};

  // Get booking history
  const pastBookings = await prisma.booking.findMany({
    where: { customerId: userId, status: 'COMPLETED' },
    select: { serviceId: true },
    take: 10,
  });
  const bookedServiceIds = pastBookings.map((b) => b.serviceId);

  // Get feedback (thumbs down items to avoid)
  const negativeFeedback = await prisma.recommendationFeedback.findMany({
    where: { userId, feedback: 'thumbs_down' },
    select: { recommendedItemId: true },
  });
  const avoidIds = negativeFeedback.map((f) => f.recommendedItemId);

  // Determine preferred categories from quiz
  const preferredCategories = quizData.preferred_services || [];

  // Fetch services matching preferences
  let services = [];

  if (preferredCategories.length > 0) {
    const categories = await prisma.category.findMany({
      where: {
        slug: { in: preferredCategories },
      },
      select: { id: true },
    });

    const catIds = categories.map((c) => c.id);

    services = await prisma.service.findMany({
      where: {
        isActive: true,
        categoryId: { in: catIds },
        id: { notIn: [...bookedServiceIds, ...avoidIds].slice(0, 20) },
      },
      include: {
        category: { select: { nameJson: true, slug: true } },
        tags: { include: { tag: true } },
      },
      take: limit * 2,
    });
  }

  // Fallback: popular services
  if (services.length < limit) {
    const popular = await prisma.service.findMany({
      where: {
        isActive: true,
        isPopular: true,
        id: { notIn: [...services.map((s) => s.id), ...avoidIds] },
      },
      include: {
        category: { select: { nameJson: true, slug: true } },
        tags: { include: { tag: true } },
      },
      take: limit,
    });
    services = [...services, ...popular];
  }

  // Deduplicate and limit
  const unique = [];
  const seen = new Set();
  for (const s of services) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      unique.push(s);
    }
    if (unique.length >= limit) break;
  }

  // Add recommendation reason
  return unique.map((s) => ({
    service: s,
    reason: bookedServiceIds.length === 0
      ? 'موصى به بناءً على تفضيلاتك'
      : s.isPopular
        ? 'الأكثر طلباً'
        : 'بناءً على اهتماماتك',
  }));
}

/**
 * Record feedback on a recommendation.
 */
export async function saveFeedback(userId, itemType, itemId, feedback) {
  return prisma.recommendationFeedback.create({
    data: { userId, recommendedItemType: itemType, recommendedItemId: itemId, feedback },
  });
}

// =============================================================================
// Layla Chatbot (OpenAI)
// =============================================================================

/**
 * Generate a chatbot response using OpenAI.
 * Falls back to rule-based responses if API key is not configured.
 */
export async function chatWithLayla(userId, message) {
  // Store user message
  await prisma.chatMessage.create({
    data: { senderId: userId, content: message, isAi: false },
  });

  let reply;

  if (env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 15000, maxRetries: 1 });

      const context = await buildChatContext(userId);

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...context,
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }, { timeout: 15000 });

      reply = completion.choices[0]?.message?.content || getFallbackReply(message);
    } catch (error) {
      logger.error('OpenAI chat error', { error: error.message });
      reply = getFallbackReply(message);
    }
  } else {
    reply = getFallbackReply(message);
  }

  // Store AI reply
  const msg = await prisma.chatMessage.create({
    data: { senderId: userId, content: reply, isAi: true, receiverId: userId },
  });

  return { message: msg, reply };
}

const SYSTEM_PROMPT = `أنتِ "ليلى"، مستشارة التجميل الافتراضية لمنصة "جالكسي بيوتي" في المملكة العربية السعودية.
أنتِ خبيرة في خدمات التجميل والعناية: الشعر، الأظافر، البشرة، المكياج، المساج، والحناء.
تتحدثين العربية الفصحى بودّ واحترافية. تساعدين العميلات في:
- اختيار الخدمة المناسبة
- نصائح للعناية الشخصية
- شرح خطوات الخدمات
- المساعدة في الحجز
ردودك قصيرة ومفيدة (جملتين إلى ثلاث). لا تذكرين منصات أو خدمات منافسة.`;

async function buildChatContext(userId) {
  const history = await prisma.chatMessage.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return history.reverse().map((m) => ({
    role: m.isAi ? 'assistant' : 'user',
    content: m.content,
  }));
}

function getFallbackReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes('شعر') || msg.includes('hair')) {
    return 'نقدم خدمات العناية بالشعر: قص، صبغ، تسريحات، وعلاجات. يمكنكِ تصفح الخدمات واختيار ما يناسبكِ. هل تودين المساعدة في الحجز؟ 💇‍♀️';
  }
  if (msg.includes('بشرة') || msg.includes('وجه') || msg.includes('skin')) {
    return 'للعناية بالبشرة نقدم: تنظيف عميق، تقشير، ماسكات، وعناية متكاملة. جميعها بأيدي متخصصات معتمدات. ✨';
  }
  if (msg.includes('مكياج') || msg.includes('makeup')) {
    return 'نقدم مكياج السهرات، مكياج العرايس، والمكياج اليومي. يمكنكِ اختيار المتخصصة المناسبة وحجز موعدكِ بسهولة. 💄';
  }
  if (msg.includes('سعر') || msg.includes('price') || msg.includes('كم')) {
    return 'أسعارنا تبدأ من ٦٠ ريال للخدمات الأساسية. السعر النهائي يعتمد على الخدمة والمتخصصة. يمكنكِ تصفح الخدمات لمعرفة الأسعار الدقيقة. 💰';
  }
  if (msg.includes('حجز') || msg.includes('book')) {
    return 'يمكنكِ الحجز بكل سهولة: اختاري الخدمة، ثم المتخصصة، ثم الموعد المناسب. سأساعدكِ في أي خطوة! 📅';
  }
  if (msg.includes('شكر') || msg.includes('thanks')) {
    return 'العفو! 🌸 سعيدة بخدمتكِ. أي استفسار آخر؟';
  }

  return 'أهلاً بكِ! 🌸 أنا ليلى، مستشارة التجميل. يمكنني مساعدتكِ في اختيار الخدمات المناسبة، الإجابة عن استفساراتكِ، والمساعدة في الحجز. كيف يمكنني خدمتكِ؟';
}

// =============================================================================
// Waitlist
// =============================================================================

export async function joinWaitlist(customerId, technicianId, serviceId) {
  const existing = await prisma.waitlistEntry.findFirst({
    where: { customerId, technicianId, status: 'WAITING' },
  });
  if (existing) {
    return { entry: existing, message: 'أنتِ بالفعل في قائمة الانتظار' };
  }

  const position = await prisma.waitlistEntry.count({
    where: { technicianId, status: 'WAITING' },
  });

  const entry = await prisma.waitlistEntry.create({
    data: {
      customerId,
      technicianId,
      serviceId,
      status: 'WAITING',
      position: position + 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { entry, position: position + 1 };
}

export async function getWaitlistStatus(technicianId) {
  const entries = await prisma.waitlistEntry.findMany({
    where: { technicianId, status: 'WAITING' },
    orderBy: { position: 'asc' },
    include: { customer: { select: { id: true, name: true } } },
  });
  return entries;
}

export async function getCustomerWaitlistPosition(customerId, technicianId) {
  const entry = await prisma.waitlistEntry.findFirst({
    where: { customerId, technicianId, status: 'WAITING' },
  });
  return entry;
}

export async function claimWaitlistSpot(entryId, technicianId) {
  const entry = await prisma.waitlistEntry.findFirst({
    where: { id: entryId, technicianId, status: 'WAITING' },
  });
  if (!entry) throw new AppError('Waitlist entry not found', 404, ErrorCodes.NOT_FOUND);

  return prisma.waitlistEntry.update({
    where: { id: entryId },
    data: { status: 'NOTIFIED', notifiedAt: new Date() },
  });
}

// =============================================================================
// Wishlist
// =============================================================================

export async function getWishlist(userId) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      service: { select: { id: true, titleJson: true, basePrice: true, durationMin: true, imageUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToWishlist(userId, serviceId, technicianId) {
  if (serviceId) {
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId, serviceId },
    });
    if (existing) return existing;

    return prisma.wishlistItem.create({ data: { userId, serviceId } });
  }

  if (technicianId) {
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId, technicianId },
    });
    if (existing) return existing;

    return prisma.wishlistItem.create({ data: { userId, technicianId } });
  }

  throw new AppError('Must provide serviceId or technicianId', 400, ErrorCodes.INVALID_INPUT);
}

export async function removeFromWishlist(userId, itemId) {
  return prisma.wishlistItem.deleteMany({
    where: { id: itemId, userId },
  });
}

export default { saveQuizResponse, getQuizResponse, getRecommendations, saveFeedback, chatWithLayla, joinWaitlist, getWaitlistStatus, getCustomerWaitlistPosition, claimWaitlistSpot, getWishlist, addToWishlist, removeFromWishlist };
