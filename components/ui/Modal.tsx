"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "alert" | "confirm";
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "confirm",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-black text-foreground">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-6 py-3 font-bold text-muted-foreground hover:bg-muted transition-colors active:scale-95"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (type === "alert") onClose();
            }}
            className={`rounded-xl px-6 py-3 font-bold text-white transition-all active:scale-95 shadow-lg ${
              type === "confirm" 
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                : "bg-accent hover:bg-accent/90 shadow-accent/20"
            }`}
          >
            {type === "confirm" ? confirmText : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}
