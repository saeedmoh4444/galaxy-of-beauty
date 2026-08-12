/**
 * JSON-LD Structured Data for SEO.
 *
 * Usage:
 *   <OrganizationSchema />
 *   <ServiceSchema service={...} />
 *   <EventSchema event={...} />
 */

interface ServiceData {
  name: string;
  description: string;
  price: number;
  currency?: string;
  category?: string;
  durationMin?: number;
}

interface EventData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price?: number;
  imageUrl?: string;
}

export function OrganizationSchema(): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Galaxy of Beauty | جالكسي بيوتي',
    description: 'Secure marketplace for beauty & grooming services in Saudi Arabia',
    url: 'https://galaxyofbeauty.sa',
    logo: 'https://galaxyofbeauty.sa/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'Riyadh',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: ['https://twitter.com/galaxyofbeauty', 'https://instagram.com/galaxyofbeauty'],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function ServiceSchema({ service }: { service: ServiceData }): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'BeautySalon',
      name: 'Galaxy of Beauty',
    },
    areaServed: { '@type': 'Country', name: 'SA' },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: service.currency ?? 'SAR',
    },
    category: service.category,
    ...(service.durationMin && { estimatedDuration: `PT${service.durationMin}M` }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function EventSchema({ event }: { event: EventData }): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    ...(event.price && {
      offers: {
        '@type': 'Offer',
        price: event.price,
        priceCurrency: 'SAR',
      },
    }),
    ...(event.imageUrl && { image: event.imageUrl }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
