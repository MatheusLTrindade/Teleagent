"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const features = [
	{
		title: "CLI + API localhost",
		body: "alert, ask, cancel, status — e HTTP em 127.0.0.1:3847 para qualquer runtime.",
	},
	{
		title: "App Windows",
		body: "Bandeja, hub, autostart e auto-update via GitHub Releases (instalador NSIS).",
	},
	{
		title: "Allowlist",
		body: "Só os Telegram user ids que você autorizar controlam o bot.",
	},
	{
		title: "Skill Cursor",
		body: "Instruções prontas para o agent usar ask/alert no loop sem inventar intenção.",
	},
];

export function FeaturesStrip() {
	const reduce = useReducedMotion();

	return (
		<section className="px-5 py-16 md:px-8 md:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--amber)]">
							Por que Teleagent
						</p>
						<h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
							Controle humano, ritmo de agent.
						</h2>
					</div>
					<Link href="/docs" className="btn btn-ghost self-start md:self-auto">
						Ver documentação
					</Link>
				</div>

				<div className="mt-10 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={reduce ? false : { opacity: 0, x: -12 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.5 }}
							transition={{ delay: index * 0.05, duration: 0.35 }}
							className="group grid gap-3 py-7 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:items-center"
						>
							<h3 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-[color:var(--cyan)]">
								{feature.title}
							</h3>
							<p className="text-[color:var(--muted)]">{feature.body}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
