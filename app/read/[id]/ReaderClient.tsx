"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { localDb } from "@/lib/db/localDb";
import { 
  ArrowLeft, BookOpen, Sun, Moon, Type, ChevronLeft, ChevronRight, 
  FileText, Loader2, Sparkles, MessageSquare, Highlighter, StickyNote,
  X, Send, Trash2, List
} from "lucide-react";
import Link from "next/link";
import * as pdfjs from "pdfjs-dist";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface IAnnotation {
  _id: string;
  pageIndex: number;
  type: 'highlight' | 'note';
  color?: string;
  content?: string;
  quote: string;
}

interface IDocument {
  _id: string;
  title: string;
  fileHash: string;
  sourceType: 'pdf' | 'url';
  currentChapter?: number;
  summary?: string;
  extractedText?: {
    chapterIndex: number;
    title: string;
    content: string;
  }[];
}

interface ReaderClientProps {
  document: IDocument;
}

type SidebarTab = 'ai' | 'notes' | 'summary';

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
  
  // New State for Learning Tools
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null);
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);
  const [aiSummary, setAiSummary] = useState<string>(document.summary || "");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiChat, setAiChat] = useState<{ q: string, a: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState<{ quote: string, pageIndex: number } | null>(null);
  const [noteText, setNoteText] = useState("");

  const mainRef = useRef<HTMLDivElement>(null);

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

  const fetchAnnotations = useCallback(async () => {
    try {
      const res = await fetch(`/api/annotations?documentId=${document._id}`);
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setAnnotations(data);
      }
    } catch (e) {
      console.warn("Failed to fetch annotations", e);
    }
  }, [document._id]);

  const extractText = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
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
    async function loadContent() {
      if (document.sourceType === 'url') {
        if (document.extractedText && document.extractedText.length > 0) {
          const pages = document.extractedText.map(t => t.content);
          setExtractedPages(pages);
          const cleaned: Record<number, string> = {};
          pages.forEach((p, i) => {
            cleaned[i] = p;
          });
          setCleanedPages(cleaned);
          setIsLoading(false);
        } else {
          console.error("URL document missing content");
          setIsLoading(false);
        }
      } else {
        const localPdf = await localDb.getPdfByHash(document.fileHash);
        if (localPdf) {
          setPdfBlob(localPdf.blob);
          extractText(localPdf.blob);
        } else {
          setIsLoading(false);
        }
      }
      fetchAnnotations();
    }
    loadContent();
  }, [document.fileHash, document.sourceType, document.extractedText, extractText, fetchAnnotations]);

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
  }, [currentPage, extractedPages.length, document._id, isLoading, document.sourceType]);

  useEffect(() => {
    const cleanCurrentPage = async () => {
      if (extractedPages.length === 0 || document.sourceType === 'url') return;
      const pageIndex = currentPage - 1;
      if (cleanedPages[pageIndex] !== undefined) return;

      const cached = await localDb.getCleanedPage(document.fileHash, pageIndex);
      if (cached) {
        setCleanedPages(prev => ({ ...prev, [pageIndex]: cached.content }));
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
          setCleanedPages(prev => ({ ...prev, [pageIndex]: cleanedText }));
          await localDb.saveCleanedPage(document.fileHash, pageIndex, cleanedText);
        } else {
          setCleanedPages(prev => ({ ...prev, [pageIndex]: extractedPages[pageIndex] }));
        }
      } catch (error) {
        setCleanedPages(prev => ({ ...prev, [pageIndex]: extractedPages[pageIndex] }));
      } finally {
        setIsCleaning(false);
      }
    };

    cleanCurrentPage();
  }, [currentPage, extractedPages, cleanedPages, document.fileHash, document.sourceType]);

  // Handle Text Selection for Toolbar
  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 10
      });
    } else {
      setSelection(null);
    }
  };

  // Learning Tools Handlers
  const addHighlight = async (color = 'yellow') => {
    if (!selection) return;
    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document._id,
          pageIndex: currentPage - 1,
          type: 'highlight',
          color,
          quote: selection.text,
        })
      });
      if (res.ok) {
        const newAnn = await res.json();
        setAnnotations(prev => [...prev, newAnn]);
        setSelection(null);
      }
    } catch (e) {
      console.error("Failed to add highlight", e);
    }
  };

  const addNote = async () => {
    if (!selection) return;
    setShowNoteInput({ quote: selection.text, pageIndex: currentPage - 1 });
    setSelection(null);
  };

  const saveNote = async () => {
    if (!showNoteInput || !noteText) return;
    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document._id,
          pageIndex: showNoteInput.pageIndex,
          type: 'note',
          content: noteText,
          quote: showNoteInput.quote,
        })
      });
      if (res.ok) {
        const newAnn = await res.json();
        setAnnotations(prev => [...prev, newAnn]);
        setShowNoteInput(null);
        setNoteText("");
        setActiveTab('notes');
      }
    } catch (e) {
      console.error("Failed to save note", e);
    }
  };

  const deleteAnnotation = async (id: string) => {
    try {
      const res = await fetch(`/api/annotations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnotations(prev => prev.filter(a => a._id !== id));
      }
    } catch (e) {
      console.error("Failed to delete annotation", e);
    }
  };

  const generateSummary = async () => {
    setIsSummarizing(true);
    setActiveTab('summary');
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document._id })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to summarize", e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const askAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion || isAsking) return;

    const question = currentQuestion;
    setCurrentQuestion("");
    setIsAsking(true);
    setActiveTab('ai');

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId: document._id, 
          question,
          selection: selection?.text
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiChat(prev => [...prev, { q: question, a: data.answer }]);
      }
    } catch (e) {
      console.error("Failed to ask AI", e);
    } finally {
      setIsAsking(false);
      setSelection(null);
    }
  };

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
      activeButton: "bg-accent text-white",
      sidebar: "bg-white border-l border-border",
      toolbar: "bg-white text-foreground shadow-2xl border border-border"
    },
    sepia: {
      body: "bg-[#f4ecd8] text-[#5b4636]",
      nav: "bg-[#f4ecd8]/80 border-[#d3c6a6]",
      button: "hover:bg-black/5 text-[#8c7a6b]",
      activeButton: "bg-[#5b4636] text-[#f4ecd8]",
      sidebar: "bg-[#f9f4e8] border-l border-[#d3c6a6]",
      toolbar: "bg-[#5b4636] text-[#f4ecd8] shadow-2xl"
    },
  };

  const currentT = themes[theme as keyof typeof themes];

  const pageContent = cleanedPages[currentPage - 1] || "";
  
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

  return (
    <div className={`flex min-h-screen transition-all duration-500 ease-in-out ${currentT.body}`}>
      {/* Main Reader Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${activeTab ? 'mr-[400px]' : ''}`}>
        <nav className={`fixed top-0 z-40 w-full border-b backdrop-blur-xl px-6 py-4 flex items-center justify-between transition-all duration-500 ${currentT.nav} ${activeTab ? 'pr-[420px]' : ''}`}>
          <div className="flex items-center gap-6">
            <Link href="/library" className={`p-3 rounded-2xl transition-all ${currentT.button}`}>
              <ArrowLeft size={22} />
            </Link>
            <h1 className="font-black truncate max-w-[150px] sm:max-w-md text-sm uppercase tracking-widest">{document.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={generateSummary}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'summary' ? currentT.activeButton : currentT.button}`}
              title="AI Summary"
            >
              <Sparkles size={22} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'ai' ? null : 'ai')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'ai' ? currentT.activeButton : currentT.button}`}
              title="AI Assistant"
            >
              <MessageSquare size={22} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'notes' ? null : 'notes')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'notes' ? currentT.activeButton : currentT.button}`}
              title="My Notes"
            >
              <StickyNote size={22} />
            </button>
            <div className="w-[1px] h-6 bg-border mx-2" />
            <button 
              onClick={() => setTheme(theme === "light" ? "sepia" : "light")}
              className={`p-3 rounded-2xl transition-all ${currentT.button}`}
            >
              {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'ai' ? null : 'ai')}
              className={`lg:hidden p-3 rounded-2xl transition-all ${currentT.button}`}
            >
              <List size={22} />
            </button>
          </div>
        </nav>

        <main 
          ref={mainRef}
          onMouseUp={handleMouseUp}
          className="mx-auto w-full max-w-4xl px-8 pt-32 pb-40 relative"
        >
          <div 
            className="mx-auto leading-[1.8] font-medium transition-all duration-500" 
            style={{ fontSize: `${fontSize}px`, maxWidth: '750px' }}
          >
            {isCleaning ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground opacity-70">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-accent" />
                <p className="text-sm font-black tracking-[0.2em] uppercase">Gemini AI is cleaning text...</p>
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
                {pageContent}
              </ReactMarkdown>
            )}
          </div>
        </main>

        {/* Floating Selection Toolbar */}
        {selection && (
          <div 
            className={`fixed z-50 flex items-center gap-1 rounded-2xl p-1.5 animate-in fade-in zoom-in duration-200 ${currentT.toolbar}`}
            style={{ 
              top: selection.y - 60, 
              left: Math.min(Math.max(20, selection.x - 120), window.innerWidth - 250) 
            }}
          >
            <button 
              onClick={() => addHighlight('yellow')}
              className="p-2.5 rounded-xl hover:bg-yellow-500/20 text-yellow-600 transition-colors"
              title="Highlight Yellow"
            >
              <Highlighter size={18} />
            </button>
            <button 
              onClick={() => addHighlight('green')}
              className="p-2.5 rounded-xl hover:bg-green-500/20 text-green-600 transition-colors"
              title="Highlight Green"
            >
              <Highlighter size={18} />
            </button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button 
              onClick={addNote}
              className="p-2.5 rounded-xl hover:bg-accent/10 text-accent transition-colors"
              title="Add Note"
            >
              <StickyNote size={18} />
            </button>
            <button 
              onClick={() => {
                setCurrentQuestion(`Explain this: "${selection.text}"`);
                setActiveTab('ai');
              }}
              className="p-2.5 rounded-xl hover:bg-accent/10 text-accent transition-colors"
              title="Explain with AI"
            >
              <Sparkles size={18} />
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className={`fixed bottom-0 z-40 left-0 w-full border-t backdrop-blur-xl p-6 transition-all duration-500 ${currentT.nav} ${activeTab ? 'pr-[420px]' : ''}`}>
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <button 
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
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
                setCurrentPage((p) => Math.min(extractedPages.length, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-20 transition-all ${currentT.button}`}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Learning Panel */}
      <aside 
        className={`fixed top-0 right-0 z-50 h-full w-[400px] shadow-2xl transition-transform duration-500 ease-in-out transform flex flex-col ${activeTab ? 'translate-x-0' : 'translate-x-full'} ${currentT.sidebar}`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent text-white">
              {activeTab === 'ai' ? <Sparkles size={20} /> : activeTab === 'notes' ? <StickyNote size={20} /> : <FileText size={20} />}
            </div>
            <h2 className="font-black uppercase tracking-widest text-sm">
              {activeTab === 'ai' ? 'AI Learning Assistant' : activeTab === 'notes' ? 'My Library Notes' : 'Document Summary'}
            </h2>
          </div>
          <button onClick={() => setActiveTab(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-accent" />
                  <p className="text-xs font-black uppercase tracking-widest">Generating deep summary...</p>
                </div>
              ) : aiSummary ? (
                <div className="prose prose-sm prose-slate dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-sm mb-6">No summary generated yet.</p>
                  <button 
                    onClick={generateSummary}
                    className="px-6 py-3 bg-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
                  >
                    Generate Summary
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-6">
                {aiChat.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-accent" />
                    <p className="text-sm font-medium">Ask questions about the text,<br/>request explanations, or quiz yourself.</p>
                  </div>
                )}
                {aiChat.map((chat, i) => (
                  <div key={i} className="space-y-3">
                    <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                      <p className="text-sm font-bold text-accent mb-1">Question</p>
                      <p className="text-sm">{chat.q}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-border">
                      <p className="text-sm font-bold text-muted-foreground mb-1">Deep Read AI</p>
                      <div className="prose prose-sm prose-slate dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.a}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-50">Assistant is thinking...</p>
                  </div>
                )}
              </div>
              
              <form onSubmit={askAi} className="mt-6 relative">
                <input 
                  type="text"
                  placeholder="Ask anything about the text..."
                  className="w-full rounded-2xl border border-border bg-muted/50 p-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  disabled={isAsking}
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent hover:scale-110 transition-all disabled:opacity-50"
                  disabled={isAsking || !currentQuestion}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {annotations.filter(a => a.type === 'note').length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <StickyNote className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm">Highlight text to add your personal notes<br/>and research insights.</p>
                </div>
              ) : (
                annotations.filter(a => a.type === 'note').map((note) => (
                  <div key={note._id} className="group p-4 rounded-2xl border border-border hover:border-accent/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-accent/10 px-3 py-1 rounded-full text-[10px] font-black text-accent uppercase tracking-widest">
                        Page {note.pageIndex + 1}
                      </div>
                      <button 
                        onClick={() => deleteAnnotation(note._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <blockquote className="border-l-2 border-border pl-3 text-xs italic text-muted-foreground mb-3 line-clamp-2">
                      &ldquo;{note.quote}&rdquo;
                    </blockquote>
                    <p className="text-sm font-medium">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Note Input Overlay */}
      {showNoteInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-4 tracking-tight">Add Learning Note</h3>
            <blockquote className="border-l-4 border-accent/20 pl-4 py-2 mb-6 italic text-sm text-muted-foreground bg-muted/30 rounded-r-2xl">
              &ldquo;{showNoteInput.quote}&rdquo;
            </blockquote>
            <textarea 
              autoFocus
              className="w-full h-32 rounded-2xl border border-border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 mb-6"
              placeholder="What did you learn? Add your thoughts..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowNoteInput(null)}
                className="flex-1 py-4 rounded-2xl border border-border font-black uppercase text-xs tracking-widest hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveNote}
                disabled={!noteText}
                className="flex-1 py-4 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest hover:scale-105 transition-all disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
