import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["pt", "en", "es"],
	defaultLocale: "pt",
	localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
