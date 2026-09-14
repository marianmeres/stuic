import { assert, test } from "vitest";
import { formatBytes, isAcceptedType } from "./asset-helpers.js";

test("isAcceptedType: empty accept lets everything through", () => {
	assert.isTrue(isAcceptedType(undefined, "image/png", "a.png"));
	assert.isTrue(isAcceptedType("", "image/png", "a.png"));
	assert.isTrue(isAcceptedType(" , ", "text/plain", "a.txt"));
});

test("isAcceptedType: MIME tokens are prefix matched, wildcards trimmed", () => {
	assert.isTrue(isAcceptedType("image/*", "image/png"));
	assert.isTrue(isAcceptedType("image/*, video/mp4", "video/mp4"));
	assert.isFalse(isAcceptedType("image/*", "video/mp4"));
	assert.isTrue(isAcceptedType("*", "application/octet-stream"));
	assert.isTrue(isAcceptedType("*/*", "application/octet-stream"));
	// case-insensitive
	assert.isTrue(isAcceptedType("IMAGE/*", "image/JPEG"));
});

test("isAcceptedType: extension tokens match the file name", () => {
	assert.isTrue(isAcceptedType(".pdf", "application/pdf", "contract.PDF"));
	assert.isTrue(isAcceptedType(".pdf,.docx", "", "cv.docx"));
	assert.isFalse(isAcceptedType(".pdf", "application/pdf", "contract.txt"));
	// no name at all: an extension token cannot match
	assert.isFalse(isAcceptedType(".pdf", "application/pdf"));
	// mixed list: either kind may match
	assert.isTrue(isAcceptedType(".pdf,image/*", "image/png", "shot.png"));
	assert.isTrue(isAcceptedType(".pdf,image/*", "application/pdf", "a.pdf"));
	assert.isFalse(isAcceptedType(".pdf,image/*", "text/plain", "a.txt"));
});

test("isAcceptedType: unknown (empty) type passes a MIME token, not an extension one", () => {
	assert.isTrue(isAcceptedType("image/*", "", "whatever.bin"));
	assert.isFalse(isAcceptedType(".png", "", "whatever.bin"));
});

test("formatBytes", () => {
	assert.equal(formatBytes(0), "0 B");
	assert.equal(formatBytes(512), "512 B");
	assert.equal(formatBytes(1024), "1 KB");
	assert.equal(formatBytes(1536), "1.5 KB");
	assert.equal(formatBytes(2 * 1024 * 1024), "2 MB");
	assert.equal(formatBytes(1234567), "1.2 MB");
	assert.equal(formatBytes(12.6 * 1024 * 1024), "13 MB");
	assert.equal(formatBytes(3 * 1024 ** 3), "3 GB");
	assert.equal(formatBytes(-5), "0 B");
	assert.equal(formatBytes(NaN), "0 B");
});
