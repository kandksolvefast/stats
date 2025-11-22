import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          tertiary: '#262626',
          overlay: 'rgba(15, 15, 15, 0.85)'
        },
        foreground: {
          primary: '#ffffff',
          secondary: '#a1a1a1',
          tertiary: '#737373',
          inverse: '#0f0f0f'
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.1)',
          DEFAULT: 'rgba(255, 255, 255, 0.15)',
          emphasis: 'rgba(255, 255, 255, 0.25)'
        },
        cpu: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
        ram: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 900: '#581c87' },
        network: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 900: '#14532d' },
        disk: { 50: '#fefce8', 100: '#fef9c3', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 900: '#713f12' },
        gpu: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 900: '#7c2d12' },
        battery: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857', 900: '#064e3b' },
        sensors: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 900: '#7f1d1d' },
        bluetooth: { 50: '#eff6ff', 100: '#dbeafe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e' },
        success: { bg: '#10b981', text: '#d1fae5', border: '#059669' },
        warning: { bg: '#f59e0b', text: '#fef3c7', border: '#d97706' },
        error: { bg: '#ef4444', text: '#fee2e2', border: '#dc2626' },
        info: { bg: '#3b82f6', text: '#dbeafe', border: '#2563eb' },
        usage: { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }]
      },
      spacing: {
        0: '0',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backdropBlur: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }
  },
  plugins: [forms, typography]
};
