import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe, DeviceMobile, ChartBar,
  PuzzlePiece, Lightning, Robot,
  ArrowLeft, ArrowRight, Check,
  PaintBrush, Eye
} from '@phosphor-icons/react';
import { Mail, User, AtSign, HelpCircle } from 'lucide-react';
import SEOHead from '../seo/SEOHead';
import './IntakeFlow.css';

const PRODUCT_TYPES = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'app', label: 'Mobile App', icon: DeviceMobile },
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
  { id: 'extension', label: 'Extension', icon: PuzzlePiece },
  { id: 'automation', label: 'Automation', icon: Lightning },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Robot },
];

const PATH_OPTIONS = [
  {
    id: 'public',
    label: 'Build in Public',
    price: 'Free',
    perks: [
      'Content featured on Asset Blog',
      'Dev process documented and shared',
      'Portfolio-ready build',
      'Community visibility through Asset Persona',
    ],
  },
  {
    id: 'private',
    label: 'Build in Private',
    price: 'Paid',
    perks: [
      'Full confidentiality and NDA',
      'Private repo and deployments',
      'Priority scheduling and support',
      'Source code and full ownership transfer',
    ],
  },
];

interface FormState {
  productType: string;
  inspirationUrl: string;
  inspirationNotes: string;
  name: string;
  email: string;
  social: string;
  howHeard: string;
  path: string;
}

export default function IntakeFlow() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    productType: searchParams.get('type') || '',
    inspirationUrl: '',
    inspirationNotes: '',
    name: '',
    email: '',
    social: '',
    howHeard: '',
    path: searchParams.get('path') || '',
  });

  const STEPS = ['Product', 'Inspiration', 'About You', 'Path', 'Review'];
  const totalSteps = STEPS.length;

  const updateField = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!form.productType;
      case 1: return true;
      case 2: return !!form.name && !!form.email;
      case 3: return !!form.path;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = () => {
    // TODO: connect to webhook
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <SEOHead title="Application Received" path="/start" />
        <main className="intake">
          <div className="container container--narrow">
            <div className="intake__success liquid-glass">
              <Check size={48} weight="bold" className="intake__success-icon" />
              <h2>Application received.</h2>
              <p>We will review your intake and be in touch within 48 hours.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Start Building" path="/start" />
      <main className="intake">
        <div className="container container--narrow">
          <div className="intake__progress">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`intake__step-dot ${i <= step ? 'intake__step-dot--active' : ''} ${i < step ? 'intake__step-dot--done' : ''}`}
              >
                <span className="intake__step-label">{label}</span>
              </div>
            ))}
            <div
              className="intake__progress-bar"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          <div className="intake__body">
            {step === 0 && (
              <div className="intake__section">
                <h2>What are you building?</h2>
                <p className="intake__desc">Pick the product type that matches your idea.</p>
                <div className="intake__grid-6">
                  {PRODUCT_TYPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={`intake__type-card ${form.productType === id ? 'intake__type-card--selected' : ''}`}
                      onClick={() => updateField('productType', id)}
                      type="button"
                    >
                      <Icon size={28} weight="duotone" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="intake__section">
                <h2>Share your inspiration</h2>
                <p className="intake__desc">
                  Drop a link to an app, site, or design that captures the feel you want.
                  Browse <a href="https://mobbin.com" target="_blank" rel="noopener noreferrer">Mobbin</a> for ideas.
                </p>
                <div className="intake__field">
                  <label htmlFor="intake-url">Inspiration URL</label>
                  <input
                    id="intake-url"
                    type="url"
                    value={form.inspirationUrl}
                    onChange={(e) => updateField('inspirationUrl', e.target.value)}
                    placeholder="https://mobbin.com/apps/..."
                  />
                </div>
                <div className="intake__field">
                  <label htmlFor="intake-notes">What do you like about it?</label>
                  <textarea
                    id="intake-notes"
                    rows={4}
                    value={form.inspirationNotes}
                    onChange={(e) => updateField('inspirationNotes', e.target.value)}
                    placeholder="The onboarding flow is clean, the color palette feels premium..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="intake__section">
                <h2>About you</h2>
                <p className="intake__desc">Basic information so we can follow up.</p>
                <div className="intake__field">
                  <label htmlFor="intake-name">
                    <User size={16} /> Name
                  </label>
                  <input
                    id="intake-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="intake__field">
                  <label htmlFor="intake-email">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    id="intake-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <div className="intake__field">
                  <label htmlFor="intake-social">
                    <AtSign size={16} /> Social (optional)
                  </label>
                  <input
                    id="intake-social"
                    type="text"
                    value={form.social}
                    onChange={(e) => updateField('social', e.target.value)}
                    placeholder="@handle or profile URL"
                  />
                </div>
                <div className="intake__field">
                  <label htmlFor="intake-how">
                    <HelpCircle size={16} /> How did you hear about us?
                  </label>
                  <input
                    id="intake-how"
                    type="text"
                    value={form.howHeard}
                    onChange={(e) => updateField('howHeard', e.target.value)}
                    placeholder="Instagram, referral, search..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="intake__section">
                <h2>Choose your path</h2>
                <p className="intake__desc">Both paths result in a shipped product. The difference is visibility.</p>
                <div className="intake__paths">
                  {PATH_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className={`intake__path-card ${form.path === option.id ? 'intake__path-card--selected' : ''}`}
                      onClick={() => updateField('path', option.id)}
                      type="button"
                    >
                      <div className="intake__path-header">
                        {option.id === 'public' ? (
                          <Eye size={24} weight="duotone" />
                        ) : (
                          <PaintBrush size={24} weight="duotone" />
                        )}
                        <h3>{option.label}</h3>
                        <span className={`intake__path-price ${option.id === 'public' ? 'intake__path-price--free' : ''}`}>
                          {option.price}
                        </span>
                      </div>
                      <ul className="intake__path-perks">
                        {option.perks.map((perk) => (
                          <li key={perk}>
                            <Check size={14} weight="bold" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="intake__section">
                <h2>Review your intake</h2>
                <div className="intake__review liquid-glass">
                  <div className="intake__review-row">
                    <span>Product</span>
                    <strong>{PRODUCT_TYPES.find(p => p.id === form.productType)?.label || 'Not selected'}</strong>
                  </div>
                  <div className="intake__review-row">
                    <span>Inspiration</span>
                    <strong>{form.inspirationUrl || 'None provided'}</strong>
                  </div>
                  <div className="intake__review-row">
                    <span>Name</span>
                    <strong>{form.name}</strong>
                  </div>
                  <div className="intake__review-row">
                    <span>Email</span>
                    <strong>{form.email}</strong>
                  </div>
                  <div className="intake__review-row">
                    <span>Path</span>
                    <strong>{PATH_OPTIONS.find(p => p.id === form.path)?.label || 'Not selected'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="intake__nav">
            {step > 0 && (
              <button
                className="btn btn--ghost"
                onClick={() => setStep(step - 1)}
                type="button"
              >
                <ArrowLeft size={16} weight="bold" />
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < totalSteps - 1 ? (
              <button
                className="btn btn--primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                type="button"
              >
                Continue
                <ArrowRight size={16} weight="bold" />
              </button>
            ) : (
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                type="button"
              >
                <Check size={16} weight="bold" />
                Submit Application
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
