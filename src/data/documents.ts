import { Document, DocumentStatus } from '../types';

const DOCS_KEY = 'business_nexus_documents';

const seedDocuments = (): Document[] => [
  {
    id: 'doc1',
    name: 'Pitch Deck 2026.pdf',
    type: 'PDF',
    size: '2.4 MB',
    lastModified: new Date().toISOString(),
    shared: true,
    url: '',
    ownerId: 'e1',
    status: 'draft',
  },
  {
    id: 'doc2',
    name: 'Term Sheet - TechWave AI.pdf',
    type: 'PDF',
    size: '640 KB',
    lastModified: new Date().toISOString(),
    shared: true,
    url: '',
    ownerId: 'e1',
    status: 'in_review',
  },
  {
    id: 'doc3',
    name: 'NDA - VC Innovate.pdf',
    type: 'PDF',
    size: '210 KB',
    lastModified: new Date().toISOString(),
    shared: true,
    url: '',
    ownerId: 'i1',
    status: 'signed',
    signedBy: 'i1',
    signedAt: new Date().toISOString(),
  },
];

const load = (): Document[] => {
  const stored = localStorage.getItem(DOCS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Document[];
    } catch {
      // fall through to reseed
    }
  }
  const seeded = seedDocuments();
  localStorage.setItem(DOCS_KEY, JSON.stringify(seeded));
  return seeded;
};

const save = (data: Document[]): void => {
  localStorage.setItem(DOCS_KEY, JSON.stringify(data));
};

export let documents: Document[] = load();

export const getDocumentsForUser = (userId: string): Document[] => {
  return documents
    .filter(doc => doc.ownerId === userId || doc.shared)
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const addDocument = (
  ownerId: string,
  file: { name: string; size: number; type: string; dataUrl: string }
): Document => {
  const newDoc: Document = {
    id: `doc${documents.length + 1}_${Date.now()}`,
    name: file.name,
    type: file.type.includes('pdf') ? 'PDF' : file.type.split('/')[1]?.toUpperCase() || 'File',
    size: formatSize(file.size),
    lastModified: new Date().toISOString(),
    shared: false,
    url: file.dataUrl,
    ownerId,
    status: 'draft',
  };
  documents = [newDoc, ...documents];
  save(documents);
  return newDoc;
};

export const removeDocument = (docId: string): void => {
  documents = documents.filter(d => d.id !== docId);
  save(documents);
};

export const updateDocumentStatus = (docId: string, status: DocumentStatus): Document | null => {
  const index = documents.findIndex(d => d.id === docId);
  if (index === -1) return null;
  documents = documents.map((d, i) => (i === index ? { ...d, status, lastModified: new Date().toISOString() } : d));
  save(documents);
  return documents[index];
};

export const signDocument = (
  docId: string,
  signerId: string,
  signatureDataUrl: string
): Document | null => {
  const index = documents.findIndex(d => d.id === docId);
  if (index === -1) return null;
  documents = documents.map((d, i) =>
    i === index
      ? {
          ...d,
          status: 'signed',
          signatureDataUrl,
          signedBy: signerId,
          signedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        }
      : d
  );
  save(documents);
  return documents[index];
};

export const toggleShare = (docId: string): Document | null => {
  const index = documents.findIndex(d => d.id === docId);
  if (index === -1) return null;
  documents = documents.map((d, i) => (i === index ? { ...d, shared: !d.shared } : d));
  save(documents);
  return documents[index];
};
