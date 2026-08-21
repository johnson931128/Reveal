import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer from 'puppeteer';

const host = '127.0.0.1';
const outputPath = fileURLToPath(new URL('../exports/engineering-light.pdf', import.meta.url));

function findAvailablePort() {
	return new Promise((resolve, reject) => {
		const probe = createServer();
		probe.once('error', reject);
		probe.listen(0, host, () => {
			const { port } = probe.address();
			probe.close(() => resolve(port));
		});
	});
}

function waitForServer(url, child) {
	const timeoutAt = Date.now() + 30_000;

	return new Promise((resolve, reject) => {
		const check = async () => {
			if (child.exitCode !== null) {
				reject(new Error(`reveal.js server exited with code ${child.exitCode}`));
				return;
			}

			try {
				const response = await fetch(url);
				if (response.ok) {
					resolve();
					return;
				}
			} catch {
				// Vite may need a few moments before it accepts connections.
			}

			if (Date.now() >= timeoutAt) {
				reject(new Error(`Timed out waiting for ${url}`));
				return;
			}

			setTimeout(check, 150);
		};

		check();
	});
}

function stopServer(child) {
	if (child.exitCode !== null) return;

	if (process.platform === 'win32') {
		spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
			stdio: 'ignore',
		});
		return;
	}

	child.kill('SIGTERM');
}

const port = await findAvailablePort();
const serverUrl = `http://${host}:${port}`;
const printUrl = `${serverUrl}/templates/engineering-light/?print-pdf`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const server = spawn(npmCommand, ['run', 'start', '--', '--host', host, '--port', String(port)], {
	cwd: process.cwd(),
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

let browser;

try {
	await waitForServer(`${serverUrl}/`, server);
	await mkdir(dirname(outputPath), { recursive: true });

	browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(printUrl, { waitUntil: 'networkidle0' });
	await page.waitForFunction(() => window.Reveal?.isReady());
	await page.pdf({
		path: outputPath,
		printBackground: true,
		preferCSSPageSize: true,
	});

	console.log(`PDF exported to ${outputPath}`);
} finally {
	if (browser) await browser.close();
	stopServer(server);
}
