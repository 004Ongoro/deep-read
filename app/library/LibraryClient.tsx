"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Clock, Search, Trash2 } from "lucide-react";

interface IDocument {
  _id: string;
  title: string;
  readingProgress: number;
  updatedAt: string;
}

interface LibraryClientProps {
  initialDocuments: IDocument[];
}

export default function LibraryClient({ initialDocuments }: LibraryClientProps) {
  const [documents, setDocuments] = useState<IDocument[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const response = await fetch(`/api/documents/delete?id=${docId}`, { method: 'DELETE' });
      if (response.ok) {
        setDocuments(documents.filter(d => d._id !== docId));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl transition-theme">
      <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-foreground tracking-tight">My Library</h1>
          <p className="mt-3 text-lg text-muted-foreground">All your learning materials in one place, optimized for depth.</p>
        </div>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={22} />
          <input 
            type="text" 
            placeholder="Search your library..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[20px] border border-border bg-card py-4 pl-12 pr-6 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-foreground"
          />
        </div>
      </header>

      <div className="grid gap-6">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc._id} className="group flex flex-col md:flex-row items-center justify-between rounded-[32px] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="rounded-2xl bg-accent-muted p-5 text-accent group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-accent transition-colors text-xl line-clamp-1">
                    {doc.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Clock size={16} /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="font-black text-accent/80 uppercase text-[10px] tracking-[0.2em]">
                      {doc.readingProgress}% COMPLETE
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 md:mt-0 flex items-center gap-8 w-full md:w-auto">
                <div className="hidden lg:block w-48 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000 ease-in-out" 
                    style={{ width: `${doc.readingProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 flex-1 md:flex-none">
                  <button 
                    onClick={() => handleDelete(doc._id)}
                    className="rounded-2xl border border-border p-4 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <Link 
                    href={`/read/${doc._id}`}
                    className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-muted px-8 py-4 text-base font-bold text-foreground transition-all hover:bg-accent hover:text-accent-foreground shadow-sm active:scale-95"
                  >
                    Read Now <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-border bg-muted/20 py-32 text-center transition-theme">
            <div className="rounded-full bg-card p-8 shadow-sm ring-1 ring-border mb-8">
              <FileText size={56} className="text-muted-foreground/20" />
            </div>
            <h3 className="text-2xl font-black text-foreground">{searchQuery ? "No matches found" : "Your library is empty"}</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-4 text-lg">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}". Try a different term.` : "Start your collection by uploading your first PDF on the dashboard."}
            </p>
            {!searchQuery && (
              <Link href="/" className="mt-10 inline-flex items-center gap-2 font-black text-accent hover:underline text-lg">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}