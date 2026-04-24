"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Clock, Search, Trash2 } from "lucide-react";

export default function LibraryClient({ initialDocuments }: { initialDocuments: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
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
    <div className="mx-auto max-w-7xl">
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Library</h1>
          <p className="mt-2 text-gray-500">All your learning materials in one place.</p>
        </div>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search your library..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-10 pr-4 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </header>

      <div className="grid gap-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc._id} className="group flex flex-col md:flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="rounded-xl bg-accent/10 p-4 text-accent">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors text-lg">
                    {doc.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-accent/70 uppercase text-[10px] tracking-widest">
                      {doc.readingProgress}% COMPLETE
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:block w-48 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${doc.readingProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                  <button 
                    onClick={() => handleDelete(doc._id)}
                    className="rounded-xl border border-gray-100 p-3 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <Link 
                    href={`/read/${doc._id}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-accent hover:text-white"
                  >
                    Read Now <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">{searchQuery ? "No matches found" : "No documents yet"}</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              {searchQuery ? "Try a different search term." : "Upload your first PDF on the dashboard to start building your library."}
            </p>
            {!searchQuery && (
              <Link href="/" className="mt-6 font-bold text-accent hover:underline">
                Go to Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
