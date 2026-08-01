import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const root = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	turbopack: {
		root,
	},
};

export default withNextIntl(nextConfig);
