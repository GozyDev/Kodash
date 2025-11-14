Kodash

Kodash is a multi-tenant, workspace-based productivity system built with Next.js + Supabase.
Each workspace acts as its own isolated environment (ideal for client work or personal projects).
Inside a workspace, you create issues first—then optionally group them into projects when you need structure.

Still in active development. Core flows are being refined.

🔥 What Makes Kodash Different

Most tools are team-centric (Linear, Asana, ClickUp).
Kodash flips this by being workspace-centric — every workspace represents a client, a product, or a personal environment.

You don’t start with projects.
You start with issues → then organize them later into goals/projects when you actually need the structure.

✨ Core Features
🔐 Multi-Tenant Architecture

Every workspace = fully isolated data silo

Supabase Row-Level Security ensures user + workspace separation

Designed for agencies, freelancers, and builders managing multiple clients/products

📝 Issue-First Workflow

Create issues instantly without needing a project

Perfect for quick tasks, bugs, ideas, or to-do items

Add metadata: status, priority, description, tags

Convert or assign issues to a project later when you’re ready to group them

📁 Optional Projects Layer

Projects are empty containers until you add issues

Organize related issues under goals, features, releases, etc.

Clean separation:

/issues → all issues

/projects → project-level organization

No forced structure, no bloated overhead

👥 Workspace-Level Membership

Invite users per workspace, not globally

Clean boundaries for agencies or multi-product devs

📊 Dashboard Overview

Quick view of issues, statuses, and active projects

Per-workspace analytics (WIP)

📱 Responsive UI

Built with TailwindCSS

Works on desktop, tablet, and mobile

Smooth, minimal interface

🛠️ Tech Stack

Next.js (App Router)

Supabase (Auth, Postgres, RLS)

TypeScript

TailwindCSS

ShadCN UI (planned)

Framer Motion (planned)

🚧 Status

Kodash is currently:

Structuring multi-tenant flows

Solidifying issue → project assignment logic

Setting up RLS for workspace isolation

Building clean routes for /issues and /projects

Polishing UI patterns

🎯 Vision

Kodash aims to be the simplest way to manage:

Client projects

Freelance tasks

Multi-product pipelines

Personal ideas + work

Small team workflows

All in one workspace-first system—without the bloated complexity other tools force on you.

📦 Installation (Dev)
git clone https://github.com/yourusername/kodash
cd kodash
npm install
npm run dev
