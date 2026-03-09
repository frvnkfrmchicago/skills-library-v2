---
name: b2b-b2c
description: B2B vs B2C patterns. Enterprise vs consumer UX, pricing models, onboarding, architecture differences.
last_updated: 2026-03
owner: Frank
---

# B2B vs B2C Patterns

Build for businesses or consumers — different games.

## TL;DR

| Aspect | B2C | B2B |
|--------|-----|-----|
| **Users** | Individuals | Teams/Orgs |
| **Onboarding** | 30-second signup | Multi-step, SSO |
| **Auth** | Social login | SSO, SAML |
| **Pricing** | Freemium, subscriptions | Seat-based, usage, enterprise |
| **UX** | Emotional, fun | Functional, dashboards |
| **Sales** | Self-serve | Sales-led or PLG |

---

## Context Questions

Before designing your product:

1. **Who's the buyer?** — Individual or organization?
2. **Payment source?** — Personal card or company budget?
3. **Onboarding needs?** — 30-second vs multi-step?
4. **Team features?** — Solo use or collaboration?
5. **Sales model?** — Self-serve or sales-led?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **User** | Individual ←→ Organization |
| **Sales** | Self-serve ←→ Sales-led |
| **Onboarding** | Instant signup ←→ Multi-step wizard |
| **Pricing** | Simple subscription ←→ Usage/seat-based |
| **UX** | Emotional/fun ←→ Functional/dashboard |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Consumer app | B2C: social login, mobile-first, gamification |
| Teams with budgets | B2B: SSO, admin panels, RBAC |
| Prosumer (hybrid) | Start B2C, add team features |
| Enterprise target | Sales-led, SSO required, API-first |
| SMB target | PLG, self-serve, usage-based pricing |
| Low ACV (<$100) | Pure B2C or PLG |

---

## Part 1: B2C Patterns

### Consumer Onboarding

```typescript
// Fast, frictionless signup
const SignupFlow = () => (
  <div className="max-w-sm mx-auto">
    {/* Social login first — lowest friction */}
    <div className="space-y-3">
      <GoogleButton />
      <AppleButton />
    </div>
    
    <Divider text="or" />
    
    {/* Email signup — simple */}
    <form>
      <Input placeholder="Email" type="email" />
      <Button type="submit">Continue</Button>
    </form>
    
    {/* No password on first step — magic link */}
  </div>
);
```

### Social Login Emphasis

```typescript
// Clerk configuration for B2C
const clerkConfig = {
  signIn: {
    // Social first
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'iconButton',
  },
  signUp: {
    // Only require email
    requiredFields: ['emailAddress'],
    optionalFields: ['firstName'],
  }
};
```

### Gamification

```typescript
// Points, badges, streaks
interface UserProgress {
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
  achievements: Achievement[];
}

// Trigger celebrations
const celebrateAchievement = (achievement: Achievement) => {
  confetti({ particleCount: 100 });
  toast.success(`🎉 ${achievement.title} unlocked!`);
  haptics.success(); // Mobile
};
```

### Viral Mechanics

```typescript
// Referral system
const ReferralProgram = () => {
  const { referralCode, referrals } = useReferrals();
  
  return (
    <Card>
      <h3>Get 1 month free</h3>
      <p>Share your code. You both get rewarded.</p>
      
      <CopyToClipboard text={`https://app.com/join/${referralCode}`}>
        <Button>Copy Link</Button>
      </CopyToClipboard>
      
      <ShareButtons 
        url={`https://app.com/join/${referralCode}`}
        networks={['twitter', 'facebook', 'whatsapp']}
      />
      
      <p>{referrals.length} friends joined</p>
    </Card>
  );
};
```

### Emotional Design

```markdown
## Principles
1. Delight with micro-interactions
2. Use personality in copy ("Woohoo!" vs "Success")
3. Add Easter eggs
4. Celebrate user achievements
5. Make empty states fun
6. Use illustrations and characters
```

### Mobile-First

```typescript
// Design for thumb zone
const MobileNavigation = () => (
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t">
    <div className="flex justify-around items-center h-full">
      <NavItem icon={<Home />} label="Home" />
      <NavItem icon={<Search />} label="Explore" />
      <NavItem icon={<Plus />} label="Create" primary />
      <NavItem icon={<Heart />} label="Activity" />
      <NavItem icon={<User />} label="Profile" />
    </div>
  </nav>
);
```

### Freemium Models

```typescript
// Gate features, not content
const pricingTiers = {
  free: {
    projects: 3,
    storage: '500MB',
    features: ['basic', 'export_png'],
    support: 'community',
  },
  pro: {
    price: 12,
    projects: 'unlimited',
    storage: '50GB',
    features: ['basic', 'export_all', 'ai_assist', 'collab'],
    support: 'email',
  }
};

// Soft-paywall pattern
const FeatureGate = ({ feature, children }) => {
  const { plan } = useSubscription();
  
  if (!hasFeature(plan, feature)) {
    return <UpgradePrompt feature={feature} />;
  }
  
  return children;
};
```

---

## Part 2: B2B Patterns

### Enterprise Onboarding

```typescript
// Multi-step, thorough
const OnboardingFlow = () => {
  const steps = [
    { id: 'company', title: 'Company Setup' },
    { id: 'team', title: 'Invite Team' },
    { id: 'integrations', title: 'Connect Tools' },
    { id: 'preferences', title: 'Configure' },
  ];
  
  return (
    <OnboardingWizard steps={steps}>
      <CompanySetup />
      <TeamInvites />
      <IntegrationConnect />
      <Preferences />
    </OnboardingWizard>
  );
};
```

### SSO / SAML Integration

```typescript
// Clerk Enterprise SSO
const EnterpriseAuth = () => (
  <SignIn>
    <SignIn.Root>
      {/* Enterprise SSO option */}
      <SignIn.Step name="start">
        <Button onClick={() => signInWithSSO()}>
          Continue with SSO
        </Button>
        
        <Clerk.Field name="identifier">
          <Clerk.Label>Work email</Clerk.Label>
          <Clerk.Input placeholder="you@company.com" />
        </Clerk.Field>
      </SignIn.Step>
    </SignIn.Root>
  </SignIn>
);

// Backend: Detect enterprise domain
const getAuthMethod = (email: string) => {
  const domain = email.split('@')[1];
  const config = enterpriseConfigs[domain];
  
  if (config?.ssoEnabled) {
    return { method: 'sso', provider: config.provider };
  }
  return { method: 'standard' };
};
```

### Dashboard-Heavy UX

```typescript
// B2B typical layout
const DashboardLayout = ({ children }) => (
  <div className="flex h-screen">
    {/* Sidebar navigation */}
    <Sidebar>
      <Logo />
      <NavLinks />
      <TeamSwitcher />
      <UserMenu />
    </Sidebar>
    
    {/* Main content */}
    <main className="flex-1 overflow-auto">
      <Header>
        <Breadcrumbs />
        <Search />
        <Notifications />
      </Header>
      
      <div className="p-6">{children}</div>
    </main>
  </div>
);

// Dashboard with KPIs
const Dashboard = () => (
  <div className="space-y-6">
    <MetricsRow>
      <MetricCard title="MRR" value="$45,230" trend="+12%" />
      <MetricCard title="Active Users" value="1,234" trend="+5%" />
      <MetricCard title="Churn Rate" value="2.1%" trend="-0.3%" />
    </MetricsRow>
    
    <Grid cols={2}>
      <RevenueChart />
      <UsageChart />
    </Grid>
    
    <RecentActivityTable />
  </div>
);
```

### Admin Panels

```typescript
// Team management
const AdminPanel = () => (
  <Tabs defaultValue="members">
    <TabsList>
      <TabsTrigger value="members">Team Members</TabsTrigger>
      <TabsTrigger value="roles">Roles</TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
      <TabsTrigger value="security">Security</TabsTrigger>
    </TabsList>
    
    <TabsContent value="members">
      <TeamMembersTable 
        onInvite={openInviteModal}
        onRemove={handleRemove}
        onRoleChange={handleRoleChange}
      />
    </TabsContent>
    
    <TabsContent value="roles">
      <RolesManager />
    </TabsContent>
  </Tabs>
);
```

### Role-Based Access

```typescript
// RBAC implementation
const permissions = {
  admin: ['*'],
  manager: ['read', 'write', 'invite', 'reports'],
  member: ['read', 'write'],
  viewer: ['read'],
};

// Permission check hook
const usePermission = (permission: string) => {
  const { user } = useAuth();
  const role = user?.organizationMembership?.role;
  
  const perms = permissions[role] || [];
  return perms.includes('*') || perms.includes(permission);
};

// Usage
const DeleteButton = () => {
  const canDelete = usePermission('delete');
  
  if (!canDelete) return null;
  return <Button variant="destructive">Delete</Button>;
};
```

### Data Export/Import

```typescript
// CSV/JSON export
const ExportButton = ({ data, filename }) => {
  const handleExport = (format: 'csv' | 'json') => {
    const content = format === 'csv' 
      ? convertToCSV(data)
      : JSON.stringify(data, null, 2);
    
    downloadFile(content, `${filename}.${format}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### API-First Design

```typescript
// Every UI action has an API equivalent
// OpenAPI spec
const apiSpec = {
  '/api/v1/projects': {
    get: { summary: 'List projects' },
    post: { summary: 'Create project' },
  },
  '/api/v1/projects/{id}': {
    get: { summary: 'Get project' },
    patch: { summary: 'Update project' },
    delete: { summary: 'Delete project' },
  },
  '/api/v1/projects/{id}/export': {
    get: { summary: 'Export project data' },
  },
};

// API keys for programmatic access
const ApiKeysManager = () => (
  <Card>
    <h3>API Keys</h3>
    <p>Use API keys for programmatic access.</p>
    
    <Button onClick={generateApiKey}>Generate New Key</Button>
    
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.map(key => (
          <ApiKeyRow key={key.id} apiKey={key} />
        ))}
      </TableBody>
    </Table>
  </Card>
);
```

### Sales-Led vs Product-Led

```markdown
## Sales-Led Growth (SLG)
- Enterprise focus ($$$)
- Demo → Trial → Contract
- Custom pricing
- Account managers
- Implementation support
- Annual contracts

## Product-Led Growth (PLG)
- Self-serve first
- Free tier drives adoption
- Upgrade in-app
- Usage-based pricing
- Virality within teams
- Monthly billing option

## Hybrid
- PLG for SMB
- Sales-led for Enterprise
- Clear "Contact Sales" path
```

### Usage-Based Pricing

```typescript
// Track and display usage
const UsageDashboard = () => {
  const { usage, limits, billingCycle } = useUsage();
  
  return (
    <Card>
      <h3>Current Usage</h3>
      <p>Billing period: {billingCycle.start} - {billingCycle.end}</p>
      
      <div className="space-y-4">
        <UsageBar 
          label="API Calls"
          current={usage.apiCalls}
          limit={limits.apiCalls}
        />
        <UsageBar 
          label="Storage"
          current={usage.storage}
          limit={limits.storage}
          unit="GB"
        />
        <UsageBar 
          label="Team Members"
          current={usage.seats}
          limit={limits.seats}
        />
      </div>
      
      <div className="mt-4">
        <p>Estimated bill: ${calculateBill(usage)}</p>
      </div>
    </Card>
  );
};
```

---

## Part 3: Decision Tree

```
Who is your primary user?
├─ Individual consumer → B2C
│   └─ Do they pay with personal money?
│       ├─ Yes → Pure B2C
│       └─ No (company card) → Prosumer
│
└─ Teams/Organizations → B2B
    └─ Who makes the buying decision?
        ├─ End users (bottom-up) → PLG B2B
        └─ Executives (top-down) → Sales-led B2B

What's your ACV (Annual Contract Value)?
├─ < $100 → B2C or PLG
├─ $100 - $1,000 → SMB/PLG
├─ $1,000 - $10,000 → Mid-market
└─ > $10,000 → Enterprise (sales required)
```

### Hybrid Models (Prosumer)

```markdown
## Examples
- Notion (individuals + teams)
- Figma (designers + design teams)
- Slack (small teams + enterprise)

## Implementation
1. Start B2C simple (individual use case)
2. Add team features naturally
3. Enterprise layer on top
4. Separate pricing tiers

## Architecture
- User can exist without Org
- User can join multiple Orgs
- Org-level vs User-level settings
- Graceful upgrade path
```

### When to Pivot

```markdown
## B2C → B2B Signals
- Users requesting team features
- Companies paying with business cards
- Feature requests around admin/audit
- Users asking for invoices

## B2B → B2C Signals
- Sales cycles too long
- Low deal values not worth sales cost
- Strong viral/word-of-mouth potential
- Consumer use case emerging
```

---

## Architecture Differences

| Component | B2C | B2B |
|-----------|-----|-----|
| **Database** | User-centric | Org → User hierarchy |
| **Auth** | Simple session | Session + org context |
| **Billing** | Stripe per user | Stripe per org/seat |
| **Data isolation** | User-level | Org-level |
| **Audit logs** | Optional | Required |
| **API** | Nice to have | Essential |

---

## Checklist

### B2C Launch

- [ ] Social login (Google, Apple minimum)
- [ ] Mobile-responsive
- [ ] Fast onboarding (< 60 seconds)
- [ ] Free tier available
- [ ] Referral mechanism
- [ ] Push notifications (mobile)
- [ ] App store presence plan

### B2B Launch

- [ ] Email/password + passwordless
- [ ] Team/organization model
- [ ] Admin dashboard
- [ ] Role-based permissions
- [ ] SSO ready (or roadmap)
- [ ] API documentation
- [ ] Data export
- [ ] Security page/SOC 2 roadmap
- [ ] Invoice support

---

## Related Skills

- `stripe/SKILL.md` — Payment integration
- `clerk/SKILL.md` — Authentication
- `landing/SKILL.md` — Landing page patterns
- `pricing/SKILL.md` — Pricing strategy
