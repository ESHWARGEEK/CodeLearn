# CodeLearn Design System

**Version:** 1.0  
**Last Updated:** February 26, 2026

---

## Design Tokens

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary: #6366F1;           /* Indigo 500 - Primary actions, links */
  --primary-hover: #4F46E5;     /* Indigo 600 - Hover states */
  --primary-light: #818CF8;     /* Indigo 400 - Light accents */
  --primary-dark: #3730A3;      /* Indigo 700 - Dark accents */
  
  /* Secondary Colors */
  --secondary: #8B5CF6;         /* Violet 500 - Secondary actions */
  --secondary-hover: #7C3AED;   /* Violet 600 - Hover states */
  
  /* Success/Accent */
  --success: #10B981;           /* Emerald 500 - Success states */
  --success-light: #34D399;     /* Emerald 400 - Light success */
  
  /* Warning */
  --warning: #F59E0B;           /* Amber 500 - Warning states */
  --warning-light: #FBBF24;     /* Amber 400 - Light warning */
  
  /* Error */
  --error: #EF4444;             /* Red 500 - Error states */
  --error-light: #F87171;       /* Red 400 - Light error */
  
  /* Background Colors */
  --dark-bg: #0F172A;           /* Slate 900 - Main background */
  --card-bg: #1E293B;           /* Slate 800 - Card/panel background */
  --surface: #334155;           /* Slate 700 - Surface elements */
  --surface-hover: #475569;     /* Slate 600 - Hover surfaces */
  
  /* Text Colors */
  --text-primary: #F8FAFC;      /* Slate 50 - Primary text */
  --text-secondary: #94A3B8;    /* Slate 400 - Secondary text */
  --text-muted: #64748B;        /* Slate 500 - Muted text */
  
  /* Border Colors */
  --border: #334155;            /* Slate 700 - Default borders */
  --border-light: #475569;      /* Slate 600 - Light borders */
  
  /* Code Editor Colors */
  --editor-bg: #0D1117;         /* GitHub dark background */
  --editor-line-highlight: #1F2937;  /* Gray 800 - Line highlight */
  
  /* Syntax Highlighting */
  --token-keyword: #C678DD;     /* Purple - Keywords */
  --token-function: #61AFEF;    /* Blue - Functions */
  --token-string: #98C379;      /* Green - Strings */
  --token-comment: #5C6370;     /* Gray - Comments */
  --token-operator: #56B6C2;    /* Cyan - Operators */
  --token-number: #D19A66;      /* Orange - Numbers */
  --token-class: #E5C07B;       /* Yellow - Classes */
  --token-tag: #E06C75;         /* Red - Tags */
  --token-attr: #D19A66;        /* Orange - Attributes */
}
```

### Typography

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Space Grotesk', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing Scale

```css
/* Spacing (based on 4px grid) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Fully rounded */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-glow: 0 0 15px rgba(99, 102, 241, 0.3);
--shadow-glow-hover: 0 0 20px rgba(99, 102, 241, 0.5);
```

---

## Component Patterns

### Buttons

```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg font-medium hover:bg-slate-750 transition-colors">
  Secondary Action
</button>

<!-- Tertiary Button -->
<button class="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
  Tertiary Action
</button>

<!-- Icon Button -->
<button class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
  <span class="material-symbols-outlined">settings</span>
</button>
```

### Cards

```html
<!-- Standard Card -->
<div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-indigo-500/30 transition-colors">
  <h3 class="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p class="text-sm text-gray-400">Card content goes here</p>
</div>

<!-- Interactive Card -->
<div class="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-gray-500 transition-all cursor-pointer relative overflow-hidden">
  <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
    <span class="material-symbols-outlined text-gray-400 text-[20px]">bookmark</span>
  </div>
  <h4 class="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Interactive Card</h4>
  <p class="text-sm text-gray-400">Hover to see interaction</p>
</div>
```

### Form Inputs

```html
<!-- Text Input -->
<input 
  type="text"
  class="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
  placeholder="Enter text..."
/>

<!-- Search Input with Icon -->
<div class="relative group">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors material-symbols-outlined text-[20px]">search</span>
  <input 
    type="text"
    class="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
    placeholder="Search..."
  />
</div>
```

### Badges

```html
<!-- Status Badges -->
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wide">Beginner</span>
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 uppercase tracking-wide">Intermediate</span>
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 uppercase tracking-wide">Advanced</span>
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-300 uppercase tracking-wide">Completed</span>
```

---

## Layout Patterns

### Three-Panel Workspace

```html
<div class="flex h-screen overflow-hidden">
  <!-- Left Panel (Tasks/Files) -->
  <aside class="w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col shrink-0">
    <!-- Content -->
  </aside>
  
  <!-- Center Panel (Editor) -->
  <section class="flex-1 flex flex-col min-w-0 bg-[#0D1117]">
    <!-- Content -->
  </section>
  
  <!-- Right Panel (Preview/AI) -->
  <aside class="w-[400px] flex flex-col border-l border-[#334155] shrink-0 bg-[#0F172A]">
    <!-- Content -->
  </aside>
</div>
```

### Dashboard Grid

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <!-- Stat cards -->
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Main content (2 cols) + Sidebar (1 col) -->
  <div class="lg:col-span-2">
    <!-- Main content -->
  </div>
  <aside>
    <!-- Sidebar -->
  </aside>
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: 320px - 767px (mobile) */

/* Tablet */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Animation Guidelines

### Transitions

```css
/* Standard transition */
transition: all 0.2s ease-out;

/* Color transition */
transition: color 0.2s ease-out, background-color 0.2s ease-out;

/* Transform transition */
transition: transform 0.3s ease-out;
```

### Hover Effects

```html
<!-- Lift on hover -->
<div class="transform hover:scale-105 transition-transform">

<!-- Glow on hover -->
<button class="shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow">

<!-- Border highlight -->
<div class="border border-slate-700 hover:border-indigo-500/50 transition-colors">
```

---

## Accessibility

### Focus States

```html
<!-- Always include visible focus indicators -->
<button class="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900">

<!-- For dark backgrounds -->
<input class="focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500">
```

### ARIA Labels

```html
<!-- Icon buttons need labels -->
<button aria-label="Close dialog">
  <span class="material-symbols-outlined">close</span>
</button>

<!-- Loading states -->
<button aria-busy="true" aria-label="Loading...">
  <span class="animate-spin">⏳</span>
</button>
```

### Color Contrast

- Text on dark background: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio

---

## Dark Mode (Default)

All designs are dark mode by default. Light mode is not in MVP scope.

**Background Hierarchy:**
1. `#0F172A` - Main background (darkest)
2. `#1E293B` - Cards/panels (medium)
3. `#334155` - Surfaces/hover states (lightest)

**Text Hierarchy:**
1. `#F8FAFC` - Primary text (headings, important content)
2. `#94A3B8` - Secondary text (descriptions, labels)
3. `#64748B` - Muted text (timestamps, metadata)

