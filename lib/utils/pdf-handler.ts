import CryptoJS from 'crypto-js';
import { localDb } from '@/lib/db/localDb';

export async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
      const hash = CryptoJS.SHA256(wordArray).toString();
      resolve(hash);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export async function ingestDocument(file: File, userId: string) {
  const hash = await calculateFileHash(file);
  
  // Save to Local DB (IndexedDB)
  await localDb.savePdf(file.name, hash, file);

  // Prepare metadata for MongoDB
  const documentData = {
    title: file.name.replace('.pdf', ''),
    fileHash: hash,
    userId: userId,
  };

  const response = await fetch('/api/documents/init', {
    method: 'POST',
    body: JSON.stringify(documentData),
    headers: { 'Content-Type': 'application/json' },
  });

  return await response.json();
}