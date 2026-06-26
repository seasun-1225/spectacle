import React, { useState, useRef } from 'react';
import { useExperiences } from '../context/ExperienceContext';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.370/pdf.worker.min.mjs`;

export default function DocumentUpload() {
  const { parseDocumentContent, isGenerating } = useExperiences();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const extension = file.name.split('.').pop().toLowerCase();
    
    try {
      let extractedText = '';

      if (extension === 'txt') {
        extractedText = await readTxtFile(file);
      } else if (extension === 'pdf') {
        extractedText = await parsePdfFile(file);
      } else if (extension === 'docx') {
        extractedText = await parseDocxFile(file);
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
      }

      if (!extractedText.trim()) {
        throw new Error('No readable text found.');
      }

      await parseDocumentContent(extractedText, file.name);
      setSuccess(`Extracted: "${file.name}"`);
      setTimeout(() => setSuccess(''), 4000); // clear message after a bit
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const readTxtFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const parsePdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const parseDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Upload size={16} style={{ color: 'var(--accent)' }} />
          Insert Material
        </h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDF, DOCX, TXT</span>
      </div>

      <form 
        onDragEnter={handleDrag} 
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onSubmit={(e) => e.preventDefault()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-glass)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem 0.75rem',
          textAlign: 'center',
          background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
          cursor: 'pointer',
          transition: 'all var(--transition-normal)',
          position: 'relative'
        }}
        onClick={triggerFileInput}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple={false} 
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {loading || isGenerating ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--accent)', animation: 'spin 2s linear infinite' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Extracting Achievements...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Drag material file here or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span>
            </span>
          </div>
        )}
      </form>

      {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem'
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#a7f3d0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem'
        }}>
          <CheckCircle size={14} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
