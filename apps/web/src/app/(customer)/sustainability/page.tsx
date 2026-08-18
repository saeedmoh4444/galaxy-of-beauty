'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  GreenSalonBadge,
  SensoryFriendlyBadge,
  SensoryMapCard,
  QuietHoursBadge,
  AccessibleSalonBadge,
  WheelchairAccessibleBadge,
  SignLanguageBadge,
  HearingAssistanceBadge,
  BrailleMenuCard,
  ColorBlindBadge,
  ServiceAnimalBadge,
  CognitiveAccessibilityBadge,
  ScentFreeBadge,
  BodyPositiveBadge,
  QuietCornerBadge,
  ComplimentaryAmenityBadge,
  BeautyEmergencyKit,
  PrayerRoomBadge,
  NoRushBadge,
  HotDrinkMenuBadge,
  SelfieStationBadge,
  RandomActOfBeauty,
  JustBecauseFlowers,
  MirrorStickerCard,
  BeautyWeatherCard,
  BeautyPlaylistCard,
  HandwrittenNote,
  BirthdayMonthBadge,
  BeautySubscriptionCard,
  BeautyConciergeCard,
  BeautyNightOutCard,
  BeautyZeroWasteCard,
  BeautyRefillableCard,
  BeautyCleanBeautyCard,
  BeautyUpcycledCard,
  BeautyPlasticFreeCard,
  BeautyVeganBeautyCard,
  BeautyHalalBeautyCard,
  BeautyGlutenFreeCard,
  BeautyCrueltyFreeCard,
  BeautyFragranceFreeCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function SustainabilityPage(): JSX.Element {
  const { t } = useLocale();
  const weather = api.weatherBeauty.getAdvice.useQuery({
    condition: 'hot',
    temp: 42,
  });

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('sustainability.title')} subtitle={t('sustainability.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Green + Accessible */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GreenSalonBadge
                practices={[
                  'recycled',
                  'organic',
                  'energy_efficient',
                  'water_saving',
                  'plastic_free',
                  'local_sourcing',
                ]}
              />
              <AccessibleSalonBadge
                features={['wheelchair', 'skin_tones', 'hair_textures', 'body_positive']}
              />
            </div>

            {/* Sensory */}
            <SensoryMapCard
              zones={['quiet', 'dim', 'private', 'aromatherapy']}
              salonName="صالون الياسمين"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <SensoryFriendlyBadge
                features={[
                  'dim_lights',
                  'quiet_music',
                  'no_fragrance',
                  'silent_appointment',
                  'comfort_kit',
                ]}
              />
              <QuietHoursBadge
                hours={t('sustainability.quietHours')}
                days={t('sustainability.quietDays')}
              />
              <CognitiveAccessibilityBadge
                features={['simple_menu', 'visual_schedule', 'clear_signage']}
              />
            </div>

            {/* Physical accessibility */}
            <div className="grid gap-4 sm:grid-cols-2">
              <WheelchairAccessibleBadge
                features={[
                  'wide_doors',
                  'elevator',
                  'accessible_bathroom',
                  'low_counter',
                  'parking',
                  'ramp',
                ]}
              />
              <div className="space-y-4">
                <SignLanguageBadge
                  technicians={[
                    { name: 'نورة', level: 'fluent', specialty: t('sustainability.makeup') },
                  ]}
                />
                <HearingAssistanceBadge
                  features={['hearing_loop', 'written_communication', 'visual_alerts']}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <BrailleMenuCard languages={['arabic']} hasVoiceMenu={true} />
              <ColorBlindBadge />
              <ServiceAnimalBadge />
            </div>

            {/* Comfort + Amenities */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ScentFreeBadge productTypes={['facial', 'hair', 'body']} />
              <BodyPositiveBadge features={['real_imagery', 'size_inclusive', 'skin_inclusive']} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <QuietCornerBadge
                amenities={['toys', 'coloring', 'play_area', 'baby_chair']}
                supervised={true}
              />
              <ComplimentaryAmenityBadge
                amenities={[
                  'hair_tie',
                  'bobby_pins',
                  'deodorant',
                  'phone_charger',
                  'sanitary_pads',
                ]}
              />
              <BeautyEmergencyKit
                items={['pads', 'hair_spray', 'sewing_kit', 'stain_remover', 'mints']}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PrayerRoomBadge amenities={['prayer_mats', 'abayas', 'qibla', 'wudu_area']} />
              <HotDrinkMenuBadge
                drinks={['arabic_coffee', 'karak', 'herbal_tea', 'chamomile', 'mint_tea']}
                complimentary={true}
              />
            </div>
            <NoRushBadge bufferMinutes={15} hasRefreshments={true} />
            <SelfieStationBadge hasRingLight={true} hasPhoneStand={true} hasBackdrop={true} />
          </div>

          {/* Sidebar — Delight + Weather */}
          <div className="space-y-6">
            <BeautyWeatherCard
              condition={weather?.data?.condition ?? 'hot'}
              temp={weather?.data?.temp ?? 42}
            />
            <BeautyPlaylistCard />
            <RandomActOfBeauty />
            <JustBecauseFlowers bookingsCount={15} />
            <MirrorStickerCard />
            <HandwrittenNote bookingCount={10} technicianName="نورة" />
            <BirthdayMonthBadge
              month={t('sustainability.monthMarch')}
              discount={15}
              daysRemaining={22}
            />
            <BeautySubscriptionCard tier="premium" />
            <BeautyConciergeCard conciergeName="سارة" />
            <BeautyNightOutCard available={true} />
          </div>
        </div>
        {/* Green Beauty */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <BeautyZeroWasteCard />
          <BeautyRefillableCard />
          <BeautyCleanBeautyCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <BeautyUpcycledCard />
          <BeautyPlasticFreeCard />
        </div>

        {/* Ethical & Clean Beauty */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <BeautyVeganBeautyCard />
          <BeautyHalalBeautyCard />
          <BeautyCrueltyFreeCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <BeautyGlutenFreeCard />
          <BeautyFragranceFreeCard />
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
