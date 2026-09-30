import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function UploadZone({ selectedFile, previewUrl, onFileSelected, onFileRemoved, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds the 15MB maximum limit.');
      return;
    }
    if (file.size < 4000) {
      setError('Image is too small or corrupt. Minimum size is 4KB.');
      return;
    }
    onFileSelected(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (previewUrl && selectedFile) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <img
            src={previewUrl}
            alt="Crop Preview"
            style={{
              maxHeight: '340px',
              maxWidth: '100%',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'contain',
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <button
            type="button"
            onClick={onFileRemoved}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(23, 33, 27, 0.85)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
            title="Remove image"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{selectedFile.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatFileSize(selectedFile.size)} • {selectedFile.type.replace('image/', '').toUpperCase()}</div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} /> Replace Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`upload-zone ${isDragOver ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          disabled={disabled}
        />
        <div className="upload-zone-icon">
          <UploadCloud size={34} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
          Upload Crop or Leaf Image
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
          Drag & drop your photograph here, or click to browse
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ pointerEvents: 'none' }}
        >
          <ImageIcon size={16} /> Browse from Device
        </button>
        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          Supported: JPG • JPEG • PNG • WEBP (Up to 15 MB)
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            border: '1px solid #f5c2c7'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
