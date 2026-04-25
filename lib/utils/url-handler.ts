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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }
  const html = await response.text();

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.content) {
    throw new Error('Failed to parse article content');
  }

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  // Convert HTML to Markdown
  const markdown = turndownService.turndown(article.content);

  const hash = CryptoJS.SHA256(url).toString();

  return {
    title: article.title || 'Untitled Webpage',
    content: markdown,
    url: url,
    fileHash: hash,
  };
}
