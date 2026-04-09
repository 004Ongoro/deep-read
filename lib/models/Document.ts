import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  fileHash: string; // To match with local IndexedDB file
  totalChapters: number;
  currentChapter: number;
  lastReadAnchor: string; // The ID of the last read paragraph
  readingProgress: number; // Percentage 0-100
  extractedText?: {
    chapterIndex: number;
    title: string;
    content: string; // Cleaned text
  }[];
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  fileHash: { type: String, required: true }, // Unique identifier for the PDF
  totalChapters: { type: Number, default: 0 },
  currentChapter: { type: Number, default: 0 },
  lastReadAnchor: { type: String },
  readingProgress: { type: Number, default: 0 },
  extractedText: [{
    chapterIndex: Number,
    title: String,
    content: String,
  }],
  updatedAt: { type: Date, default: Date.now },
});

// Index by userId and fileHash for quick lookups
DocumentSchema.index({ userId: 1, fileHash: 1 });

export const DocumentModel: Model<IDocument> = 
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);