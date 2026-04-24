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
    <div className="space-y-12">
      {/* Active Reading Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Book size={20} className="text-accent" /> Currently Learning
          </h2>
        </div>

        {documents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc._id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-accent/10 p-3 text-accent">
                    <FileText size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(doc._id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {doc.readingProgress}% Complete
                    </span>
                  </div>
                </div>
                
                <h3 className="line-clamp-1 font-bold text-gray-900 group-hover:text-accent transition-colors">
                  {doc.title}
                </h3>
                
                {/* Progress Bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${doc.readingProgress}%` }}
                  />
                </div>

                <Link 
                  href={`/read/${doc._id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-accent hover:text-white group-hover:border-accent"
                >
                  Resume Reading <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
            <div className="rounded-full bg-white p-4 shadow-sm">
              <Book size={32} className="text-gray-300" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Your library is empty</h3>
            <p className="text-sm text-gray-600">Upload a PDF to start your deep reading session.</p>
          </div>
        )}
      </section>

      {/* Upload Action */}
      <section className="rounded-3xl bg-accent p-8 text-white shadow-2xl shadow-accent/20 md:p-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-md">
            <h2 className="text-3xl font-black tracking-tight">Add New Material</h2>
            <p className="mt-2 text-white/90">
              Drop a PDF here. We&apos;ll strip the noise and prepare your focus environment.
            </p>
          </div>
          
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-8 py-4 font-black text-accent transition-transform hover:scale-105 active:scale-95 shadow-xl">
            {isUploading ? (
              <span className="flex items-center gap-2 italic">Processing...</span>
            ) : (
              <>
                <Plus size={20} strokeWidth={3} />
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
