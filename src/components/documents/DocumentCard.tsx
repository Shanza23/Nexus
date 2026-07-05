import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, Trash2, Share2, PenLine, Image as ImageIcon } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SignaturePad } from './SignaturePad';
import { Document, DocumentStatus } from '../../types';
import { removeDocument, updateDocumentStatus, signDocument, toggleShare } from '../../data/documents';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  currentUserId: string;
  onChange: () => void;
}

const statusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'draft':
      return <Badge variant="gray">Draft</Badge>;
    case 'in_review':
      return <Badge variant="warning">In Review</Badge>;
    case 'signed':
      return <Badge variant="success">Signed</Badge>;
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, currentUserId, onChange }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const isOwner = document.ownerId === currentUserId;
  const isImage = document.url.startsWith('data:image');

  const handleStatusChange = (status: DocumentStatus) => {
    updateDocumentStatus(document.id, status);
    toast.success(`Marked as ${status.replace('_', ' ')}`);
    onChange();
  };

  const handleDelete = () => {
    removeDocument(document.id);
    toast.success('Document deleted');
    onChange();
  };

  const handleShareToggle = () => {
    toggleShare(document.id);
    onChange();
  };

  const handleSign = (dataUrl: string) => {
    signDocument(document.id, currentUserId, dataUrl);
    toast.success('Document signed');
    setShowSignaturePad(false);
    onChange();
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="p-2 bg-primary-50 rounded-md mr-3">
              {isImage ? (
                <ImageIcon size={20} className="text-primary-600" />
              ) : (
                <FileText size={20} className="text-primary-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 break-all">{document.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {document.type} · {document.size} · {format(new Date(document.lastModified), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {statusBadge(document.status)}
        </div>

        {document.status === 'signed' && document.signatureDataUrl && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-1">Signature</p>
            <img src={document.signatureDataUrl} alt="Signature" className="h-10" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {document.url && (
            <Button variant="outline" size="sm" leftIcon={<FileText size={14} />} onClick={() => setShowPreview(true)}>
              Preview
            </Button>
          )}
          {document.url && (
            <a href={document.url} download={document.name}>
              <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
                Download
              </Button>
            </a>
          )}
          {isOwner && (
            <Button variant="ghost" size="sm" leftIcon={<Share2 size={14} />} onClick={handleShareToggle}>
              {document.shared ? 'Unshare' : 'Share'}
            </Button>
          )}
          {document.status !== 'signed' && (
            <Button variant="primary" size="sm" leftIcon={<PenLine size={14} />} onClick={() => setShowSignaturePad(true)}>
              Sign
            </Button>
          )}
          {isOwner && (
            <Button variant="ghost" size="sm" className="text-error-500" leftIcon={<Trash2 size={14} />} onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>

        {document.status !== 'signed' && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <select
              value={document.status}
              onChange={e => handleStatusChange(e.target.value as DocumentStatus)}
              className="text-xs rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
            </select>
          </div>
        )}
      </CardBody>

      {showPreview && (
        <Modal title={document.name} onClose={() => setShowPreview(false)}>
          {isImage ? (
            <img src={document.url} alt={document.name} className="w-full rounded-md" />
          ) : document.url.startsWith('data:application/pdf') ? (
            <iframe title={document.name} src={document.url} className="w-full h-96 rounded-md border" />
          ) : (
            <p className="text-sm text-gray-500">No inline preview available for this file type.</p>
          )}
        </Modal>
      )}

      {showSignaturePad && (
        <Modal title={`Sign: ${document.name}`} onClose={() => setShowSignaturePad(false)}>
          <SignaturePad onSign={handleSign} onCancel={() => setShowSignaturePad(false)} />
        </Modal>
      )}
    </Card>
  );
};
