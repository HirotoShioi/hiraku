import { defineConfig } from "vitepress";

export default defineConfig({
	title: "hiraku",
	description:
		"Strongly typed, modal state management system for React (Radix UI + Base UI).",
	base: "/hiraku/",

	head: [["link", { rel: "icon", href: "/hiraku/favicon.ico" }]],

	themeConfig: {
		logo: "/logo.svg",

		nav: [{ text: "Docs", link: "/docs/getting-started" }],

		sidebar: {
			"/docs/": [
				{
					text: "Introduction",
					items: [
						{ text: "Getting Started", link: "/docs/getting-started" },
						{ text: "Packages", link: "/docs/packages" },
						{ text: "Why hiraku?", link: "/docs/why-hiraku" },
						{ text: "Examples", link: "/docs/examples" },
					],
				},
				{
					text: "Basics",
					items: [
						{ text: "Creating Modals", link: "/docs/creating-modals" },
						{ text: "Opening & Closing", link: "/docs/opening-closing" },
						{ text: "Return Values", link: "/docs/return-values" },
					],
				},
				{
					text: "Advanced",
					items: [
						{ text: "Using useModal hook", link: "/docs/using-hooks" },
						{ text: "Modal Controller", link: "/docs/modal-controller" },
					],
				},
				{
					text: "Migration",
					items: [{ text: "Migration Guide", link: "/docs/migration" }],
				},
				{
					text: "API",
					items: [
						{
							text: "Factory Functions",
							collapsed: true,
							items: [
								{ text: "createDialog", link: "/docs/api/create-dialog" },
								{ text: "createSheet", link: "/docs/api/create-sheet" },
								{
									text: "createAlertDialog",
									link: "/docs/api/create-alert-dialog",
								},
							],
						},
						{
							text: "Hooks",
							collapsed: true,
							items: [{ text: "useModal", link: "/docs/api/use-modal" }],
						},
						{
							text: "Components",
							collapsed: true,
							items: [
								{ text: "ModalProvider", link: "/docs/api/modal-provider" },
							],
						},
						{
							text: "Utilities",
							collapsed: true,
							items: [
								{
									text: "modalController",
									link: "/docs/api/modal-controller",
								},
							],
						},
					],
				},
				{
					text: "LLM",
					items: [{ text: "LLM.txt", link: "/hiraku/llms.txt" }],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/HirotoShioi/hiraku" },
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2025-present Hiroto Shioi",
		},

		search: {
			provider: "local",
		},
	},
});
