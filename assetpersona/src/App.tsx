import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, lazy, Suspense } from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SEOHead from './components/seo/SEOHead';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard, AdminGuard } from './components/guards/AuthGuard';
import ModeratorGuard from './components/guards/ModeratorGuard';
import MobileTabBar from './components/learn/MobileTabBar';
import { hydrateFromSupabase } from './data/blogSync';

// Landing (interactive v2) — lazy so non-landing routes don't pay its cost
const LandingV2 = lazy(() => import('./components/landing/LandingV2'));

// Lazy load pages
const AboutPage = lazy(() => import('./pages/About'));
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogAdminPage = lazy(() => import('./pages/BlogAdmin'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const BlogTagPage = lazy(() => import('./pages/BlogTag'));
const IntakeFlow = lazy(() => import('./components/intake/IntakeFlow'));

// New pages
const LivePage = lazy(() => import('./pages/Live'));
const EventDetailPage = lazy(() => import('./pages/EventDetail'));
const BusinessPage = lazy(() => import('./pages/Business'));

// Work With Frank — consultant pathways (Wave 2)
const WorkHubPage = lazy(() => import('./pages/work/Hub'));
const ConsultingPathwayPage = lazy(() => import('./pages/work/Consulting'));
const SpeakingPathwayPage = lazy(() => import('./pages/work/Speaking'));
const TrainingPathwayPage = lazy(() => import('./pages/work/Training'));
const MarketingPathwayPage = lazy(() => import('./pages/work/Marketing'));

// Admin command center
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const BlogWritePage = lazy(() => import('./pages/admin/BlogWrite'));
const EventManagerPage = lazy(() => import('./pages/admin/EventManager'));
const MemberCRMPage = lazy(() => import('./pages/admin/MemberCRM'));
const CourseManagerPage = lazy(() => import('./pages/admin/CourseManager'));
const ProductManagerPage = lazy(() => import('./pages/admin/ProductManager'));
const AnalyticsPage = lazy(() => import('./pages/admin/Analytics'));
const StudioListPage = lazy(() => import('./pages/admin/StudioList'));

// Studio editor (standalone, full viewport)
const StudioEditorPage = lazy(() => import('./studio/engine/StudioEditor'));

// Public dynamic pages
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

// Existing pages
const ShopPage = lazy(() => import('./pages/Shop'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail'));
const StudyHallPage = lazy(() => import('./pages/AgenticStudyHall'));
const RecordingsPage = lazy(() => import('./pages/Recordings'));
const ResourcesPage = lazy(() => import('./pages/Resources'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const TermsPage = lazy(() => import('./pages/Terms'));
const AccessibilityPage = lazy(() => import('./pages/Accessibility'));

const ContactPage = lazy(() => import('./pages/Contact'));
const ScreensPage = lazy(() => import('./pages/Screens'));

// Community
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const InquiriesAdminPage = lazy(() => import('./pages/admin/Inquiries'));

// Learn (AP-LEARN-2026-05)
const ModulesAdminPage = lazy(() => import('./pages/admin/Modules'));
const ContentHubPage = lazy(() => import('./pages/admin/ContentHub'));
const ContentHubEditPage = lazy(() => import('./pages/admin/ContentHubEdit'));
const LearnerExplorerPage = lazy(() => import('./pages/admin/LearnerExplorer'));
const ModuleEditPage = lazy(() => import('./pages/admin/ModuleEdit'));
const ModuleQueuePage = lazy(() => import('./pages/admin/ModuleQueue'));
const VelocityPage = lazy(() => import('./pages/admin/Velocity'));
const ModerationPage = lazy(() => import('./pages/admin/Moderation'));
const FaqAdminPage = lazy(() => import('./pages/admin/FaqAdmin'));
const StrategyVoiceHubPage = lazy(() => import('./pages/admin/StrategyVoiceHub'));
const FaqPublicPage = lazy(() => import('./pages/Faq'));
// Learn hub unified into Classroom (AP-STUDYHALL-REBUILD-2026-06 · Lane 7):
// /community/learn now redirects to /community/classroom. The standalone
// LearnHub page (pages/community/Learn) is no longer routed; the module
// player below stays for /community/learn/:slug.
const LearnModulePage = lazy(() => import('./pages/community/Module'));
const CommunityLayout = lazy(() => import('./components/community/CommunityLayout'));
const Feed = lazy(() => import('./pages/community/Feed'));
const Classroom = lazy(() => import('./pages/community/Classroom'));
const CourseDetail = lazy(() => import('./pages/community/CourseDetail'));
const Calendar = lazy(() => import('./pages/community/Calendar'));
const CommunityEventDetail = lazy(() => import('./pages/community/EventDetail'));
const Members = lazy(() => import('./pages/community/Members'));
const Leaderboard = lazy(() => import('./pages/community/Leaderboard'));
const Profile = lazy(() => import('./pages/community/Profile'));
const GroupSettings = lazy(() => import('./pages/community/GroupSettings'));
const UserSettings = lazy(() => import('./pages/community/UserSettings'));
const UpgradeSelfPage = lazy(() => import('./pages/community/UpgradeSelf'));

/* AP-MODERNIZE-2026-05 · Lane 6 — new community surfaces */
const MessagesPage = lazy(() => import('./pages/community/Messages'));
const MessageThreadPage = lazy(() => import('./pages/community/MessageThread'));
const NotificationsPage = lazy(() => import('./pages/community/Notifications'));
const SavedPage = lazy(() => import('./pages/community/Saved'));

/* AP-STUDYHALL-REBUILD-2026-06 · Lane 7 (Batch 1) — Chat, Deploy, Start Here surfaces */
const Chat = lazy(() => import('./pages/community/Chat'));
const Deploy = lazy(() => import('./pages/community/Deploy'));
const StartHere = lazy(() => import('./pages/community/StartHere'));

// Lane 6: Momentum (the learner's progress screen)
const Momentum = lazy(() => import('./pages/community/Momentum'));

// Lane 7: Team Learning
const TeamLearning = lazy(() => import('./pages/community/TeamLearning'));

// Lane 8: Credentials
const CredentialDetail = lazy(() => import('./pages/community/CredentialDetail'));

// Lane 9: Showcase
const ShowcaseGallery = lazy(() => import('./pages/community/ShowcaseGallery'));
const ShowcaseDetail = lazy(() => import('./pages/community/ShowcaseDetail'));

/* AP-ENGAGEMENT-LOOP-2026-05 · Lane 7 (shell coordinator) — wires Wave 1 surfaces.
 * Public-share + community + admin entrypoints added in a single coordinated block. */
const PublicLearnTeaserPage = lazy(() => import('./pages/Learn'));          // Lane 2
const LearnedSharePage = lazy(() => import('./pages/Learned'));             // Lane 2
const PublicProfilePage = lazy(() => import('./pages/PublicProfile'));      // Lane 3
const CredentialSharePage = lazy(() => import('./pages/CredentialShare'));  // Lane 3
const PortfolioOwnerPage = lazy(() => import('./pages/community/Portfolio'));// Lane 4
const BroadcastsMonitorPage = lazy(() => import('./pages/admin/BroadcastsMonitor'));// Lane 5
const FeedIntelPage = lazy(() => import('./pages/admin/FeedIntel'));               // Feed Intel

// Lane 3: AI Briefs
const BriefsList = lazy(() => import('./pages/community/BriefsList'));
const BriefDetail = lazy(() => import('./pages/community/BriefDetail'));
const ResourceHubPage = lazy(() => import('./pages/guides/ResourceHub'));

// Lane 4: Timed Assessments
const AssessmentIntro = lazy(() => import('./pages/community/AssessmentIntro'));
const AssessmentExam = lazy(() => import('./pages/community/AssessmentExam'));

// Lane 6: Interactive Tutorials
const TutorialsList = lazy(() => import('./pages/community/TutorialsList'));
const TutorialDetail = lazy(() => import('./pages/community/TutorialDetail'));

const ArcadeLobby = lazy(() => import('./pages/community/ArcadeLobby'));
const PromptBattle = lazy(() => import('./pages/community/PromptBattle'));
const JailbreakChallenge = lazy(() => import('./pages/community/JailbreakChallenge'));
const RagOptimizer = lazy(() => import('./pages/community/RagOptimizer'));
const Orchestration = lazy(() => import('./pages/community/Orchestration'));


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BlogHydrator() {
  // Fire once on mount. Bypass / un-configured Supabase short-circuits inside.
  useEffect(() => {
    void hydrateFromSupabase();
  }, []);
  return null;
}

function LandingPage() {
  return (
    <>
      <SEOHead />
      <LandingV2 />
    </>
  );
}

/** Marketing pages get Navbar + Footer */
function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <BlogHydrator />
          <MobileTabBar />
          <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)' }} aria-hidden="true" />}>
            <Routes>
              {/* ── Marketing pages ── */}
              <Route path="/" element={<MarketingShell><LandingPage /></MarketingShell>} />
              <Route path="/about" element={<MarketingShell><AboutPage /></MarketingShell>} />
              <Route path="/blog" element={<MarketingShell><BlogPage /></MarketingShell>} />
              <Route path="/blog/tag/:tag" element={<MarketingShell><BlogTagPage /></MarketingShell>} />
              <Route path="/blog/:slug" element={<MarketingShell><BlogPostPage /></MarketingShell>} />
              <Route path="/shop" element={<MarketingShell><ShopPage /></MarketingShell>} />
              <Route path="/shop/:slug" element={<MarketingShell><ProductDetailPage /></MarketingShell>} />
              <Route path="/recordings" element={<MarketingShell><RecordingsPage /></MarketingShell>} />
              <Route path="/resources" element={<MarketingShell><ResourcesPage /></MarketingShell>} />
              <Route path="/guides" element={<MarketingShell><ResourceHubPage /></MarketingShell>} />
              <Route path="/start" element={<MarketingShell><IntakeFlow /></MarketingShell>} />
              <Route path="/contact" element={<MarketingShell><ContactPage /></MarketingShell>} />
              <Route path="/faq" element={<MarketingShell><FaqPublicPage /></MarketingShell>} />
              <Route path="/privacy" element={<MarketingShell><PrivacyPage /></MarketingShell>} />
              <Route path="/terms" element={<MarketingShell><TermsPage /></MarketingShell>} />
              <Route path="/accessibility" element={<MarketingShell><AccessibilityPage /></MarketingShell>} />

              {/* ── NEW pages ── */}
              <Route path="/agenticstudyhall" element={<MarketingShell><StudyHallPage /></MarketingShell>} />
              {/* Upgrade.Self lives INSIDE the study hall (/community/upgrade-self),
                  not on the main site — keep the old path pointed there. */}
              <Route path="/upgrade-self" element={<Navigate to="/community/upgrade-self" replace />} />
              <Route path="/talkthrutech" element={<MarketingShell><LivePage /></MarketingShell>} />
              <Route path="/talkthrutech/:slug" element={<MarketingShell><EventDetailPage /></MarketingShell>} />
              <Route path="/business" element={<MarketingShell><BusinessPage /></MarketingShell>} />
              <Route path="/screens" element={<MarketingShell><ScreensPage /></MarketingShell>} />

              {/* ── Work With Frank — consultant pathways ── */}
              <Route path="/work" element={<MarketingShell><WorkHubPage /></MarketingShell>} />
              <Route path="/work/consulting" element={<MarketingShell><ConsultingPathwayPage /></MarketingShell>} />
              <Route path="/work/speaking" element={<MarketingShell><SpeakingPathwayPage /></MarketingShell>} />
              <Route path="/work/training" element={<MarketingShell><TrainingPathwayPage /></MarketingShell>} />
              <Route path="/work/marketing" element={<MarketingShell><MarketingPathwayPage /></MarketingShell>} />

              {/* ── Redirects from old paths ── */}
              <Route path="/live" element={<Navigate to="/talkthrutech" replace />} />
              <Route path="/live/:slug" element={<Navigate to="/talkthrutech" replace />} />
              <Route path="/school" element={<Navigate to="/agenticstudyhall" replace />} />
              <Route path="/aistudyhall" element={<Navigate to="/agenticstudyhall" replace />} />


              {/* ── Admin routes (sidebar layout) ── */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="blog" element={<BlogAdminPage />} />
                <Route path="blog/new" element={<BlogWritePage />} />
                <Route path="blog/edit/:slug" element={<BlogWritePage />} />
                <Route path="events" element={<EventManagerPage />} />
                <Route path="members" element={<MemberCRMPage />} />
                <Route path="courses" element={<CourseManagerPage />} />
                <Route path="products" element={<ProductManagerPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="studio" element={<StudioListPage />} />
                <Route path="inquiries" element={<InquiriesAdminPage />} />
                <Route path="modules" element={<ModulesAdminPage />} />
                <Route path="modules/new" element={<ModuleEditPage />} />
                <Route path="modules/edit/:slug" element={<ModuleEditPage />} />
                <Route path="modules/queue" element={<ModuleQueuePage />} />
                <Route path="content-hub" element={<ContentHubPage />} />
                <Route path="content-hub/new" element={<ContentHubEditPage />} />
                <Route path="content-hub/edit/:id" element={<ContentHubEditPage />} />
                {/* AP-ENGAGEMENT-LOOP-2026-05 · Lane 5 — multi-platform broadcasts monitor */}
                <Route path="content-hub/broadcasts" element={<BroadcastsMonitorPage />} />
                {/* Feed Intel — Threads For You feed monitor */}
                <Route path="feed-intel" element={<FeedIntelPage />} />
                <Route path="strategy" element={<StrategyVoiceHubPage />} />
                <Route path="velocity" element={<VelocityPage />} />
                <Route path="learners" element={<LearnerExplorerPage />} />
                <Route path="faq" element={<FaqAdminPage />} />
              </Route>

              {/* ── Moderator-accessible admin route (admins + moderators) ── */}
              <Route
                path="/admin/moderation"
                element={<ModeratorGuard><ModerationPage /></ModeratorGuard>}
              />

              {/* ── Studio editor (full viewport, no admin shell) ── */}
              <Route path="/admin/studio/:pageId" element={<AdminGuard><StudioEditorPage /></AdminGuard>} />

              {/* ── Public dynamic pages ── */}
              <Route path="/p/:slug" element={<DynamicPage />} />

              {/* ── AP-ENGAGEMENT-LOOP-2026-05 · public share surfaces ──
                  Lane 2: /learn/:slug (teaser) + /learned/:shareId (completion share)
                  Lane 3: /u/:handle (public profile) + /c/:shareId (credential share)
                  All four are intentionally OUTSIDE AuthGuard so unauthenticated
                  visitors can land directly from social shares. */}
              <Route path="/learn/:slug" element={<PublicLearnTeaserPage />} />
              <Route path="/learned/:shareId" element={<LearnedSharePage />} />
              <Route path="/u/:handle" element={<PublicProfilePage />} />
              <Route path="/c/:shareId" element={<CredentialSharePage />} />

              {/* ── Auth ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* ── Community ── */}
              <Route
                path="/community"
                element={
                  <AuthGuard>
                    <CommunityLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Feed />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="messages/:threadId" element={<MessageThreadPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="classroom" element={<Classroom />} />
                <Route path="classroom/:courseId" element={<CourseDetail />} />
                {/* AP-STUDYHALL-REBUILD-2026-06 · Lane 7 — Luma-style events.
                    Events is the primary surface; the old /calendar path
                    redirects so existing links keep working. */}
                <Route path="events" element={<Calendar />} />
                <Route path="events/:slug" element={<CommunityEventDetail />} />
                <Route path="calendar" element={<Navigate to="/community/events" replace />} />
                <Route path="members" element={<Members />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="teams" element={<TeamLearning />} />
                <Route path="credentials" element={<CredentialDetail />} />
                <Route path="credentials/:code" element={<CredentialDetail />} />
                <Route path="showcase" element={<ShowcaseGallery />} />
                <Route path="showcase/:id" element={<ShowcaseDetail />} />
                <Route path="profile/:memberId" element={<Profile />} />
                {/* AP-ENGAGEMENT-LOOP-2026-05 · Lane 4 — owner portfolio editor */}
                <Route path="portfolio" element={<PortfolioOwnerPage />} />
                <Route path="user-settings" element={<UserSettings />} />
                <Route path="upgrade-self" element={<UpgradeSelfPage />} />
                {/* AP-STUDYHALL-REBUILD-2026-06 · Lane 7 (Batch 1) — new surfaces */}
                <Route path="chat" element={<Chat />} />
                <Route path="deploy" element={<Deploy />} />
                <Route path="start" element={<StartHere />} />
                {/* Momentum dashboard: the learner's progress screen (Lane 6). */}
                <Route path="momentum" element={<Momentum />} />
                {/* Unified learning entry: Classroom is the canonical hub.
                    /community/learn redirects there so there is ONE entry point.
                    learn/:slug stays for the module player. */}
                <Route path="learn" element={<Navigate to="/community/classroom" replace />} />
                <Route path="learn/:slug" element={<LearnModulePage />} />
                {/* "Library" is the new name for the Classroom surface. The page
                    still lives at the classroom path/component, so this alias
                    redirects there to keep one canonical entry point. */}
                <Route path="library" element={<Navigate to="/community/classroom" replace />} />
                <Route path="briefs" element={<BriefsList />} />
                <Route path="briefs/:slug" element={<BriefDetail />} />
                <Route path="assessments" element={<AssessmentIntro />} />
                <Route path="assessments/take/:slug" element={<AssessmentExam />} />
                <Route path="tutorials" element={<TutorialsList />} />
                <Route path="tutorials/:tutorialId" element={<TutorialDetail />} />
                <Route path="arcade" element={<ArcadeLobby />} />
                <Route path="arcade/battle/:scenarioId" element={<PromptBattle />} />
                <Route path="arcade/jailbreak/:levelId" element={<JailbreakChallenge />} />
                <Route path="arcade/rag-optimizer" element={<RagOptimizer />} />
                <Route path="orchestration" element={<Orchestration />} />
                <Route
                  path="settings"
                  element={
                    <AdminGuard>
                      <GroupSettings />
                    </AdminGuard>
                  }
                />
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={<MarketingShell><NotFoundPage /></MarketingShell>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}
