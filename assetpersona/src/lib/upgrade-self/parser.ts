export interface ParserNode {
  id: string;
  type: string;
  data: {
    label: string;
    details?: string;
    level: number;
  };
  position: { x: number; y: number };
}

export interface ParserEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface CheatsheetSection {
  title: string;
  content: string[];
}

export interface UpgradeSelfResult {
  nodes: ParserNode[];
  edges: ParserEdge[];
  cheatsheet: CheatsheetSection[];
  summary: string;
}

/**
 * Pure client-side parser to transform arbitrary Markdown documents 
 * into interactive mind-maps and summary cheatsheets.
 */
export function parseMarkdownToMindMap(markdown: string): UpgradeSelfResult {
  const lines = markdown.split('\n');
  const nodes: ParserNode[] = [];
  const edges: ParserEdge[] = [];
  const cheatsheet: CheatsheetSection[] = [];
  
  let rootNodeId = 'root';
  let currentHeader2Id = '';
  let currentHeader3Id = '';
  
  // Default values if markdown is empty
  let documentTitle = 'Self-Upgrade Node';
  let documentSummary = 'Parsed knowledge structure.';
  
  let currentSection: CheatsheetSection | null = null;
  let sectionContentAccumulator: string[] = [];

  // 1. Initial Pass to extract structure
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect Document Title (# Title)
    if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
      documentTitle = trimmed.replace(/^#\s+/, '');
      rootNodeId = `node_h1_${index}`;
      nodes.push({
        id: rootNodeId,
        type: 'input',
        data: { label: documentTitle, level: 1, details: 'Root node for ingested context.' },
        position: { x: 250, y: 50 }
      });
      
      if (currentSection) {
        currentSection.content = [...sectionContentAccumulator];
        cheatsheet.push(currentSection);
      }
      currentSection = { title: documentTitle, content: [] };
      sectionContentAccumulator = [];
    }
    // Detect Level 2 Themes (## Subtitle)
    else if (trimmed.startsWith('##') && !trimmed.startsWith('###')) {
      const title = trimmed.replace(/^##\s+/, '');
      currentHeader2Id = `node_h2_${index}`;
      
      nodes.push({
        id: currentHeader2Id,
        type: 'default',
        data: { label: title, level: 2 },
        position: { x: 0, y: 0 } // Position will be laid out below
      });
      
      edges.push({
        id: `edge_${rootNodeId}_${currentHeader2Id}`,
        source: rootNodeId,
        target: currentHeader2Id,
        animated: true,
        style: { stroke: '#f5a623', strokeWidth: 2 }
      });

      if (currentSection) {
        currentSection.content = [...sectionContentAccumulator];
        cheatsheet.push(currentSection);
      }
      currentSection = { title, content: [] };
      sectionContentAccumulator = [];
    }
    // Detect Level 3 Subthemes (### Heading3)
    else if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s+/, '');
      currentHeader3Id = `node_h3_${index}`;
      
      nodes.push({
        id: currentHeader3Id,
        type: 'output',
        data: { label: title, level: 3 },
        position: { x: 0, y: 0 }
      });
      
      const parentId = currentHeader2Id || rootNodeId;
      edges.push({
        id: `edge_${parentId}_${currentHeader3Id}`,
        source: parentId,
        target: currentHeader3Id,
        style: { stroke: 'rgba(255,255,255,0.2)' }
      });
    }
    // Accumulate description bullets under active section
    else {
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-*\d.]+\s+/, '');
        sectionContentAccumulator.push(bulletText);
        
        // Append bullet details to active leaf node
        const activeNode = nodes[nodes.length - 1];
        if (activeNode && activeNode.id !== rootNodeId) {
          if (!activeNode.data.details) activeNode.data.details = '';
          activeNode.data.details += `• ${bulletText}\n`;
        }
      } else {
        sectionContentAccumulator.push(trimmed);
        const activeNode = nodes[nodes.length - 1];
        if (activeNode && activeNode.id !== rootNodeId) {
          if (!activeNode.data.details) activeNode.data.details = '';
          activeNode.data.details += `${trimmed}\n`;
        }
      }
    }
  }

  // Push last section
  if (currentSection) {
    currentSection.content = [...sectionContentAccumulator];
    cheatsheet.push(currentSection);
  }

  // Ensure root node exists even if header is missing
  if (nodes.length === 0) {
    nodes.push({
      id: rootNodeId,
      type: 'input',
      data: { label: documentTitle, level: 1, details: documentSummary },
      position: { x: 250, y: 50 }
    });
  }

  // 2. Lay out nodes in radial or hierarchical coordinates
  // Root node is at (250, 50)
  const h2Nodes = nodes.filter(n => n.data.level === 2);
  const h3Nodes = nodes.filter(n => n.data.level === 3);

  // Layout H2 nodes in a horizontal arc or offset rows
  h2Nodes.forEach((node, i) => {
    const totalH2 = h2Nodes.length;
    const spacing = 350;
    const startX = 250 - ((totalH2 - 1) * spacing) / 2;
    node.position = {
      x: startX + i * spacing,
      y: 200
    };
    
    // Layout corresponding H3 child nodes directly below their H2 parent
    const childH3 = h3Nodes.filter(h3 => 
      edges.some(e => e.source === node.id && e.target === h3.id)
    );
    childH3.forEach((h3, j) => {
      const childSpacing = 160;
      const childStartX = node.position.x - ((childH3.length - 1) * childSpacing) / 2;
      h3.position = {
        x: childStartX + j * childSpacing,
        y: 380
      };
    });
  });

  // Extract initial dynamic summary from first section
  if (cheatsheet.length > 0 && cheatsheet[0].content.length > 0) {
    documentSummary = cheatsheet[0].content.join(' ').slice(0, 180) + '...';
  }

  return {
    nodes,
    edges,
    cheatsheet,
    summary: documentSummary
  };
}

/**
 * Default example markdown to populate the Knowledge Map on first load.
 */
export const DEFAULT_UPGRADE_MARKDOWN = `# AI Literacy Fundamentals
## How LLMs Work
- Transformer architecture processes input tokens in parallel.
- Attention mechanism weighs relationships between all token pairs.
- Sampling parameters (temperature, top-p) control output diversity.
## Prompt Engineering
- System prompts set behavioral constraints and persona.
- Few-shot examples improve output consistency.
- Chain-of-thought prompting increases reasoning accuracy.
## Practical Applications
- Content generation automates drafts across formats.
- Code assistance accelerates debugging and prototyping.
- Data analysis extracts patterns from unstructured text.`;
