import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	turbopack: {
		root,
	},
};

export default nextConfig;
