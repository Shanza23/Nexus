import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { addDocument } from '../../data/documents';

interface DocumentUploaderProps {
  ownerId: string;
  onUploaded: () => void;
}

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB, generous for a frontend demo

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ ownerId, onUploaded }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        if (file.size > MAX_SIZE_BYTES) {
          toast.error(`${file.name} is too large (max 8 MB for this demo)`);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          addDocument(ownerId, {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result as string,
          });
          toast.success(`${file.name} uploaded`);
          onUploaded();
        };
        reader.onerror = () => toast.error(`Could not read ${file.name}`);
        reader.readAsDataURL(file);
      });
    },
    [ownerId, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud size={28} className="text-primary-500 mb-2" />
      <p className="text-sm font-medium text-gray-700">
        {isDragActive ? 'Drop the file here…' : 'Drag & drop a file, or click to browse'}
      </p>
      <p className="text-xs text-gray-500 mt-1">PDF, Word, or image — up to 8 MB</p>
    </div>
  );
};
