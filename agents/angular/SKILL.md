---
name: angular
description: Enterprise frontend framework with TypeScript, signals, and structured architecture.
owner: Frank
last_updated: 2026-03
---

# Angular

Google's enterprise framework. TypeScript-first. Batteries included.

---

## Context Questions

Before implementing with Angular:

1. **Why Angular?** — Enterprise mandate, team expertise, complex forms?
2. **What's the scale?** — Small app or large enterprise suite?
3. **State management?** — Component state, signals, or NgRx?
4. **Styling approach?** — Component styles, Tailwind, Material?
5. **Backend integration?** — REST, GraphQL, existing enterprise APIs?

---

## TL;DR

| Need | Solution |
|------|----------|
| UI components | Angular Material or PrimeNG |
| State management | Signals (Angular 17+) or NgRx |
| Forms | Reactive Forms |
| HTTP | HttpClient |
| Routing | Angular Router |
| Styling | Component CSS, Tailwind, or SCSS |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **State complexity** | Local signals ←→ Global NgRx |
| **Styling** | Component CSS ←→ Tailwind utility |
| **Form complexity** | Template-driven ←→ Reactive forms |
| **Architecture** | Feature modules ←→ Standalone components |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Enterprise forms-heavy | Reactive Forms + Material |
| Dashboard with charts | Signals + PrimeNG |
| Simple CRUD | Standalone components + HttpClient |
| Large team | Feature modules + shared module |
| Complex state | NgRx or signals store pattern |

---

## When to Use Angular

### ✅ Great Fit

- **Enterprise apps** — Structure enforced, consistent patterns
- **Large teams** — Clear conventions, less decision fatigue
- **Complex forms** — Best-in-class reactive forms
- **TypeScript mandates** — Full TypeScript from day one
- **Long-term maintenance** — Stable, predictable updates

### ❌ Consider Alternatives

- **Marketing sites** — Next.js or Astro lighter
- **Small apps** — React or Vue simpler start
- **Rapid prototyping** — More boilerplate than alternatives

---

## Quick Start (Angular 17+)

```bash
# Create new project
npm install -g @angular/cli
ng new my-app --standalone --style=scss

# Generate components
ng generate component features/users/user-list
ng generate service core/services/user
```

---

## Project Structure

```
src/app/
├── app.component.ts         # Root component
├── app.config.ts            # App configuration
├── app.routes.ts            # Route definitions
├── core/                    # Singleton services
│   ├── interceptors/
│   └── services/
├── shared/                  # Reusable components
│   ├── components/
│   └── directives/
└── features/                # Feature areas
    └── users/
        ├── user-list/
        ├── user-detail/
        └── user.service.ts
```

---

## Core Patterns (Angular 17+)

### Standalone Component with Signals

```typescript
// user-list.component.ts
import { Component, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserService } from '../user.service'

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-list">
      <input 
        type="text" 
        [value]="searchTerm()" 
        (input)="updateSearch($event)"
        placeholder="Search users..."
      />
      
      @if (loading()) {
        <p>Loading...</p>
      } @else {
        <ul>
          @for (user of filteredUsers(); track user.id) {
            <li>{{ user.name }} - {{ user.email }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class UserListComponent {
  private userService = inject(UserService)
  
  users = signal<User[]>([])
  searchTerm = signal('')
  loading = signal(true)
  
  filteredUsers = computed(() => 
    this.users().filter(user => 
      user.name.toLowerCase().includes(this.searchTerm().toLowerCase())
    )
  )
  
  constructor() {
    this.loadUsers()
  }
  
  async loadUsers() {
    this.loading.set(true)
    const users = await this.userService.getUsers()
    this.users.set(users)
    this.loading.set(false)
  }
  
  updateSearch(event: Event) {
    const target = event.target as HTMLInputElement
    this.searchTerm.set(target.value)
  }
}
```

### Service with HttpClient

```typescript
// user.service.ts
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private apiUrl = '/api/users'
  
  async getUsers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(this.apiUrl)
    )
  }
  
  async getUser(id: string): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/${id}`)
    )
  }
  
  async createUser(user: CreateUserDto): Promise<User> {
    return firstValueFrom(
      this.http.post<User>(this.apiUrl, user)
    )
  }
}
```

### Reactive Forms

```typescript
import { Component, inject } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name" />
      @if (form.controls.name.invalid && form.controls.name.touched) {
        <span class="error">Name is required</span>
      }
      
      <input formControlName="email" placeholder="Email" type="email" />
      @if (form.controls.email.errors?.['email']) {
        <span class="error">Valid email required</span>
      }
      
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class UserFormComponent {
  private fb = inject(FormBuilder)
  
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  })
  
  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value)
    }
  }
}
```

### Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router'

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./features/users/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
  },
]
```

---

## Control Flow (Angular 17+)

```html
<!-- @if / @else -->
@if (loading()) {
  <p>Loading...</p>
} @else if (error()) {
  <p>Error: {{ error() }}</p>
} @else {
  <div>{{ data() }}</div>
}

<!-- @for -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items found</p>
}

<!-- @switch -->
@switch (status()) {
  @case ('loading') { <p>Loading...</p> }
  @case ('error') { <p>Error!</p> }
  @default { <p>Ready</p> }
}
```

---

## Common Packages

| Package | Purpose |
|---------|---------|
| `@angular/material` | UI components |
| `@ngrx/store` | State management |
| `@angular/fire` | Firebase integration |
| `primeng` | Rich UI components |
| `tailwindcss` | Utility CSS |

---

## Related Skills

- `agents/react/SKILL.md` — Alternative frontend
- `agents/nestjs/SKILL.md` — Angular-like backend
- `agents/testing/SKILL.md` — Angular testing
- `tech-stack/SKILL.md` — Framework selection
