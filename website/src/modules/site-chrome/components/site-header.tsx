"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
	const menuId = useId();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

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
				<Link
					href="/"
					className="group flex items-center gap-3"
					onClick={() => setOpen(false)}
				>
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

				<nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
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
					className="btn btn-ghost !inline-flex !px-3 !py-2 md:!hidden"
					aria-expanded={open}
					aria-controls={menuId}
					aria-label={open ? "Fechar menu" : "Abrir menu"}
					onClick={() => setOpen((v) => !v)}
				>
					{open ? "Fechar" : "Menu"}
				</button>
			</div>

			{open ? (
				<div
					id={menuId}
					className="border-t border-[color:var(--line)] bg-[color:rgba(6,9,18,0.95)] px-5 py-4 md:!hidden"
				>
					<nav className="flex flex-col gap-1" aria-label="Mobile">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="rounded-xl px-3 py-3 text-[color:var(--ink)]"
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}
						<a
							href="https://github.com/MatheusLTrindade/Teleagent"
							target="_blank"
							rel="noreferrer"
							className="rounded-xl px-3 py-3 text-[color:var(--cyan)]"
							onClick={() => setOpen(false)}
						>
							GitHub
						</a>
					</nav>
				</div>
			) : null}
		</header>
	);
}
