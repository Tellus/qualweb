import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export async function launchBrowser() {
  const args = [];

  if (process.env.CI)
    args.push('--no-sandbox');

  return await puppeteer.launch({
    headless: process.env.TEST_PUPPETEER_HEADLESS == false || true,
    args,
  });
}

/**
 * Creates a tiny static file server to host any files under a specific
 * directory.
 * @param {string} rootPath Root of path to host files from.
 * @returns 
 */
export function createStaticFileServer(rootPath) {
  const contentTypeMappings = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpg',
  }

  return http.createServer((request, response) => {
    const filePath = path.resolve(rootPath, request.url.substring(1));

    if (!fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end(`No such file: ${filePath}`);

      return;
    }

    const headers = {};

    if (contentTypeMappings[path.extname(filePath)]) {
      headers['Content-Type'] = contentTypeMappings[path.extname(filePath)];
    }

    response.writeHead(200, headers);

    response.end(fs.readFileSync(filePath), 'utf-8');
  });
}
