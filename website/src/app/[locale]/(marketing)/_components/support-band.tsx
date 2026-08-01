"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SPONSOR_URL } from "@/modules/support/public";

export function SupportBand() {
	const t = useTranslations("SupportBand");
	const reduce = useReducedMotion();

	return (
		<section
			id="apoiar"
			className="scroll-mt-24 px-5 py-16 md:px-8 md:py-20"
		>
			<motion.div
				initial={reduce ? false : { opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.4 }}
				transition={{ duration: 0.45 }}
				className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[color:rgba(255,200,87,0.28)] bg-[linear-gradient(125deg,rgba(255,200,87,0.12),rgba(79,209,255,0.06)_40%,rgba(6,9,18,0.55))] px-6 py-10 shadow-[var(--shadow)] md:px-10 md:py-12"
			>
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div className="max-w-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--amber)]">
							{t("eyebrow")}
						</p>
						<h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
							{t("title")}
						</h2>
						<p className="mt-3 text-[color:var(--muted)]">{t("body")}</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<a
							href={SPONSOR_URL}
							target="_blank"
							rel="noreferrer"
							className="btn btn-primary"
						>
							{t("ctaSponsor")}
						</a>
						<Link href="/apoiar" className="btn btn-ghost">
							{t("ctaMore")}
						</Link>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
