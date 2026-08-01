"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const LABELS: Record<AppLocale, string> = {
	pt: "PT",
	en: "EN",
	es: "ES",
};

export function LanguageSwitcher() {
	const locale = useLocale() as AppLocale;
	const pathname = usePathname();
	const router = useRouter();

	return (
		<label className="relative inline-flex items-center">
			<span className="sr-only">Language</span>
			<select
				value={locale}
				onChange={(e) =>
					router.replace(pathname, { locale: e.target.value as AppLocale })
				}
				className="cursor-pointer appearance-none rounded-full border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.85)] px-3 py-1.5 text-xs font-semibold tracking-[0.04em] text-[color:var(--ink)] transition-colors hover:border-[color:rgba(79,209,255,0.35)] focus:outline focus:outline-1 focus:outline-[color:var(--cyan)]"
				aria-label="Language"
			>
				{routing.locales.map((code) => (
					<option key={code} value={code}>
						{LABELS[code]}
					</option>
				))}
			</select>
		</label>
	);
}
