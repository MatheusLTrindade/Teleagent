import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import {
	PointerGlow,
	SiteHeader,
} from "@/modules/site-chrome/public.client";
import { LocaleHtmlLang } from "@/modules/site-chrome/components/locale-html-lang";
import { SiteFooter } from "@/modules/site-chrome/public.server";
import { routing, type AppLocale } from "@/i18n/routing";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	if (!routing.locales.includes(locale as AppLocale)) {
		return {};
	}
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "Meta" });
	return {
		title: {
			default: t("title"),
			template: "%s · Teleagent",
		},
		description: t("description"),
		openGraph: {
			title: "Teleagent",
			description: t("ogDescription"),
			type: "website",
			locale: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
			images: [
				{ url: "/icon-512.png", width: 512, height: 512, alt: "Teleagent" },
			],
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
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;
	if (!routing.locales.includes(locale as AppLocale)) {
		notFound();
	}

	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			<LocaleHtmlLang />
			<div className="site-shell">
				<div className="grid-noise" aria-hidden />
				<PointerGlow />
				<SiteHeader />
				<main>{children}</main>
				<SiteFooter />
			</div>
		</NextIntlClientProvider>
	);
}
