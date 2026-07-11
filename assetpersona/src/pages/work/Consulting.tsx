import SEOHead from '../../components/seo/SEOHead';
import PathwayInquiryForm, {
  type FieldDef,
} from '../../components/intake/PathwayInquiryForm';
import './work.css';

const FIELDS: FieldDef[] = [
  {
    name: 'industry',
    label: 'Industry',
    type: 'text',
    placeholder: 'e.g. real estate, SaaS, healthtech',
    required: true,
    half: true,
  },
  {
    name: 'team_size',
    label: 'Team size',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick a band',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: '2-10', label: '2 to 10' },
      { value: '11-50', label: '11 to 50' },
      { value: '51-200', label: '51 to 200' },
      { value: '200+', label: '200 plus' },
    ],
  },
  {
    name: 'current_ai_use',
    label: 'How is your team using AI today?',
    type: 'select',
    required: true,
    placeholder: 'Pick the closest',
    options: [
      { value: 'none', label: 'Not really using it' },
      { value: 'individual', label: 'A few people use it ad hoc' },
      { value: 'tools', label: 'We pay for tools, no system' },
      { value: 'systems', label: 'We have systems, want to scale' },
    ],
  },
  {
    name: 'budget',
    label: 'Engagement budget',
    type: 'select',
    required: true,
    placeholder: 'Pick a band',
    options: [
      { value: 'sub-5k', label: 'Under $5,000' },
      { value: '5-15k', label: '$5,000 – $15,000' },
      { value: '15-50k', label: '$15,000 – $50,000' },
      { value: '50k+', label: '$50,000+' },
      { value: 'open', label: 'Open / depends on scope' },
    ],
  },
  {
    name: 'goal',
    label: 'What do you want to be true in 90 days?',
    type: 'textarea',
    required: true,
    placeholder: 'One paragraph is fine.',
    rows: 4,
  },
];

export default function ConsultingPathway() {
  return (
    <>
      <SEOHead
        title="AI Consulting with Frank Lawrence Jr. — Asset Persona"
        description="Strategy, audit, and hands-on AI implementation for founders and teams. Tell me about your situation and I will reply personally."
        path="/work/consulting"
      />
      <main className="work-page">
        <PathwayInquiryForm
          formType="consult"
          fields={FIELDS}
          heading="Let's get AI doing real work in your business."
          subhead="Tell me where you are and where you want to be. I read every inquiry."
          intro={
            <ul>
              <li>Audit + strategy engagement (single sprint or ongoing).</li>
              <li>Hands-on integration with your team's actual tools.</li>
              <li>Plain-language frameworks. No jargon, no vapor.</li>
            </ul>
          }
          submitLabel="Send Consulting Inquiry"
        />
      </main>
    </>
  );
}
