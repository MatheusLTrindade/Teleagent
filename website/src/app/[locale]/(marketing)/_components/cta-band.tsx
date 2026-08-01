"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CtaBand() {
	const t = useTranslations("CtaBand");

	return (
		<section className="px-5 pb-8 md:px-8">
			<div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(120deg,rgba(79,209,255,0.14),rgba(93,255,168,0.08)_45%,rgba(6,9,18,0.4))] px-6 py-10 shadow-[var(--shadow)] md:px-10 md:py-12">
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div className="max-w-xl">
						<h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
							{t("title")}
						</h2>
						<p className="mt-3 text-[color:var(--muted)]">{t("body")}</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link href="/download" className="btn btn-primary">
							{t("ctaDownload")}
						</Link>
						<a
							href="https://github.com/MatheusLTrindade/Teleagent"
							target="_blank"
							rel="noreferrer"
							className="btn btn-ghost"
						>
							{t("ctaStar")}
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
