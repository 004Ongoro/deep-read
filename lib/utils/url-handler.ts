import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import CryptoJS from 'crypto-js';

export interface ProcessedUrl {
  title: string;
  content: string;
  url: string;
  fileHash: string;
}

export async function processUrl(url: string): Promise<ProcessedUrl> {
  console.log(`processUrl started for: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    console.error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  console.log(`Fetched HTML length: ${html.length}`);

  if (!html || html.trim().length === 0) {
    throw new Error('Received empty HTML from URL');
  }

  console.log("Initializing JSDOM...");
  const dom = new JSDOM(html, { url });
  
  // Basic check to ensure we have a body
  if (!dom.window.document.body) {
    throw new Error('Failed to parse HTML body');
  }

  console.log("Parsing with Readability...");
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.content) {
    throw new Error('Failed to extract readable content from this webpage. It might not be article-article-like.');
  }

  console.log("Converting to Markdown...");
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  // Convert HTML to Markdown
  const markdown = turndownService.turndown(article.content);
  console.log(`Markdown generated, length: ${markdown.length}`);

  const hash = CryptoJS.SHA256(url).toString();

  return {
    title: article.title || 'Untitled Webpage',
    content: markdown,
    url: url,
    fileHash: hash,
  };
}
