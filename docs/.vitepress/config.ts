import { defineConfig } from "vitepress";

export default defineConfig({
	title: "hiraku",
	description:
		"Strongly typed, modal state management system for Radix UI based applications.",
	base: "/hiraku/",

	head: [["link", { rel: "icon", href: "/hiraku/favicon.ico" }]],

	themeConfig: {
		logo: "/logo.svg",

		nav: [
			{ text: "Guide", link: "/guide/getting-started" },
			{ text: "API", link: "/api/create-dialog" },
		],

		sidebar: {
			"/guide/": [
				{
					text: "Introduction",
					items: [
						{ text: "Getting Started", link: "/guide/getting-started" },
						{ text: "Why hiraku?", link: "/guide/why-hiraku" },
					],
				},
				{
					text: "Basics",
					items: [
						{ text: "Creating Modals", link: "/guide/creating-modals" },
						{ text: "Opening & Closing", link: "/guide/opening-closing" },
						{ text: "Return Values", link: "/guide/return-values" },
					],
				},
				{
					text: "Advanced",
					items: [
						{ text: "Using useModal hook", link: "/guide/using-hooks" },
						{ text: "Modal Controller", link: "/guide/modal-controller" },
					],
				},
				{
					text: "Migration",
					items: [{ text: "Migration Guide", link: "/guide/migration" }],
				},
			],
			"/api/": [
				{
					text: "Factory Functions",
					items: [
						{ text: "createDialog", link: "/api/create-dialog" },
						{ text: "createSheet", link: "/api/create-sheet" },
						{ text: "createAlertDialog", link: "/api/create-alert-dialog" },
					],
				},
				{
					text: "Hooks",
					items: [{ text: "useModal", link: "/api/use-modal" }],
				},
				{
					text: "Components",
					items: [{ text: "ModalProvider", link: "/api/modal-provider" }],
				},
				{
					text: "Utilities",
					items: [{ text: "modalController", link: "/api/modal-controller" }],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/HirotoShioi/hiraku" },
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2024-present Hiroto Shioi",
		},

		search: {
			provider: "local",
		},
	},
});
