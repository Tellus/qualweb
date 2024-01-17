import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function launchBrowser() {
  const args = [];

  if (process.env.CI)
    args.push('--no-sandbox');

  const headless = process.env.TEST_PUPPETEER_HEADLESS
    ? process.env.TEST_PUPPETEER_HEADLESS.toLowerCase() != 'false'
    : true;

  console.debug(headless);

  return await puppeteer.launch({
    headless,
    args,
  });
}

/**
 * Creates a tiny static file server to host any files under a specific
 * directory.
 * @param {string} rootPath Root of path to host files from.
 * @returns 
 */
export function createStaticFileServer() {
  // A lot of these were pulled from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  const contentTypeMappings = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpg',
    '.mp4': 'video/mp4',
    '.xml': 'text/xml',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
  };

  const rootPath = path.resolve(__dirname, 'fixtures/w3c-repo/');
  // /content-assets/wcag-act-rules/

  return http.createServer(async (request, response) => {
    // Remove leading slash (to play nice with path.resolve). Also remove "/WAI"
    // root path. For the W3C site, this points to their subdir on the web
    // server. For us, it's in the way.
    const requestPath = request.url.replace(/^\/WAI/, '').replace(/^\//, '');

    let filePath = path.resolve(rootPath, requestPath);

    try {
      const st = await fs.promises.stat(filePath);

      if (st.isDirectory()) {
        filePath = path.resolve(filePath, 'index.html');
      } else if (st.isFile() === false) {
        response.writeHead(400);
        response.end(`Unknown file type at path ${filePath}`);
        
        return;
      }

      const headers = {};

      if (contentTypeMappings[path.extname(filePath)]) {
        headers['Content-Type'] = contentTypeMappings[path.extname(filePath)];
      } else {
        console.error(`Unknown MIME type for file ${filePath}. Add it to the list!`);
        response.writeHead(500);
        response.end('DEV ERROR! Missing mime type for the request file.');
        return;
      }
  
      response.writeHead(200, headers);
  
      let fileContents = fs.readFileSync(filePath);
  
      // Convert any URLs to w3c.org into absolute paths.
      // fileContents = fileContents.replaceAll('https://www.w3.org', '');

      response.end(fileContents);
    } catch (err) {
      if (!fs.existsSync(filePath)) {
        response.writeHead(404);
        response.end(`No such file: ${filePath}`);
      } else {
        response.writeHead(500);
        response.end(JSON.stringify(err));
      }
    }
  });
}

// const h = createStaticFileServer();

// h.listen(8081);