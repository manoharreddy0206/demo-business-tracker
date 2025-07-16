# Hostel Management System

## Overview

This is a modern hostel fee management system built with React, Express, TypeScript, and Firebase. The application provides QR code-based student verification, real-time fee tracking, and an admin dashboard for managing student records and payments.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

- Completely rebuilt admin dashboard with simplified, more effective design
- Added comprehensive CRUD operations (Create, Read, Update, Delete) for student management
- Implemented "Last Updated" display within fee status with light gray text
- Added real-time updates that sync when admin or student changes status
- Created student management forms with validation for: username, phone number, joining date, room number
- Integrated payment mode tracking (UPI/Cash) with visual indicators
- Added search functionality for students across name, mobile, and room
- Implemented edit and delete operations with confirmation dialogs
- **Mobile-Responsive Design Implementation** (January 12, 2025):
  - Responsive navigation with mobile hamburger menu
  - Mobile-optimized dashboard cards with adaptive spacing and icon sizes
  - Touch-friendly student cards for mobile instead of table layout
  - Responsive dialogs and forms with proper mobile viewport handling
  - Student portal optimized for mobile devices with larger touch targets
- **Dashboard Enhancements** (January 12, 2025):
  - Changed "Monthly Revenue" to "Total Collected" with Indian rupee formatting (₹1.5L, ₹2.5Cr format)
  - Added overdue status detection for students with unpaid fees after 30 days
  - Implemented clickable dashboard cards for filtering (Total, Paid, Pending, Overdue)
  - Enhanced date/time display showing exact payment timestamp for paid status
  - Improved payment mode indicators (UPI/Cash) with compact spacing
  - Added dual payment buttons (UPI/Cash) for quick admin fee marking
  - Updated "Updated By" field to show student/admin source without extra spacing
  - Added filter status indicator showing active filter and count with clear option
- **Simplified Fee Status Management** (January 12, 2025):
  - Consolidated duplicate dropdowns into single user-friendly payment status dropdown
  - Smart dropdown shows "Mark Paid" for unpaid students, "Paid" for paid students
  - Options adapt based on current status: mark as paid (UPI/Cash) or change payment mode
  - Consistent dropdown behavior across both desktop table and mobile card views
  - Removed redundant controls to eliminate user confusion and improve workflow efficiency
- **Simplified Status System** (January 12, 2025):
  - Removed overdue status, now using only "paid" and "pending" for cleaner workflow
  - Updated dashboard cards to show only Total, Paid, Pending, and Total Collected
  - Simplified schema and data models to remove overdue complexity
  - Updated filter system to work with only two fee statuses
- **Business Expense Management System** (January 12, 2025):
  - Added comprehensive expense tracking for maintenance, salaries, rent, and utilities
  - Created dedicated expense management component with full CRUD operations
  - Integrated expense analytics with category-wise totals and monthly summaries
  - Added dual navigation system for switching between Students and Expenses
  - Implemented responsive design following simple functional component patterns
  - Enhanced data models with expense schema and business analytics methods
- **Ultra User-Friendly Interface Redesign** (January 12, 2025):
  - Added visual cash flow dashboard showing income vs outgoing money with simple language
  - Created "Money Flow" as primary tab with profit/loss visualization and business tips
  - Used emojis and simple terms throughout interface (💰 Money Flow, 🔧 Repairs, 👥 Students)
  - Added comprehensive expense breakdown with percentage calculations
  - Implemented month/year filtering for cash flow analysis with clear visual indicators
  - Enhanced all labels and descriptions to be understandable without technical knowledge
- **Complete Firebase Integration** (January 12, 2025):
  - Migrated entire system from in-memory storage to Firebase Firestore
  - Implemented real-time data synchronization across all devices
  - Added Firebase Admin SDK for secure server-side operations
  - Created comprehensive Firebase service layer with error handling
  - Maintained local data fallback for offline scenarios and development
  - All student records, admin authentication, and business data now stored in cloud
  - Real-time listeners update UI instantly when data changes from any device
- **Production UPI Payment System** (January 12, 2025):
  - Implemented comprehensive UPI payment integration with QR code generation
  - Added professional payment dialog with real-time status tracking
  - Created standardized UPI URLs compatible with all payment apps
  - Integrated payment completion workflows with automatic status updates
  - Added Firebase test page at /firebase-test for connection verification
  - Prepared production deployment guides for Vercel, Railway, and Netlify
- **Deployment Configuration Fixed** (January 15, 2025):
  - Resolved Vercel serverless function crashes by converting to frontend-only deployment
  - Fixed FUNCTION_INVOCATION_FAILED errors with simplified configuration
  - Updated vercel.json for proper SPA routing and build process
  - Created deployment hook solution for GitHub email authentication issues
  - Streamlined build process to work with Vercel's static hosting
- **Settings Save Button Implementation** (January 15, 2025):
  - Added proper form validation for hostel settings (monthly fee, UPI ID, hostel name)
  - Created dedicated HostelSettingsForm component with success feedback
  - Implemented save confirmation with visual success indicators
  - Added form validation with minimum fee requirements and required fields
  - Enhanced user experience with loading states and proper error handling
- **Secure Admin Authentication System** (January 15, 2025):
  - Replaced open signup with secure admin-only authentication
  - Added admin profile management with password change functionality
  - Created dedicated admin profile tab with account details and security settings
  - Implemented consistent credentials (admin/admin123) across all environments
  - Added comprehensive admin management features with mobile optimization
- **Fixed Auto-Generated Expense Records Bug** (January 15, 2025):
  - Resolved critical issue where expense records were auto-generating without user input
  - Removed automatic sample data loading that was causing expenses to persist after deletion
  - Updated local data manager to start with empty expense array instead of sample data
  - Added clear all expenses functionality for complete data reset
  - Fixed Firebase initialization to prevent unwanted expense seeding
- **Enhanced Firebase Data Persistence for Live Production** (January 16, 2025):
  - Fixed critical Firebase connectivity issue where production condition prevented Firebase usage in development
  - Removed production-only condition (import.meta.env.PROD) to enable Firebase for all environments with project ID
  - Enhanced Add Student functionality to properly use Firebase operations with fallback to localStorage
  - Added comprehensive Firebase support for expense CRUD operations (create, read, update, delete)
  - Updated all async operations to properly handle Firebase data persistence
  - Fixed student and expense data to persist correctly in live Firebase environment
  - Enhanced error handling and logging for Firebase operations with local storage fallback
- **Fixed Missing Add Student Button on Mobile** (January 16, 2025):
  - Added dedicated Add Student button to mobile layout that was missing compared to desktop version
  - Implemented full-width mobile-optimized Add Student button with proper touch targets
  - Ensured complete feature parity between mobile and desktop interfaces
  - Fixed mobile student management workflow by adding missing Add Student functionality
- **Comprehensive Mobile UI Fixes** (January 16, 2025):
  - Fixed text hidden under header in expense and money flow pages by adding proper padding
  - Replaced horizontal scroll expense table with mobile-friendly card layout showing all properties
  - Enhanced expense cards with organized sections for category, amount, date, payment method, recipient, and notes
  - Fixed student form spacing issues with proper mobile margins and responsive dialog containers
  - Implemented dual layout system: mobile cards for phones, desktop table for larger screens
- **Enhanced App-Like Authentication System** (January 16, 2025):
  - Implemented persistent login sessions that survive app closure and reopening
  - Added 7-day session expiration for security while maintaining app-like experience  
  - Enhanced session restoration with proper token validation and error handling
  - Users now stay logged in when closing and reopening the app like native mobile apps
  - Added comprehensive localStorage management for seamless authentication experience
- **Production Demo Deployment Ready** (January 16, 2025):
  - Created comprehensive demo deployment guides for client presentations
  - Fixed dialog width issues for perfect mobile fitting (95vw with proper constraints)
  - Added fee status dropdown to student forms with conditional payment mode selection
  - Prepared Vercel deployment configuration for instant demo hosting
  - Created detailed demo scripts and feature showcase documentation for client meetings
  - System is production-ready with Firebase backend and can be deployed to live demo in minutes
- **Enhanced Forgot Password and UI Fixes** (January 15, 2025):
  - Fixed expense amount field to properly clear "0" values when editing
  - Added mobile number option for forgot password instead of just email
  - Fixed hostel name dynamic update issue by implementing immediate UI refresh
  - Improved settings synchronization to update interface without page reload
  - Enhanced contact method selection with both email and mobile options
- **Profile-Based Contact Verification for Forgot Password** (January 15, 2025):
  - Implemented contact verification against actual admin profile data
  - Added mobile number field to admin profile with proper validation
  - Forgot password now validates email/mobile against stored profile information
  - Enhanced admin profile form with mobile number editing capability
  - Added proper localStorage sync for adminProfile data
- **Made Recipient Name Optional in Expense Form** (January 15, 2025):
  - Updated expense form to make recipient name field optional instead of required
  - Added "(Optional)" label to clearly indicate the field is not mandatory
  - Enhanced expense display to show "Not specified" when no recipient name provided
  - Updated interface and validation to handle optional recipient names properly
- **Comprehensive Mobile-Responsive Design Implementation** (January 15, 2025):
  - Created complete mobile-first responsive design with touch-friendly interfaces
  - Added MobileNavigation component with hamburger menu and smooth transitions
  - Implemented MobileStudentCard with optimized card layout for touch devices
  - Enhanced admin dashboard with mobile-responsive layouts and components
  - Optimized student portal with mobile-specific spacing and container sizing
  - Added mobile-specific touch targets and improved button sizes for better usability
  - Implemented responsive grid layouts that adapt to screen sizes
  - Added mobile-optimized dialog forms and modal interactions
  - Created mobile-friendly notification system with proper positioning
  - All CRUD operations now work seamlessly on mobile devices
- **Streamlined Mobile Interface** (January 15, 2025):
  - Removed redundant bottom navigation (Money/Students/Expenses tabs) to eliminate clutter
  - Removed floating action button (FAB) in favor of simple Add Student button
  - Simplified navigation to use only hamburger menu for cleaner design
  - Fixed payment mode display bug - no longer shows "UPI" when status is pending
  - Added compact stats grid directly in mobile Students tab for quick overview
  - Cleaned up mobile interface by removing duplicate quick action components
  - Enhanced mobile student cards with proper conditional payment mode display
  - Streamlined mobile layout to reduce scrolling and improve user experience
- **Fixed Hostel Name Dynamic Loading Issue** (January 15, 2025):
  - Fixed hostel name not updating in app interface despite Firebase/settings updates
  - Updated home page to load actual hostel name from settings instead of hardcoded text
  - Enhanced QR verification component to display dynamic hostel name
  - Implemented proper data binding for hostel name across all public-facing components
  - Resolved UI sync issues by connecting components to actual settings data
- **Added Downloadable QR Code Generator** (January 15, 2025):
  - Created functional QR code generator using qrcode library for student portal access
  - Replaced placeholder QR code with real scannable QR code pointing to student portal
  - Added download functionality for QR code with PNG format export
  - Implemented QR code regeneration feature for updated URLs
  - Enhanced home page with professional QR code display for student access
- **Monthly Auto-Reset and Pay Now Control** (January 15, 2025):
  - Implemented automatic monthly fee reset based on 1st-10th collection period logic
  - System automatically resets all students to "pending" when entering new month
  - Added admin dashboard setting to enable/disable "Pay Now" button in student portal
  - Created monthly reset tracking to prevent duplicate resets within same month
  - Added manual "Reset All Fees to Pending" button in Settings for immediate testing
  - Enhanced student portal to respect Pay Now button settings with appropriate messaging
  - Smart late-reset detection handles cases where system wasn't running on 1st of month
  - Updated storage and schema to support new monthly reset and payment control features
- **Bug Fixes and Debugging** (January 12, 2025):
  - Fixed student addition form validation and button click issues
  - Added comprehensive logging for form submission debugging
  - Enhanced error handling for mutation operations
  - Improved dialog state management and form reset functionality
  - **RESOLVED: Add Student Button Issue** - Fixed critical bug where student data returned empty objects
  - Disabled Firebase operations due to network timeouts, using reliable local storage
  - All CRUD operations now work instantly without Firebase connection delays
- **Mobile-First Responsive Design & Clickable Details** (January 12, 2025):
  - Optimized cash flow and expense cards for mobile with compact sizing and reduced padding
  - Made all cards clickable with detailed popup dialogs showing breakdown information
  - Added visual "eye" icons to indicate clickable elements for better user guidance
  - Reduced scrolling on mobile by optimizing card layouts and responsive grid systems
  - Created category breakdown dialogs with percentage calculations and visual indicators
  - Enhanced touch targets and improved mobile navigation throughout the interface

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: Firebase Firestore (NoSQL document database)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Schema Validation**: Zod for runtime type checking

### Data Storage Solutions
- **Primary Database**: Firebase Firestore for all production data
- **Real-time Sync**: Firebase listeners for instant updates across devices
- **Authentication**: Firebase Admin SDK for server-side operations
- **Schema Management**: Shared TypeScript schemas with Zod validation
- **Fallback Storage**: In-memory storage for development/offline scenarios

## Key Components

### Frontend Components
1. **StudentPortal**: QR verification and student details view (mobile-optimized)
2. **AdminDashboard**: Student management and fee tracking (responsive design)
3. **QRVerification**: Mobile number verification system (touch-friendly)
4. **StudentDetails**: Student information display (mobile-responsive)
5. **UI Components**: Complete shadcn/ui component library with responsive behavior

### Backend Services
1. **Express Server**: RESTful API with middleware for logging
2. **Storage Interface**: Abstracted storage layer with in-memory implementation
3. **Route Registration**: Modular route handling system
4. **Vite Integration**: Development server with HMR support

### Shared Schemas
- **Student Schema**: ID, name, mobile, room, joining date, fee status
- **Hostel Settings**: Monthly fee, UPI ID, hostel name
- **Verification Schema**: Mobile number validation

## Data Flow

1. **Student Access**:
   - Student enters mobile number for verification
   - System queries Firebase for student record
   - Displays student details and fee status
   - Provides UPI payment integration

2. **Admin Management**:
   - Real-time student list with Firebase listeners
   - Fee status updates with immediate reflection
   - Search and filter functionality
   - Payment marking capabilities

3. **Data Synchronization**:
   - Firebase real-time listeners for instant updates
   - TanStack Query for optimistic updates and caching
   - Shared schema validation across client and server

## External Dependencies

### Core Dependencies
- **Firebase**: Authentication and Firestore database
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first styling

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **ESLint/Prettier**: Code quality (configured)
- **PostCSS**: CSS processing

## Deployment Strategy

### Build Process
- **Client**: Vite builds React app to `dist/public`
- **Server**: ESBuild bundles Express server to `dist/index.js`
- **Assets**: Static files served from build output

### Environment Configuration
- **Development**: Local Vite dev server with Express backend
- **Production**: Single Node.js server serving static files and API
- **Database**: Firebase connection with environment-based configuration

### Scripts
- `npm run dev`: Development with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Database schema deployment (Drizzle)

### Architecture Decisions

1. **Firebase Choice**: Chosen for real-time capabilities and ease of setup, with Drizzle ORM prepared for future PostgreSQL migration if needed
2. **Monorepo Structure**: Single repository with client, server, and shared code for simplified development
3. **TypeScript**: End-to-end type safety with shared schemas
4. **Component Library**: shadcn/ui for consistent, accessible UI components
5. **State Management**: TanStack Query for server state, local state for UI interactions