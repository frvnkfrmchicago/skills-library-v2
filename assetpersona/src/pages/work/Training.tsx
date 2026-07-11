import SEOHead from '../../components/seo/SEOHead';
import PathwayInquiryForm, {
  type FieldDef,
} from '../../components/intake/PathwayInquiryForm';
import './work.css';

const FIELDS: FieldDef[] = [
  {
    name: 'org_name',
    label: 'Organization',
    type: 'text',
    required: true,
    placeholder: 'Company, agency, or team',
  },
  {
    name: 'learner_count',
    label: 'How many learners?',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick a band',
    options: [
      { value: 'sub-10', label: 'Under 10' },
      { value: '10-50', label: '10 – 50' },
      { value: '50-200', label: '50 – 200' },
      { value: '200+', label: '200 plus' },
    ],
  },
  {
    name: 'level',
    label: 'Current AI fluency',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick one',
    options: [
      { value: 'starter', label: 'Just starting' },
      { value: 'curious', label: 'Curious users' },
      { value: 'using', label: 'Using daily, want depth' },
      { value: 'mixed', label: 'Mixed across the team' },
    ],
  },
  {
    name: 'format',
    label: 'Format',
    type: 'select',
    required: true,
    placeholder: 'Pick one',
    options: [
      { value: 'workshop', label: 'Single workshop (half / full day)' },
      { value: 'cohort', label: 'Multi-week live cohort' },
      { value: 'async', label: 'Async curriculum' },
      { value: 'blended', label: 'Blended (live + async)' },
      { value: 'open', label: 'Help me pick' },
    ],
  },
  {
    name: 'target_dates',
    label: 'Target window',
    type: 'text',
    placeholder: 'e.g. "Q3 2026" or "before our offsite"',
  },
  {
    name: 'outcomes',
    label: 'What does success look like for your team?',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder:
      'Be specific. "Cut research time" beats "AI literacy" every time.',
  },
];

export default function TrainingPathway() {
  return (
    <>
      <SEOHead
        title="AI Training & Workshops for Teams · Asset Persona"
        description="Custom AI training, cohorts, and async curricula for teams of 5 to 500. Built around your tools and outputs."
        path="/work/training"
      />
      <main className="work-page">
        <PathwayInquiryForm
          formType="training"
          fields={FIELDS}
          heading="AI training your team will actually use Monday."
          subhead="Custom curriculum, your tools, your outputs. Workshops, cohorts, or async."
          intro={
            <ul>
              <li>Built around your real workflows, not generic prompt lists.</li>
              <li>Live + async options for distributed teams.</li>
              <li>Outcomes-first: every module ties to a measurable shift.</li>
            </ul>
          }
          submitLabel="Send Training Inquiry"
        />
      </main>
    </>
  );
}
