import Dexie, { Table } from 'dexie';

export interface LocalPdf {
  id?: number;
  fileHash: string;
  fileName: string;
  blob: Blob;
  addedAt: Date;
}


export class DeepReadLocalDB extends Dexie {
  pdfs!: Table<LocalPdf>;

  constructor() {
    super('DeepReadLocalDB');
    this.version(1).stores({
      pdfs: '++id, fileHash, fileName' 
    });
  }

  async savePdf(fileName: string, fileHash: string, blob: Blob) {
    const exists = await this.pdfs.where('fileHash').equals(fileHash).first();
    if (!exists) {
      return await this.pdfs.add({
        fileName,
        fileHash,
        blob,
        addedAt: new Date()
      });
    }
    return exists.id;
  }

  async getPdfByHash(fileHash: string) {
    return await this.pdfs.where('fileHash').equals(fileHash).first();
  }
}

export const localDb = new DeepReadLocalDB();