import { Fragment, type ReactNode } from 'react';
import { useThemeStyle } from '../../hooks/useThemeStyle';
import type { PublishedSnapshot, SectionKey } from '../../types/cms';
import { AboutSection } from './AboutSection';
import { ContactSection } from './ContactSection';
import { FeedbackSection } from './FeedbackSection';
import { FloatingWhatsAppWidget } from './FloatingWhatsAppWidget';
import { Footer } from './Footer';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { PartnerSection } from './PartnerSection';
import { PortfolioSection } from './PortfolioSection';
import { ServicesSection } from './ServicesSection';
import { TestimonialsSection } from './TestimonialsSection';

interface LandingPageViewProps {
  snapshot: PublishedSnapshot;
  topBanner?: ReactNode;
  heroReady?: boolean;
}

export function LandingPageView({
  snapshot,
  topBanner,
  heroReady = true,
}: LandingPageViewProps) {
  const {
    settings,
    service_categories,
    services,
    portfolio_categories,
    portfolio_items,
    testimonials,
  } = snapshot;
  const themeStyle = useThemeStyle(settings);
  const hasTestimonials = testimonials.length > 0;

  const renderSection = (key: SectionKey): ReactNode => {
    if (settings.section_visibility[key] === false) {
      return null;
    }

    switch (key) {
      case 'services':
        return (
          <ServicesSection
            key={key}
            settings={settings}
            categories={service_categories ?? []}
            services={services}
          />
        );
      case 'about':
        return <AboutSection key={key} settings={settings} />;
      case 'portfolio':
        return (
          <PortfolioSection
            key={key}
            settings={settings}
            categories={portfolio_categories}
            items={portfolio_items}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSection
            key={key}
            settings={settings}
            testimonials={testimonials}
          />
        );
      case 'contact':
        return <ContactSection key={key} settings={settings} />;
      default:
        return null;
    }
  };

  let partnerRendered = false;
  const renderedSections = settings.section_order.map((sectionKey) => {
    if (sectionKey === 'contact' && settings.section_visibility.contact !== false) {
      partnerRendered = true;
      return (
        <Fragment key="partner-contact">
          <PartnerSection />
          <ContactSection settings={settings} />
          <FeedbackSection settings={settings} />
        </Fragment>
      );
    }
    return renderSection(sectionKey);
  });

  return (
    <div className="landing-theme min-h-screen flex flex-col" style={themeStyle}>
      {topBanner}
      <Header settings={settings} hasTestimonials={hasTestimonials} />
      <main className="flex-1">
        <HeroSection settings={settings} ready={heroReady} />
        {renderedSections}
        {!partnerRendered && (
          <>
            <PartnerSection />
            <FeedbackSection settings={settings} />
          </>
        )}
      </main>
      <Footer settings={settings} hasTestimonials={hasTestimonials} />
      <FloatingWhatsAppWidget settings={settings} />
      <div id="landing-modal-root" />
    </div>
  );
}
