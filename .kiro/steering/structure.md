# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── api-test/          # API testing pages
│   ├── dashboard/         # Dashboard pages
│   ├── nodes/             # Node management pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home/login page
├── components/            # Reusable UI components
├── lib/                   # Utility libraries and services
└── utils/                 # Helper utilities
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `NodeDetailModal.tsx`)
- **Pages**: lowercase with Next.js conventions
- **Utilities**: camelCase (e.g., `geocodingService.ts`)
- **Types**: `types.ts` for centralized type definitions

### Component Structure
- **Layout Components**: Root layout with Korean locale and dark theme
- **UI Components**: Reusable components in `/components`
- **Page Components**: Route-specific components in `/app`
- **Client Components**: Marked with `'use client'` directive

### Import Patterns
- **Path Aliases**: Use `@/*` for src imports
- **Type Imports**: Use `import type` for TypeScript types
- **Named Exports**: Prefer named exports over default exports for utilities

### Styling Conventions
- **Tailwind Classes**: Utility-first approach with custom extensions
- **Dark Theme**: Default dark mode with gray-900 backgrounds
- **Color Palette**: Blue accents, gray scales for dark UI
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

### State Management
- **React State**: useState/useEffect for component state
- **Authentication**: Centralized auth service in `/lib/auth.ts`
- **API Layer**: Centralized API calls in `/lib/api.ts`
- **Mock Data**: Development data in `/lib/mockData.ts`

### TypeScript Patterns
- **Strict Types**: Comprehensive interfaces in `/lib/types.ts`
- **Utility Types**: Helper functions with proper typing
- **Component Props**: Explicit interface definitions
- **API Responses**: Typed data structures for network calls