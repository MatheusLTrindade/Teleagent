import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Sora } from "next/font/google";
import {
	PointerGlow,
	SiteHeader,
} from "@/modules/site-chrome/public.client";
import { SiteFooter } from "@/modules/site-chrome/public.server";
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
		images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Teleagent" }],
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.png", type: "image/png", sizes: "192x192" },
			{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
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
