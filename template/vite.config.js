import { defineConfig, loadEnv } from "vite";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import bundleAnalyzer from "rollup-plugin-bundle-analyzer";
import postCssPxToRem from "postcss-pxtorem";
import autoprefixer from "autoprefixer";
import terser from "@rollup/plugin-terser";

// 雪碧图
import Spritesmith from "vite-plugin-spritesmith";
import spriteTemplate from "./src/common/js/spriteTemplate.js";

// 获取执行时的参数 --report, 用于打包分析
const npm_lifecycle_script = process.env.npm_lifecycle_script;
const isReport = npm_lifecycle_script.indexOf("--report") > -1;
// https://vitejs.dev/config/
export default ({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	console.log("🚀 ~ file: vite.config.js:20 ~ env:", env);
	const isProduction = mode === "production";
	return defineConfig({
		base: "./",
		server: {
			host: true,
			port: 5173,
			proxy: {
				"/api": {
					target: env.VITE_API_HOST,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, "")
				}
			},
			fs: {
				strict: false,
				// 添加根目录中的 games 文件夹到 Vite 服务器
				allow: ["games"]
			}
		},
		plugins: [
			svelte({
				onwarn: (warning, handler) => {
					if (warning.code.includes("a11y")) {
						return; // 忽略A11y警告
					}
					handler(warning); // 处理其他警告
				}
			}),
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
				: null,
			Spritesmith({
				watch: mode === "development",
				src: {
					cwd: "./src/assets/images/spriteIcons",
					glob: "*.png"
				},
				target: {
					image: "./src/assets/images/sprite.png",
					css: [
						[
							"./src/common/scss/sprite.scss",
							{
								format: "function_based_template"
							}
						]
					]
				},
				apiOptions: {
					cssImageRef: "@/assets/images/sprite.png"
				},
				customTemplates: {
					function_based_template: spriteTemplate
				}
			})
		],
		build: {
			rollupOptions: {
				input: {
					index: path.resolve(__dirname, "index.html"),
					game: path.resolve(__dirname, "game.html")
				},
				output: {
					chunkFileNames: "js/[name]-[hash].js",
					entryFileNames: "js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
					// Pack router, i18n and other libraries into the thunk file separately
					manualChunks: {
						thunk: ["axios", "svelte-intersection-observer-directive"],
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
					additionalData: `@use "@/common/scss/mixin.scss" as *;`,
					logger: {
						warn: () => {}, // 忽略所有的警告
						error: console.error
					}
				}
			}
		}
	});
};
