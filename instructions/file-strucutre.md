# File Structure

The project follows a standard Next.js structure with additional directories for organization:
jungian-dream-analyzer/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── services/
├── utils/
├── instructions/
│   ├── file-strucutre.md
│   ├── frontend-backend-guidelines.md
│   ├── prd.md
│   └── tech-stack.md
├── lib/
├── public/
├── node_modules/
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json

#

#Rules
- all new components should go in /components and be named like example-component.tsx unless otherwise specified 
- All new pages go in /app
- services/ for business logic (e.g., dream analysis)
- utils/ for utility functions (e.g., local storage helpers)


