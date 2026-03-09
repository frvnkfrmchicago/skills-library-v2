---
name: laravel
description: PHP web framework for e-commerce, CMS, and rapid web development.
owner: Frank
last_updated: 2026-03
---

# Laravel

PHP's elegant framework. E-commerce, CMS, full-stack web apps.

---

## Context Questions

Before implementing with Laravel:

1. **What's the app type?** — E-commerce, CMS, SaaS, API?
2. **Frontend approach?** — Blade, Inertia (Vue/React), or API-only?
3. **Database needs?** — MySQL, PostgreSQL, SQLite?
4. **Hosting environment?** — Laravel Forge, Vapor (serverless), or self-managed?
5. **Scale expectations?** — Small site or high-traffic?

---

## TL;DR

| Need | Solution |
|------|----------|
| Database ORM | Eloquent |
| Frontend | Blade, Livewire, or Inertia |
| Auth | Laravel Breeze or Jetstream |
| API | API Resources + Sanctum |
| Queue jobs | Laravel Queue |
| Payments | Laravel Cashier (Stripe) |
| Search | Laravel Scout (Algolia/Meilisearch) |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Frontend** | Server-rendered Blade ←→ SPA with Inertia |
| **Interactivity** | Traditional forms ←→ Livewire real-time |
| **API style** | Full-stack ←→ API-only backend |
| **Scale** | Shared hosting ←→ Laravel Vapor serverless |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Traditional web app | Blade + Tailwind + Livewire |
| Modern SPA feel | Inertia.js + Vue/React |
| API backend only | API Resources + Sanctum |
| Real-time features | Laravel Echo + Pusher |
| E-commerce | Laravel + Stripe Cashier |
| CMS needs | Filament admin panel |

---

## When to Use Laravel

### ✅ Great Fit

- **E-commerce** — Mature ecosystem, Stripe/payment integrations
- **CMS/Admin** — Filament, Nova admin panels
- **Rapid development** — Convention over configuration
- **PHP teams** — Massive talent pool
- **Traditional hosting** — Works on any PHP host

### ❌ Consider Alternatives

- **High-concurrency real-time** — Node.js better fit
- **Existing React/Next.js team** — Keep JS stack
- **Serverless-first** — Vapor works but adds complexity

---

## Quick Start

```bash
# Create new Laravel project
composer create-project laravel/laravel my-app

# With starter kit
composer create-project laravel/laravel my-app
cd my-app
composer require laravel/breeze --dev
php artisan breeze:install

# Run development server
php artisan serve
```

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/         # Form validation
├── Models/               # Eloquent models
├── Services/             # Business logic
└── Policies/             # Authorization
resources/
├── views/                # Blade templates
├── css/
└── js/
routes/
├── web.php               # Web routes
└── api.php               # API routes
database/
├── migrations/
└── seeders/
```

---

## Core Patterns

### Eloquent Model

```php
// app/Models/Post.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    protected $fillable = ['title', 'slug', 'content', 'user_id'];
    
    protected $casts = [
        'published_at' => 'datetime',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
    
    // Scope for published posts
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }
}
```

### Controller

```php
// app/Http/Controllers/PostController.php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with('user')
            ->published()
            ->latest()
            ->paginate(15);
            
        return view('posts.index', compact('posts'));
    }
    
    public function show(Post $post)
    {
        $post->load(['user', 'comments.user']);
        
        return view('posts.show', compact('post'));
    }
    
    public function store(StorePostRequest $request)
    {
        $post = auth()->user()->posts()->create($request->validated());
        
        return redirect()->route('posts.show', $post)
            ->with('success', 'Post created successfully!');
    }
}
```

### Form Request Validation

```php
// app/Http/Requests/StorePostRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'unique:posts'],
            'content' => ['required', 'string'],
        ];
    }
}
```

### Blade Template

```blade
{{-- resources/views/posts/index.blade.php --}}
@extends('layouts.app')

@section('content')
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold mb-6">Blog Posts</h1>
        
        <div class="grid gap-6">
            @forelse($posts as $post)
                <article class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-semibold">
                        <a href="{{ route('posts.show', $post) }}">
                            {{ $post->title }}
                        </a>
                    </h2>
                    <p class="text-gray-600 mt-2">
                        By {{ $post->user->name }} • 
                        {{ $post->published_at->diffForHumans() }}
                    </p>
                    <p class="mt-4">{{ Str::limit($post->content, 200) }}</p>
                </article>
            @empty
                <p>No posts found.</p>
            @endforelse
        </div>
        
        {{ $posts->links() }}
    </div>
@endsection
```

---

## API Resources

```php
// app/Http/Resources/PostResource.php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'author' => new UserResource($this->whenLoaded('user')),
            'comments_count' => $this->when(
                $this->comments_count !== null, 
                $this->comments_count
            ),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}

// Usage in controller
return PostResource::collection($posts);
```

---

## Livewire (Real-time UI)

```php
// app/Livewire/SearchPosts.php
<?php

namespace App\Livewire;

use App\Models\Post;
use Livewire\Component;

class SearchPosts extends Component
{
    public string $search = '';
    
    public function render()
    {
        return view('livewire.search-posts', [
            'posts' => Post::where('title', 'like', "%{$this->search}%")
                ->limit(10)
                ->get(),
        ]);
    }
}
```

```blade
{{-- resources/views/livewire/search-posts.blade.php --}}
<div>
    <input 
        type="text" 
        wire:model.live="search" 
        placeholder="Search posts..."
    />
    
    <ul>
        @foreach($posts as $post)
            <li>{{ $post->title }}</li>
        @endforeach
    </ul>
</div>
```

---

## Common Packages

| Package | Purpose |
|---------|---------|
| `laravel/breeze` | Simple auth scaffolding |
| `laravel/jetstream` | Full auth + teams |
| `laravel/cashier` | Stripe subscriptions |
| `laravel/scout` | Full-text search |
| `livewire/livewire` | Real-time UI components |
| `filament/filament` | Admin panel generator |
| `spatie/laravel-permission` | Roles & permissions |

---

## Related Skills

- `app-types/ecommerce/SKILL.md` — E-commerce patterns
- `agents/shopify/SKILL.md` — Alternative for e-commerce
- `agents/payments/SKILL.md` — Payment integration
- `agents/database/SKILL.md` — Database design
