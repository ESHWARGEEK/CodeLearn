# Stitch Website Design Prompt
# AI Learning & Developer Productivity Platform

## Project Overview

Design a modern, developer-focused web application for an AI-powered dual-mode platform that combines learning and productivity tools.

## Platform Identity

**Name:** [CodeLearn]  
**Tagline:** "Learn by Building Real Projects"  
**Mission:** Help developers learn new technologies through hands-on project reconstruction and accelerate development with AI-powered template integration

## Target Audience

- **Primary:** Junior/mid-level developers learning new frameworks (22-35 years old)
- **Secondary:** Professional developers seeking productivity tools (28-40 years old)
- **Tertiary:** Development teams and engineering managers

## Design Requirements

### Brand Personality
- **Professional yet approachable** - Not corporate, not playful
- **Tech-forward** - Modern, cutting-edge, AI-native
- **Educational** - Clear, guiding, supportive
- **Trustworthy** - Reliable, secure, transparent
- **Energetic** - Dynamic, fast, efficient

### Color Palette
- **Primary:** Modern tech blue or purple (suggest: #6366F1 indigo or #8B5CF6 violet)
- **Secondary:** Complementary accent (suggest: #10B981 emerald for success states)
- **Neutral:** Dark mode friendly grays (#1F2937 to #F9FAFB)
- **Code:** Syntax highlighting colors (VS Code inspired)
- **Status:** Green (success), Yellow (warning), Red (error)

### Typography
- **Headings:** Modern sans-serif (Inter, Poppins, or Space Grotesk)
- **Body:** Readable sans-serif (Inter or System UI)
- **Code:** Monospace (JetBrains Mono, Fira Code, or Monaco)

## Key Pages to Design

### 1. Landing Page (Homepage)

**Hero Section:**
- Headline: "Learn by Building Real Projects"
- Subheadline: "AI-powered platform that teaches you to code by reconstructing real GitHub projects"
- Primary CTA: "Start Learning Free"
- Secondary CTA: "See How It Works"
- Hero visual: Split-screen showing code editor on left, live preview on right

**Two-Mode Explanation:**
- Side-by-side cards explaining Learning Mode (FREE) and Developer Mode (FREEMIUM)
- Icons representing each mode
- Key benefits listed (3-4 bullets each)

**How It Works (3-step process):**
1. Choose a technology (React, Vue, Next.js, Node.js)
2. AI curates real projects and breaks them into tasks
3. Build, preview, and deploy your project

**Social Proof:**
- User count, projects built, hours saved
- Testimonials from beta users (3-4 cards)
- Logos of technologies supported

**Pricing Preview:**
- Simple 3-tier comparison (Free, Pro $19/mo, Team $99/mo)
- "Start Free" CTA

**Footer:**
- Links: About, Docs, Blog, Pricing, Contact
- Social media icons
- Newsletter signup


### 2. Dashboard (Main App Interface)

**Layout:**
- **Left Sidebar (240px):**
  - Logo and platform name
  - Navigation: Learning, Developer, Projects, Profile
  - User avatar and tier badge (Free/Pro/Team)
  - Collapse/expand toggle

- **Top Bar:**
  - Search bar (global search for projects/templates)
  - Notifications bell icon
  - User menu dropdown

- **Main Content Area:**
  - Welcome message with user's first name
  - Quick stats cards (Projects completed, Hours spent, Current streak)
  - "Continue Learning" section (current project with progress bar)
  - "Recommended for You" section (3 project cards)

- **Right Sidebar (optional, 300px):**
  - AI Mentor chat widget
  - Recent activity feed
  - Tips and shortcuts

**Design Notes:**
- Clean, spacious layout with plenty of white space
- Card-based design for content sections
- Smooth transitions and micro-interactions
- Dark mode toggle in user menu

### 3. Technology Selection Page

**Layout:**
- Page title: "Choose Your Technology"
- Subtitle: "Select a framework to start learning"
- Grid of technology cards (2x2 or 3x2 layout)

**Technology Card Design:**
- Large technology logo/icon
- Technology name (React, Vue, Next.js, Node.js)
- Brief description (1-2 sentences)
- Difficulty indicator (Beginner-friendly, Intermediate, Advanced)
- Project count badge ("12 projects available")
- "Start Learning" button
- Hover effect: Lift shadow, scale slightly

**Additional Elements:**
- Filter/sort options (Difficulty, Popularity, Recently Added)
- "Coming Soon" badges for future technologies (Python, Go, Rust)
- Search bar for quick technology lookup

### 4. Learning Path View

**Layout:**
- Breadcrumb: Home > Learning > React
- Page title: "React Learning Path"
- Subtitle: "Build 3 real-world projects from beginner to advanced"

**Project Cards (3 cards, vertical stack):**

**Card Structure:**
- **Badge:** Beginner / Intermediate / Advanced
- **Project Name:** e.g., "Todo App with Hooks"
- **Description:** 2-3 sentences about what you'll build
- **Metadata:**
  - Estimated time: "8-12 hours"
  - Tasks: "12 tasks"
  - Tech stack icons: React, Tailwind, Vite
- **Preview Image:** Screenshot or mockup of final project
- **GitHub Link:** "View Source Repo" (external link icon)
- **CTA Button:** "Start Project" (primary) or "Continue" (if in progress)
- **Progress Bar:** If project started (e.g., "4/12 tasks completed")

**Design Notes:**
- Cards should feel substantial (not cramped)
- Use subtle gradients or shadows for depth
- Hover effect: Highlight border, slight lift
- Clear visual hierarchy (badge → name → description → metadata → CTA)

### 5. Project Workspace (Code Editor)

**Layout (Full-screen, split-pane):**

**Top Bar:**
- Project name and technology icon
- Progress indicator: "Task 4/12 - Building the Header Component"
- Action buttons: Run, Save, Deploy, Get Hint
- Settings icon (editor preferences)

**Left Panel (30%, collapsible):**
- **Task List:**
  - Numbered tasks with checkboxes
  - Current task highlighted
  - Completed tasks with checkmark icon
  - Expandable task descriptions
  - Estimated time per task
- **Files Tree (optional tab):**
  - Project file structure
  - Click to open in editor

**Center Panel (40%):**
- **Monaco Code Editor:**
  - Syntax highlighting (VS Code theme)
  - Line numbers
  - Minimap (optional)
  - Auto-complete suggestions
  - Error/warning indicators
- **Bottom Console:**
  - Output logs
  - Error messages with helpful hints
  - Collapsible/expandable

**Right Panel (30%):**
- **Live Preview:**
  - Iframe showing rendered output
  - Refresh button
  - Responsive view toggles (desktop/tablet/mobile)
  - Full-screen preview option
- **AI Mentor Chat (tab):**
  - Chat interface with AI assistant
  - Quick action buttons: "Get Hint", "Explain This", "Debug"

**Design Notes:**
- Resizable panels (drag dividers)
- Dark theme optimized for coding
- Smooth transitions when switching tasks
- Auto-save indicator (subtle, non-intrusive)
- Keyboard shortcuts displayed on hover

### 6. Template Library (Developer Mode)

**Layout:**
- Page title: "Template Library"
- Subtitle: "Reusable components from real open-source projects"
- Search bar with filters

**Filters (Left Sidebar or Top Bar):**
- Technology: React, Vue, Next.js, Node.js
- Category: Authentication, UI Components, API Integration, State Management
- Rating: 4+ stars, 3+ stars
- Sort by: Most Popular, Highest Rated, Recently Added

**Template Grid (3-4 columns):**

**Template Card:**
- **Preview Image:** Code snippet or component preview
- **Template Name:** e.g., "JWT Authentication System"
- **Description:** 1-2 sentences
- **Metadata:**
  - Technology icon and name
  - Rating stars (1-5) with count
  - Download count
  - Source repo link
- **Tags:** #auth #jwt #security
- **CTA Button:** "Integrate" (primary) or "Preview Code" (secondary)

**Usage Limit Indicator (Free Users):**
- Sticky banner at top: "3/5 integrations used this month" with progress bar
- "Upgrade to Pro" link

**Design Notes:**
- Card hover: Lift shadow, show quick preview
- Clear visual distinction between free and premium templates
- Easy-to-scan grid layout
- Pagination or infinite scroll

### 7. Template Integration Preview

**Layout (Modal or Full Page):**

**Split View:**
- **Left Side (50%):** "Current Code"
  - Your existing code
  - Highlighted sections that will be affected
- **Right Side (50%):** "After Integration"
  - Code with template integrated
  - Diff highlighting (green additions, red deletions)

**Top Bar:**
- Template name and source
- AI explanation: "This template adds JWT authentication to your existing auth system"
- Close button

**Bottom Action Bar:**
- **Preview Button:** "See Live Preview" (opens sandbox)
- **Approve Button:** "Integrate Template" (primary, green)
- **Undo Button:** "Cancel" (secondary, gray)
- **Details Toggle:** "Show Integration Details" (expandable section)

**Design Notes:**
- Clear diff visualization (GitHub-style)
- Smooth transitions between views
- Loading states for AI analysis
- Confirmation dialog before final integration

### 8. Login Page

**Layout (Centered, Single Column):**

**Left Side (50% - Optional for Desktop):**
- **Brand Section:**
  - Platform logo and name
  - Tagline: "Learn by Building Real Projects"
  - Background: Gradient or abstract code pattern
  - Testimonial carousel (optional)
  - "New to CodeLearn?" with "Sign Up" link

**Right Side (50% or Full Width on Mobile):**
- **Login Form Card:**
  - Card title: "Welcome Back"
  - Subtitle: "Sign in to continue your learning journey"
  
  - **Social Login Buttons (Prominent):**
    - "Continue with GitHub" (primary, with GitHub icon)
    - "Continue with Google" (secondary, with Google icon)
  
  - **Divider:** "OR" with horizontal lines
  
  - **Email/Password Form:**
    - Email input field (with email icon)
    - Password input field (with eye icon to show/hide)
    - "Remember me" checkbox
    - "Forgot password?" link (right-aligned)
  
  - **Login Button:** "Sign In" (primary, full-width)
  
  - **Sign Up Link:** "Don't have an account? Sign up" (centered, below button)

**Design Notes:**
- Clean, minimal form design
- Focus on social login (GitHub primary for developers)
- Clear visual hierarchy
- Loading states for buttons
- Error messages inline (red text below fields)
- Auto-focus on email field
- Enter key submits form

**Mobile Considerations:**
- Full-width card
- Larger touch targets (48px minimum)
- Stack social buttons vertically
- Simplified background (solid color or subtle gradient)

### 9. Registration Page

**Layout (Centered, Single Column):**

**Left Side (50% - Optional for Desktop):**
- **Brand Section:**
  - Platform logo and name
  - Value proposition: "Join 10,000+ developers learning by building"
  - Key benefits (3 bullet points with icons):
    - ✓ Learn from real GitHub projects
    - ✓ AI-powered guidance
    - ✓ Deploy your projects live
  - Background: Gradient or abstract code pattern

**Right Side (50% or Full Width on Mobile):**
- **Registration Form Card:**
  - Card title: "Create Your Account"
  - Subtitle: "Start learning for free"
  
  - **Social Signup Buttons (Prominent):**
    - "Sign up with GitHub" (primary, with GitHub icon)
    - "Sign up with Google" (secondary, with Google icon)
  
  - **Divider:** "OR" with horizontal lines
  
  - **Email/Password Form:**
    - Full name input field (with user icon)
    - Email input field (with email icon)
    - Password input field (with eye icon to show/hide)
      - Password strength indicator (weak/medium/strong)
      - Requirements tooltip: "8+ characters, uppercase, lowercase, number"
    - Confirm password input field
  
  - **Terms Checkbox:**
    - "I agree to the Terms of Service and Privacy Policy" (with links)
  
  - **Sign Up Button:** "Create Account" (primary, full-width, disabled until terms checked)
  
  - **Login Link:** "Already have an account? Sign in" (centered, below button)

**Design Notes:**
- Progressive disclosure (show password requirements on focus)
- Real-time validation (email format, password strength)
- Clear error messages
- Success state after registration (redirect to onboarding)
- Email verification notice if using email signup
- Loading states for buttons

**Mobile Considerations:**
- Full-width card
- Larger touch targets
- Stack social buttons vertically
- Simplified background
- Sticky "Create Account" button at bottom

### 10. Forgot Password Page

**Layout (Centered, Single Column):**

**Form Card:**
- **Icon:** Lock or key icon (centered, above title)
- **Title:** "Forgot Password?"
- **Subtitle:** "Enter your email and we'll send you a reset link"

- **Email Input Field:**
  - Email input with email icon
  - Placeholder: "your@email.com"

- **Submit Button:** "Send Reset Link" (primary, full-width)

- **Back to Login Link:** "← Back to Sign In" (centered, below button)

**Success State (After Submission):**
- **Icon:** Email sent icon (centered)
- **Title:** "Check Your Email"
- **Message:** "We've sent a password reset link to your@email.com"
- **Note:** "Didn't receive it? Check spam or resend in 60s"
- **Resend Button:** "Resend Email" (secondary, disabled for 60s countdown)
- **Back to Login Link:** "← Back to Sign In"

**Design Notes:**
- Simple, focused interface
- Clear success feedback
- Countdown timer for resend button
- Email validation before submission
- Error handling for non-existent emails

### 11. Reset Password Page

**Layout (Centered, Single Column):**

**Form Card:**
- **Icon:** Lock icon (centered, above title)
- **Title:** "Reset Your Password"
- **Subtitle:** "Enter your new password below"

- **New Password Input:**
  - Password field with eye icon
  - Password strength indicator
  - Requirements checklist (visible):
    - ✓ At least 8 characters
    - ✓ One uppercase letter
    - ✓ One lowercase letter
    - ✓ One number

- **Confirm Password Input:**
  - Password field with eye icon
  - Match indicator (passwords match/don't match)

- **Submit Button:** "Reset Password" (primary, full-width)

**Success State:**
- **Icon:** Checkmark icon (centered)
- **Title:** "Password Reset Successful"
- **Message:** "Your password has been updated"
- **CTA Button:** "Sign In" (primary, redirects to login)

**Design Notes:**
- Real-time password validation
- Visual feedback for requirements met
- Clear success state
- Auto-redirect to login after 3 seconds
- Handle expired/invalid reset tokens gracefully

### 12. Email Verification Page

**Layout (Centered, Single Column):**

**Pending Verification:**
- **Icon:** Email icon (centered)
- **Title:** "Verify Your Email"
- **Message:** "We've sent a verification link to your@email.com"
- **Instructions:** "Click the link in the email to verify your account"
- **Resend Button:** "Resend Verification Email" (secondary)
- **Change Email Link:** "Use a different email address"

**After Verification (Success):**
- **Icon:** Checkmark icon (centered)
- **Title:** "Email Verified!"
- **Message:** "Your account is now active"
- **CTA Button:** "Get Started" (primary, redirects to onboarding)

**Design Notes:**
- Clear instructions
- Resend functionality with cooldown
- Handle already-verified state
- Handle expired verification links
- Auto-check verification status (polling)

### 13. User Profile / Portfolio

**Layout:**

**Header Section:**
- Cover image or gradient background
- User avatar (large, circular)
- User name and bio
- Social links (GitHub, Twitter, LinkedIn)
- Edit profile button (if own profile)
- Public/Private toggle

**Stats Cards (3-4 cards):**
- Projects Completed: 12
- Hours Spent Learning: 48
- Current Streak: 7 days
- Templates Integrated: 23

**Projects Showcase (Grid):**
- Completed project cards with live links
- Project thumbnail/screenshot
- Project name and technology
- "View Live" and "View Code" buttons
- Deploy date

**Achievements/Badges:**
- Visual badges for milestones
- "First Project", "Week Streak", "10 Projects", etc.

**Activity Timeline:**
- Recent activity feed
- "Completed React Todo App"
- "Integrated Authentication Template"
- Timestamps

**Design Notes:**
- Clean, portfolio-style layout
- Shareable public URL
- Print-friendly for resume inclusion
- Responsive grid for projects


## UI Components Library

### Buttons
- **Primary:** Solid background, white text, hover lift
- **Secondary:** Outline style, hover fill
- **Tertiary:** Text only, hover underline
- **Sizes:** Small (32px), Medium (40px), Large (48px)
- **States:** Default, Hover, Active, Disabled, Loading

### Cards
- **Standard Card:** White background, subtle shadow, rounded corners (8px)
- **Hover Card:** Lift shadow, scale 1.02
- **Interactive Card:** Clickable, cursor pointer
- **Status Card:** Color-coded border (green/yellow/red)

### Forms
- **Input Fields:** Rounded corners, focus ring, error states
- **Dropdowns:** Custom styled, search functionality
- **Checkboxes/Radio:** Custom styled, animated
- **Validation:** Inline error messages, success indicators

### Navigation
- **Sidebar:** Collapsible, active state highlighting
- **Tabs:** Underline active tab, smooth transition
- **Breadcrumbs:** Clickable path, separator icons
- **Pagination:** Numbers + prev/next, disabled states

### Feedback
- **Toast Notifications:** Top-right corner, auto-dismiss
- **Loading Spinners:** Branded, smooth animation
- **Progress Bars:** Animated, percentage display
- **Empty States:** Friendly illustrations, helpful CTAs

### Modals
- **Overlay:** Semi-transparent dark background
- **Content:** Centered, max-width 600px, close button
- **Actions:** Bottom-aligned buttons
- **Animation:** Fade in, scale up

## Design Principles

### 1. Developer-First Design
- Code-centric interface (Monaco editor prominent)
- Keyboard shortcuts everywhere
- Dark mode optimized
- Technical but not intimidating

### 2. Progressive Disclosure
- Start simple, reveal complexity gradually
- Collapsible panels and sections
- Tooltips for advanced features
- Onboarding guides for new users

### 3. Instant Feedback
- Real-time preview updates
- Auto-save indicators
- Loading states for all async operations
- Success/error notifications

### 4. Accessibility (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators visible
- Alt text for all images

### 5. Performance
- Lazy loading for images and components
- Skeleton screens for loading states
- Optimized animations (60fps)
- Responsive images (WebP format)

## Responsive Design

### Breakpoints
- **Mobile:** 320px - 767px (single column, stacked layout)
- **Tablet:** 768px - 1023px (2-column layout, collapsible sidebar)
- **Desktop:** 1024px - 1439px (3-column layout, full sidebar)
- **Large Desktop:** 1440px+ (max-width container, centered)

### Mobile Considerations
- Bottom navigation bar (instead of sidebar)
- Simplified code editor (basic syntax highlighting)
- Swipe gestures for panel switching
- Touch-optimized buttons (min 44px)
- Collapsible sections by default

### Tablet Considerations
- Side-by-side code and preview (50/50 split)
- Collapsible sidebar (hamburger menu)
- Touch and keyboard support
- Landscape optimized

## Animations & Interactions

### Micro-interactions
- Button hover: Lift shadow, scale 1.05
- Card hover: Lift shadow, border highlight
- Input focus: Ring animation, label float
- Checkbox: Checkmark draw animation
- Toggle: Smooth slide transition

### Page Transitions
- Fade in: 200ms ease-out
- Slide in: 300ms ease-out (for modals)
- Scale up: 200ms ease-out (for cards)

### Loading States
- Skeleton screens for content
- Spinner for actions (button loading)
- Progress bar for long operations
- Shimmer effect for placeholders

## Iconography

### Icon Style
- **Style:** Outline icons (Heroicons, Lucide, or Feather)
- **Size:** 16px (small), 20px (medium), 24px (large)
- **Color:** Inherit from parent or theme color
- **Usage:** Consistent throughout (same icon for same action)

### Key Icons Needed
- Technology logos (React, Vue, Next.js, Node.js)
## Deliverables Expected

1. **Landing Page Design** (Desktop + Mobile)
2. **Login Page Design** (Desktop + Mobile)
3. **Registration Page Design** (Desktop + Mobile)
4. **Forgot Password Page** (Desktop + Mobile)
5. **Reset Password Page** (Desktop + Mobile)
6. **Email Verification Page** (Desktop + Mobile)
7. **Dashboard Design** (Desktop + Mobile)
8. **Technology Selection Page** (Desktop + Mobile)
9. **Learning Path View** (Desktop + Mobile)
10. **Project Workspace** (Desktop + Tablet)
11. **Template Library** (Desktop + Mobile)
12. **Template Integration Preview** (Desktop)
13. **User Profile/Portfolio** (Desktop + Mobile)
14. **Component Library** (Buttons, Cards, Forms, etc.)
15. **Style Guide** (Colors, Typography, Spacing, Icons)

### File Format
- Figma design file (preferred)
- High-fidelity mockups (PNG/JPG)
- Interactive prototype (Figma prototype or similar)
- Design system documentation
### Backgrounds
- **Hero:** Subtle gradient or abstract tech pattern
- **Sections:** Light gray or white alternating
- **Cards:** White with subtle shadow

## Summary Prompt for Stitch

**Create a modern, developer-focused web application design for an AI-powered learning and productivity platform called CodeLearn. The platform has two modes: Learning Mode (free, project-based learning from real GitHub repos) and Developer Mode (AI template extraction and integration). Design should be clean, code-centric, with a prominent Monaco editor, live preview pane, and AI mentor chat. Target audience is developers aged 22-40. Use a tech-forward color palette (indigo/violet primary), modern sans-serif typography, and dark mode optimization. Include landing page, authentication pages (login, registration, forgot password, reset password, email verification), dashboard, code editor workspace, template library, and user portfolio. Prioritize accessibility (WCAG AA), responsive design (mobile/tablet/desktop), and smooth micro-interactions. Style inspiration: GitHub, VS Code, Vercel, Linear. Authentication should emphasize social login (GitHub primary, Google secondary) with clean, minimal forms and clear error/success states.**

---

*End of Design Prompt*right-aligned), AI (left-aligned)
- **Quick Actions:** Predefined buttons ("Get Hint", "Explain", "Debug")
- **Animation:** Typing indicator, smooth scroll

### Live Preview Iframe
- **Border:** Subtle border to distinguish from editor
- **Controls:** Refresh, responsive view toggles, full-screen
- **Loading:** Skeleton screen or spinner
- **Error State:** Friendly error message with retry button

### Progress Tracking
- **Visual:** Circular progress (percentage) or linear bar
- **Gamification:** Badges, streaks, milestones
- **Celebration:** Confetti animation on completion
- **Sharing:** Social share buttons for achievements

### Code Diff Viewer
- **Style:** GitHub-style diff
- **Colors:** Green (additions), Red (deletions), Gray (unchanged)
- **Line Numbers:** Both old and new
- **Syntax Highlighting:** Maintained in diff view

## Onboarding Flow

### Step 1: Welcome Screen
- Platform logo and name
- Welcome message
- "Get Started" button

### Step 2: Goal Selection
- "What brings you here today?"
- Options: "Learn a new technology" or "Build faster with templates"
- Visual cards for each option

### Step 3: Technology Selection
- "Which technology do you want to learn?"
- Grid of technology cards
- "Skip for now" option

### Step 4: Quick Tour
- Interactive walkthrough (optional)
- Highlight key features (3-4 steps)
- "Start Learning" final CTA

### Design Notes
- Skippable at any point
- Progress indicator (dots or steps)
- Smooth transitions between steps
- Mobile-friendly

## Error States & Empty States

### Error Pages
- **404 Not Found:** Friendly illustration, "Go Home" button
- **500 Server Error:** Apologetic message, "Try Again" button
- **Network Error:** Offline indicator, retry mechanism

### Empty States
- **No Projects:** "Start your first project" with CTA
- **No Templates:** "Browse template library" with CTA
- **No Results:** "Try different search terms" with suggestions

### Design Notes
- Helpful, not frustrating
- Clear next steps
- Friendly illustrations
- Maintain brand voice

## Dark Mode

### Color Adjustments
- **Background:** #0F172A (dark blue-gray)
- **Surface:** #1E293B (lighter blue-gray)
- **Text:** #F1F5F9 (light gray)
- **Primary:** Slightly brighter version of brand color
- **Borders:** Subtle, low contrast

### Special Considerations
- Code editor: Dark theme by default
- Syntax highlighting: Adjusted for dark background
- Images: Reduced opacity or inverted if needed
- Shadows: Lighter, more subtle

### Toggle
- **Position:** User menu or settings
- **Icon:** Sun/Moon toggle
- **Persistence:** Save preference to localStorage
- **Transition:** Smooth fade (300ms)

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and clear
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Alt text for all images
- [ ] ARIA labels for icon buttons
- [ ] Semantic HTML (headings, landmarks, lists)
- [ ] Screen reader tested
- [ ] Form labels and error messages
- [ ] Skip to main content link
- [ ] No auto-playing media

## Performance Targets

- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Largest Contentful Paint:** <2.5s
- **Cumulative Layout Shift:** <0.1
- **First Input Delay:** <100ms

### Optimization Strategies
- Code splitting (lazy load routes)
- Image optimization (WebP, lazy loading)
- Font optimization (subset, preload)
- CSS optimization (critical CSS inline)
- JavaScript optimization (tree shaking, minification)

## Brand Voice & Messaging

### Tone
- **Supportive:** "You've got this!"
- **Encouraging:** "Great progress! Keep going."
- **Clear:** "Click 'Run' to see your code in action."
- **Friendly:** "Welcome back! Ready to continue learning?"

### Error Messages
- **Helpful:** "Oops! Looks like there's a syntax error on line 12."
- **Actionable:** "Try adding a semicolon at the end of the line."
- **Reassuring:** "Don't worry, everyone makes mistakes. Let's fix this together."

### Success Messages
- **Celebratory:** "🎉 Project completed! You're on fire!"
- **Motivating:** "Nice work! Ready for the next challenge?"
- **Specific:** "Template integrated successfully. Your auth system is now live!"

## Technical Specifications for Developers

### Framework
- Next.js 14 (React 18, App Router)
- TypeScript for type safety

### Styling
- Tailwind CSS 3.4 for utility-first styling
- shadcn/ui for component library
- CSS variables for theming

### State Management
- React Context for global state
- TanStack Query for server state
- localStorage for preferences

### Code Editor
- Monaco Editor (VS Code engine)
- Syntax highlighting for JavaScript/TypeScript
- Auto-complete and IntelliSense

### Icons
- Heroicons or Lucide React
- Technology logos from Simple Icons

### Fonts
- Inter (Google Fonts) for UI
- JetBrains Mono for code

### Animations
- Framer Motion for complex animations
- CSS transitions for simple interactions

## Deliverables Expected

1. **Landing Page Design** (Desktop + Mobile)
2. **Dashboard Design** (Desktop + Mobile)
3. **Technology Selection Page** (Desktop + Mobile)
4. **Learning Path View** (Desktop + Mobile)
5. **Project Workspace** (Desktop + Tablet)
6. **Template Library** (Desktop + Mobile)
7. **Template Integration Preview** (Desktop)
8. **User Profile/Portfolio** (Desktop + Mobile)
9. **Component Library** (Buttons, Cards, Forms, etc.)
10. **Style Guide** (Colors, Typography, Spacing, Icons)

### File Format
- Figma design file (preferred)
- High-fidelity mockups (PNG/JPG)
- Interactive prototype (Figma prototype or similar)
- Design system documentation

## Additional Notes

- **Inspiration:** GitHub, VS Code, Replit, Vercel, Linear
- **Avoid:** Overly playful designs, cluttered interfaces, outdated patterns
- **Focus:** Clean, modern, developer-friendly, AI-native
- **Priority:** Code editor and live preview experience (core value)

---

## Summary Prompt for Stitch

**Create a modern, developer-focused web application design for an AI-powered learning and productivity platform. The platform has two modes: Learning Mode (free, project-based learning from real GitHub repos) and Developer Mode (AI template extraction and integration). Design should be clean, code-centric, with a prominent Monaco editor, live preview pane, and AI mentor chat. Target audience is developers aged 22-40. Use a tech-forward color palette (indigo/violet primary), modern sans-serif typography, and dark mode optimization. Include landing page, dashboard, code editor workspace, template library, and user portfolio. Prioritize accessibility (WCAG AA), responsive design (mobile/tablet/desktop), and smooth micro-interactions. Style inspiration: GitHub, VS Code, Vercel, Linear.**

---

*End of Design Prompt*
