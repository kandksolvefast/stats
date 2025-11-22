# Stats - Design System

**Status:** v1.0 | **Last Updated:** 2025-11-22 | **Phase:** Planning

## Overview

The Stats design system defines the visual language, components, and patterns for the application. It ensures consistency across all modules while maintaining flexibility for module-specific needs.

### Design Principles

1. **Clarity Over Density**: Prioritize readability and comprehension over maximum information density
2. **Progressive Disclosure**: Show essential info upfront, details on demand
3. **Smooth & Responsive**: Every interaction should feel instantaneous and fluid
4. **Accessible by Default**: WCAG AA compliance, keyboard navigation, screen reader support
5. **Platform Native**: Respect OS conventions while maintaining brand identity

---

## Design Tokens

Design tokens are the atomic values of the design system, referenced in Tailwind configuration.

### Color Palette

#### Brand Colors (Dark Mode Primary)

```javascript
// tailwind.config.js
colors: {
    // Base colors
    background: {
        primary: '#0f0f0f',      // Main background
        secondary: '#1a1a1a',    // Card/panel background
        tertiary: '#262626',     // Elevated elements
        overlay: 'rgba(15, 15, 15, 0.85)', // Glass effect background
    },

    // Foreground/text
    foreground: {
        primary: '#ffffff',       // Primary text
        secondary: '#a1a1a1',     // Secondary text
        tertiary: '#737373',      // Disabled/muted text
        inverse: '#0f0f0f',       // Text on light backgrounds
    },

    // Borders
    border: {
        subtle: 'rgba(255, 255, 255, 0.1)',  // Light border
        default: 'rgba(255, 255, 255, 0.15)', // Standard border
        emphasis: 'rgba(255, 255, 255, 0.25)', // Highlighted border
    },
}
```

#### Module Accent Colors

Each module has a semantic color for identity and status visualization:

```javascript
colors: {
    cpu: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',   // Primary - Blue
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
    },
    ram: {
        50: '#faf5ff',
        100: '#f3e8ff',
        500: '#a855f7',   // Primary - Purple
        600: '#9333ea',
        700: '#7e22ce',
        900: '#581c87',
    },
    network: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',   // Primary - Green
        600: '#16a34a',
        700: '#15803d',
        900: '#14532d',
    },
    disk: {
        50: '#fefce8',
        100: '#fef9c3',
        500: '#eab308',   // Primary - Yellow
        600: '#ca8a04',
        700: '#a16207',
        900: '#713f12',
    },
    gpu: {
        50: '#fff7ed',
        100: '#ffedd5',
        500: '#f97316',   // Primary - Orange
        600: '#ea580c',
        700: '#c2410c',
        900: '#7c2d12',
    },
    battery: {
        50: '#ecfdf5',
        100: '#d1fae5',
        500: '#10b981',   // Primary - Emerald
        600: '#059669',
        700: '#047857',
        900: '#064e3b',
    },
    sensors: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',   // Primary - Red
        600: '#dc2626',
        700: '#b91c1c',
        900: '#7f1d1d',
    },
    bluetooth: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#0ea5e9',   // Primary - Sky
        600: '#0284c7',
        700: '#0369a1',
        900: '#0c4a6e',
    },
}
```

#### Semantic/Status Colors

```javascript
colors: {
    success: {
        bg: '#10b981',
        text: '#d1fae5',
        border: '#059669',
    },
    warning: {
        bg: '#f59e0b',
        text: '#fef3c7',
        border: '#d97706',
    },
    error: {
        bg: '#ef4444',
        text: '#fee2e2',
        border: '#dc2626',
    },
    info: {
        bg: '#3b82f6',
        text: '#dbeafe',
        border: '#2563eb',
    },
}
```

#### Usage Threshold Colors

For visualizing resource usage levels:

```javascript
colors: {
    usage: {
        low: '#22c55e',      // 0-50% - Green
        medium: '#eab308',   // 50-75% - Yellow
        high: '#f97316',     // 75-90% - Orange
        critical: '#ef4444', // 90-100% - Red
    },
}
```

#### Light Mode (Secondary Theme)

```javascript
// Light mode overrides
colors: {
    background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
        overlay: 'rgba(255, 255, 255, 0.85)',
    },
    foreground: {
        primary: '#0f0f0f',
        secondary: '#525252',
        tertiary: '#a3a3a3',
        inverse: '#ffffff',
    },
}
```

### Typography

#### Font Families

```javascript
fontFamily: {
    sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
    ],
    mono: [
        'JetBrains Mono',
        'SF Mono',
        'Monaco',
        'Consolas',
        'monospace',
    ],
}
```

#### Font Sizes

```javascript
fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
}
```

#### Font Weights

```javascript
fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
}
```

#### Usage Guidelines

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title (h1) | 3xl | bold | foreground-primary |
| Section Title (h2) | 2xl | semibold | foreground-primary |
| Card Title (h3) | xl | semibold | foreground-primary |
| Subsection (h4) | lg | medium | foreground-primary |
| Body Text | base | normal | foreground-primary |
| Label | sm | medium | foreground-secondary |
| Caption | xs | normal | foreground-tertiary |
| Metric Value | 4xl-5xl | bold | module accent |
| Metric Unit | sm | medium | foreground-tertiary |
| Code/Monospace | base | normal | foreground-primary |

### Spacing Scale

Consistent spacing using 4px base unit:

```javascript
spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
}
```

#### Spacing Usage

| Context | Spacing | Use Case |
|---------|---------|----------|
| Component padding | 4-6 (16-24px) | Card, panel inner padding |
| Section gap | 8-12 (32-48px) | Between major sections |
| Element gap | 2-4 (8-16px) | Between related elements |
| Tight spacing | 1-2 (4-8px) | Within buttons, labels |
| Layout margin | 6-8 (24-32px) | Page margins |

### Border Radius

```javascript
borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.625rem',   // 10px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
}
```

#### Usage

| Element | Radius |
|---------|--------|
| Buttons | md (10px) |
| Cards | lg (12px) |
| Modals | xl (16px) |
| Inputs | md (10px) |
| Badges | full |
| Charts | sm (4px) |
| Avatars | full |

### Shadows

Glass morphism and subtle elevation:

```javascript
boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
}
```

### Backdrop Blur

For glass morphism effects:

```javascript
backdropBlur: {
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
}
```

### Transitions

```javascript
transitionDuration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
}

transitionTimingFunction: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy easing
}
```

---

## Component Primitives

### Button

**Variants:**

```tsx
// Primary button
<button className="
    px-4 py-2
    bg-cpu-500 hover:bg-cpu-600
    text-white font-medium
    rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-cpu-500 focus:ring-offset-2
">
    Primary
</button>

// Secondary button
<button className="
    px-4 py-2
    bg-background-tertiary hover:bg-background-secondary
    text-foreground-primary font-medium
    border border-border-default
    rounded-md
    transition-colors duration-200
">
    Secondary
</button>

// Ghost button
<button className="
    px-4 py-2
    text-foreground-secondary hover:text-foreground-primary
    hover:bg-background-tertiary
    rounded-md
    transition-colors duration-200
">
    Ghost
</button>
```

**Sizes:**
- Small: `px-3 py-1.5 text-sm`
- Medium (default): `px-4 py-2 text-base`
- Large: `px-6 py-3 text-lg`

**States:**
- Hover: Slightly darker background
- Active: Pressed state (scale-95)
- Disabled: `opacity-50 cursor-not-allowed`
- Focus: Ring with accent color

### Card

```tsx
<div className="
    bg-background-secondary
    border border-border-subtle
    rounded-lg
    p-6
    shadow-md
    backdrop-blur-md
    transition-shadow hover:shadow-lg
">
    {/* Card content */}
</div>
```

**Variants:**
- **Default**: Standard card with subtle border
- **Glass**: `bg-background-overlay backdrop-blur-lg`
- **Elevated**: `shadow-lg` for prominence
- **Interactive**: `hover:shadow-xl cursor-pointer` for clickable cards

### Input

```tsx
<input className="
    w-full px-4 py-2
    bg-background-tertiary
    border border-border-default
    rounded-md
    text-foreground-primary
    placeholder:text-foreground-tertiary
    focus:outline-none focus:ring-2 focus:ring-cpu-500
    transition-all duration-200
" />
```

**Types:**
- Text input
- Number input (with tabular numbers)
- Select dropdown
- Checkbox/Toggle
- Range slider

### Badge

```tsx
<span className="
    inline-flex items-center
    px-2.5 py-0.5
    bg-cpu-500/10
    text-cpu-500
    text-xs font-medium
    rounded-full
">
    Badge
</span>
```

**Variants:**
- **Status**: Success, warning, error, info colors
- **Module**: CPU, RAM, Network, etc. accent colors
- **Neutral**: Gray background

### Toggle/Switch

```tsx
<button
    role="switch"
    aria-checked={enabled}
    className={`
        relative inline-flex h-6 w-11
        items-center rounded-full
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-cpu-500
        ${enabled ? 'bg-cpu-500' : 'bg-background-tertiary'}
    `}
>
    <span className={`
        inline-block h-4 w-4
        transform rounded-full
        bg-white
        transition-transform duration-200
        ${enabled ? 'translate-x-6' : 'translate-x-1'}
    `} />
</button>
```

### Tooltip

```tsx
<div className="
    absolute z-50
    px-2 py-1
    bg-background-primary
    border border-border-default
    text-foreground-primary text-xs
    rounded shadow-lg
    whitespace-nowrap
">
    Tooltip content
</div>
```

### Modal

```tsx
{/* Backdrop */}
<div className="
    fixed inset-0 z-40
    bg-black/50
    backdrop-blur-sm
    transition-opacity
" />

{/* Modal */}
<div className="
    fixed inset-0 z-50
    flex items-center justify-center
    p-4
">
    <div className="
        bg-background-secondary
        border border-border-default
        rounded-xl
        shadow-2xl
        max-w-lg w-full
        p-6
    ">
        {/* Modal content */}
    </div>
</div>
```

---

## Widget Components

### MiniWidget

Small circular progress indicator for system tray:

```tsx
<div className="flex items-center gap-2">
    {/* Circular progress */}
    <svg className="w-6 h-6">
        <circle
            cx="12" cy="12" r="10"
            className="stroke-background-tertiary"
            strokeWidth="2"
            fill="none"
        />
        <circle
            cx="12" cy="12" r="10"
            className="stroke-cpu-500"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${usage * 0.628} 62.8`}
            transform="rotate(-90 12 12)"
        />
    </svg>
    <span className="text-sm font-medium tabular-nums">
        {usage}%
    </span>
</div>
```

### LineChart

Real-time line chart for historical data:

```tsx
<ResponsiveContainer width="100%" height={200}>
    <LineChart data={history}>
        <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#cpuGradient)"
            dot={false}
            animationDuration={300}
        />
        <XAxis hide />
        <YAxis hide domain={[0, 100]} />
        <Tooltip />
    </LineChart>
</ResponsiveContainer>
```

### GaugeWidget

Circular gauge for percentage values:

```tsx
<div className="relative w-32 h-32">
    <svg className="w-full h-full -rotate-90">
        {/* Background arc */}
        <circle
            cx="64" cy="64" r="56"
            className="stroke-background-tertiary"
            strokeWidth="8"
            fill="none"
        />
        {/* Progress arc with gradient */}
        <circle
            cx="64" cy="64" r="56"
            className="stroke-cpu-500"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${usage * 3.52} 352`}
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
        />
    </svg>
    {/* Center text */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
            <div className="text-3xl font-bold tabular-nums">{usage}%</div>
            <div className="text-xs text-foreground-tertiary">CPU</div>
        </div>
    </div>
</div>
```

### MetricCard

Large metric display with trend:

```tsx
<div className="
    bg-background-secondary
    border border-border-subtle
    rounded-lg p-6
">
    <div className="flex items-start justify-between">
        <div>
            <p className="text-sm text-foreground-secondary mb-1">CPU Usage</p>
            <p className="text-4xl font-bold text-cpu-500 tabular-nums">
                {usage}%
            </p>
        </div>
        <div className="w-16 h-16">
            <MiniSparkline data={history} color="cpu-500" />
        </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
        <TrendIcon trend={trend} />
        <span className="text-xs text-foreground-tertiary">
            vs. previous minute
        </span>
    </div>
</div>
```

---

## Chart Styling Guidelines

### Colors
- Use module accent colors for primary data series
- Use gradient fills for area charts (30% opacity)
- Use semantic colors for thresholds (green/yellow/orange/red)
- Muted grid lines: `stroke-border-subtle`

### Axes
- Hide axes labels for compact widgets
- Show axes for detailed popups
- Use tabular numbers for tick labels
- Grid lines: subtle, 10% opacity

### Tooltips
- Dark background with slight transparency
- Module accent color border
- Include timestamp and unit
- Smooth transitions on hover

### Animations
- Initial draw: 500ms ease-out
- Updates: 300ms ease-in-out
- Hover: 150ms
- No animations if `prefers-reduced-motion`

---

## Layout Patterns

### System Tray Menu

```
┌─────────────────────────┐
│  CPU     [🔵 45%]      │ ← Mini widget
│  RAM     [🟣 62%]      │
│  Network [🟢 ↑12 ↓45]  │
├─────────────────────────┤
│  Show Dashboard         │
│  Settings               │
│  Quit                   │
└─────────────────────────┘
```

### Popup Panel

```
┌──────────────────────────────────┐
│  CPU Usage                    [×] │ ← Header
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │  [Gauge: 45%]   [History]  │  │ ← Dashboard
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│  Per-Core Breakdown               │ ← Details
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐            │
│  │▓▓│ │▓░│ │▓▓│ │▓░│            │
│  └──┘ └──┘ └──┘ └──┘            │
├──────────────────────────────────┤
│  Top Processes                    │ ← Process list
│  Chrome      45%                  │
│  VSCode      12%                  │
└──────────────────────────────────┘
```

### Dashboard View

```
┌────────────────────────────────────────────────┐
│  Stats                              [⚙️] [☀️]  │ ← Header
├────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   CPU    │ │   RAM    │ │ Network  │       │ ← Grid of modules
│  │  [45%]   │ │  [62%]   │ │ ↑12 ↓45  │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Disk   │ │   GPU    │ │ Battery  │       │
│  │  [78%]   │ │  [32%]   │ │   85%    │       │
│  └──────────┘ └──────────┘ └──────────┘       │
└────────────────────────────────────────────────┘
```

### Settings View

```
┌────────────────────────────────────────────────┐
│  Settings                                 [×]  │
├──────────┬─────────────────────────────────────┤
│ CPU      │  Update Interval: [▼ 1 second]     │
│ RAM      │                                     │
│ Network  │  Widget Type:                       │
│ Disk     │  ⚪ Mini  ⚫ Line Chart  ⚪ Gauge   │
│ GPU      │                                     │
│ Battery  │  Show Temperature:  [✓]             │
│ Sensors  │                                     │
│──────────│  Threshold Alert: [____] %          │
│ App      │                                     │
│ About    │  [Save]                   [Cancel]  │
└──────────┴─────────────────────────────────────┘
```

---

## Animation Guidelines

### Micro-interactions

```tsx
// Hover scale
<div className="transition-transform hover:scale-105 duration-200">

// Button press
<button className="active:scale-95 transition-transform duration-100">

// Fade in
<div className="animate-fadeIn">

// Slide in from right
<div className="animate-slideInRight">
```

### Number Animations

Use Framer Motion for count-up effects:

```tsx
<motion.span
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
>
    {animatedValue}
</motion.span>
```

### Chart Animations

- Initial load: Draw lines from left to right (500ms)
- Data update: Smooth transition of values (300ms)
- Hover: Highlight data point (150ms)

### Page Transitions

```tsx
<motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
>
    {/* Page content */}
</motion.div>
```

### Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## Accessibility

### Keyboard Navigation

- Tab order follows visual hierarchy
- Focus indicators visible (ring-2)
- Escape closes modals/popups
- Arrow keys navigate lists

### Screen Readers

- Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic updates
- Alt text for all images

### Color Contrast

All text meets WCAG AA:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Focus Management

```tsx
// Visible focus ring
<button className="
    focus:outline-none
    focus:ring-2
    focus:ring-cpu-500
    focus:ring-offset-2
">
```

---

## Responsive Behavior

### Breakpoints

```javascript
screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
}
```

### Layout Adaptations

- **Small (< 640px)**: Single column, stacked modules
- **Medium (640-1024px)**: 2-column grid
- **Large (> 1024px)**: 3-column grid, sidebar visible

### Window Sizing

- Minimum window size: 480x600
- Default window size: 800x600
- Resizable: Yes
- Responsive units: Use `rem` for typography, `%` for layouts

---

## Usage Rules

### Do's ✅

- Use design tokens from Tailwind config
- Maintain consistent spacing (4px grid)
- Apply module accent colors consistently
- Use tabular numbers for metrics
- Include smooth transitions
- Provide loading states
- Handle empty states
- Show error boundaries

### Don'ts ❌

- Don't use arbitrary values (use tokens)
- Don't mix spacing systems
- Don't use pure black (#000) or pure white (#fff)
- Don't animate large lists (performance)
- Don't rely on color alone for meaning
- Don't use text smaller than 12px
- Don't exceed 3 levels of elevation

---

## Tailwind Configuration Reference

See [tailwind.config.js](../tailwind.config.js) for complete configuration.

Key plugins:
- `@tailwindcss/forms` - Form styling
- `@tailwindcss/typography` - Rich text
- `tailwindcss-animate` - Animation utilities

---

## Figma / Design Files

*(To be added: Link to Figma file with component library)*

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial design system | Project Team |

---

**Next Steps:**
1. Implement Tailwind config with these tokens
2. Create component library in Storybook (optional)
3. Build example pages using design system
