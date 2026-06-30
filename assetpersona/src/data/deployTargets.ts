/* ─────────────────────────────────────────────────────────────────────────
   Deploy & Ship: host catalog (SHIP step of the Study Hall loop)

   A "host" is the company that runs your project on the public internet so
   anyone with the link can open it. This file is the single source of truth
   for the four hosts a beginner is most likely to reach for in 2026, plus a
   tiny helper that recommends one based on what kind of project you built.

   The core lesson this data teaches: the host that is easiest to START on is
   not always the one that is cheapest to STAY on. Netlify and Vercel get a
   first project live in minutes. Cloudflare Pages costs the least once real
   traffic shows up, which is exactly why AssetPersona itself runs on it.

   Every fact below is checked against each host's own pricing and docs pages
   as of 2026. Plans change. The manageNotes call out the spots where a free
   plan can quietly turn into a bill so a learner knows where to look.
   ───────────────────────────────────────────────────────────────────────── */

export type DeployHostId = 'vercel' | 'netlify' | 'cloudflarePages' | 'githubPages';

/** How much a complete beginner has to learn before their first deploy works. */
export type DeployBarrier = 'lowest' | 'low' | 'medium';

/** The kind of project you built. Drives the recommend() helper. */
export type ProjectType = 'static' | 'react-spa' | 'nextjs' | 'fullstack';

export interface DeployTarget {
  id: DeployHostId;
  name: string;
  /** One plain line: who this host fits best. */
  bestFor: string;
  /** How hard the first deploy is for someone who has never shipped before. */
  barrier: DeployBarrier;
  /** What you actually get without paying. */
  freeTier: string;
  /** What happens to the bill once a project gets real traffic. */
  costAtScale: string;
  /** Real, current steps to get a first project live. Ordered, do them top to bottom. */
  steps: string[];
  /** Day-two operations: custom domain, secrets, undoing a bad deploy, watching the bill. */
  manageNotes: string[];
  /** Link straight to the host's own getting-started docs. */
  docsUrl: string;
}

export const DEPLOY_TARGETS: DeployTarget[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    bestFor:
      'Next.js apps and anyone who wants the smoothest connect-repo-and-go experience.',
    barrier: 'low',
    freeTier:
      'Hobby plan, free for personal and non-commercial projects. Includes 100 GB of bandwidth a month, automatic HTTPS, preview deploys on every pull request, and serverless functions.',
    costAtScale:
      'The Pro plan starts at 20 dollars per user each month and is required once a project is commercial. Bandwidth, function runtime, and image optimization are metered on top, so a busy app can climb well past the base price. This is the most common surprise on the bill.',
    steps: [
      'Push your project to a GitHub, GitLab, or Bitbucket repository.',
      'Sign in at vercel.com with that Git account.',
      'Click "Add New Project" and pick your repository from the list.',
      'Vercel detects the framework (Next.js, Vite, and most others) and fills in the build settings for you. Leave them as-is for a first deploy.',
      'Click "Deploy" and wait for the build to finish. You get a live yourname.vercel.app link, and every future git push deploys automatically.',
    ],
    manageNotes: [
      'Custom domain: open Project, then Settings, then Domains. Add your domain and copy the DNS records Vercel shows into your domain registrar. HTTPS is issued for you, no certificate work.',
      'Environment variables: Settings, then Environment Variables. Add secrets like API keys here, never in your code. Pick which environments (Production, Preview, Development) each one applies to, then redeploy so they take effect.',
      'Rollback: open the Deployments tab, find a previous deploy that worked, open its menu, and choose "Promote to Production". Your live site reverts in seconds without a new git push.',
      'Watch your bill: usage shows under Settings, then Usage. Bandwidth and serverless function time are metered. Set a spend limit on the Pro plan so a traffic spike or a runaway function cannot run up an open-ended charge.',
    ],
    docsUrl: 'https://vercel.com/docs/getting-started-with-vercel',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    bestFor:
      'Your very first vibe-coded app. The lowest-friction way to get something on the internet today.',
    barrier: 'lowest',
    freeTier:
      'Free plan with 100 GB of bandwidth and 300 build minutes a month, automatic HTTPS, deploy previews, instant rollbacks, and serverless functions. You can also drag a built folder straight onto the dashboard with no Git at all.',
    costAtScale:
      'The Pro plan is 19 dollars per member each month. Extra bandwidth past the included amount is billed per 100 GB, and build minutes can run out on a project that deploys often. Steady traffic costs more here than on Cloudflare Pages.',
    steps: [
      'Option A, no Git needed: run your build (for example "npm run build") to create a dist or build folder.',
      'Go to app.netlify.com, sign up, and drag that folder onto the "deploy manually" drop zone. Your site is live in under a minute.',
      'Option B, connect a repo for automatic deploys: click "Add new site", then "Import an existing project", and pick your GitHub repo.',
      'Set the build command (such as "npm run build") and the publish directory (such as "dist"). Netlify suggests these for common setups.',
      'Click "Deploy site". You get a live name.netlify.app link, and with the Git option every push redeploys automatically.',
    ],
    manageNotes: [
      'Custom domain: Site configuration, then Domain management, then "Add a domain". Point your registrar at Netlify with the records shown, or let Netlify manage DNS for you. HTTPS is automatic.',
      'Environment variables: Site configuration, then Environment variables. Add keys and secrets here so they stay out of your repo, then trigger a redeploy.',
      'Rollback: open the Deploys tab, click any earlier successful deploy, and choose "Publish deploy". Netlify keeps every past build, so reverting is one click with no rebuild.',
      'Watch your bill: the Usage page shows bandwidth and build minutes against your plan. The free plan stops serving rather than charging you, but on Pro overages are billed, so check usage before a launch or a traffic push.',
    ],
    docsUrl: 'https://docs.netlify.com/welcome/add-new-site/',
  },
  {
    id: 'cloudflarePages',
    name: 'Cloudflare Pages',
    bestFor:
      'Staying cheap as traffic grows. Unlimited bandwidth on the free plan. This is what AssetPersona itself runs on.',
    barrier: 'low',
    freeTier:
      'Free plan with unlimited bandwidth and unlimited requests, plus 500 builds a month and automatic HTTPS. Dynamic code runs on Cloudflare Workers, whose free plan covers 100,000 requests a day.',
    costAtScale:
      'Because bandwidth is never metered, a static or front-end site can serve heavy traffic and still pay nothing. If you add Workers for dynamic logic, the paid Workers plan is 5 dollars a month and includes 10 million requests, with usage past that billed at low per-request rates. This is the cheapest of the four once a project gets popular.',
    steps: [
      'Push your project to a GitHub or GitLab repository.',
      'Sign in to the Cloudflare dashboard and open "Workers & Pages", then "Create", then the "Pages" tab.',
      'Choose "Connect to Git" and authorize the repository.',
      'Pick your framework preset (Cloudflare detects Vite, Next.js, Astro, and more) so the build command and output directory are filled in. Adjust only if your setup is custom.',
      'Click "Save and Deploy". You get a live name.pages.dev link, and every git push builds and deploys a new version automatically.',
    ],
    manageNotes: [
      'Custom domain: open your Pages project, then the Custom domains tab, and add your domain. If the domain is already on Cloudflare the DNS is wired up for you. HTTPS is automatic.',
      'Environment variables: project Settings, then "Variables and secrets". Set values per environment (Production and Preview). Mark sensitive ones as encrypted secrets, then redeploy.',
      'Rollback: open the Deployments list, find a healthy past deployment, open its menu, and choose "Rollback to this deployment". The live site switches back with no rebuild.',
      'Watch your bill: static hosting and bandwidth stay free no matter the traffic, so the static side has no cost spike to fear. The place to watch is Workers. If you add dynamic functions, check the Workers usage in the dashboard, since requests past the included amount are what generate a charge.',
    ],
    docsUrl: 'https://developers.cloudflare.com/pages/get-started/git-integration/',
  },
  {
    id: 'githubPages',
    name: 'GitHub Pages',
    bestFor:
      'A free static site or project demo straight from a repo you already have. Personal and open-source use only.',
    barrier: 'medium',
    freeTier:
      'Free for public repositories. Serves static files only (HTML, CSS, JavaScript, images), with a soft limit around 100 GB of bandwidth a month and a 1 GB site size. HTTPS is included on the github.io domain and on custom domains.',
    costAtScale:
      'There is no paid tier to scale into. GitHub Pages stays free, but its terms forbid commercial use, it cannot run any server-side code, and the bandwidth limit is a soft cap GitHub may enforce on a very busy site. When a project outgrows static-only or needs to make money, you move it to one of the other three.',
    steps: [
      'Put your static site files, or a front-end build output, in a public GitHub repository.',
      'For a plain static site, commit your index.html at the repo root or in a /docs folder. For a build tool like Vite, set the correct "base" path in your config so asset links resolve under the repo subpath.',
      'In the repository, open Settings, then Pages.',
      'Under "Build and deployment", choose your source: a branch and folder for plain files, or "GitHub Actions" for a build step (Vite and similar ship a ready-made Pages workflow).',
      'Save. After the build runs, your site is live at https://yourname.github.io/repo-name/.',
    ],
    manageNotes: [
      'Custom domain: Settings, then Pages, then the Custom domain field. Add your domain, then create a CNAME (or apex) record at your registrar pointing to GitHub. Turn on "Enforce HTTPS" once the certificate is issued.',
      'Environment variables: there are none at runtime, because the site is static with no server. Anything you put in client-side code is public, so never ship secret API keys here. Use build-time secrets in the GitHub Actions workflow only for the build itself.',
      'Rollback: revert the commit (git revert) or push the previous version. Pages redeploys from your repo, so your Git history is the rollback mechanism. There is no one-click deploy switcher.',
      'Watch your bill: there is nothing to bill on the free static tier. The real limits are the rules, not the cost: no commercial use, no server code, and a soft bandwidth cap. Treat a sustained traffic warning as the signal to migrate to Cloudflare Pages or Netlify.',
    ],
    docsUrl: 'https://docs.github.com/en/pages/quickstart',
  },
];

/** Look up a single host by id. Returns undefined if the id is unknown. */
export function getDeployTarget(id: DeployHostId): DeployTarget | undefined {
  return DEPLOY_TARGETS.find((t) => t.id === id);
}

export interface DeployRecommendation {
  host: DeployHostId;
  /** One line a beginner can act on: why this host fits this project type. */
  why: string;
}

/**
 * Recommend a host for the kind of project you built.
 *
 * The rule of thumb behind these picks: start where the deploy is easiest for
 * what you have, but lean toward the host that stays cheapest if the project
 * is the kind that tends to attract traffic.
 */
export function recommend(projectType: ProjectType): DeployRecommendation {
  switch (projectType) {
    case 'static':
      return {
        host: 'cloudflarePages',
        why: 'A plain static site costs nothing to serve here even at high traffic, since bandwidth is unlimited on the free plan.',
      };
    case 'react-spa':
      return {
        host: 'netlify',
        why: 'A single-page React app deploys in minutes with the single-page redirect handled for you, which is the lowest-friction first ship.',
      };
    case 'nextjs':
      return {
        host: 'vercel',
        why: 'Vercel builds Next.js and most other frameworks with no setup, since they make the framework, so server features and image handling work out of the box.',
      };
    case 'fullstack':
      return {
        host: 'cloudflarePages',
        why: 'Pages plus Workers covers a front end and back-end functions on one platform, and stays the cheapest as both sides grow.',
      };
  }
}
