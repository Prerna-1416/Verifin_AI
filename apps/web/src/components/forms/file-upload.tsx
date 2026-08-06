'use client';

import * as React from 'react';
import { UploadCloud, File, X, Image as ImageIcon, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  label?: string;
  error?: string;
}

export function FileUpload({
  accept,
  maxSize = 50 * 1024 * 1024,
  multiple = false,
  value = [],
  onChange,
  label = 'Drag & drop files here, or click to browse',
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter((file) => file.size <= maxSize);
    if (multiple) {
      onChange?.([...value, ...fileArray]);
    } else {
      onChange?.(fileArray.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-primary" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-accent-600" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'relative flex flex-col items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-6',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          error && 'border-destructive'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <UploadCloud className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        <p className="text-xs text-muted-foreground">
          Max file size {formatFileSize(maxSize)}
        </p>
      </div>

      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 animate-in"
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}