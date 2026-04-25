import Dexie, { Table } from 'dexie';

export interface LocalPdf {
  id?: number;
  fileHash: string;
  fileName: string;
  blob: Blob;
  addedAt: Date;
}

export interface CleanedPage {
  id?: number;
  fileHash: string;
  pageIndex: number;
  content: string;
}

export class DeepReadLocalDB extends Dexie {
  pdfs!: Table<LocalPdf>;
  cleanedPages!: Table<CleanedPage>;

  constructor() {
    super('DeepReadLocalDB');
    this.version(2).stores({
      pdfs: '++id, fileHash, fileName',
      cleanedPages: '++id, fileHash, pageIndex, [fileHash+pageIndex]'
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

  async saveCleanedPage(fileHash: string, pageIndex: number, content: string) {
    const exists = await this.cleanedPages.where({ fileHash, pageIndex }).first();
    if (!exists) {
      return await this.cleanedPages.add({
        fileHash,
        pageIndex,
        content
      });
    }
    return exists.id;
  }

  async getCleanedPage(fileHash: string, pageIndex: number) {
    return await this.cleanedPages.where({ fileHash, pageIndex }).first();
  }
}

export const localDb = new DeepReadLocalDB();