import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, LinkedinLogo, Printer, MagnifyingGlass, Sparkle, Copy } from '@phosphor-icons/react';
import { getCredentialByCode, generateLinkedInShareUrl } from '../../data/credentialsStore';
import type { Credential } from '../../data/credentialsStore';
import SubTabs from '../../components/community/SubTabs';
import './CredentialDetail.css';

const PORTFOLIO_TABS = [
  { to: '/community/portfolio', label: 'Projects' },
  { to: '/community/credentials', label: 'Credentials' },
  { to: '/community/showcase', label: 'Showcase' },
  { to: '/community/saved', label: 'Saved' },
];

export default function CredentialDetail() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const [searchCode, setSearchCode] = useState(code || '');
  const [credential, setCredential] = useState<Credential | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      handleVerify(code);
    }
  }, [code]);

  const handleVerify = async (verifyCode: string) => {
    setErrorMsg('');
    const found = await getCredentialByCode(verifyCode);
    if (found) {
      setCredential(found);
      setSearchCode(found.verificationCode);
    } else {
      setCredential(null);
      setErrorMsg('No credential found matching this verification code. Please check the code and try again.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/community/credentials/${searchCode.trim()}`);
      handleVerify(searchCode.trim());
    }
  };

  const handleCopyLink = () => {
    if (!credential) return;
    const link = `${window.location.origin}/community/credentials/${credential.verificationCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="credential-page">
      <SubTabs tabs={PORTFOLIO_TABS} />
      <div className="verify-top-search">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <MagnifyingGlass size={18} className="search-icon" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Verify credential ID (e.g. CERT-PE-8893)"
            className="search-input"
            required
          />
          <button type="submit" className="search-submit">
            Verify ID
          </button>
        </form>
        {errorMsg && <p className="verify-error">{errorMsg}</p>}
      </div>

      {credential ? (
        <div className="credential-layout">
          {/* Print/Verify container */}
          <div className="certificate-container-wrapper">
            <div ref={certificateRef} className="certificate-card printable-certificate">
              {/* Gold borders and orbital glow */}
              <div className="cert-border-outer">
                <div className="cert-border-inner">
                  {/* Decorative corner brackets */}
                  <div className="cert-corner top-left"></div>
                  <div className="cert-corner top-right"></div>
                  <div className="cert-corner bottom-left"></div>
                  <div className="cert-corner bottom-right"></div>

                  <div className="cert-header">
                    <ShieldCheck size={40} className="cert-shield-icon" />
                    <h2>PERSONA STUDIO</h2>
                    <p className="cert-subtitle">OFFICIAL VERIFIED SKILLS CREDENTIAL</p>
                  </div>

                  <div className="cert-body">
                    <span className="cert-certifies">This certifies that</span>
                    <h1 className="recipient-name">{credential.recipientName}</h1>
                    <p className="recipient-title">{credential.recipientTitle}</p>
                    
                    <span className="cert-achievement">has successfully demonstrated mastery and completed</span>
                    <h3 className="course-title">{credential.courseOrTestName}</h3>
                    
                    <div className="stats-row">
                      <div className="stat-box">
                        <span className="stat-label">Final Score</span>
                        <span className="stat-val">{credential.score}%</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Rank Percentile</span>
                        <span className="stat-val">{credential.percentile}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cert-footer">
                    <div className="footer-col">
                      <span className="footer-label">Issue Date</span>
                      <span className="footer-val">{credential.issueDate}</span>
                    </div>
                    <div className="footer-col badge-col">
                      <div className="cert-seal">
                        <Sparkle size={20} className="seal-sparkle" />
                        <span className="seal-text">VERIFIED</span>
                      </div>
                    </div>
                    <div className="footer-col">
                      <span className="footer-label">Credential ID</span>
                      <span className="footer-val">{credential.verificationCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action sidebar */}
          <div className="credential-actions-sidebar">
            <div className="sidebar-card">
              <h3>Credential Details</h3>
              <p className="sidebar-desc">
                This credential is cryptographically verified against completed sandbox outputs, assessment scores, and prompt challenges.
              </p>

              <div className="skills-group">
                <h4>Skills Covered</h4>
                <div className="skills-flex">
                  {credential.skillsCovered.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="sidebar-buttons">
                <a
                  href={generateLinkedInShareUrl(credential)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn linkedin-btn"
                >
                  <LinkedinLogo size={18} /> Add to LinkedIn
                </a>
                
                <button onClick={handlePrint} className="action-btn secondary-btn">
                  <Printer size={18} /> Print / Save as PDF
                </button>

                <button onClick={handleCopyLink} className="action-btn secondary-btn">
                  {copied ? 'Link Copied!' : (
                    <>
                      <Copy size={18} /> Copy Verify Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-verify-lobby">
          <div className="lobby-shield-icon-wrapper">
            <ShieldCheck size={64} className="lobby-shield-icon" />
          </div>
          <h2>Skills Registry & Verification</h2>
          <p>
            Enter a verification code above to authenticate a completion certificate. All credentials issued by Persona Studio are cryptographically linked to individual user profiles and sandbox evaluation tests.
          </p>
          <div className="example-ids">
            <span>Try entering:</span>
            <button onClick={() => handleVerify('CERT-PE-8893')} className="id-btn">
              CERT-PE-8893
            </button>
            <button onClick={() => handleVerify('CERT-JC-9120')} className="id-btn">
              CERT-JC-9120
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
