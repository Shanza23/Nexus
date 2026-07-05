import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DocumentUploader } from '../../components/documents/DocumentUploader';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { useAuth } from '../../context/AuthContext';
import { getDocumentsForUser } from '../../data/documents';
import { DocumentStatus } from '../../types';

const FILTERS: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Signed', value: 'signed' },
];

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<DocumentStatus | 'all'>('all');
  const bump = () => setRefreshKey(k => k + 1);

  const documents = useMemo(
    () => (user ? getDocumentsForUser(user.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, refreshKey]
  );

  if (!user) return null;

  const filteredDocuments = filter === 'all' ? documents : documents.filter(d => d.status === filter);
  const counts = {
    draft: documents.filter(d => d.status === 'draft').length,
    in_review: documents.filter(d => d.status === 'in_review').length,
    signed: documents.filter(d => d.status === 'signed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
        <p className="text-gray-600">Upload, preview, and e-sign deal documents and contracts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Upload</h2>
            </CardHeader>
            <CardBody>
              <DocumentUploader ownerId={user.id} onUploaded={bump} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Status Overview</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Draft</span>
                <Badge variant="gray">{counts.draft}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Review</span>
                <Badge variant="warning">{counts.in_review}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signed</span>
                <Badge variant="success">{counts.signed}</Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
              <div className="flex gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      filter === f.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No documents here yet</p>
                  <p className="text-sm text-gray-500 mt-1">Upload a file to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocuments.map(doc => (
                    <DocumentCard key={doc.id} document={doc} currentUserId={user.id} onChange={bump} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
