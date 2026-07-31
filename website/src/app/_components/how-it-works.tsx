"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const nodes = [
	{
		id: "agent",
		title: "Agent",
		body: "Cursor, Claude Code, Codex… chama a CLI ou a API local.",
	},
	{
		id: "bridge",
		title: "Bridge local",
		body: "teleagent serve na sua máquina. Long polling + HTTP em 127.0.0.1.",
	},
	{
		id: "telegram",
		title: "Telegram",
		body: "Alertas e botões de decisão chegam no seu chat — allowlist por user id.",
	},
	{
		id: "you",
		title: "Você",
		body: "Responde no celular. O agent recebe JSON e continua sozinho.",
	},
];

export function HowItWorks() {
	const reduce = useReducedMotion();
	const [active, setActive] = useState("bridge");

	return (
		<section
			id="como-funciona"
			className="scroll-mt-24 border-y border-[color:var(--line)] bg-[color:rgba(12,18,32,0.35)] px-5 py-16 md:px-8 md:py-24"
		>
			<div className="mx-auto max-w-6xl">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--mint)]">
						Arquitetura
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] md:text-4xl">
						Um bot. Um processo. N projetos.
					</h2>
					<p className="mt-3 text-[color:var(--muted)]">
						Passe o mouse (ou toque) nos nós — o sinal mostra o caminho do
						pedido até a sua decisão.
					</p>
				</div>

				<div className="mt-10 grid gap-3 md:grid-cols-4">
					{nodes.map((node, index) => {
						const isActive = active === node.id;
						return (
							<motion.button
								key={node.id}
								type="button"
								onMouseEnter={() => setActive(node.id)}
								onFocus={() => setActive(node.id)}
								onClick={() => setActive(node.id)}
								initial={reduce ? false : { opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ delay: index * 0.06, duration: 0.4 }}
								className={`relative rounded-[20px] border p-5 text-left transition ${
									isActive
										? "border-[color:rgba(79,209,255,0.45)] bg-[rgba(79,209,255,0.08)] shadow-[0_0_40px_rgba(79,209,255,0.12)]"
										: "border-[color:var(--line)] bg-[color:rgba(6,9,18,0.55)] hover:border-[color:rgba(79,209,255,0.28)]"
								}`}
							>
								<span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
									0{index + 1}
								</span>
								<p className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.03em]">
									{node.title}
								</p>
								<p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
									{node.body}
								</p>
								{index < nodes.length - 1 ? (
									<span
										aria-hidden
										className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-gradient-to-r from-[color:var(--cyan)] to-transparent md:block"
									/>
								) : null}
							</motion.button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
