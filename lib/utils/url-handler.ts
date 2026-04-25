import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
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
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    next: { revalidate: 3600 } // Cache for 1 hour
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

  console.log("Initializing linkedom...");
  const { document } = parseHTML(html);
  
  console.log("Parsing with Readability...");
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article || !article.content) {
    throw new Error('Failed to extract readable content from this webpage. It might not be article-like.');
  }

  console.log("Converting to Markdown...");
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    hr: '---',
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
