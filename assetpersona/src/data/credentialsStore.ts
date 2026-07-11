export interface Credential {
  id: string;
  recipientName: string;
  recipientTitle: string;
  courseOrTestName: string;
  type: 'Course Certificate' | 'Assessment Certification';
  issueDate: string;
  verificationCode: string;
  score: number;
  percentile: string;
  skillsCovered: string[];
}

const DEFAULT_CREDENTIALS: Credential[] = [
  {
    id: 'cred_prompt_eng',
    recipientName: 'Frank Lawrence',
    recipientTitle: 'AI Content Strategist & Prompt Engineer',
    courseOrTestName: 'Advanced Prompt Engineering & Chain-of-Thought',
    type: 'Course Certificate',
    issueDate: '2026-05-10',
    verificationCode: 'CERT-PE-8893',
    score: 96,
    percentile: 'Top 2%',
    skillsCovered: ['Few-shot prompting', 'System instructions', 'Reasoning templates', 'Jailbreak defense'],
  },
  {
    id: 'cred_json_master',
    recipientName: 'Frank Lawrence',
    recipientTitle: 'AI Content Strategist & Prompt Engineer',
    courseOrTestName: 'JSON Schema & Structured Tool Calling',
    type: 'Assessment Certification',
    issueDate: '2026-05-15',
    verificationCode: 'CERT-JC-9120',
    score: 92,
    percentile: 'Top 6%',
    skillsCovered: ['JSON schema validation', 'Function calling signatures', 'Type-safety overrides', 'Strict formatting'],
  },
];

const STORAGE_KEY = 'ap_user_credentials';

function loadCredentials(): Credential[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
    return DEFAULT_CREDENTIALS;
  }
  return JSON.parse(raw) as Credential[];
}

export function getCredentials(): Promise<Credential[]> {
  return Promise.resolve(loadCredentials());
}

export function getCredentialByCode(code: string): Promise<Credential | null> {
  const creds = loadCredentials();
  const found = creds.find(c => c.verificationCode.toLowerCase() === code.trim().toLowerCase());
  return Promise.resolve(found ?? null);
}

export function generateLinkedInShareUrl(cred: Credential): string {
  const name = encodeURIComponent(cred.courseOrTestName);
  const organizationName = encodeURIComponent('Persona Studio');
  const certId = encodeURIComponent(cred.verificationCode);
  const certUrl = encodeURIComponent(`${window.location.origin}/community/credentials/${cred.verificationCode}`);
  
  // LinkedIn Add to Profile URL format
  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${organizationName}&certId=${certId}&certUrl=${certUrl}`;
}
