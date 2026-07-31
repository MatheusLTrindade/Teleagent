"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

const links = [
	{ href: "/#como-funciona", label: "Como funciona" },
	{ href: "/#demo", label: "Demo" },
	{ href: "/download", label: "Download" },
	{ href: "/docs", label: "Docs" },
];

export function SiteHeader() {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<header
			className={clsx(
				"sticky top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300",
				scrolled
					? "border-[color:var(--line)] bg-[color:rgba(6,9,18,0.78)] backdrop-blur-xl"
					: "border-transparent bg-transparent",
			)}
		>
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
				<Link href="/" className="group flex items-center gap-3">
					<Image
						src="/icon.png"
						alt=""
						width={40}
						height={40}
						className="rounded-xl shadow-[var(--shadow)] transition-transform duration-300 group-hover:scale-105"
						priority
					/>
					<span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-[-0.04em]">
						Teleagent
					</span>
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={clsx(
								"rounded-full px-3.5 py-2 text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--ink)]",
								pathname.startsWith(link.href) &&
									link.href !== "/#como-funciona" &&
									link.href !== "/#demo" &&
									"text-[color:var(--cyan)]",
							)}
						>
							{link.label}
						</Link>
					))}
					<a
						href="https://github.com/MatheusLTrindade/Teleagent"
						target="_blank"
						rel="noreferrer"
						className="btn btn-ghost ml-2 !px-4 !py-2 text-sm"
					>
						GitHub
					</a>
				</nav>

				<button
					type="button"
					className="btn btn-ghost !px-3 !py-2 md:hidden"
					aria-expanded={open}
					aria-label="Abrir menu"
					onClick={() => setOpen((v) => !v)}
				>
					{open ? "Fechar" : "Menu"}
				</button>
			</div>

			{open ? (
				<div className="border-t border-[color:var(--line)] bg-[color:rgba(6,9,18,0.95)] px-5 py-4 md:hidden">
					<div className="flex flex-col gap-1">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="rounded-xl px-3 py-3 text-[color:var(--ink)]"
							>
								{link.label}
							</Link>
						))}
						<a
							href="https://github.com/MatheusLTrindade/Teleagent"
							target="_blank"
							rel="noreferrer"
							className="rounded-xl px-3 py-3 text-[color:var(--cyan)]"
						>
							GitHub
						</a>
					</div>
				</div>
			) : null}
		</header>
	);
}
