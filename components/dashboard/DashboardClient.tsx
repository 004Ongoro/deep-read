"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Book, ArrowRight, FileText, Trash2 } from "lucide-react";
import { ingestDocument } from "@/lib/utils/pdf-handler";
import { useSession } from "next-auth/react";

interface IDocument {
  _id: string;
  title: string;
  readingProgress: number;
  updatedAt: string;
}

interface DashboardClientProps {
  initialDocuments: IDocument[];
}

interface AuthUser {
  id: string;
}

export default function DashboardClient({ initialDocuments }: DashboardClientProps) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<IDocument[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    setIsUploading(true);
    try {
      const user = session.user as AuthUser;
      const newDoc = await ingestDocument(file, user.id);
      setDocuments([newDoc, ...documents]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process PDF. Ensure it's a valid digital document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12 transition-theme">
      {/* Active Reading Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Book size={24} className="text-accent" /> Currently Learning
          </h2>
        </div>

        {documents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc._id} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1">
                <div className="mb-6 flex items-start justify-between">
                  <div className="rounded-2xl bg-accent-muted p-4 text-accent">
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={() => handleDelete(doc._id)}
                      className="rounded-xl p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent/70">
                      {doc.readingProgress}% Complete
                    </span>
                  </div>
                </div>
                
                <h3 className="line-clamp-2 text-lg font-bold text-foreground group-hover:text-accent transition-colors min-h-[3.5rem]">
                  {doc.title}
                </h3>
                
                {/* Progress Bar */}
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full bg-accent transition-all duration-700 ease-out" 
                    style={{ width: `${doc.readingProgress}%` }}
                  />
                </div>

                <Link 
                  href={`/read/${doc._id}`}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background py-4 text-sm font-bold text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent"
                >
                  Resume Reading <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-border bg-muted/30 py-24 text-center">
            <div className="rounded-full bg-card p-6 shadow-sm ring-1 ring-border">
              <Book size={40} className="text-muted-foreground/30" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-foreground">Your library is empty</h3>
            <p className="mt-2 text-muted-foreground max-w-xs">Upload a PDF to start your deep reading session and reclaim your focus.</p>
          </div>
        )}
      </section>

      {/* Upload Action */}
      <section className="relative overflow-hidden rounded-[40px] bg-accent p-10 text-accent-foreground shadow-2xl shadow-accent/20 md:p-16">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">Add New Material</h2>
            <p className="mt-4 text-lg text-accent-foreground/90 leading-relaxed">
              Drop a PDF here. We&apos;ll strip the noise, handle the reflow, and prepare your perfect focus environment.
            </p>
          </div>
          
          <label className="flex cursor-pointer items-center gap-4 rounded-[28px] bg-white px-12 py-6 text-xl font-black text-accent transition-all hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl">
            {isUploading ? (
              <span className="flex items-center gap-3 italic">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Processing...
              </span>
            ) : (
              <>
                <Plus size={24} strokeWidth={3} />
                <span>Upload PDF</span>
              </>
            )}
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
          </label>
        </div>
      </section>
    </div>
  );
}