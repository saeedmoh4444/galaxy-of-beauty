import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: {
    default: 'Galaxy of Beauty | جالكسي بيوتي — منصة خدمات التجميل',
    template: '%s | Galaxy of Beauty',
  },
  description:
    'احجزي خدمات التجميل المنزلية بكل سهولة — شعر، بشرة، مكياج، مساج، حناء والمزيد. منصة سعودية تربطك بأفضل فنيات التجميل المعتمدات.',
  keywords: [
    'تجميل', 'خدمات تجميل', 'صالون متنقل', 'مكياج', 'شعر', 'بشرة', 'مساج',
    'حناء', 'عناية بالبشرة', 'فنيات تجميل', 'السعودية', 'beauty', 'salon',
    'makeup', 'hair', 'skincare', 'massage', 'henna', 'Saudi Arabia',
  ],
  openGraph: {
    title: 'Galaxy of Beauty | جالكسي بيوتي — منصة خدمات التجميل',
    description:
      'احجزي خدمات التجميل المنزلية بكل سهولة — شعر، بشرة، مكياج، مساج، حناء والمزيد.',
    siteName: 'Galaxy of Beauty',
    locale: 'ar_SA',
    type: 'website',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Galaxy of Beauty | جالكسي بيوتي',
    description: 'منصة خدمات التجميل المنزلية في السعودية',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({ children }: { children: ReactNode }): ReactNode {
  return <MainLayout>{children}</MainLayout>;
}
