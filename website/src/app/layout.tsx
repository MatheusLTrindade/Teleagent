import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Sora } from "next/font/google";
import { PointerGlow } from "@/app/_components/pointer-glow";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import "./globals.css";

const display = Sora({
	variable: "--font-display",
	subsets: ["latin"],
	weight: ["500", "600", "700", "800"],
});

const body = IBM_Plex_Sans({
	variable: "--font-body",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
	title: {
		default: "Teleagent — agents ↔ Telegram, local-first",
		template: "%s · Teleagent",
	},
	description:
		"Bridge local entre agentes de IA e Telegram. Alertas e decisões humanas no loop, sem VPS e sem webhook público.",
	openGraph: {
		title: "Teleagent",
		description:
			"Quando o agent precisa de você, o Telegram responde — e o agent continua.",
		type: "website",
		locale: "pt_BR",
	},
	icons: {
		icon: "/icon.png",
		apple: "/icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
			>
				<div className="site-shell">
					<div className="grid-noise" aria-hidden />
					<PointerGlow />
					<SiteHeader />
					<main>{children}</main>
					<SiteFooter />
				</div>
			</body>
		</html>
	);
}
