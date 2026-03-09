/**
 * Build script: reads all markdown files from the skills library
 * and generates a skills.json data file for the platform.
 */
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import matter from 'gray-matter'

const ROOT = path.resolve(__dirname, '../../')
const OUTPUT = path.resolve(__dirname, '../src/data/skills.json')

interface SkillEntry {
  id: string
  name: string
  description: string
  category: string
  path: string
  relativePath: string
  size: number
  lastUpdated: string
  content: string
  tags: string[]
  relatedSkills: string[]
}

function getCategory(filePath: string): string {
  const rel = path.relative(ROOT, filePath)
  if (rel.startsWith('librarians/')) return 'Librarians'
  if (rel.startsWith('agents/')) return 'Agents'
  if (rel.startsWith('workflows/')) return 'Workflows'
  if (rel.startsWith('platforms/')) return 'Platforms'
  if (rel.startsWith('content/')) return 'Content'
  if (rel.startsWith('app-types/')) return 'App Types'
  if (rel.startsWith('tech-stack/')) return 'Tech Stack'
  if (rel.startsWith('direct-paths/')) return 'Direct Paths'
  return 'Other'
}

function extractTags(content: string): string[] {
  const tags: string[] = []
  const lc = content.toLowerCase()
  const tagMap: Record<string, string> = {
    'react': 'React', 'next.js': 'Next.js', 'typescript': 'TypeScript',
    'supabase': 'Supabase', 'firebase': 'Firebase', 'tailwind': 'Tailwind',
    'phaser': 'Phaser.js', 'three.js': 'Three.js', 'canvas': 'Canvas',
    'vercel': 'Vercel', 'cloudflare': 'Cloudflare', 'github actions': 'CI/CD',
    'docker': 'Docker', 'prisma': 'Prisma', 'drizzle': 'Drizzle',
    'websocket': 'WebSocket', 'graphql': 'GraphQL', 'rest': 'REST',
    'mobile': 'Mobile', 'responsive': 'Responsive', 'animation': 'Animation',
    'testing': 'Testing', 'security': 'Security', 'performance': 'Performance',
    'deployment': 'Deployment', 'design': 'Design', 'accessibility': 'Accessibility',
    'ai': 'AI', 'machine learning': 'ML', 'llm': 'LLM',
  }
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lc.includes(keyword)) tags.push(tag)
  }
  return [...new Set(tags)].slice(0, 8)
}

function extractRelatedSkills(content: string): string[] {
  const matches = content.match(/\[([^\]]+)\]\([^)]*librarian[^)]*\.md\)/g) || []
  return matches.map(m => {
    const name = m.match(/\[([^\]]+)\]/)?.[1] || ''
    return name
  }).filter(Boolean).slice(0, 6)
}

function buildData() {
  const patterns = [
    'librarians/*.md',
    'agents/*/SKILL.md',
    'workflows/*/SKILL.md',
    'platforms/*/SKILL.md',
    'content/*/SKILL.md',
    'app-types/*/SKILL.md',
    'tech-stack/*.md',
  ]

  const allFiles: string[] = []
  for (const pattern of patterns) {
    const found = globSync(pattern, { cwd: ROOT, absolute: true })
    allFiles.push(...found)
  }

  const skills: SkillEntry[] = []

  for (const filePath of allFiles) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data: frontmatter, content } = matter(raw)
      const stat = fs.statSync(filePath)
      const relativePath = path.relative(ROOT, filePath)

      const id = relativePath
        .replace(/\//g, '-')
        .replace(/\.md$/, '')
        .replace(/SKILL$/, '')
        .replace(/-$/, '')
        .toLowerCase()

      skills.push({
        id,
        name: frontmatter.name || path.basename(filePath, '.md').replace(/-/g, ' '),
        description: frontmatter.description || '',
        category: getCategory(filePath),
        path: filePath,
        relativePath,
        size: stat.size,
        lastUpdated: frontmatter.last_updated || stat.mtime.toISOString().split('T')[0],
        content,
        tags: extractTags(content),
        relatedSkills: extractRelatedSkills(content),
      })
    } catch (err) {
      // Skip files that can't be read
    }
  }

  // Sort by category then name
  skills.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.name.localeCompare(b.name)
  })

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(skills, null, 2))

  console.log(`✅ Generated ${skills.length} skills`)
  console.log(`   Categories: ${[...new Set(skills.map(s => s.category))].join(', ')}`)
  console.log(`   Output: ${OUTPUT}`)
}

buildData()
