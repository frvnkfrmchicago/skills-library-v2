import SEOHead from '../../components/seo/SEOHead';
import PathwayInquiryForm, {
  type FieldDef,
} from '../../components/intake/PathwayInquiryForm';
import './work.css';

const FIELDS: FieldDef[] = [
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    required: true,
    placeholder: 'Brand or company name',
  },
  {
    name: 'scope',
    label: 'What do you need help with?',
    type: 'select',
    required: true,
    placeholder: 'Pick the closest',
    options: [
      { value: 'content', label: 'Content systems + production' },
      { value: 'brand-voice', label: 'Brand voice + messaging' },
      { value: 'ai-production', label: 'AI-assisted creative production' },
      { value: 'launch', label: 'Launch or campaign sprint' },
      { value: 'audit', label: 'Marketing audit + strategy' },
      { value: 'mixed', label: 'Mixed / talk it out' },
    ],
  },
  {
    name: 'channels',
    label: 'Primary channels',
    type: 'text',
    placeholder: 'e.g. LinkedIn, YouTube, email, paid social',
    half: true,
  },
  {
    name: 'audience',
    label: 'Target audience',
    type: 'text',
    placeholder: 'e.g. SMB founders, enterprise marketers',
    half: true,
  },
  {
    name: 'budget',
    label: 'Monthly marketing budget',
    type: 'select',
    placeholder: 'Pick a band (optional)',
    options: [
      { value: 'sub-5k', label: 'Under $5,000 / mo' },
      { value: '5-15k', label: '$5,000 – $15,000 / mo' },
      { value: '15-50k', label: '$15,000 – $50,000 / mo' },
      { value: '50k+', label: '$50,000+ / mo' },
      { value: 'one-off', label: 'One-off project, not ongoing' },
    ],
  },
  {
    name: 'context',
    label: 'What\'s the situation?',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder:
      'Where you are, where you want to be, what you have already tried.',
  },
];

export default function MarketingPathway() {
  return (
    <>
      <SEOHead
        title="Marketing Services · Asset Persona"
        description="Hands-on marketing support for founders. Content systems, brand voice, AI-assisted production. Senior thinking, real output."
        path="/work/marketing"
      />
      <main className="work-page">
        <PathwayInquiryForm
          formType="marketing"
          fields={FIELDS}
          heading="Senior marketing thinking. Real output."
          subhead="For founders who need a senior brain on the work, not another templated agency."
          intro={
            <ul>
              <li>Content systems and AI-assisted creative production.</li>
              <li>Brand voice that survives both your intern and your CEO.</li>
              <li>Senior-only. I do the work, not a junior under my name.</li>
            </ul>
          }
          submitLabel="Send Marketing Inquiry"
        />
      </main>
    </>
  );
}
