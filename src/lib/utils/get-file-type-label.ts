const EXT_IMAGE = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"bmp",
	"tiff",
	"tif",
	"webp",
	"svg",
	"ico",
	"heic",
	"heif",
	"raw",
	"cr2",
	"nef",
	"arw",
	"psd",
	"ai",
];

const EXT_ARCHIVE = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];

const EXT_AUDIO = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma"];

const EXT_TEXT = ["txt", "log", "ini", "conf", "tsv"];

const EXT_RICHTEXT = ["md", "markdown", "rtf"];

const EXT_DOC = ["doc", "docx", "odt", "pages"];

const EXT_SPREADSHEET = ["xls", "ods", "numbers", "csv"];

const EXT_PRESENTATION = ["ppt", "pptx", "odp", "key"];

const EXT_BINARY = ["exe", "dll", "so", "bin", "app", "dmg"];

const EXT_PDF = ["pdf"];

const EXT_CODE = [
	"js",
	"jsx",
	"ts",
	"tsx",
	"py",
	"java",
	"c",
	"cpp",
	"h",
	"cs",
	"php",
	"rb",
	"go",
	"rs",
	"swift",
	"kt",
	"sql",
	"sh",
	"bash",
	"json",
	"yaml",
	"yml",
	"css",
	"scss",
	"sass",
	"less",
	"htm",
	"html",
	"xml",
];

/**
 * Mapping of file type categories to their associated file extensions.
 *
 * Categories include: archive, audio, binary, code, doc, image, pdf,
 * presentation, richtext, spreadsheet, text.
 *
 * @example
 * ```ts
 * EXTS.image; // ["jpg", "jpeg", "png", "gif", ...]
 * EXTS.code;  // ["js", "ts", "py", "java", ...]
 * ```
 */
export const EXTS = {
	archive: EXT_ARCHIVE,
	audio: EXT_AUDIO,
	binary: EXT_BINARY,
	code: EXT_CODE,
	doc: EXT_DOC,
	image: EXT_IMAGE,
	pdf: EXT_PDF,
	presentation: EXT_PRESENTATION,
	richtext: EXT_RICHTEXT,
	spreadsheet: EXT_SPREADSHEET,
	text: EXT_TEXT,
};

const MAP = Object.entries(EXTS).reduce(
	(m, [label, exts]) => {
		// @ts-ignore
		exts.forEach((ext) => (m[ext] = label));
		return m;
	},
	{} as Record<string, keyof typeof EXTS>
);

/**
 * Returns the file type category for a given file extension.
 *
 * @param ext - The file extension (with or without leading dot)
 * @returns The category name (e.g., "image", "code", "doc") or "unknown"
 *
 * @example
 * ```ts
 * getFileTypeLabel("jpg");   // "image"
 * getFileTypeLabel(".ts");   // "code"
 * getFileTypeLabel("PDF");   // "pdf"
 * getFileTypeLabel("xyz");   // "unknown"
 * ```
 */
export function getFileTypeLabel(ext: string): keyof typeof EXTS | "unknown" {
	ext = `${ext}`.toLowerCase().trim().replace(/^\./, "");
	return MAP[ext] || "unknown";
}
