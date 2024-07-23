import { defineConfig } from "vite";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import bundleAnalyzer from "rollup-plugin-bundle-analyzer";
import postCssPxToRem from "postcss-pxtorem";
import autoprefixer from "autoprefixer";
import { terser } from "rollup-plugin-terser";

// 获取执行时的参数 --report, 用于打包分析
const npm_lifecycle_script = process.env.npm_lifecycle_script;
const isReport = npm_lifecycle_script.indexOf("--report") > -1;
// https://vitejs.dev/config/
export default ({ mode }) => {
	const isProduction = mode.indexOf("prod") > -1 || mode.indexOf("entfeds") > -1;
	// const isProduction = true;
	return defineConfig({
		base: "./",
		server: {
			port: 5173,
			// proxy: {
			// 	'/games': {
			// 		target: 'http://192.168.13.15:4551',
			// 		port: 4551,
			// 		changeOrigin: true,
			// 		rewrite: (path) => path.replace(/^\/games/, '')
			// 	}
			// }
			fs: {
				strict: false,
				// 添加根目录中的 games 文件夹到 Vite 服务器
				allow: ["games"]
			}
		},
		plugins: [
			svelte(),
			// createHtmlPlugin({
			// 	inject: {
			// 		injectData: {
			// 			VITE_INCLUDE_CP: process.env.VITE_INCLUDE_CP
			// 		}
			// 	},
			// 	minify: true,
			// }),
			{
				name: "html-transform",
				transformIndexHtml: {
					handler(html, { path }) {
						if (path === "/index.html") {
							// 修改路径为你的目标路径
							return html.replace(
								"<!-- VITE_INCLUDE_CP === 'saagi' -->",
								process.env.VITE_INCLUDE_CP === "saagi" ? process.env.VITE_APP_CP_URL : ""
							);
						}
						return html;
					}
				}
			},
			isReport ? bundleAnalyzer() : null,
			isProduction
				? terser({
						format: {
							comments: false
						},
						compress: {
							drop_console: true,
							drop_debugger: true
						}
					})
				: null
		],
		build: {
			rollupOptions: {
				output: {
					chunkFileNames: "js/[name]-[hash].js",
					entryFileNames: "js/app-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
					// Pack router, i18n and other libraries into the thunk file separately
					manualChunks: {
						thunk: [] // "svelte-i18n"
					}
				},
				// 开启tree shaking
				treeshake: true
				// external: ['svelte-i18n', 'svelte-spa-router'],
			}
		},
		resolve: {
			alias: {
				"@": path.resolve("./src"),
				$components: path.resolve("./src/components"),
				$routes: path.resolve("./src/routes"),
				$stores: path.resolve("./src/stores")
			}
		},
		css: {
			postcss: {
				plugins: [
					postCssPxToRem({
						rootValue: 36, // 2倍图(720px)
						unitPrecision: 5,
						propList: ["*"],
						selectorBlackList: [],
						replace: true,
						mediaQuery: false,
						minPixelValue: 0,
						exclude: /node_modules/i
					}),
					autoprefixer()
				]
			},
			preprocessorOptions: {
				scss: {
					additionalData: `@import "@/common/scss/mixin.scss";`
				}
			}
		}
	});
};
