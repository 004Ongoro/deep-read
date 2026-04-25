"use client";

import { useEffect, useState, useCallback } from "react";
import { localDb } from "@/lib/db/localDb";
import { ArrowLeft, Settings, BookOpen, Sun, Moon, Type, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import * as pdfjs from "pdfjs-dist";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [cleanedPages, setCleanedPages] = useState<Record<number, string>>({});
  const [isCleaning, setIsCleaning] = useState(false);
  const [currentPage, setCurrentPage] = useState(document.currentChapter || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(20);
  const [theme, setTheme] = useState<"light" | "sepia">("light");
  const [isBionic, setIsBionic] = useState(false);
  const [isReferenceView, setIsReferenceView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem("deep-read-settings");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.bionicReading !== undefined) setIsBionic(parsed.bionicReading);
        if (parsed.defaultReferenceView !== undefined) setIsReferenceView(parsed.defaultReferenceView);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

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
    const cleanCurrentPage = async () => {
      if (extractedPages.length === 0) return;
      const pageIndex = currentPage - 1;
      
      // 1. Check in-memory state first
      if (cleanedPages[pageIndex] !== undefined) return;

      // 2. Check localDb
      const cached = await localDb.getCleanedPage(document.fileHash, pageIndex);
      if (cached) {
        setCleanedPages(prev => ({
          ...prev,
          [pageIndex]: cached.content
        }));
        return;
      }

      setIsCleaning(true);
      try {
        const response = await fetch("/api/documents/clean", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: extractedPages[pageIndex] }),
        });

        if (response.ok) {
          const data = await response.json();
          const cleanedText = data.markdown;
          
          setCleanedPages(prev => ({
            ...prev,
            [pageIndex]: cleanedText
          }));

          // Save to localDb for future sessions
          await localDb.saveCleanedPage(document.fileHash, pageIndex, cleanedText);
        } else {
          console.error("Failed to clean page text");
          setCleanedPages(prev => ({
            ...prev,
            [pageIndex]: extractedPages[pageIndex]
          }));
        }
      } catch (error) {
        console.error("Error calling clean API:", error);
        setCleanedPages(prev => ({
          ...prev,
          [pageIndex]: extractedPages[pageIndex]
        }));
      } finally {
        setIsCleaning(false);
      }
    };

    cleanCurrentPage();
  }, [currentPage, extractedPages, cleanedPages, document.fileHash]);

  // Proactive background cleaning for the next page
  useEffect(() => {
    const preFetchNextPage = async () => {
      if (extractedPages.length === 0 || currentPage >= extractedPages.length) return;
      const nextPageIndex = currentPage; // currentPage is 1-based, so its value is the next index (0-based)

      // Check if already in memory or in DB
      if (cleanedPages[nextPageIndex] !== undefined) return;
      const cached = await localDb.getCleanedPage(document.fileHash, nextPageIndex);
      if (cached) {
        setCleanedPages(prev => ({
          ...prev,
          [nextPageIndex]: cached.content
        }));
        return;
      }

      // Proactively clean next page if not busy
      if (!isCleaning) {
        try {
          const response = await fetch("/api/documents/clean", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedPages[nextPageIndex] }),
          });

          if (response.ok) {
            const data = await response.json();
            const cleanedText = data.markdown;
            setCleanedPages(prev => ({
              ...prev,
              [nextPageIndex]: cleanedText
            }));
            await localDb.saveCleanedPage(document.fileHash, nextPageIndex, cleanedText);
          }
        } catch (e) {
          console.warn("Pre-fetch cleaning failed", e);
        }
      }
    };

    const timeoutId = setTimeout(preFetchNextPage, 1000); // Wait 1s after page load to pre-fetch
    return () => clearTimeout(timeoutId);
  }, [currentPage, extractedPages, cleanedPages, isCleaning, document.fileHash]);

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
      if (word.length <= 3) return `<b class="font-black text-accent">${word}</b>`;
      const mid = Math.ceil(word.length / 2);
      return `<b class="font-black text-accent">${word.slice(0, mid)}</b>${word.slice(mid)}`;
    }).join(' ');
  };

  const themes = {
    light: {
      body: "bg-[#fdfcfb] text-[#1a1a1a]",
      nav: "bg-[#fdfcfb]/80 border-[#e2e2e2]",
      button: "hover:bg-black/5 text-muted-foreground",
      activeButton: "bg-accent text-white"
    },
    sepia: {
      body: "bg-[#f4ecd8] text-[#5b4636]",
      nav: "bg-[#f4ecd8]/80 border-[#d3c6a6]",
      button: "hover:bg-black/5 text-[#8c7a6b]",
      activeButton: "bg-[#5b4636] text-[#f4ecd8]"
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 h-16 w-16 animate-spin mx-auto rounded-full border-4 border-accent border-t-transparent shadow-2xl"></div>
          <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Calibrating Focus Environment...</p>
        </div>
      </div>
    );
  }

  const currentT = themes[theme as keyof typeof themes];

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${currentT.body}`}>
      <nav className={`fixed top-0 z-50 w-full border-b backdrop-blur-xl px-6 py-4 flex items-center justify-between transition-all duration-500 ${currentT.nav}`}>
        <div className="flex items-center gap-6">
          <Link href="/library" className={`p-3 rounded-2xl transition-all ${currentT.button}`}>
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-black truncate max-w-[150px] sm:max-w-md text-sm uppercase tracking-widest">{document.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsReferenceView(!isReferenceView)}
            className={`p-3 rounded-2xl transition-all ${isReferenceView ? currentT.activeButton : currentT.button}`}
            title="Reference View (Source PDF)"
          >
            <FileText size={22} />
          </button>
          <button 
            onClick={() => setIsBionic(!isBionic)}
            className={`p-3 rounded-2xl transition-all ${isBionic ? currentT.activeButton : currentT.button}`}
            title="Bionic Reading"
          >
            <BookOpen size={22} />
          </button>
          <button 
            onClick={() => setTheme(theme === "light" ? "sepia" : "light")}
            className={`p-3 rounded-2xl transition-all ${currentT.button}`}
          >
            {theme === "light" ? <Sun size={22} /> : <BookOpen size={22} />}
          </button>
          <div className="flex items-center gap-1 bg-muted/20 rounded-2xl p-1">
            <button 
              onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
              className={`p-2 rounded-xl transition-all ${currentT.button}`}
            >
              <Type size={16} />
            </button>
            <button 
              onClick={() => setFontSize(prev => Math.min(prev + 2, 40))}
              className={`p-2 rounded-xl transition-all ${currentT.button}`}
            >
              <Type size={24} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-8 pt-32 pb-40">
        {isReferenceView ? (
          <div className="h-[calc(100vh-200px)] w-full rounded-[32px] overflow-hidden border border-border shadow-2xl transition-all duration-500">
            {pdfUrl && (
              <iframe 
                src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`} 
                className="w-full h-full"
                title="Source PDF"
              />
            )}
          </div>
        ) : (
          <div 
            className="mx-auto leading-[1.7] font-medium transition-all duration-500" 
            style={{ 
              fontSize: `${fontSize}px`,
              maxWidth: '750px' 
            }}
          >
            {isCleaning ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground opacity-70">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-accent" />
                <p className="text-sm font-black tracking-[0.2em] uppercase">Gemini AI is cleaning text...</p>
              </div>
            ) : (
              cleanedPages[currentPage - 1] === "" ? (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground opacity-50">
                  <FileText className="h-12 w-12 mb-4" />
                  <p className="text-sm font-black tracking-[0.2em] uppercase text-center">
                    Front matter skipped.<br/>
                    <span className="text-[10px] opacity-70">Gemini identified this as TOC, Preface, or Metadata.</span>
                  </p>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(extractedPages.length, prev + 1))}
                    className="mt-6 px-6 py-2 border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                  >
                    Go to Next Page
                  </button>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, children, ...props}) => {
                      const content = isBionic ? (
                        Array.isArray(children) 
                          ? children.map((c, i) => typeof c === 'string' ? <span key={i} dangerouslySetInnerHTML={{ __html: applyBionic(c) }} /> : c)
                          : (typeof children === 'string' ? <span dangerouslySetInnerHTML={{ __html: applyBionic(children) }} /> : children)
                      ) : children;
                      
                      return <p className="mb-10 transition-all duration-500 hover:opacity-100 opacity-90 cursor-default" {...props}>{content}</p>
                    },
                    h1: ({node, ...props}) => <h1 className="text-4xl font-black mt-16 mb-8 tracking-tight" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-14 mb-6 tracking-tight" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-10 mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-8 mb-10 space-y-3" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-8 mb-10 space-y-3" {...props} />,
                    li: ({node, children, ...props}) => {
                      const content = isBionic ? (
                        Array.isArray(children) 
                          ? children.map((c, i) => typeof c === 'string' ? <span key={i} dangerouslySetInnerHTML={{ __html: applyBionic(c) }} /> : c)
                          : (typeof children === 'string' ? <span dangerouslySetInnerHTML={{ __html: applyBionic(children) }} /> : children)
                      ) : children;
                      return <li className="pl-2" {...props}>{content}</li>
                    },
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent pl-6 py-2 mb-10 italic opacity-80" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-black text-accent" {...props} />
                  }}
                >
                  {cleanedPages[currentPage - 1] || ""}
                </ReactMarkdown>
              )
            )}
          </div>
        )}
      </main>

      <div className={`fixed bottom-0 left-0 w-full border-t backdrop-blur-xl p-6 transition-all duration-500 ${currentT.nav}`}>
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <button 
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p: number) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-20 transition-all ${currentT.button}`}
          >
            <ChevronLeft size={20} /> Prev
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Progress</div>
            <div className="text-sm font-black tabular-nums">
              <span className="text-accent">{currentPage}</span> <span className="opacity-30">/</span> {extractedPages.length}
            </div>
          </div>

          <button 
            disabled={currentPage === extractedPages.length}
            onClick={() => {
              setCurrentPage((p: number) => Math.min(extractedPages.length, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-20 transition-all ${currentT.button}`}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}