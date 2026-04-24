"use client";

import { useEffect, useState, useCallback } from "react";
import { localDb } from "@/lib/db/localDb";
import { ArrowLeft, Settings, BookOpen, Sun, Moon, Type, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import * as pdfjs from "pdfjs-dist";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface IDocument {
  _id: string;
  title: string;
  fileHash: string;
  currentChapter?: number;
}

interface ReaderClientProps {
  document: IDocument;
}

export default function ReaderClient({ document }: ReaderClientProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(document.currentChapter || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [isBionic, setIsBionic] = useState(false);
  const [isReferenceView, setIsReferenceView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const extractText = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: unknown) => (item as { str: string }).str).join(" ");
        pages.push(text);
      }

      setExtractedPages(pages);
      setIsLoading(false);
    } catch (error) {
      console.error("Error extracting text:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadPdf() {
      const localPdf = await localDb.getPdfByHash(document.fileHash);
      if (localPdf) {
        setPdfBlob(localPdf.blob);
        extractText(localPdf.blob);
      } else {
        setIsLoading(false);
      }
    }
    loadPdf();
  }, [document.fileHash, extractText]);

  useEffect(() => {
    if (isLoading || extractedPages.length === 0) return;

    const saveProgress = async () => {
      const progress = Math.round((currentPage / extractedPages.length) * 100);
      try {
        await fetch('/api/documents/update', {
          method: 'PATCH',
          body: JSON.stringify({
            documentId: document._id,
            currentChapter: currentPage,
            readingProgress: progress,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    };

    const timeoutId = setTimeout(saveProgress, 2000);
    return () => clearTimeout(timeoutId);
  }, [currentPage, extractedPages.length, document._id, isLoading]);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  const applyBionic = (text: string) => {
    if (!isBionic) return text;
    return text.split(' ').map((word) => {
      if (word.length <= 3) return `<b class="font-bold">${word}</b>`;
      const mid = Math.ceil(word.length / 2);
      return `<b class="font-bold">${word.slice(0, mid)}</b>${word.slice(mid)}`;
    }).join(' ');
  };

  const themes = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-950 text-gray-100",
    sepia: "bg-[#f4ecd8] text-[#5b4636]",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin mx-auto rounded-full border-4 border-accent border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Preparing your focus environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themes[theme]}`}>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100/10 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-500/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold truncate max-w-[200px] sm:max-w-md">{document.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsReferenceView(!isReferenceView)}
            className={`p-2 rounded-full transition-colors ${isReferenceView ? 'bg-accent text-white' : 'hover:bg-gray-500/10'}`}
            title="Reference View (Source PDF)"
          >
            <FileText size={20} />
          </button>
          <button 
            onClick={() => setIsBionic(!isBionic)}
            className={`p-2 rounded-full transition-colors ${isBionic ? 'bg-accent text-white' : 'hover:bg-gray-500/10'}`}
            title="Bionic Reading"
          >
            <BookOpen size={20} />
          </button>
          <button 
            onClick={() => setTheme(theme === "light" ? "sepia" : theme === "sepia" ? "dark" : "light")}
            className="p-2 hover:bg-gray-500/10 rounded-full transition-colors"
          >
            {theme === "light" ? <Sun size={20} /> : theme === "sepia" ? <BookOpen size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
            className="p-2 hover:bg-gray-500/10 rounded-full transition-colors"
          >
            <Type size={20} />
          </button>
          <button className="p-2 hover:bg-gray-500/10 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-32">
        {isReferenceView ? (
          <div className="h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden border border-gray-100/20 shadow-2xl">
            {pdfUrl && (
              <iframe 
                src={`${pdfUrl}#page=${currentPage}`} 
                className="w-full h-full"
                title="Source PDF"
              />
            )}
          </div>
        ) : (
          <div 
            className="prose prose-lg mx-auto leading-relaxed" 
            style={{ fontSize: `${fontSize}px` }}
          >
            {extractedPages[currentPage - 1]?.split('\n').map((para, i) => (
              <p 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`mb-6 transition-all duration-300 ${
                  hoveredIndex !== null && hoveredIndex !== i 
                    ? 'opacity-20 blur-[1px]' 
                    : 'opacity-100'
                }`}
                dangerouslySetInnerHTML={{ __html: applyBionic(para) }}
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full border-t border-gray-100/10 backdrop-blur-md p-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-500/10 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          <div className="text-sm font-medium">
            Page <span className="font-bold">{currentPage}</span> of {extractedPages.length}
          </div>

          <button 
            disabled={currentPage === extractedPages.length}
            onClick={() => setCurrentPage((p: number) => Math.min(extractedPages.length, p + 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-500/10 disabled:opacity-30 transition-all"
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
