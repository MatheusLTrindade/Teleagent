export const REPO = "MatheusLTrindade/Teleagent";
export const GITHUB_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${GITHUB_URL}/releases`;
export const LATEST_API = `https://api.github.com/repos/${REPO}/releases/latest`;

export type ReleaseAsset = {
	name: string;
	browser_download_url: string;
	size: number;
};

export type LatestRelease = {
	tag_name: string;
	name: string | null;
	html_url: string;
	published_at: string | null;
	assets: ReleaseAsset[];
};

export async function fetchLatestRelease(): Promise<LatestRelease | null> {
	try {
		const res = await fetch(LATEST_API, {
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "teleagent-website",
			},
			next: { revalidate: 300 },
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			tag_name: string;
			name: string | null;
			html_url: string;
			published_at: string | null;
			assets: Array<{
				name: string;
				browser_download_url: string;
				size: number;
			}>;
		};
		return {
			tag_name: data.tag_name,
			name: data.name,
			html_url: data.html_url,
			published_at: data.published_at,
			assets: data.assets.map((a) => ({
				name: a.name,
				browser_download_url: a.browser_download_url,
				size: a.size,
			})),
		};
	} catch {
		return null;
	}
}

export function pickAssets(release: LatestRelease | null) {
	const assets = release?.assets ?? [];
	const setup = assets.find((a) => /Teleagent-Setup-.*\.exe$/i.test(a.name));
	const portable = assets.find((a) =>
		/Teleagent-Portable-.*\.exe$/i.test(a.name),
	);
	return { setup, portable, tag: release?.tag_name ?? null };
}

export function formatBytes(bytes: number) {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
