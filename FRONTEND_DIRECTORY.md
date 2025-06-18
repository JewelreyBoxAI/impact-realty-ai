# Impact Realty AI - Frontend Directory Structure

## Overview
This document outlines the complete frontend directory structure for the Impact Realty AI project. The frontend is built with Next.js 14, TypeScript, and follows modern React patterns with a focus on the DualCore Agent theme and professional design.

## Complete Directory Structure

```
impact-realty-ai/frontend/
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── next.config.js                  # Next.js configuration
├── postcss.config.js               # PostCSS configuration
├── jest.config.js                  # Jest testing configuration
├── jest.setup.js                   # Jest setup file
├── next-env.d.ts                   # Next.js TypeScript definitions
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
│
└── src/
    ├── middleware.ts               # Next.js middleware for auth/routing
    │
    ├── app/                        # Next.js App Router (main application)
    │   ├── layout.tsx              # Root layout component
    │   ├── page.tsx                # Home page
    │   ├── loading.tsx             # Global loading UI
    │   ├── error.tsx               # Global error UI
    │   ├── not-found.tsx           # 404 page
    │   │
    │   ├── auth/                   # Authentication pages
    │   │   ├── layout.tsx          # Auth layout wrapper
    │   │   ├── page.tsx            # Auth landing page
    │   │   ├── loading.tsx         # Auth loading state
    │   │   ├── error.tsx           # Auth error handling
    │   │   ├── login/
    │   │   │   └── page.tsx        # Login page
    │   │   ├── signup/
    │   │   │   └── page.tsx        # Signup page
    │   │   ├── reset/
    │   │   │   └── page.tsx        # Password reset page
    │   │   └── update-password/
    │   │       └── page.tsx        # Password update page
    │   │
    │   ├── content/                # Content management pages
    │   │   ├── add/
    │   │   │   └── page.tsx        # Add content page
    │   │   └── [id]/
    │   │       └── page.tsx        # Dynamic content detail page
    │   │
    │   └── profile/                # User profile pages
    │       ├── layout.tsx          # Profile layout
    │       ├── page.tsx            # Profile main page
    │       ├── loading.tsx         # Profile loading state
    │       └── error.tsx           # Profile error handling
    │
    ├── components/                 # Reusable React components
    │   ├── AgentDashboard.tsx      # Main agent dashboard component
    │   ├── BookmarkedItems.tsx     # Bookmarked content component
    │   ├── ContentDetailCard.tsx   # Content detail card
    │   ├── ContentDetailCardWithSelect.tsx # Content card with selection
    │   ├── ContentList.tsx         # Content listing component
    │   ├── ContentListWithSelect.tsx # Content list with selection
    │   ├── FAQSection.tsx          # FAQ section component
    │   ├── FeaturesSection.tsx     # Features showcase section
    │   ├── Footer.tsx              # Site footer
    │   ├── HeroSection.tsx         # Landing page hero
    │   ├── Navbar.tsx              # Main navigation
    │   ├── NavbarAuth.tsx          # Authenticated navigation
    │   ├── PricingSection.tsx      # Pricing display section
    │   ├── TestimonialsSection.tsx # Customer testimonials
    │   │
    │   ├── auth/                   # Authentication components
    │   │   ├── AuthForm.tsx        # Login/signup form component
    │   │   └── ProfileCard.tsx     # User profile card
    │   │
    │   ├── common/                 # Common/shared components
    │   │   └── LoadingSpinner.tsx  # Loading spinner component
    │   │
    │   ├── dashboard/              # Dashboard-specific components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── flow-builder/           # Workflow builder components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── flow-library/           # Workflow library components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── icons/                  # Custom icon components
    │   │   └── BookmarkIcon.tsx    # Bookmark icon component
    │   │
    │   ├── layout/                 # Layout components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── monitoring/             # Monitoring dashboard components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── providers/              # Context providers
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   ├── settings/               # Settings page components
    │   │   └── (empty)             # Directory exists but empty
    │   │
    │   └── shared/                 # Shared utility components
    │       └── (empty)             # Directory exists but empty
    │
    ├── features/                   # Feature-specific logic
    │   └── userActions/            # User actions feature
    │       ├── UserActionsContext.tsx # React context for user actions
    │       └── useUserActions.ts   # Custom hook for user actions
    │
    ├── lib/                        # Utility libraries
    │   └── (empty)                 # Directory exists but empty
    │
    ├── styles/                     # Global styles
    │   └── globals.css             # Global CSS styles
    │
    ├── types/                      # TypeScript type definitions
    │   ├── content.ts              # Content-related types
    │   ├── supabase.ts             # Supabase client types
    │   └── supabase-js.d.ts        # Supabase JavaScript types
    │
    └── utils/                      # Utility functions
        └── mockContent.ts          # Mock data for development
```

## Key Architecture Points

### Next.js App Router Structure
- **App Router**: Using Next.js 14 App Router for file-based routing
- **Layout Components**: Nested layouts for different sections (auth, profile)
- **Loading & Error States**: Dedicated loading.tsx and error.tsx files for each route
- **Dynamic Routes**: `[id]` for dynamic content pages

### Component Organization
- **Feature-based**: Components organized by feature/domain
- **Reusable**: Common components in dedicated folders
- **Atomic Design**: Mix of atomic (icons) and molecular (cards) components

### State Management
- **React Context**: UserActionsContext for global user actions
- **Custom Hooks**: useUserActions for encapsulated state logic
- **Local State**: Component-level state for UI interactions

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework
- **Global Styles**: Custom CSS in globals.css
- **Component Styles**: Tailwind classes within components
- **DualCore Agent Theme**: Futuristic design with #0C0F1A background, #00FFFF neon accents

### TypeScript Integration
- **Strict Types**: Full TypeScript integration with strict mode
- **API Types**: Supabase-generated types for database integration
- **Component Props**: Strongly typed component interfaces

## Development Notes

### Currently Implemented
- ✅ Authentication flow (login, signup, reset, update password)
- ✅ Content management (list, detail, add)
- ✅ User profile management
- ✅ Agent dashboard with real-time updates
- ✅ Bookmark functionality
- ✅ Landing page sections (hero, features, pricing, testimonials, FAQ)

### Placeholder Directories
Some directories exist but are empty, indicating planned features:
- `components/dashboard/` - Additional dashboard components
- `components/flow-builder/` - Workflow builder interface
- `components/flow-library/` - Workflow library management
- `components/monitoring/` - System monitoring dashboards
- `components/settings/` - Settings management
- `lib/` - Shared utility libraries

### API Integration
- **Backend Communication**: REST API calls to FastAPI backend
- **Supabase**: Database and authentication integration
- **Real-time Updates**: WebSocket connections for live data

### Testing Setup
- **Jest**: Unit testing framework configured
- **Testing Library**: React Testing Library for component testing
- **Type Safety**: TypeScript ensures compile-time error catching

## Getting Started

### Installation
```bash
cd impact-realty-ai/frontend
npm install
```

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build
```bash
npm run build
npm run start
```

### Testing
```bash
npm run test
npm run test:watch
```

This structure follows modern Next.js best practices and is designed for scalability and maintainability according to the DualCore Agent theme and professional design standards. 