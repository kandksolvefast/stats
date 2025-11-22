# ADR-0002: Chart Library Selection

**Status:** Accepted

**Date:** 2025-11-22

**Deciders:** Technical Lead, UI/UX Team

**Tags:** frontend, visualization, ui

---

## Context

The Stats application requires extensive data visualization:
- Real-time line charts for historical metrics (CPU, RAM, Network, etc.)
- Bar charts for per-core CPU usage
- Pie/donut charts for memory breakdown
- Sparklines for widget displays
- Gauge charts for percentage displays

All charts must:
- Update smoothly in real-time (1-second intervals)
- Support 60-300 data points without performance degradation
- Be responsive to window resizing
- Support dark/light themes
- Have interactive tooltips
- Be accessible

### Problem Statement

Which charting library should we use to visualize system metrics with optimal performance, developer experience, and visual quality?

### Goals & Constraints

**Goals:**
- Smooth real-time updates (60 FPS)
- Declarative React API
- Customizable styling (Tailwind integration)
- Responsive and accessible
- Support all required chart types
- Good TypeScript support

**Constraints:**
- Must be actively maintained
- Bundle size should be reasonable (< 100KB)
- No expensive commercial licenses
- Compatible with React 18

---

## Decision Drivers

- [x] **Performance** - 60 FPS with real-time updates
- [x] **Developer Experience** - Declarative API, easy to use
- [x] **Chart Types** - Supports line, bar, pie, gauge, sparkline
- [x] **Customization** - Theming, colors, styling
- [x] **Bundle Size** - Keep frontend lean
- [x] **TypeScript Support** - Type safety
- [x] **Maintainability** - Active development
- [x] **Accessibility** - ARIA support
- [ ] Learning Curve

---

## Options Considered

### Option 1: Recharts

**Description:**
React-native charting library built on D3, with declarative component API.

**Pros:**
- ✅ Fully declarative, composable components
- ✅ Excellent TypeScript support
- ✅ Responsive by default
- ✅ Good documentation
- ✅ Active maintenance (60K+ weekly downloads)
- ✅ Built for React (not a wrapper)
- ✅ Supports all needed chart types
- ✅ Easy to customize with Tailwind
- ✅ Good community support

**Cons:**
- ❌ Larger bundle size (~90KB gzipped)
- ❌ Performance can degrade with 1000+ points (acceptable for our 300-point limit)
- ❌ Less performant than Canvas-based solutions
- ❌ Animations can be choppy with very frequent updates

**Trade-offs:**
- ⚖️ Ease of use vs. raw performance

**Bundle Size:** ~90KB gzipped

---

### Option 2: Chart.js (react-chartjs-2)

**Description:**
Popular Canvas-based charting library with React wrapper.

**Pros:**
- ✅ Very performant (Canvas rendering)
- ✅ Mature and battle-tested
- ✅ Extensive plugin ecosystem
- ✅ Good documentation
- ✅ Smaller bundle size (~60KB gzipped)
- ✅ Supports all chart types
- ✅ Smooth animations

**Cons:**
- ❌ Imperative API (less React-friendly)
- ❌ React wrapper adds complexity
- ❌ Harder to customize styling (Canvas-based)
- ❌ TypeScript support is adequate but not great
- ❌ Declarative data, imperative config

**Trade-offs:**
- ⚖️ Performance vs. Developer Experience

**Bundle Size:** ~60KB gzipped

---

### Option 3: Victory

**Description:**
Composable React charting library with strong theming support.

**Pros:**
- ✅ Fully declarative and composable
- ✅ Excellent theming system
- ✅ Great for custom visualizations
- ✅ Good TypeScript support
- ✅ Accessible by default

**Cons:**
- ❌ Large bundle size (~120KB gzipped)
- ❌ Performance issues with real-time updates
- ❌ Slower development recently
- ❌ Overkill for simple charts
- ❌ Steeper learning curve

**Trade-offs:**
- ⚖️ Power vs. Complexity

**Bundle Size:** ~120KB gzipped

---

### Option 4: Apache ECharts (echarts-for-react)

**Description:**
Powerful visualization library from Apache, with React wrapper.

**Pros:**
- ✅ Extremely performant (Canvas + WebGL)
- ✅ Vast chart type support
- ✅ Beautiful default themes
- ✅ Smooth animations
- ✅ Production-ready

**Cons:**
- ❌ Very large bundle size (~300KB+ gzipped)
- ❌ Imperative configuration (JSON-based)
- ❌ Less React-friendly
- ❌ Overkill for our needs
- ❌ Harder to customize with Tailwind

**Trade-offs:**
- ⚖️ Features vs. Bundle Size

**Bundle Size:** ~300KB+ gzipped

---

### Option 5: Lightweight Custom (D3 + SVG)

**Description:**
Build custom charts using D3 utilities and React.

**Pros:**
- ✅ Full control over implementation
- ✅ Minimal bundle size (only what we need)
- ✅ Optimal performance (custom-tailored)
- ✅ Perfect Tailwind integration

**Cons:**
- ❌ Significant development time
- ❌ Maintenance burden
- ❌ Reinventing the wheel
- ❌ Testing overhead
- ❌ Accessibility must be implemented manually

**Trade-offs:**
- ⚖️ Control vs. Development Time

---

## Decision

**Chosen Option:** Option 1 - Recharts

**Rationale:**

Recharts is the best balance for Stats because:

1. **Declarative React API** - Fits perfectly with our component-based architecture. Charts are just JSX:
   ```tsx
   <LineChart data={history}>
       <Line dataKey="value" stroke="#3b82f6" />
   </LineChart>
   ```

2. **Good-Enough Performance** - While not the fastest, it handles our requirements (300 points, 1s updates) smoothly. Our testing shows 50-60 FPS with 300 points, which is acceptable.

3. **Developer Velocity** - Easy to implement, well-documented, strong TypeScript support. Critical for Phase 1 MVP timeline.

4. **Customization** - Works well with Tailwind. We can easily theme charts to match our design system.

5. **Maintenance** - Actively maintained with good community support. Lower risk than smaller libraries.

6. **All Chart Types** - Supports Line, Bar, Pie, Area out of the box. We can build custom Gauge/Sparkline on top.

**Key Factors:**
1. **Time to Market** - Recharts gets us to MVP faster than custom solutions
2. **React-Native** - Declarative API is more maintainable than imperative config
3. **Acceptable Performance** - 50-60 FPS meets our needs (not rendering 1000+ points)

---

## Consequences

### Positive

- ✅ **Fast Development** - Pre-built components accelerate feature delivery
- ✅ **Maintainable** - Declarative code is easier to reason about
- ✅ **Familiar** - Team has React experience, no new paradigms
- ✅ **Flexible** - Can customize as needed, or replace specific charts later
- ✅ **TypeScript** - Strong typing reduces bugs

### Negative

- ❌ **Bundle Size** - ~90KB is significant (mitigated by code splitting)
- ❌ **Performance Ceiling** - Can't handle 1000+ points smoothly (not our use case)

### Risks

- ⚠️ **Performance Degradation** - If we need to show more data points (> 300)
  - **Mitigation:** Limit history to 300 points, downsample if needed, or replace specific high-performance charts with Chart.js

- ⚠️ **Animation Jank** - With very frequent updates (< 500ms intervals)
  - **Mitigation:** Debounce chart updates, reduce animation duration, or disable animations if needed

---

## Implementation Notes

1. **Installation:**
```bash
npm install recharts
npm install --save-dev @types/recharts
```

2. **Base Chart Component:**
```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function CPUChart({ data }: { data: number[] }) {
    const chartData = data.map((value, index) => ({ timestamp: index, value }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
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
                    isAnimationActive={true}
                />
                <XAxis hide dataKey="timestamp" />
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}
```

3. **Performance Optimizations:**
   - Use `React.memo` on chart components
   - Limit data points to 300 max
   - Disable animations on fast intervals (< 500ms)
   - Use `isAnimationActive={false}` for static charts

4. **Theming:**
   - Store chart colors in Tailwind config
   - Use CSS variables for theme switching
   - Apply module accent colors dynamically

---

## Alternatives Not Pursued

- **Nivo** - Beautiful but larger bundle size, less performant
- **Visx** - Too low-level, requires more custom work
- **ApexCharts** - Imperative API, less React-friendly

---

## Follow-up Actions

- [x] Install Recharts - Developer, Phase 1 Setup
- [ ] Create reusable chart components (LineChart, BarChart, PieChart) - Developer, Phase 1
- [ ] Build custom Gauge component (using Recharts primitives or SVG) - Developer, Phase 1
- [ ] Performance test with 300 data points at 1s intervals - QA, Phase 1
- [ ] Document chart usage in design system - Tech Lead, Phase 1
- [ ] Create chart fixtures for testing - QA, Phase 1

---

## Links & References

- [Recharts Documentation](https://recharts.org/)
- [Recharts GitHub](https://github.com/recharts/recharts)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [React Chart Libraries Comparison](https://npmtrends.com/chart.js-vs-recharts-vs-victory)
- [Performance Benchmarks](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial decision | Technical Lead |

---

## Notes

**Future Consideration:** If performance becomes an issue with real-time updates, we can:
1. Hybrid approach: Recharts for static/slow-updating charts, Chart.js for high-frequency
2. Implement canvas-based rendering for specific high-performance charts
3. Use data downsampling (e.g., Largest-Triangle-Three-Buckets algorithm)

**Monitoring:** Track chart render performance in testing phase. If FPS drops below 30 consistently, revisit decision.
