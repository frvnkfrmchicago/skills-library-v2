import SEOHead from '../../components/seo/SEOHead';
import PathwayInquiryForm, {
  type FieldDef,
} from '../../components/intake/PathwayInquiryForm';
import './work.css';

const FIELDS: FieldDef[] = [
  {
    name: 'event_name',
    label: 'Event name',
    type: 'text',
    required: true,
    placeholder: 'Conference, summit, internal offsite',
  },
  {
    name: 'event_date',
    label: 'Event date',
    type: 'date',
    required: true,
    half: true,
  },
  {
    name: 'audience_size',
    label: 'Audience size',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick a band',
    options: [
      { value: 'sub-50', label: 'Under 50' },
      { value: '50-200', label: '50 – 200' },
      { value: '200-1000', label: '200 – 1,000' },
      { value: '1000+', label: '1,000 plus' },
    ],
  },
  {
    name: 'format',
    label: 'Format',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick one',
    options: [
      { value: 'keynote', label: 'Keynote' },
      { value: 'panel', label: 'Panel' },
      { value: 'workshop', label: 'Workshop' },
      { value: 'fireside', label: 'Fireside chat' },
    ],
  },
  {
    name: 'venue_type',
    label: 'In-person or virtual',
    type: 'select',
    required: true,
    half: true,
    placeholder: 'Pick one',
    options: [
      { value: 'in-person', label: 'In-person' },
      { value: 'virtual', label: 'Virtual' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
  },
  {
    name: 'topic',
    label: 'Topic or angle',
    type: 'text',
    required: true,
    placeholder: 'AI literacy, the AI economy, founder workflows...',
  },
  {
    name: 'budget',
    label: 'Speaker budget',
    type: 'select',
    required: false,
    placeholder: 'Pick a band (optional)',
    options: [
      { value: 'sub-5k', label: 'Under $5,000' },
      { value: '5-15k', label: '$5,000 – $15,000' },
      { value: '15-30k', label: '$15,000 – $30,000' },
      { value: '30k+', label: '$30,000+' },
      { value: 'open', label: 'Open / depends on fit' },
    ],
  },
  {
    name: 'context',
    label: 'Anything else I should know?',
    type: 'textarea',
    rows: 4,
    placeholder: 'Audience makeup, sponsor context, format quirks.',
  },
];

export default function SpeakingPathway() {
  return (
    <>
      <SEOHead
        title="Book Frank for Keynote or Workshop · Asset Persona"
        description="Conference keynotes, panels, and corporate offsites on AI literacy and the AI economy. Tell me about your event."
        path="/work/speaking"
      />
      <main className="work-page">
        <PathwayInquiryForm
          formType="speaking"
          fields={FIELDS}
          heading="Talks that translate AI hype into action."
          subhead="Drop the event details. I confirm fit, dates, and fee within the same reply."
          intro={
            <ul>
              <li>Plain-language keynotes built on real demos and case data.</li>
              <li>Custom angle for your audience. Never a stock deck.</li>
              <li>Travel-ready or virtual; comfortable on stage and on camera.</li>
            </ul>
          }
          submitLabel="Send Speaking Inquiry"
        />
      </main>
    </>
  );
}
