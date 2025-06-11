
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingStats from '@/components/landing/LandingStats';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingBenefits from '@/components/landing/LandingBenefits';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <LandingHeader />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingBenefits />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default Landing;
