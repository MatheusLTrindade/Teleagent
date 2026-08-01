import { CtaBand } from "./_components/cta-band";
import { FeaturesStrip } from "./_components/features-strip";
import { HeroSection } from "./_components/hero-section";
import { HowItWorks } from "./_components/how-it-works";
import { LiveDemo } from "./_components/live-demo";
import { SupportBand } from "./_components/support-band";

export default function HomePage() {
	return (
		<>
			<HeroSection />
			<HowItWorks />
			<LiveDemo />
			<FeaturesStrip />
			<SupportBand />
			<CtaBand />
		</>
	);
}
