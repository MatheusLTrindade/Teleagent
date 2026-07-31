"use client";

import { useEffect, useState } from "react";

export function PointerGlow() {
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const [on, setOn] = useState(false);

	useEffect(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const fine = window.matchMedia("(pointer: fine)").matches;
		if (reduce || !fine) return;

		const onMove = (e: PointerEvent) => {
			setPos({ x: e.clientX, y: e.clientY });
			setOn(true);
		};
		const onLeave = () => setOn(false);
		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerleave", onLeave);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerleave", onLeave);
		};
	}, []);

	if (!on) return null;

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed z-40 hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,209,255,0.14),transparent_65%)] md:block"
			style={{ left: pos.x, top: pos.y }}
		/>
	);
}
