"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function HeroSection() {
	const reduce = useReducedMotion();

	return (
		<section className="relative overflow-hidden px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
			<div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
				<div>
					<motion.p
						initial={reduce ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45 }}
						className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.65)] px-3 py-1 text-xs font-medium tracking-wide text-[color:var(--cyan)]"
					>
						<span className="relative flex h-2 w-2">
							<span className="absolute inset-0 animate-[pulse-ring_1.6s_ease-out_infinite] rounded-full bg-[color:var(--mint)]" />
							<span className="relative h-2 w-2 rounded-full bg-[color:var(--mint)]" />
						</span>
						LOCAL-FIRST · HUMAN IN THE LOOP
					</motion.p>

					<motion.h1
						initial={reduce ? false : { opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.05 }}
						className="font-[family-name:var(--font-display)] text-[clamp(3.1rem,9vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.06em]"
					>
						Teleagent
					</motion.h1>

					<motion.p
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.12 }}
						className="mt-5 max-w-xl text-lg text-[color:var(--muted)] md:text-xl"
					>
						Quando o agent precisa de você, o Telegram responde — e o fluxo
						continua. Sem VPS. Sem webhook público.
					</motion.p>

					<motion.div
						initial={reduce ? false : { opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-8 flex flex-wrap gap-3"
					>
						<Link href="/download" className="btn btn-primary">
							Baixar para Windows
						</Link>
						<Link href="/docs/quickstart" className="btn btn-ghost">
							Começar em 5 minutos
						</Link>
					</motion.div>
				</div>

				<motion.div
					initial={reduce ? false : { opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.65, delay: 0.15 }}
					className="relative"
					aria-hidden
				>
					<div className="absolute -inset-6 rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(79,209,255,0.22),transparent_55%)] blur-2xl" />
					<div className="relative overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(160deg,rgba(12,18,32,0.95),rgba(6,9,18,0.92))] p-5 shadow-[var(--shadow)]">
						<div className="mb-4 flex items-center justify-between text-xs text-[color:var(--muted)]">
							<span>bridge · 127.0.0.1:3847</span>
							<span className="text-[color:var(--mint)]">online</span>
						</div>
						<pre className="overflow-x-auto rounded-2xl border border-[color:var(--line)] bg-[#050910] p-4 text-[0.82rem] leading-relaxed text-[#cfe6ff]">
							<span className="text-[color:var(--muted)]">$</span> teleagent ask
							{" \\\n"}
							{"  "}--project deploy{" \\\n"}
							{"  "}--question{" "}
							<span className="text-[color:var(--mint)]">
								&quot;Promovo pra prod?&quot;
							</span>
							{" \\\n"}
							{"  "}--options{" "}
							<span className="text-[color:var(--cyan)]">
								&quot;sim,não&quot;
							</span>
							{" \\\n"}
							{"  "}--json
							<span className="ml-0.5 inline-block h-4 w-2 animate-[type-caret_1s_step-end_infinite] bg-[color:var(--cyan)] align-middle" />
						</pre>
						<div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--muted)]">
							<div className="rounded-xl border border-[color:var(--line)] px-2 py-3">
								Agent
							</div>
							<div className="rounded-xl border border-[color:rgba(79,209,255,0.35)] bg-[rgba(79,209,255,0.08)] px-2 py-3 text-[color:var(--cyan)]">
								Bridge
							</div>
							<div className="rounded-xl border border-[color:var(--line)] px-2 py-3">
								You
							</div>
						</div>
						<div className="pointer-events-none absolute inset-x-8 top-1/2 h-px overflow-hidden">
							<div className="h-px w-full animate-[signal_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[color:var(--cyan)] to-transparent" />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
