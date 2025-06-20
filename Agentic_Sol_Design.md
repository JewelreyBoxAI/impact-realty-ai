# AgentOS Dashboard UI/UX - Cursor Prompt Scaffold

---

**Prompt Title:**
**Generate Next.js + Tailwind + TypeScript AgentOS Dashboard UI/UX (full layout + components)**

---

**Prompt Body:**

> Please generate a modern **Next.js v14** app written in **TypeScript** using **Tailwind CSS** as the styling system.
>
> The app should match the look, feel, and component structure of the **AgentOS dashboard** (per provided screenshots and visual spec) — dark theme, modern UI/UX for SaaS tools.
>
> ---
>
> ### 🎨 **Design System:**
>
> * Color palette:
>
>   * Primary: `#3B82F6`
>   * Background: `#0F172A`
>   * Card background: `#1E293B`
>   * Text (primary): `#FFFFFF`
>   * Text (secondary): `#E5E7EB`
>   * Accent green: `#22C55E`
>   * Border light: `#334155`
>
> * Font: `"Inter", sans-serif`
>
> * Rounded corners on cards/buttons
>
> * Shadows on cards
>
> ---
>
> ### 🧹 **Components (Typed in `.tsx`):**
>
> 1️⃣ **Dashboard.tsx page**
>
> * Full layout w/ Sidebar + Main Content
> * Header: "Dashboard - Agent Flow Overview & Management"
>
> 2️⃣ **Sidebar.tsx**
>
> * Persistent left sidebar
> * Sections:
>
>   * Logo / app name top
>   * Nav links: Dashboard, Flow Builder, Flow Library, Monitoring, Settings
>   * Active link styling
>   * Footer w/ version info
>
> 3️⃣ **AgentCard.tsx**
>
> * Title, subtitle, status
> * Description
> * Progress bar (success rate)
> * Avg. time, total runs
> * Buttons: "View Logs", "Configure"
>
> 4️⃣ **AgentControlCard.tsx**
>
> * Connected agent info
> * Command input (textarea + char count)
> * Quick command buttons: Run Full Pipeline, License Check, Generate Report, Data Sync
> * Dropdowns: Model select, Agent Mode select
> * Slider: Temperature
> * Primary "Execute Command" button
>
> 5️⃣ **Layout.tsx**
>
> * Standard app layout w/ Sidebar + Main
>
> ---
>
> ### ⚙️ **System Setup:**
>
> * TypeScript (TSX)
> * Next.js 14
> * TailwindCSS 3.x
> * PostCSS
> * tsconfig.json (Next defaults)
> * Package.json (Next, React, ReactDOM, Tailwind, autoprefixer)
> * Global styles in `globals.css`
>
> ---
>
> ### 📱 **Responsive Design:**
>
> * Mobile-first
> * Collapsible sidebar on small screens
> * Responsive spacing/typography
>
> ---
>
> ### 📂 **Folder Structure:**
>
> ```
> /components
>   Sidebar.tsx
>   AgentCard.tsx
>   AgentControlCard.tsx
>   Button.tsx
>   Layout.tsx
> /pages
>   _app.tsx
>   dashboard.tsx
> /styles
>   globals.css
> tailwind.config.js
> tsconfig.json
> ```
>
> ---
>
> ### 🏰 **Final Deliverable:**
>
> * Styled, responsive AgentOS Dashboard
> * Reusable TSX components
> * Works w/ `npm install && npm run dev`
>
> ---
>
> ### ✨ **Goal:**
>
> Generate a full UI/UX scaffold for **AgentOS Dashboard** — ultra-modern dark SaaS UI, built in Next.js 14, with Tailwind/TS, reusable for future projects.

---

**How to use:**
Paste this full prompt into **Cursor**. It will generate the complete UI scaffold — with Sidebar, Layout, AgentCard, AgentControlCard — matching the AgentOS dashboard style.

---

Would you like me to also prepare:

✅ Matching `README.md`
✅ Example mock Agent data for demo
✅ Utility classes (progress bars, buttons)?

If so, just confirm — ready to generate on request.
