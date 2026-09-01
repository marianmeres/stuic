export {
	default as Breadcrumbs,
	type Props as BreadcrumbsProps,
	type BreadcrumbItem,
} from "./Breadcrumbs.svelte";

export {
	breadcrumbsJsonLd,
	breadcrumbsJsonLdScript,
	type BreadcrumbsJsonLdOptions,
	type BreadcrumbListItemJsonLd,
	type BreadcrumbListJsonLd,
} from "./json-ld.js";

export {
	createBreadcrumbsT,
	BREADCRUMBS_MESSAGES_EN,
	type BreadcrumbsMessageKey,
	type BreadcrumbsMessages,
} from "./i18n.js";

export { BREADCRUMBS_MESSAGES_SK } from "./i18n-sk.js";
