import { IBM_Plex_Sans, JetBrains_Mono, Sora } from "next/font/google";
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
