"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Step =
	| { kind: "agent"; text: string }
	| { kind: "bot"; level?: string; text: string; options?: string[] }
	| { kind: "you"; text: string }
	| { kind: "result"; text: string };

const script: Step[] = [
	{ kind: "agent", text: "teleagent ask --project release --question …" },
	{
		kind: "bot",
		level: "DECISÃO",
		text: "Promovo o deploy para produção?",
		options: ["sim", "não"],
	},
	{ kind: "you", text: "sim" },
	{
		kind: "result",
		text: '{ "status": "answered", "answer": "sim" }',
	},
];

export function LiveDemo() {
	const reduce = useReducedMotion();
	const [visible, setVisible] = useState(1);
	const [picked, setPicked] = useState<string | null>(null);

	useEffect(() => {
		if (reduce) {
			setVisible(script.length);
			return;
		}
		if (visible >= script.length) {
			const reset = window.setTimeout(() => {
				setVisible(1);
				setPicked(null);
			}, 3200);
			return () => window.clearTimeout(reset);
		}
		const step = script[visible - 1];
		const delay =
			step?.kind === "bot" && !picked && visible === 2 ? 2400 : 1100;
		const id = window.setTimeout(() => setVisible((v) => v + 1), delay);
		return () => window.clearTimeout(id);
	}, [visible, picked, reduce]);

	return (
		<section id="demo" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--cyan)]">
						Ao vivo
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
						O agent pergunta. Você decide no bolso.
					</h2>
					<p className="mt-3 text-[color:var(--muted)]">
						Simulação do fluxo `ask`: bloqueia o agent, manda botões no
						Telegram, devolve JSON e segue.
					</p>
				</div>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					<div className="rounded-[24px] border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.72)] p-5 shadow-[var(--shadow)] md:p-6">
						<p className="mb-4 text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
							Terminal do agent
						</p>
						<div className="space-y-3 font-[family-name:var(--font-mono)] text-sm">
							<AnimatePresence initial={false}>
								{script.slice(0, visible).map((step, i) => {
									if (step.kind !== "agent" && step.kind !== "result")
										return null;
									return (
										<motion.div
											key={`${step.kind}-${i}`}
											initial={reduce ? false : { opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											className="rounded-xl border border-[color:var(--line)] bg-[#050910] px-3 py-3"
										>
											{step.kind === "agent" ? (
												<span className="text-[color:var(--muted)]">$ </span>
											) : null}
											<span
												className={
													step.kind === "result"
														? "text-[color:var(--mint)]"
														: "text-[#d7e7ff]"
												}
											>
												{step.text}
											</span>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</div>

					<div className="rounded-[24px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(18,28,48,0.9),rgba(8,12,22,0.95))] p-5 shadow-[var(--shadow)] md:p-6">
						<div className="mb-4 flex items-center gap-3">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="/bot-avatar.png"
								alt=""
								width={36}
								height={36}
								className="rounded-full"
							/>
							<div>
								<p className="text-sm font-semibold">Teleagent Bot</p>
								<p className="text-xs text-[color:var(--muted)]">Telegram</p>
							</div>
						</div>
						<div className="space-y-3">
							<AnimatePresence initial={false}>
								{script.slice(0, visible).map((step, i) => {
									if (step.kind === "agent" || step.kind === "result")
										return null;
									return (
										<motion.div
											key={`${step.kind}-${i}`}
											initial={reduce ? false : { opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className={
												step.kind === "you"
													? "ml-10 rounded-2xl rounded-br-md bg-[color:var(--cyan)] px-4 py-3 text-sm font-medium text-[#041018]"
													: "mr-6 rounded-2xl rounded-bl-md border border-[color:var(--line)] bg-[color:rgba(6,9,18,0.85)] px-4 py-3"
											}
										>
											{step.kind === "bot" ? (
												<>
													<p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--amber)]">
														{step.level}
													</p>
													<p className="text-sm">{step.text}</p>
													{step.options ? (
														<div className="mt-3 flex flex-wrap gap-2">
															{step.options.map((opt) => (
																<button
																	key={opt}
																	type="button"
																	className="rounded-full border border-[color:rgba(79,209,255,0.35)] bg-[rgba(79,209,255,0.1)] px-3 py-1.5 text-xs font-semibold text-[color:var(--cyan)] transition hover:bg-[rgba(79,209,255,0.2)]"
																	onClick={() => {
																		setPicked(opt);
																		setVisible(3);
																	}}
																>
																	{opt}
																</button>
															))}
														</div>
													) : null}
												</>
											) : (
												step.text
											)}
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
