/**
 * The English edition's words for the facts in systems.ts (docs/content-plan/README.md, «English
 * edition»). Each entry overrides the Russian one by id; `fit` and `url` are shared. The facts were
 * re-read on 28.10.2026 from each system's own site or repository where it could be reached
 * (m3.material.io could not, so Material is read through its Android developer docs and the
 * material-web repository, which cite it). License of this file: Apache-2.0.
 */
import type { System } from './systems.ts';

export const SYSTEMS_EN: Record<string, Partial<System>> = {
	material3: {
		name: 'Material Design 3',
		owner: 'Google',
		idea: 'A common grammar for Android apps and the web: layers of “paper”, large rounded corners, expressive color.',
		tokens: 'Three tiers: reference (the raw palette), system (roles such as primary and surface) and component (the values of one part). A color scheme is built from five key colors, each giving a tonal palette of 13 tones; all five can be generated from one source color, and on Android 12 and newer that color can be taken from the wallpaper (dynamic color).',
		components: 'A very complete set, from buttons and fields to navigation and dialogs; states and anatomy are described for each.',
		access: 'Android recommends a touch target of at least 48 × 48 dp, and Material follows it; the web library has a focus ring for keyboard users.',
		open: 'The documentation is public. The Material web components library (material-web.dev) says in its README that it is in maintenance mode pending new maintainers, so check its state before you choose it.',
		take: 'The idea of color roles (what a color is used for), component states and the detailed anatomy pages.',
		avoid: 'When you need a character of your own: the recognizable Material look quickly makes a site “one of many”.'
	},
	hig: {
		name: 'Human Interface Guidelines (Apple)',
		owner: 'Apple',
		idea: 'Rules for apps on Apple devices: respect the platform, the content and the gestures.',
		tokens: 'Role names instead of numbers: colors such as “background” and “text” adapt to the theme by themselves; type sizes follow the person’s setting (Dynamic Type).',
		components: 'Described as platform behaviors rather than code: buttons, lists, search. Apple does not provide a ready web library.',
		access: 'A button needs a hit region of at least 44 × 44 points (60 × 60 on visionOS); text size is a systemwide setting (Dynamic Type).',
		open: 'Documentation only. There is no code for the web: the system describes Apple’s own apps.',
		take: 'The 44-point minimum target, the idea of “roles instead of colors”, and respect for the person’s settings.',
		avoid: 'Copying the “glass” look (Liquid Glass) onto a website without need: it was made for the platform and costs legibility.'
	},
	fluent2: {
		name: 'Fluent 2 (Microsoft)',
		owner: 'Microsoft',
		idea: 'One language for Microsoft’s products (Windows, Teams, Outlook) and the web: consistency across platforms.',
		tokens: 'Global tokens, which store raw values, and “alias” tokens, which give them semantic names; components have tokens of their own too.',
		components: 'Components for Web (React), iOS, Android and Windows; Figma kits for designers.',
		access: 'For designers there are Figma plugins: “A11y – Focus Order” and “A11y – Color Contrast Checker” (contrast against WCAG).',
		open: 'The documentation is public; the web library (Fluent UI React) is open.',
		take: 'The idea of a shared language across platforms, and a layer of aliases on top of global tokens.',
		avoid: 'When you have a single site and no Microsoft products: the look will feel “corporate”.'
	},
	govuk: {
		name: 'GOV.UK Design System',
		owner: 'The UK Government Digital Service (GDS)',
		idea: 'So that anyone can make a government service on the internet clear and accessible: components and patterns tested through research.',
		tokens: 'Styles: layout, color, typography and spacing; the values are gathered in the GOV.UK Frontend package.',
		components: 'Components (buttons, fields, tables) and, separately, patterns (how to ask for a name, an address, how to gather a form’s errors).',
		access: 'Components are stated to be accessible; the pages explain when a component fits and when it does not, and rest on research.',
		open: 'The content is published under the Open Government License v3.0 (except where stated otherwise); the code is open.',
		take: 'Forms: the label above the field, a hint, a summary list of errors, one question at a time. Plain language and a bold, visible focus.',
		avoid: 'As a ready look for a commercial project: its own guidance says that a service outside GOV.UK should replace its images and use another font. Take the rules, not the styling.'
	},
	carbon: {
		name: 'Carbon (IBM)',
		owner: 'IBM',
		idea: 'Business applications: data, tables, dense working screens and strict order.',
		tokens: 'Foundations: the 2x Grid, accessibility, color, content, icons, motion, spacing, themes and typography; two type sets (productive and expressive).',
		components: 'Dozens of components (a data table, modals, tabs, search among them) and patterns: dialogs, forms, sign-in.',
		access: 'Accessibility is one of the system’s foundations; there is a separate section on data visualization.',
		open: 'IBM’s open system, with a contributing guide.',
		take: 'The 2x Grid, the idea of two type sets (dense and free), and the pages on data and tables.',
		avoid: 'When your site is for the general public: business density and gray surfaces feel cold.'
	},
	atlassian: {
		name: 'Atlassian Design System',
		owner: 'Atlassian',
		idea: 'A single language for a team’s products: Jira, Confluence and others.',
		tokens: 'Tokens with telling names: color.text.accent.red, elevation.surface.hovered. A name states the role and the state. The spacing tokens start from space.100 = 8px.',
		components: 'A full set for Atlassian’s products; foundations: color, typography, accessibility, icons.',
		access: 'Accessibility is part of the foundations.',
		open: 'Public documentation and a catalog of tokens.',
		take: 'The naming scheme for tokens, “property · role · state”, and the token pages as a reference.',
		avoid: 'When you need an independent library: the system is built first of all for the company’s own products.'
	},
	polaris: {
		name: 'Shopify Polaris',
		owner: 'Shopify',
		idea: 'The interface of a shop’s admin: clear operations on products, orders and customers.',
		tokens: 'Foundations and tokens for Shopify apps; the system has moved to web components.',
		components: 'Web components for apps that are embedded in the Shopify admin so as to look native there.',
		access: 'Accessibility is described together with the components.',
		open: 'The documentation is public (shopify.dev/docs/api/polaris).',
		take: 'Working admin screens: “list and details”.',
		avoid: 'Outside Shopify: the system is built as part of the platform and travels badly beyond it.'
	},
	primer: {
		name: 'Primer (GitHub)',
		owner: 'GitHub',
		idea: 'The system behind GitHub’s own site: a product interface, and a separate kit for marketing pages.',
		tokens: 'The tokens are called “primitives”: color, spacing, typography; the Octicons icons are a separate set.',
		components: 'Product UI for the site itself; Brand UI and a Brand toolkit for marketing pages. The system has two faces.',
		access: 'Accessibility is one of the shared foundations.',
		open: 'The documentation and the primitives are public.',
		take: 'The split between a “product interface” and a “marketing site”: they have different rules of density.',
		avoid: 'As a ready style: the look is too recognizable as GitHub.'
	},
	radix: {
		name: 'Radix Primitives',
		owner: 'WorkOS',
		idea: 'Complex behaviors (a dialog, tabs, a menu) ready-made, without a line of styling: you style them yourself.',
		tokens: 'It imposes nothing: the styling is yours. Next to it lives a separate set of color scales (Radix Colors).',
		components: 'Unstyled components: Accordion, Dialog, Dropdown Menu, Popover, Slider, Tabs and others, each in its own package.',
		access: 'They follow WAI-ARIA; keyboard control and focus management are set up by default and tested with screen readers.',
		open: 'Open code, for React.',
		take: 'The idea of “headless” components: behavior and accessibility in one place, the look in another.',
		avoid: 'When you don’t write React and don’t need complex widgets: plain HTML (details, dialog) already does a lot.'
	},
	shadcn: {
		name: 'shadcn/ui',
		owner: 'An independent open-source project',
		idea: 'Not a library, but a way to get the source code of components into your own project and rework it as you like.',
		tokens: 'The theme is built from CSS variables that you edit in your own project.',
		components: 'The components’ code is copied by a command (the CLI) straight into your repository, not installed as a package.',
		access: 'It is built on top of accessible unstyled components, but the responsibility for your changes is yours.',
		open: 'The source is open; it is distributed as a set of files.',
		take: 'The idea of “owning the code”: a component can be changed without waiting for another library’s release.',
		avoid: 'When you don’t want to maintain copied code: you will have to make the updates yourself.'
	},
	tailwind: {
		name: 'Tailwind CSS as a system',
		owner: 'Tailwind Labs',
		idea: 'Tokens as short classes: p-4, text-lg, bg-blue-600. A design system right in the markup.',
		tokens: 'The theme is described by CSS variables (theme variables); each variable also produces utility classes.',
		components: 'There are no ready components in the core: you build them from utilities yourself.',
		access: 'The responsibility is the author’s: utilities don’t know whether a page is accessible.',
		open: 'Open code; a popular way to style a project without writing styles of your own.',
		take: 'The idea of a limited set of values with short names: you can’t write “17 pixels”, you can write “p-4”.',
		avoid: 'When markup with dozens of classes scares you, or when you must hand the markup to someone who knows only CSS.'
	},
	gravity: {
		name: 'Gravity UI',
		owner: 'The Gravity UI team (Yandex)',
		idea: 'A set of libraries and a design system for complex web services: dashboards, charts, data.',
		tokens: 'UIKit holds the base components and tokens; light, dark and high-contrast themes; a Themer tool for customizing themes.',
		components: 'More than seventy React components, plus separate libraries: charts, a Markdown editor, navigation, a landing-page builder, calendar components.',
		access: 'A high-contrast theme, right-to-left layout and built-in internationalization.',
		open: 'Open code under the MIT license on GitHub.',
		take: 'Three themes out of the box, separate packages for separate tasks, and built-in support for several languages.',
		avoid: 'When your stack is not React: the library is written for it.'
	},
	vkui: {
		name: 'VKUI',
		owner: 'VK',
		idea: 'A library of adaptive React components, based on VK’s design system and implementing its interfaces for different platforms.',
		tokens: 'The platform is detected while the app runs (a hook, usePlatform, tells the component which one it is on), and the look adapts.',
		components: 'Adaptive components for web apps.',
		access: 'Not stated separately in the repository; check the documentation.',
		open: 'Open code under the MIT license on GitHub (@vkontakte/vkui).',
		take: 'The idea of adaptive components that change their look with the platform, and documentation that is ready (in Russian).',
		avoid: 'When your site has nothing to do with VK: the look comes from VK’s design system, and it is not yours.'
	},
	taiga: {
		name: 'Taiga UI',
		owner: 'Taiga Family (the project began at Tinkoff, now T-Bank)',
		idea: 'A library for Angular: components, directives and tools that are easy to attach piece by piece.',
		tokens: 'The styling is built on CSS variables (dozens of tokens), and a dark theme is included out of the box.',
		components: 'More than 130 components and more than 100 directives; the library splits into parts, so the unused stay out of the build.',
		access: 'Check the documentation for each component.',
		open: 'Open code under the Apache-2.0 license.',
		take: 'The idea of “install only what you need”, and styling through CSS variables.',
		avoid: 'When you don’t write Angular: the library is made for it.'
	},
	plasma: {
		name: 'Plasma (SDDS, Sber)',
		owner: 'salute-developers (Sber’s ecosystem)',
		idea: 'A design system for React web apps built on “verticals”: sets of components and themes for particular products.',
		tokens: 'Themes and tokens live in separate packages and are attached to each vertical.',
		components: 'A core and the packages of the verticals; icons in separate packages.',
		access: 'Check the documentation of the vertical.',
		open: 'Open code under the MIT license on GitHub.',
		take: 'The idea of “a core plus verticals”: a common base and separate sets for products.',
		avoid: 'When you need one simple library: the system has several packages, and choosing a vertical is a task in itself.'
	}
};
