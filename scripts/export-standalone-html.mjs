import { readFile, writeFile, access } from 'node:fs/promises';
import { extname, isAbsolute, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(repositoryRoot, 'templates/engineering-light/index.html');
const outputPath = resolve(repositoryRoot, 'exports/engineering-light-standalone.html');

const mimeTypes = new Map([
	['.png', 'image/png'],
	['.jpg', 'image/jpeg'],
	['.jpeg', 'image/jpeg'],
	['.webp', 'image/webp'],
	['.gif', 'image/gif'],
	['.svg', 'image/svg+xml'],
]);

const isDataOrExternal = value => /^(?:data:|blob:|https?:|mailto:|#|\/\/)/i.test(value.trim());

const resolveLocalPath = (value, baseDirectory) => {
	const cleanValue = value.split(/[?#]/, 1)[0];
	if (isDataOrExternal(cleanValue) || isAbsolute(cleanValue)) return null;
	return resolve(baseDirectory, cleanValue.replace(/\\/g, '/'));
};

const toDataUri = async (filePath, mimeType) => {
	const buffer = await readFile(filePath);
	return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

const escapeStyleText = text => text.replace(/<\/style/gi, '<\\/style');
const escapeScriptText = text => text.replace(/<\/script/gi, '<\\/script');

const inlineCss = (css, cssPath) => replaceAsync(css, /url\(\s*(["']?)([^"')]+)\1\s*\)/gi, async match => {
	const [, quote, value] = match;
	if (isDataOrExternal(value)) return match;
	const assetPath = resolveLocalPath(value, dirname(cssPath));
	if (!assetPath) return match;
	const mimeType = mimeTypes.get(extname(assetPath).toLowerCase());
	if (!mimeType) throw new Error(`Unsupported CSS asset type: ${relative(repositoryRoot, assetPath)}`);
	return `url(${await toDataUri(assetPath, mimeType)})`;
});

const replaceAsync = async (text, pattern, replacer) => {
	const matches = [...text.matchAll(pattern)];
	if (!matches.length) return text;
	const replacements = await Promise.all(matches.map(match => replacer(match)));
	let result = text;
	for (let index = matches.length - 1; index >= 0; index -= 1) {
		const match = matches[index];
		result = `${result.slice(0, match.index)}${replacements[index]}${result.slice(match.index + match[0].length)}`;
	}
	return result;
};

const inlineHtmlImages = async (html, htmlDirectory) => replaceAsync(
	html,
	/(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']+)\2/gi,
	async match => {
		const [, prefix, quote, value] = match;
		if (isDataOrExternal(value)) return match[0];
		const imagePath = resolveLocalPath(value, htmlDirectory);
		if (!imagePath) return match[0];
		const mimeType = mimeTypes.get(extname(imagePath).toLowerCase());
		if (!mimeType) throw new Error(`Unsupported image type: ${relative(repositoryRoot, imagePath)}`);
		return `${prefix}${quote}${await toDataUri(imagePath, mimeType)}${quote}`;
	}
);

const inlineTextSources = async (html, htmlDirectory) => replaceAsync(
	html,
	/(\bdata-terminal-source\s*=\s*)(["'])([^"']+\.txt[^"']*)\2/gi,
	async match => {
		const [, prefix, quote, value] = match;
		const textPath = resolveLocalPath(value, htmlDirectory);
		if (!textPath) return match[0];
		const contents = await readFile(textPath);
		const dataUri = `data:text/plain;charset=utf-8;base64,${contents.toString('base64')}`;
		return `${prefix}${quote}${dataUri}${quote}`;
	}
);

const inlineStylesheets = async (html, htmlDirectory) => replaceAsync(
	html,
	/<link\b[^>]*>/gi,
	async match => {
		if (!/\brel\s*=\s*["'][^"']*stylesheet[^"']*["']/i.test(match[0])) return match[0];
		const hrefMatch = match[0].match(/\bhref\s*=\s*(["'])([^"']+)\1/i);
		if (!hrefMatch) return match[0];
		const stylesheetPath = resolveLocalPath(hrefMatch[2], htmlDirectory);
		if (!stylesheetPath) return match[0];
		const css = await readFile(stylesheetPath, 'utf8');
		const inlined = await inlineCss(css, stylesheetPath);
		return `<style>${escapeStyleText(inlined)}</style>`;
	}
);

const inlineScripts = async (html, htmlDirectory) => replaceAsync(
	html,
	/<script\b([^>]*?)\bsrc\s*=\s*(["'])([^"']+)\2[^>]*>\s*<\/script>/gi,
	async match => {
		const [, attributes, , value] = match;
		if (isDataOrExternal(value)) {
			if (!/^https:\/\/cdn\.jsdelivr\.net\/npm\/mermaid@11\/dist\/mermaid\.min\.js$/i.test(value)) {
				return match[0];
			}
			const response = await fetch(value);
			if (!response.ok) throw new Error(`Unable to fetch existing Mermaid runtime: HTTP ${response.status}`);
			return `<script>${escapeScriptText(await response.text())}</script>`;
		}
		const scriptPath = resolveLocalPath(value, htmlDirectory);
		if (!scriptPath) return match[0];
		return `<script>${escapeScriptText(await readFile(scriptPath, 'utf8'))}</script>`;
	}
);

const validateStandalone = async (output, source) => {
	const outputStats = await access(output).then(() => readFile(output)).then(contents => ({ size: contents.byteLength, text: contents.toString('utf8') }));
	const failures = [];
	if (outputStats.size <= Buffer.byteLength(source)) failures.push('output is not larger than source index.html');
	const checks = [
		['local stylesheet link', /<link\b[^>]*\b(?:href|src)\s*=\s*["'](?:\.\.?\/|templates\/|dist\/|assets\/)/i],
		['local script src', /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\.?\/|templates\/|dist\/|assets\/)/i],
		['local image src', /<img\b[^>]*\bsrc\s*=\s*["'](?:\.\.?\/|templates\/|dist\/|assets\/)/i],
		['local CSS url', /url\(\s*["']?(?:\.\.?\/|templates\/|dist\/|assets\/)/i],
		['local terminal source', /\bdata-terminal-source\s*=\s*["'](?:\.\.?\/|templates\/|dist\/|assets\/)/i],
		['local fetch path', /\bfetch\(\s*["'](?:\.\.?\/|templates\/|dist\/|assets\/)/i],
	];
	for (const [label, pattern] of checks) {
		if (pattern.test(outputStats.text)) failures.push(label);
	}
	if (/<link\b[^>]*\brel\s*=\s*["'][^"']*stylesheet/i.test(outputStats.text)) failures.push('stylesheet link remains');
	if (/<script\b[^>]*\bsrc\s*=/i.test(outputStats.text)) failures.push('script src remains');
	if (failures.length) {
		throw new Error(`Standalone validation failed: ${failures.join(', ')}`);
	}
	console.log(`Standalone HTML written: ${output}`);
	console.log(`Standalone validation passed (${outputStats.size} bytes)`);
};

const sourceHtml = await readFile(sourcePath, 'utf8');
let standaloneHtml = sourceHtml;
standaloneHtml = await inlineStylesheets(standaloneHtml, dirname(sourcePath));
standaloneHtml = await inlineHtmlImages(standaloneHtml, dirname(sourcePath));
standaloneHtml = await inlineTextSources(standaloneHtml, dirname(sourcePath));
standaloneHtml = await inlineScripts(standaloneHtml, dirname(sourcePath));
standaloneHtml = standaloneHtml.replace(/[ \t]+(?=\r?\n)/g, '');
await writeFile(outputPath, standaloneHtml, 'utf8');
await validateStandalone(outputPath, sourceHtml);
