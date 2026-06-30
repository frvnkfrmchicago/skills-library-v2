import { useMemo, useState } from 'react';
import {
  RocketLaunch,
  Cloud,
  Lightning,
  Stack,
  GitBranch,
  Globe,
  Key,
  ArrowCounterClockwise,
  CurrencyDollar,
  CaretDown,
  ArrowSquareOut,
  CheckCircle,
  Question,
} from '@phosphor-icons/react';
import InteractiveHeader from '../../components/layout/InteractiveHeader';
import {
  DEPLOY_TARGETS,
  recommend,
  getDeployTarget,
  type DeployBarrier,
  type DeployHostId,
  type ProjectType,
} from '../../data/deployTargets';
import './Deploy.css';

/* SHIP step of the Study Hall loop: LEARN -> DISCUSS -> BUILD -> SHOW -> SHIP.
   This page teaches WHERE to put a finished project on the internet and HOW to
   run it once it is live. No user data, no network calls. It reads from the
   typed deployTargets catalog so the facts stay in one place. */

// Plain-language label for each barrier level, shown on the comparison cards.
const BARRIER_LABEL: Record<DeployBarrier, string> = {
  lowest: 'Easiest start',
  low: 'Easy start',
  medium: 'Some setup',
};

// One phosphor icon per host so the cards are scannable at a glance.
const HOST_ICON: Record<DeployHostId, typeof Cloud> = {
  vercel: Lightning,
  netlify: RocketLaunch,
  cloudflarePages: Cloud,
  githubPages: GitBranch,
};

// The four questions in the picker map to a project type the recommend() helper
// understands. Each answer is a real, beginner-recognizable description.
const PICKER_OPTIONS: { type: ProjectType; label: string; hint: string }[] = [
  {
    type: 'static',
    label: 'A simple site',
    hint: 'Pages of text, images, and links. No login, no database.',
  },
  {
    type: 'react-spa',
    label: 'A React app',
    hint: 'A single-page app built with Vite or Create React App. Runs in the browser.',
  },
  {
    type: 'nextjs',
    label: 'A Next.js app',
    hint: 'Uses Next.js, with server pages or API routes.',
  },
  {
    type: 'fullstack',
    label: 'Front end plus a back end',
    hint: 'A user interface and your own server functions or database.',
  },
];

export default function Deploy() {
  const [picked, setPicked] = useState<ProjectType | null>(null);
  const [openHost, setOpenHost] = useState<DeployHostId | null>(null);

  const suggestion = useMemo(
    () => (picked ? recommend(picked) : null),
    [picked]
  );
  const suggestedHost = suggestion ? getDeployTarget(suggestion.host) : null;

  function toggleHost(id: DeployHostId) {
    setOpenHost((current) => (current === id ? null : id));
  }

  return (
    <div className="deploy">
      <InteractiveHeader
        title="Deploy & Ship"
        subtitle="You built something. Now put it on the internet so anyone with the link can open it. This page shows where to deploy, how to do it step by step, and how to run it once it is live."
        badgeText="Ship step"
        badgeIcon={<RocketLaunch size={12} weight="fill" />}
        stats={[
          { label: 'Hosts compared', value: DEPLOY_TARGETS.length, icon: <Cloud size={14} /> },
          { label: 'First deploy', value: 'Minutes', icon: <Lightning size={14} /> },
          { label: 'Cost to start', value: 'Free', icon: <CurrencyDollar size={14} /> },
        ]}
      />

      {/* The one idea to carry through the whole page. */}
      <p className="deploy__thesis">
        <CheckCircle size={18} weight="fill" className="deploy__thesis-icon" />
        The host that is easiest to start on is not always the cheapest to stay
        on. Pick by where your project is headed, not just by today.
      </p>

      {/* ── Pick your host ─────────────────────────────────────────────── */}
      <section className="deploy__section" aria-labelledby="deploy-pick-head">
        <header className="deploy__section-head">
          <h2 id="deploy-pick-head">
            <Question size={18} weight="bold" className="deploy__head-icon" />
            Pick your host
          </h2>
          <p className="deploy__section-blurb">
            What did you build? Tap one and we point you at a good first home for
            it. You can always move later.
          </p>
        </header>

        <div className="deploy__picker" role="group" aria-label="Project type">
          {PICKER_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              className={`deploy__pick${picked === opt.type ? ' deploy__pick--active' : ''}`}
              aria-pressed={picked === opt.type}
              onClick={() => setPicked(opt.type)}
            >
              <span className="deploy__pick-label">{opt.label}</span>
              <span className="deploy__pick-hint">{opt.hint}</span>
            </button>
          ))}
        </div>

        {suggestedHost && suggestion && (
          <div className="deploy__suggestion" role="status">
            <span className="deploy__suggestion-kicker">Good first home</span>
            <div className="deploy__suggestion-body">
              <span className="deploy__suggestion-name">{suggestedHost.name}</span>
              <p className="deploy__suggestion-why">{suggestion.why}</p>
            </div>
            <button
              type="button"
              className="deploy__suggestion-jump"
              onClick={() => {
                setOpenHost(suggestion.host);
                document
                  .getElementById(`host-${suggestion.host}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              See the steps
            </button>
          </div>
        )}
      </section>

      {/* ── Compare the four ──────────────────────────────────────────── */}
      <section className="deploy__section" aria-labelledby="deploy-compare-head">
        <header className="deploy__section-head">
          <h2 id="deploy-compare-head">
            <Stack size={18} weight="bold" className="deploy__head-icon" />
            Compare the four
          </h2>
          <p className="deploy__section-blurb">
            All four get a first project live for free. They split apart on how
            easy the start is and what happens to the bill once people show up.
          </p>
        </header>

        <div className="deploy__grid">
          {DEPLOY_TARGETS.map((host) => {
            const Icon = HOST_ICON[host.id];
            return (
              <article key={host.id} className={`deploy__card deploy__card--${host.id}`}>
                <header className="deploy__card-head">
                  <span className="deploy__card-icon">
                    <Icon size={22} weight="duotone" />
                  </span>
                  <h3 className="deploy__card-name">{host.name}</h3>
                  <span className={`deploy__barrier deploy__barrier--${host.barrier}`}>
                    {BARRIER_LABEL[host.barrier]}
                  </span>
                </header>

                <p className="deploy__card-bestfor">{host.bestFor}</p>

                <dl className="deploy__card-facts">
                  <div className="deploy__fact">
                    <dt>Free tier</dt>
                    <dd>{host.freeTier}</dd>
                  </div>
                  <div className="deploy__fact">
                    <dt>Cost at scale</dt>
                    <dd>{host.costAtScale}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="deploy__card-cta"
                  onClick={() => {
                    setOpenHost(host.id);
                    document
                      .getElementById(`host-${host.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Deploy on {host.name}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Deploy in a few steps (expandable per host) ───────────────── */}
      <section className="deploy__section" aria-labelledby="deploy-steps-head">
        <header className="deploy__section-head">
          <h2 id="deploy-steps-head">
            <RocketLaunch size={18} weight="bold" className="deploy__head-icon" />
            Deploy, step by step
          </h2>
          <p className="deploy__section-blurb">
            Open the host you chose and follow the steps top to bottom. Each one
            is the real, current path, not a summary.
          </p>
        </header>

        <div className="deploy__steps">
          {DEPLOY_TARGETS.map((host) => {
            const isOpen = openHost === host.id;
            const Icon = HOST_ICON[host.id];
            return (
              <div
                key={host.id}
                id={`host-${host.id}`}
                className={`deploy__panel${isOpen ? ' deploy__panel--open' : ''}`}
              >
                <button
                  type="button"
                  className="deploy__panel-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`steps-${host.id}`}
                  onClick={() => toggleHost(host.id)}
                >
                  <span className="deploy__panel-icon">
                    <Icon size={20} weight="duotone" />
                  </span>
                  <span className="deploy__panel-title">Deploy on {host.name}</span>
                  <span className="deploy__panel-meta">{BARRIER_LABEL[host.barrier]}</span>
                  <CaretDown
                    size={16}
                    weight="bold"
                    className="deploy__panel-caret"
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="deploy__panel-body" id={`steps-${host.id}`}>
                    <ol className="deploy__step-list">
                      {host.steps.map((step, i) => (
                        <li key={i} className="deploy__step">
                          <span className="deploy__step-num">{i + 1}</span>
                          <span className="deploy__step-text">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <a
                      className="deploy__docs-link"
                      href={host.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open the {host.name} guide
                      <ArrowSquareOut size={14} weight="bold" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Manage it (day-two operations) ────────────────────────────── */}
      <section className="deploy__section" aria-labelledby="deploy-manage-head">
        <header className="deploy__section-head">
          <h2 id="deploy-manage-head">
            <Stack size={18} weight="bold" className="deploy__head-icon" />
            Manage it once it is live
          </h2>
          <p className="deploy__section-blurb">
            Getting live is step one. These are the four things you will reach
            for next. The steps differ a little per host, so each card links to
            where it lives.
          </p>
        </header>

        <div className="deploy__manage-grid">
          <article className="deploy__manage-card">
            <span className="deploy__manage-icon"><Globe size={20} weight="duotone" /></span>
            <h3 className="deploy__manage-title">Use your own domain</h3>
            <p className="deploy__manage-text">
              Swap the host's free address for a name you own, like
              yourname.com. You add the domain in the host's dashboard, then
              copy the records it shows into your domain registrar. All four
              hosts turn on HTTPS, the lock-icon security, for you.
            </p>
          </article>

          <article className="deploy__manage-card">
            <span className="deploy__manage-icon"><Key size={20} weight="duotone" /></span>
            <h3 className="deploy__manage-title">Keep secrets out of code</h3>
            <p className="deploy__manage-text">
              An environment variable is a setting, like an API key, that you
              store in the host instead of writing into your files. Set them in
              the host's dashboard so secrets never end up in your public repo.
              GitHub Pages is static only, so anything in its code is public.
            </p>
          </article>

          <article className="deploy__manage-card">
            <span className="deploy__manage-icon"><ArrowCounterClockwise size={20} weight="duotone" /></span>
            <h3 className="deploy__manage-title">Undo a bad deploy</h3>
            <p className="deploy__manage-text">
              A rollback returns your live site to an earlier version that
              worked. Vercel, Netlify, and Cloudflare Pages keep past builds, so
              it is one click in the deploys list. GitHub Pages rolls back by
              reverting the commit in Git.
            </p>
          </article>

          <article className="deploy__manage-card deploy__manage-card--warn">
            <span className="deploy__manage-icon"><CurrencyDollar size={20} weight="duotone" /></span>
            <h3 className="deploy__manage-title">Watch your bill</h3>
            <p className="deploy__manage-text">
              Free plans meter bandwidth and function time, and a traffic spike
              can push you onto a paid plan. Check the usage page before a
              launch, and set a spend limit where the host offers one. Cloudflare
              Pages does not meter bandwidth, which is why heavy traffic stays
              cheap there.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
