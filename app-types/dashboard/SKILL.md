---
name: app-type-dashboard
description: Complete blueprint for building dashboard applications. Admin panels, analytics dashboards, data visualization. Use when building any internal tool, admin interface, or data-heavy app.
---

# Dashboard App Blueprint

Build admin panels, analytics dashboards, data visualization apps.

## TL;DR

| Phase | Time | Output |
|-------|------|--------|
| Setup | 15 min | Project scaffolded |
| Layout | 30 min | Sidebar + header + main |
| Auth | 15 min | Protected routes |
| Data tables | 1 hr | CRUD interface |
| Charts | 30 min | Visualizations |
| Polish | 30 min | Loading, errors, responsive |

**Total: ~3 hours to functional dashboard**

---

## Recommended Stack

```
Framework:    Next.js 16.1.1 (App Router)
Database:     PostgreSQL + Prisma
Auth:         Clerk
Styling:      Tailwind + shadcn/ui
State:        TanStack Query
Tables:       TanStack Table
Charts:       Recharts
Forms:        react-hook-form + zod
Icons:        lucide-react
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, etc)
│   │   └── sign-in/
│   ├── (dashboard)/         # Protected dashboard
│   │   ├── layout.tsx       # Dashboard layout (sidebar)
│   │   ├── page.tsx         # Dashboard home
│   │   ├── analytics/
│   │   ├── users/
│   │   │   ├── page.tsx     # Users list
│   │   │   └── [id]/page.tsx # User detail
│   │   └── settings/
│   └── api/
├── components/
│   ├── ui/                  # shadcn components
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-item.tsx
│   │   └── user-nav.tsx
│   ├── charts/
│   │   ├── area-chart.tsx
│   │   ├── bar-chart.tsx
│   │   └── stat-card.tsx
│   └── tables/
│       ├── data-table.tsx
│       └── columns/
├── lib/
│   ├── db.ts
│   └── utils.ts
├── server/
│   └── actions/
└── types/
```

---

## Phase 1: Setup (15 min)

### 1. Create Project
```bash
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
```

### 2. Install Dependencies
```bash
pnpm add @clerk/nextjs @prisma/client @tanstack/react-query @tanstack/react-table recharts react-hook-form zod @hookform/resolvers lucide-react clsx tailwind-merge
pnpm add -D prisma
```

### 3. Setup shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button card table input dialog dropdown-menu avatar badge separator skeleton
```

### 4. Setup Prisma
```bash
npx prisma init
```

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

```bash
npx prisma db push
```

### 5. Setup Clerk

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
```

**Checkpoint CP0: Project scaffolded ✓**

---

## Phase 2: Layout (30 min)

### Dashboard Layout

```tsx
// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Sidebar

```tsx
// src/components/dashboard/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings 
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 border-r bg-muted/40 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

### Header

```tsx
// src/components/dashboard/header.tsx
import { UserButton } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8" />
      </div>
      <UserButton />
    </header>
  )
}
```

**Checkpoint CP1: Layout complete ✓**

---

## Phase 3: Auth (15 min)

### Middleware

```tsx
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtected = createRouteMatcher(["/(dashboard)(.*)"])

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth().protect()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

---

## Phase 4: Data Tables (1 hr)

### Reusable Data Table

```tsx
// src/components/tables/data-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### User Columns Example

```tsx
// src/components/tables/columns/user-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { User } from "@prisma/client"

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]
```

**Checkpoint CP2: Data tables working ✓**

---

## Phase 5: Charts (30 min)

### Stat Card

```tsx
// src/components/charts/stat-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.positive ? "text-green-500" : "text-red-500"}`}>
            {trend.positive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### Area Chart

```tsx
// src/components/charts/area-chart.tsx
"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  name: string
  value: number
}

interface AreaChartProps {
  title: string
  data: ChartData[]
}

export function AreaChartComponent({ title, data }: AreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## Phase 6: Dashboard Home

```tsx
// src/app/(dashboard)/page.tsx
import { StatCard } from "@/components/charts/stat-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { Users, DollarSign, Activity, CreditCard } from "lucide-react"

const chartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          trend={{ value: 20.1, positive: true }}
        />
        <StatCard
          title="Subscriptions"
          value="+2350"
          icon={Users}
          trend={{ value: 180.1, positive: true }}
        />
        <StatCard
          title="Sales"
          value="+12,234"
          icon={CreditCard}
          trend={{ value: 19, positive: true }}
        />
        <StatCard
          title="Active Now"
          value="+573"
          icon={Activity}
          trend={{ value: 201, positive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AreaChartComponent title="Revenue Over Time" data={chartData} />
        <AreaChartComponent title="User Growth" data={chartData} />
      </div>
    </div>
  )
}
```

**Checkpoint CP3: Dashboard functional ✓**

---

## Deploy

```bash
vercel --prod
```

**Checkpoint CP4: Shipped ✓**

---

## Common Dashboard Patterns

| Pattern | Solution |
|---------|----------|
| Real-time updates | TanStack Query `refetchInterval` |
| Export to CSV | Custom export function |
| Date range picker | shadcn date-picker |
| Filters | TanStack Table column filters |
| Row actions | Dropdown menu in column |
| Bulk actions | Selection + batch actions |
| Dark mode | next-themes |
