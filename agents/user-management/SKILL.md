---
name: user-management
description: Admin-side user management patterns. User lists, CRUD, roles/permissions, moderation, analytics dashboards. Use when building admin panels or user management features.
---

# User Management

Build admin tools to manage your users.

## TL;DR

| Need | Pattern |
|------|---------|
| User list | Filterable table with search, pagination |
| User detail | Profile view with actions |
| Roles | Role-based access control (RBAC) |
| Moderation | Ban, verify, flag workflows |
| Analytics | User metrics dashboard |

---

## Context Questions (Ask First)

Before implementing user management:

1. **Scale** — 100 users or 1M? (affects pagination, search, caching)
2. **Self-service vs. Admin** — Can users manage themselves or admin-only?
3. **Role complexity** — Simple (admin/user) or complex (org hierarchies)?
4. **Moderation needs** — Community content? Need ban/flag workflows?
5. **Compliance** — GDPR? Need data export/deletion?

---

## User List Patterns

### Basic Table (Small Scale)

```tsx
// Simple paginated table
export function UserTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, filters],
    queryFn: () => getUsers({ page, ...filters })
  })
  
  return (
    <DataTable
      columns={columns}
      data={data?.users}
      pagination={{
        page,
        pageSize: 20,
        total: data?.total
      }}
    />
  )
}
```

### Searchable + Filterable (Medium Scale)

- Debounced search input
- Filter dropdowns (role, status, date range)
- Column sorting
- Bulk actions (select multiple)

### Virtual Scroll (Large Scale)

- Use `@tanstack/react-virtual` for 10k+ users
- Server-side search only
- Cursor pagination, not offset

---

## User Detail View

### Profile Sections

```tsx
// Modular profile view
<UserProfile>
  <UserHeader user={user} />
  <Tabs>
    <TabPane label="Overview">
      <UserOverview user={user} />
    </TabPane>
    <TabPane label="Activity">
      <UserActivity userId={user.id} />
    </TabPane>
    <TabPane label="Settings">
      <UserSettings userId={user.id} />
    </TabPane>
  </Tabs>
  <UserActions user={user} />
</UserProfile>
```

### Action Patterns

| Action | UI Pattern | Confirmation |
|--------|------------|--------------|
| Edit profile | Inline or modal form | Save button |
| Change role | Dropdown with save | Yes if escalating |
| Suspend | Button → modal | Always confirm |
| Delete | Button → modal | Type username to confirm |
| Impersonate | Button → new session | Log action |

---

## Roles & Permissions

### Simple RBAC

```typescript
// Simple role check
const ROLES = ['user', 'moderator', 'admin', 'superadmin'] as const
type Role = typeof ROLES[number]

function hasPermission(userRole: Role, requiredRole: Role) {
  return ROLES.indexOf(userRole) >= ROLES.indexOf(requiredRole)
}
```

### Permission-Based (More Flexible)

```typescript
// Granular permissions
type Permission = 
  | 'users:read' 
  | 'users:write' 
  | 'users:delete'
  | 'content:moderate'
  | 'billing:manage'

const rolePermissions: Record<Role, Permission[]> = {
  user: [],
  moderator: ['users:read', 'content:moderate'],
  admin: ['users:read', 'users:write', 'content:moderate'],
  superadmin: ['users:read', 'users:write', 'users:delete', 'billing:manage']
}
```

### Org Hierarchies (Complex)

- Tenant → Org → Team → User
- Inherited permissions cascade down
- Use libraries: `casl`, `oso`, or build custom

---

## Moderation Workflows

### User States

```typescript
type UserStatus = 
  | 'active' 
  | 'pending_verification'
  | 'suspended' 
  | 'banned'
  | 'deleted'
```

### Moderation Actions

| Action | Effect | Reversible | Logged |
|--------|--------|------------|--------|
| Warn | Send message, log | Yes | Yes |
| Suspend | Temp block (X days) | Auto-expires | Yes |
| Ban | Permanent block | Admin can lift | Yes |
| Delete | Remove account | No (soft delete recommended) | Yes |

### Audit Trail

```typescript
// Always log moderation actions
await createAuditLog({
  action: 'user.banned',
  targetUserId: user.id,
  performedBy: admin.id,
  reason: reason,
  metadata: { duration, previousStatus }
})
```

---

## User Analytics (Admin Dashboard)

### Key Metrics

| Metric | What It Shows |
|--------|---------------|
| DAU/WAU/MAU | Active users by period |
| Retention | % returning after X days |
| Churn | % leaving per period |
| Signup funnel | Drop-off by step |
| Feature adoption | % using specific features |

### Quick Dashboard Layout

```tsx
<DashboardGrid>
  <StatCard title="Total Users" value={stats.total} />
  <StatCard title="Active Today" value={stats.dau} />
  <StatCard title="New This Week" value={stats.weeklySignups} />
  <StatCard title="Churn Rate" value={stats.churnRate} suffix="%" />
  
  <ChartCard title="Signups Over Time">
    <LineChart data={signupTrend} />
  </ChartCard>
  
  <ChartCard title="User Distribution">
    <PieChart data={roleDistribution} />
  </ChartCard>
</DashboardGrid>
```

---

## GDPR / Compliance

### Data Export

```typescript
// Generate user data export
async function exportUserData(userId: string) {
  const user = await getUser(userId)
  const activity = await getUserActivity(userId)
  const content = await getUserContent(userId)
  
  return {
    profile: sanitize(user),
    activity,
    content,
    exportedAt: new Date().toISOString()
  }
}
```

### Right to Delete

```typescript
// Soft delete with data retention rules
async function deleteUser(userId: string) {
  // 1. Anonymize PII
  await anonymizeUser(userId)
  
  // 2. Mark as deleted
  await updateUser(userId, { status: 'deleted', deletedAt: new Date() })
  
  // 3. Schedule hard delete (30 days)
  await scheduleHardDelete(userId, { daysFromNow: 30 })
  
  // 4. Revoke all sessions
  await revokeUserSessions(userId)
}
```

---

## Integration with Auth Providers

### Clerk

```typescript
// Sync Clerk users to your DB
import { clerkClient } from '@clerk/nextjs/server'

// Webhook handler for user events
export async function handleClerkWebhook(event: WebhookEvent) {
  switch (event.type) {
    case 'user.created':
      await syncUserToDb(event.data)
      break
    case 'user.updated':
      await updateUserInDb(event.data)
      break
    case 'user.deleted':
      await softDeleteUser(event.data.id)
      break
  }
}
```

### Custom Metadata

```typescript
// Store custom data in Clerk
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { role: 'admin' },
  privateMetadata: { internalNotes: '...' }
})
```

---

## Quick Decisions

| Scenario | Recommendation |
|----------|----------------|
| < 1000 users | Simple table, client filtering OK |
| 1k-100k users | Server-side search + pagination |
| 100k+ users | Virtual scroll, cursor pagination, search service |
| Simple roles | 3-tier: user/moderator/admin |
| Complex orgs | Full RBAC with permission sets |
| Community app | Add moderation queue, reports system |
| B2B SaaS | Add org/team hierarchy |

---

## Related Skills

- [Database](/agents/database/SKILL.md) — User schema design
- [Backend Patterns](/agents/backend-patterns/SKILL.md) — API design
- [Security](/agents/security/SKILL.md) — Auth best practices
- [Analytics](/agents/analytics/SKILL.md) — User tracking
