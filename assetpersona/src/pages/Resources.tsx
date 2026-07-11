import { Link } from 'react-router-dom';
import { ArrowRight, Download, BookOpen, FileText, Zap } from 'lucide-react';
import { Sparkle } from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import { useStaggerReveal } from '../hooks/useGSAP';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { track } from '../lib/analytics';
import './Resources.css';

interface FreeResource {
  icon: typeof Download;
  title: string;
  description: string;
  type: string;
  fileName: string;
}

const FREE_RESOURCES: FreeResource[] = [
  {
    icon: Download,
    title: 'Ship Free APIs Directory',
    description: 'Direct link to the verified directory of 52 free-tier and keyless APIs for fast-shipping developers.',
    type: 'Directory',
    fileName: 'ship-free-apis.pdf',
  },
  {
    icon: Zap,
    title: 'Asset Persona Agentic Centre',
    description: 'Operates as an AI-powered multi-pipeline content engine synchronizing Threads, LinkedIn, n8n, and Supabase.',
    type: 'Command Centre',
    fileName: 'agentic-centre-guide.pdf',
  },
  {
    icon: FileText,
    title: 'AI Starter Checklist',
    description: 'A simple checklist to evaluate your AI readiness. Covers tools, skills, and mindset.',
    type: 'PDF',
    fileName: 'ai-starter-checklist.pdf',
  },
  {
    icon: Zap,
    title: '10 Prompts That Actually Work',
    description: 'Battle-tested prompts for writing, coding, analysis, and image generation.',
    type: 'PDF',
    fileName: '10-prompts-that-work.pdf',
  },
  {
    icon: BookOpen,
    title: 'Vibe Coding 101 Guide',
    description: 'Your first steps into building with AI. Covers setup, tools, and your first project.',
    type: 'Guide',
    fileName: 'vibe-coding-101.pdf',
  },
  {
    icon: Download,
    title: 'AI Tool Comparison Chart',
    description: 'Side-by-side comparison of the top AI tools for creatives, marketers, and developers.',
    type: 'Spreadsheet',
    fileName: 'ai-tool-comparison.xlsx',
  },
];

export default function Resources() {
  const containerRef = useStaggerReveal('.resources__card', {
    stagger: 0.1,
    y: 30,
    duration: 0.6,
  });

  const handleDownload = async (resource: FreeResource) => {
    track('post_view', { kind: 'free_resource_download', resource: resource.title });

    if (isSupabaseConfigured) {
      // Construct public storage download URL
      const { data } = supabase.storage.from('digital-products').getPublicUrl(resource.fileName);
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
        return;
      }
    }

    // Local fallback/warning if Supabase is offline/not configured
    alert(`Supabase is not configured. (Simulated download for: "${resource.fileName}" initiated)`);
  };

  return (
    <>
      <SEOHead
        title="Free Resources: AI Guides & Tools | Asset Persona"
        description="Free AI learning resources, starter guides, prompt templates, and tool comparisons. Start your AI journey today."
      />

      <section className="resources">
        <div className="container">
          <div className="resources__hero">
            <p className="text-uppercase text-accent-blue">
              <Sparkle size={18} weight="duotone" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Free Resources
            </p>
            <h1 className="resources__title">
              Start Here. <span className="text-accent-salmon">Free.</span>
            </h1>
            <p className="resources__subtitle">
              Free guides, checklists, and tools to start your AI journey. No email required. Just download and go.
            </p>
          </div>

          <div className="resources__grid" ref={containerRef}>
            {FREE_RESOURCES.map((resource) => (
              <div key={resource.title} className="resources__card liquid-glass border-glow">
                <div className="resources__card-icon-wrap">
                  <resource.icon size={24} />
                </div>
                <span className="resources__card-type">{resource.type}</span>
                <h2 className="resources__card-title">{resource.title}</h2>
                <p className="resources__card-desc">{resource.description}</p>
                <button 
                  className="btn btn--secondary resources__card-cta"
                  onClick={() => handleDownload(resource)}
                >
                  <Download size={14} /> Download Free
                </button>
              </div>
            ))}
          </div>

          {/* Upsell */}
          <div className="resources__upsell liquid-glass">
            <div className="resources__upsell-content">
              <h2>Want more?</h2>
              <p>
                Check out our premium templates, workbooks, and the full Agentic Study Hall curriculum for deeper learning.
              </p>
            </div>
            <div className="resources__upsell-actions">
              <Link to="/shop" className="btn btn--primary">
                Browse Products <ArrowRight size={16} />
              </Link>
              <Link to="/agenticstudyhall" className="btn btn--secondary">
                Explore Agentic Study Hall
              </Link>
            </div>
          </div>

          {/* Blog highlight */}
          <div className="resources__blog-section">
            <h2 className="resources__blog-title">From the Blog</h2>
            <p className="resources__blog-subtitle">
              Deep dives into AI literacy, vibe coding, and building in the digital economy.
            </p>
            <Link to="/blog" className="resources__blog-link">
              Read the Blog <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
