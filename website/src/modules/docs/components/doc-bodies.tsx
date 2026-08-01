import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { DOC_BODIES_EN } from "./doc-bodies-en";
import { DOC_BODIES_ES } from "./doc-bodies-es";
import { DOC_BODIES_PT } from "./doc-bodies-pt";

type DocBodyMap = Record<string, () => ReactNode>;

const BODIES_BY_LOCALE: Record<AppLocale, DocBodyMap> = {
	pt: DOC_BODIES_PT,
	en: DOC_BODIES_EN,
	es: DOC_BODIES_ES,
};

const NOT_FOUND: Record<AppLocale, string> = {
	pt: "Documento não encontrado.",
	en: "Document not found.",
	es: "Documento no encontrado.",
};

function resolveLocale(locale: string): AppLocale {
	return routing.locales.includes(locale as AppLocale)
		? (locale as AppLocale)
		: routing.defaultLocale;
}

export function DocBody({
	slug,
	locale,
}: {
	slug: string;
	locale: string;
}) {
	const resolvedLocale = resolveLocale(locale);
	const Body = BODIES_BY_LOCALE[resolvedLocale][slug];
	if (!Body) return <p>{NOT_FOUND[resolvedLocale]}</p>;
	return (
		<div className="prose-docs">
			<Body />
		</div>
	);
}
