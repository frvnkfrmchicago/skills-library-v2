import { useState } from 'react';
import { 
  X, 
  UploadSimple, 
  Sparkle, 
  Clock, 
  CheckCircle,
  Warning
} from '@phosphor-icons/react';

interface CertUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CertUpload({ onClose, onSuccess }: CertUploadProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [certId, setCertId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Security check: validate size and type
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      setStatus('error');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(selected.type)) {
      setErrorMsg('Unsupported file format. Use PNG, JPG, or PDF.');
      setStatus('error');
      return;
    }

    setFile(selected);
    setErrorMsg('');
    setStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer || !file) {
      setErrorMsg('Please fill in all required fields and upload your certificate file.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    // Validation + processing delay, then add the credential.
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    }, 2000);
  };

  return (
    <div className="portfolio-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="cert-upload-title">
      <div className="portfolio-editor community-card" style={{ maxWidth: '480px', width: '90%' }}>
        <header className="portfolio-editor__header">
          <h2 id="cert-upload-title">Verify Outside Credentials</h2>
          <button type="button" className="portfolio-editor__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl) 0', gap: 'var(--space-md)' }}>
            <Clock size={40} className="glow-icon-amber" style={{ animation: 'spin 2s linear infinite' }} />
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Analyzing credential metadata...</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '30ch' }}>
              Parsing files and signing transaction onto local profile grid.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl) 0', gap: 'var(--space-md)' }}>
            <CheckCircle size={48} weight="fill" className="animate-pulse" style={{ color: 'var(--color-text-primary)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Verification successful</h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'var(--color-surface, rgba(255,255,255,0.04))', border: '1px solid var(--color-border)', padding: '4px 12px', borderRadius: 'var(--radius-md)' }}>
              <Sparkle size={14} weight="fill" style={{ color: 'var(--color-text-secondary)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Added to your credentials</span>
            </div>
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <form onSubmit={handleSubmit} className="portfolio-editor__form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: 'var(--text-xs)' }}>
                <Warning size={16} /> {errorMsg}
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label htmlFor="cert-title" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Certificate Name *</label>
              <input
                id="cert-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prompt Engineering Mastery"
                style={{ background: '#09090b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label htmlFor="cert-issuer" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Issuing Organization *</label>
              <input
                id="cert-issuer"
                type="text"
                required
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. DeepLearning.AI"
                style={{ background: '#09090b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label htmlFor="cert-id" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Credential ID (Optional)</label>
              <input
                id="cert-id"
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. CERT-993-882"
                style={{ background: '#09090b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Upload Certificate File *</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                <UploadSimple size={24} style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {file ? file.name : 'Choose file (PNG, JPG, PDF up to 5MB)'}
                </span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  required
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn--primary btn--sm" style={{ flex: 1 }}>
                Verify credential
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
