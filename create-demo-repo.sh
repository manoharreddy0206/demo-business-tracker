#!/bin/bash

# Script to create independent demo environment
# Run this on your local machine or GitHub Codespaces

echo "🚀 Creating Independent Demo Environment..."

# Create new directory for demo
mkdir hostel-management-demo
cd hostel-management-demo

# Initialize git repository
git init

# Create demo-specific package.json
cat > package.json << 'EOF'
{
  "name": "hostel-management-demo",
  "version": "1.0.0",
  "description": "Professional Hostel Management System - Demo Environment",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production node dist/index.js",
    "demo": "npm run build && npm start",
    "db:push": "drizzle-kit push:pg"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.8.4",
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^4.17.21",
    "@types/node": "^20.8.7",
    "@types/react": "^18.2.33",
    "@types/react-dom": "^18.2.14",
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "firebase": "^10.7.1",
    "lucide-react": "^0.290.0",
    "qrcode": "^1.5.3",
    "react": "^18.2.0",
    "react-day-picker": "^8.9.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.47.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss": "^3.3.5",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^3.14.0",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "wouter": "^2.12.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.4",
    "postcss": "^8.4.31"
  }
}
EOF

# Create demo-specific vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "hostel-management-demo",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DEMO_MODE": "true"
  },
  "installCommand": "npm install"
}
EOF

# Create .env.example for demo
cat > .env.example << 'EOF'
# Demo Environment Variables
NODE_ENV=production
DEMO_MODE=true

# Firebase Configuration (Demo)
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_PROJECT_ID=demo-project-id
VITE_FIREBASE_APP_ID=demo-app-id

# Demo Settings
VITE_APP_MODE=demo
VITE_DEMO_CREDENTIALS_DISPLAY=true
EOF

# Create README for demo
cat > README.md << 'EOF'
# Hostel Management System - Demo Environment

## 🚀 Live Demo

**Demo URL:** [Deploy to get your link]
**Admin Dashboard:** `/admin`
**Student Portal:** `/student`

### Demo Credentials
```
Admin Login:
Username: admin
Password: admin123

Student Portal Test Numbers:
9876543210
1234567890
5555666777
```

## Quick Deployment

### Deploy to Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Deploy with one click
4. Get professional demo URL

### Deploy to Netlify
1. Fork this repository  
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist/public`

### Deploy to Railway
1. Fork this repository
2. Connect to Railway
3. Auto-deploy on push

## Demo Features

✅ **Student Management** - Add, edit, search students
✅ **Payment Tracking** - UPI/Cash payment modes
✅ **Financial Dashboard** - Income vs expense analytics
✅ **Mobile-Responsive** - Works on all devices
✅ **QR Code Portal** - Student self-service
✅ **Real-time Updates** - Instant synchronization
✅ **Professional UI** - Modern, clean interface

## Technology Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Radix UI  
- **State Management:** TanStack Query
- **Build Tool:** Vite
- **Deployment:** Vercel/Netlify ready

## AI/ML Future Roadmap

See `AI_ML_ROADMAP.md` for detailed 3-phase enhancement plan including:
- Payment prediction models
- Student behavior analysis  
- Smart automation features
- Business intelligence dashboard

---

**Ready for immediate client demonstrations!**
EOF

echo "✅ Demo environment structure created!"
echo "📁 Next steps:"
echo "1. Copy your project files to this directory"
echo "2. Create GitHub repository: hostel-management-demo"
echo "3. Push code: git add . && git commit -m 'Demo environment' && git push"
echo "4. Deploy to Vercel/Netlify for professional demo URL"
EOF