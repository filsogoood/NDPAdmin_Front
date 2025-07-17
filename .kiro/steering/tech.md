# Technology Stack

## Framework & Runtime
- **Next.js 15.4.1** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript development
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Dark Mode**: Enabled by default with `class` strategy
- **Custom Fonts**: Inter (sans-serif), Fira Code (monospace)
- **Icons**: Lucide React for consistent iconography
- **Responsive Design**: Mobile-first approach with breakpoints

## Key Libraries
- **clsx** - Conditional className utility
- **date-fns** - Date manipulation and formatting (Korean locale)
- **react-simple-maps** - Geographic visualization components
- **recharts** - Data visualization and charting

## Development Tools
- **ESLint** - Code linting with Next.js and TypeScript rules
- **PostCSS** - CSS processing with Autoprefixer
- **TypeScript strict mode** - Enhanced type checking

## Build System & Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint checks
```

### Project Configuration
- **Module Resolution**: Bundler-based with path aliases (`@/*` → `./src/*`)
- **Target**: ES2017 with modern browser support
- **JSX**: Preserve mode for Next.js optimization
- **Incremental Compilation**: Enabled for faster builds

## Architecture Patterns
- **App Router**: Next.js 13+ file-based routing in `src/app/`
- **Client Components**: Explicit `'use client'` directive for interactivity
- **TypeScript-first**: Strict typing with comprehensive type definitions
- **Utility-first CSS**: Tailwind classes with custom design system extensions