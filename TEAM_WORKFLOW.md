# VNA Frontend - Team Structure & Workflow

## 🏗️ Cấu Trúc Thư Mục

```
vna-frontend/
├── app/                              # Next.js App Router (ROOT LEVEL)
│   ├── (auth)/                       # Auth routes group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/[token]/page.tsx
│   │   └── layout.tsx
│   ├── (protected)/                  # Authenticated routes
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── src/
│   ├── components/
│   │   ├── auth/                     # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── ui/                       # Reusable UI
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Alert.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ProtectedRoute.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useForm.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # API client + interceptors
│   │   ├── validators.ts             # Form validators
│   │   ├── storage.ts                # LocalStorage helpers
│   │   └── auth.ts                   # Auth utilities
│   │
│   ├── context/
│   │   └── AuthContext.tsx           # Auth global state
│   │
│   ├── services/
│   │   └── authService.ts            # Auth API calls
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   └── api.ts
│   │
│   └── constants/
│       ├── routes.ts
│       ├── apiConfig.ts
│       └── messages.ts
│
├── public/
├── .env.example                      # ENV template
├── .env.local                        # ENV local (gitignored)
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── TEAM_WORKFLOW.md                  # This file
```