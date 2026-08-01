"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

function localeToHtmlLang(locale: string) {
	if (locale === "pt") return "pt-BR";
	if (locale === "es") return "es";
	return "en";
}

export function LocaleHtmlLang() {
	const locale = useLocale();

	useEffect(() => {
		document.documentElement.lang = localeToHtmlLang(locale);
	}, [locale]);

	return null;
}
