import type { Metadata } from "next";
import Link from "next/link";
import { SPONSOR_URL } from "@/modules/support/public";

export const metadata: Metadata = {
	title: "Apoiar",
	description:
		"Apoie o desenvolvimento do Teleagent via GitHub Sponsors — open source, local-first.",
};

const reasons = [
	{
		title: "Mantém o ritmo",
		body: "Bridge, app Windows, docs e releases continuam evoluindo sem ads nem telemetria.",
	},
	{
		title: "Você escolhe o valor",
		body: "GitHub Sponsors permite apoio único ou recorrente — do café ao patrocínio.",
	},
	{
		title: "Transparente",
		body: "Tudo acontece na conta GitHub do autor. Sem intermediário misterioso no site.",
	},
];

export default function SupportPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
			<div className="max-w-2xl">
				<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--amber)]">
					Apoiar
				</p>
				<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] md:text-5xl">
					Ajude o Teleagent a continuar local-first.
				</h1>
				<p className="mt-4 text-lg text-[color:var(--muted)]">
					Se o bridge te deu paz num ask crítico, um café ajuda a pagar tempo
					de manutenção. Obrigado — de verdade.
				</p>
			</div>

			<div className="mt-10 grid gap-4 md:grid-cols-3">
				{reasons.map((item) => (
					<div
						key={item.title}
						className="rounded-[22px] border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.55)] p-5"
					>
						<h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]">
							{item.title}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
							{item.body}
						</p>
					</div>
				))}
			</div>

			<section className="mt-12 overflow-hidden rounded-[28px] border border-[color:rgba(255,200,87,0.28)] bg-[linear-gradient(135deg,rgba(255,200,87,0.1),rgba(6,9,18,0.7))] p-6 shadow-[var(--shadow)] md:p-10">
				<h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em] md:text-3xl">
					GitHub Sponsors
				</h2>
				<p className="mt-3 max-w-2xl text-[color:var(--muted)]">
					O apoio vai direto para{" "}
					<span className="text-[color:var(--ink)]">@MatheusLTrindade</span>{" "}
					pela plataforma oficial do GitHub. Você usa a conta que já tem —
					cartão gerenciado pela GitHub.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<a
						href={SPONSOR_URL}
						target="_blank"
						rel="noreferrer"
						className="btn btn-primary"
					>
						Abrir página de patrocínio
					</a>
					<Link href="/docs" className="btn btn-ghost">
						Voltar às docs
					</Link>
				</div>
				<p className="mt-6 text-xs text-[color:var(--muted)]">
					Link:{" "}
					<a
						href={SPONSOR_URL}
						target="_blank"
						rel="noreferrer"
						className="text-[color:var(--cyan)] underline-offset-2 hover:underline"
					>
						{SPONSOR_URL}
					</a>
				</p>
			</section>
		</div>
	);
}
