"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SPONSOR_URL } from "@/modules/support/public";

export function SupportBand() {
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
							Apoiar o projeto
						</p>
						<h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
							Se o Teleagent te poupou um deploy ruim, você pode retribuir.
						</h2>
						<p className="mt-3 text-[color:var(--muted)]">
							O projeto é open source (MIT). Apoios via GitHub Sponsors
							ajudam a manter bridge, desktop e docs — sem paywall, sem
							telemetry.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<a
							href={SPONSOR_URL}
							target="_blank"
							rel="noreferrer"
							className="btn btn-primary"
						>
							Patrocinar no GitHub
						</a>
						<Link href="/apoiar" className="btn btn-ghost">
							Saiba mais
						</Link>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
