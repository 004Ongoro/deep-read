import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnotation extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  pageIndex: number;
  type: 'highlight' | 'note';
  color?: string;
  content?: string; // The note text
  quote: string; // The highlighted text from the document
  range?: {
    startOffset: number;
    endOffset: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  pageIndex: { type: Number, required: true },
  type: { type: String, enum: ['highlight', 'note'], default: 'highlight' },
  color: { type: String, default: 'yellow' },
  content: { type: String },
  quote: { type: String, required: true },
  range: {
    startOffset: Number,
    endOffset: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AnnotationSchema.index({ documentId: 1, userId: 1 });

export const Annotation: Model<IAnnotation> = 
  mongoose.models.Annotation || mongoose.model<IAnnotation>('Annotation', AnnotationSchema);
