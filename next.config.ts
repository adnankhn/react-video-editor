import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: false,
	serverExternalPackages: ['@remotion/bundler', '@remotion/renderer', 'esbuild'],
	webpack: (config, { isServer }) => {
		if (isServer) {
			// Don't bundle these packages for the server
			config.externals = [...(config.externals || []), '@remotion/bundler', '@remotion/renderer', 'esbuild'];
		}
		return config;
	},
};

export default nextConfig;
