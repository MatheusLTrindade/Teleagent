import { CtaBand } from "@/app/_components/cta-band";
import { FeaturesStrip } from "@/app/_components/features-strip";
import { HeroSection } from "@/app/_components/hero-section";
import { HowItWorks } from "@/app/_components/how-it-works";
import { LiveDemo } from "@/app/_components/live-demo";

export default function HomePage() {
	return (
		<>
			<HeroSection />
			<HowItWorks />
			<LiveDemo />
			<FeaturesStrip />
			<CtaBand />
		</>
	);
}
