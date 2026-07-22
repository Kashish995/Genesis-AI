# Genesis AI ⚡

> A metadata-driven application builder and event-driven automation platform.
> Define data-driven mini-apps through JSON schemas, preview and run them live,
> and wire up CRUD-triggered workflows — all from a single, unified workspace.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Data Model](#-data-model)
- [Application Configuration Schema](#-application-configuration-schema)
- [Pages & Routes](#-pages--routes)
- [Authentication & Security](#-authentication--security)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Overview

**Genesis AI** is an internal low-code platform that lets teams rapidly scaffold
data-driven applications from configuration alone — no manual table, form, or
page coding required. Users author a JSON blueprint describing the entities,
fields, and pages of their desired app; the platform validates it, renders a
live preview, persists it, and then serves a fully-functional runtime with
working CRUD operations, dashboards, and charts.

Alongside the app builder, Genesis AI ships a **workflow automation engine**:
event-driven rules that fire actions in response to CRUD events on entities
(create / update / delete), with enable/disable toggles, conditions, and a full
execution-log audit trail.

Everything is monitored from a single, personalized dashboard with live KPIs,
recent activity, and quick-start templates.

---

## ✨ Key Features

### Application Builder
- **JSON-driven schema definition** — declare `entities` (with typed fields) and `pages` (dashboards or CRUD layouts) in a single config file.
- **Live preview** — see your generated app render in real time before saving, in a sandboxed state.
- **Schema validation engine** — a robust validator (`validateAppConfig`) reports exactly what's wrong with a config (`entities must be an array`, `Entity "X" must have a "fields" array`, etc.) before deployment.
- **Starter templates** — one-click scaffolding for common patterns:
  - 🗂 **Task Manager** — tasks, priorities, due dates, status dashboard
  - 👥 **CRM System** — contacts, deals, pipeline by stage
  - 📦 **Inventory** — products, SKUs, categories, stock
- **Config summary sidebar** — entity/page counts, per-entity field counts, and a built-in schema reference card.
- **Versioned configs** — every edit increments the app version, preserving history.

### Runtime & Rendering
- **Dynamic CRUD pages** — auto-generated tables (`DynamicTable`), forms (`DynamicForm`), and component registry (`ComponentRegistry`) that render fully working create / read / update / delete flows from config.
- **Dashboard layouts** — declarative dashboard pages composed of:
  - `stat_card` (count metrics, with optional filters)
  - `chart` (bar / pie, grouped by entity field)
  - `table` (preview lists)
- **Dynamic data persistence** — config-defined records are stored via a generic `DynamicRecord` entity keyed by `app_config_id` + `entity_type`, so every generated app has its own isolated dataset.
- **Tab-based page navigation** for multi-page generated apps.

### Workflow Automation
- **Event-triggered rules** — pick an entity + a CRUD event (`create` / `update` / `delete`) + JSON-defined `actions`.
- **Conditions support** — optional JSON conditions for finer control.
- **Enable / disable toggles** — turn automations on or off without deleting them.
- **Execution logging** — every run records status (`success` / `failed` / `pending`), duration (ms), input + output data, and error messages, shown on a live activity feed.
- **Success-rate metrics** — auto-computed from the log feed.

### Dashboard
- **Personalized greeting** — time-of-day aware, by first name.
- **Animated KPI stats** — Total Applications, Active Apps, Workflows, Executions, with smooth count-up animations.
- **Recent apps grid** — quick access to the latest 4 apps with status badges and version info.
- **Starter templates panel** — one-click shortcuts.
- **Workflows status panel** — on/off states, trigger signatures.
- **Activity feed** — recent workflow executions with pass/fail indicators and durations.
- **Loading skeletons** — graceful, non-janky skeleton placeholders across all async surfaces.

### Platform & UX
- **Responsive design** — mobile-first with a slide-in sidebar on small screens; sticky topbar on mobile.
- **Dark, modern theme** — glassmorphism cards, indigo→violet gradient accents, mesh background.
- **Toast notifications** — confirmations for every state-changing action.
- **Auth-protected routes** — every page is gated behind login via `ProtectedRoute`.

---

## 🧠 How It Works

### 1. Author

The user defines an app by writing (or loading a template of) a JSON config:

```json
{
  "entities": [
    {
      "name": "Contact",
      "icon": "Users",
      "fields": [
        { "name": "name",     "type": "string", "required": true, "label": "Full Name" },
        { "name": "email",    "type": "email",                    "label": "Email" },
        { "name": "company",  "type": "string",                   "label": "Company" },
        { "name": "stage",
          "type": "select",
          "options": ["lead", "qualified", "proposal", "closed_won"],
          "default": "lead",
          "label": "Stage" }
      ]
    }
  ],
  "pages": [
    {
      "name": "Dashboard",
      "layout": "dashboard",
      "components": [
        { "type": "stat_card", "title": "Total Contacts", "entity": "Contact", "metric": "count" },
        { "type": "chart",     "chartType": "pie", "entity": "Contact", "groupBy": "stage", "title": "Pipeline" }
      ]
    },
    { "name": "Contacts", "layout": "crud", "entity": "Contact" }
  ],
  "theme": { "primaryColor": "#4F46E5", "name": "Default" }
}
```

### 2. Validate

`validateAppConfig(config)` runs structural checks:
- ✅ Config must define at least one of `entities`, `pages`, or `dashboard`
- ✅ `entities` and `pages` must be arrays
- ✅ Every entity must have a `name` and a `fields` array

Errors are surfaced inline (red banner + per-error bullet points).

### 3. Preview

In the App Builder, the **Live Preview** tab renders the config through a
sandboxed `AppPreview` component — pages, tables, and forms work in-memory with
local state, so the user can experiment before committing.

### 4. Save

On **Create App**, the validated config string is persisted as an `AppConfig`
record (`status: 'draft'`, `version: 1`) and the user is routed to the new
app's detail page.

### 5. Run

In the App Detail page, the **Runtime** tab mounts `AppRuntime`, which:
1. Extracts entities & pages via `extractEntities` / `extractPages`
2. Loads persisted records from the generic `DynamicRecord` store, filtered by `app_config_id` + `entity_type`
3. Renders dashboard layouts (stat cards / charts / tables) or full CRUD views
4. Powers create/update/delete through the `DynamicRecord` SDK, with optimistic invalidation via TanStack Query

### 6. Automate

The user defines a `Workflow` rule tying a CRUD event to JSON actions on an
entity. Workflow runs are logged as `WorkflowLog` records, surfaced on the
dashboard and workflows page activity feeds.

---

## 🛠 Tech Stack

| Layer            | Technology |
|------------------|------------|
| **Framework**     | React 18 |
| **Build tool**    | Vite |
| **Styling**       | Tailwind CSS + shadcn/ui |
| **Routing**       | React Router v6 |
| **State / data**  | TanStack Query (React Query) |
| **Icons**         | lucide-react |
| **Date utils**     | date-fns |
| **Toasts**         | sonner |
| **Charts**        | recharts (via dynamic dashboard components) |
| **Backend**       | Base44 BaaS (entities, auth, file storage, integrations) |
| **Auth**          | Base44 Auth (email + OTP, Google OAuth, password reset) |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        App Shell                          │
│  AuthProvider → QueryClientProvider → Router → AppLayout   │
│  (sidebar + Outlet)                                       │
└──────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
  Pages                  Components               Lib
  ├── Dashboard.jsx      ├── layout/             ├── configParser.js
  ├── AppsList.jsx       │   └── AppLayout.jsx    ├── utils.js
  ├── AppBuilder.jsx     ├── preview/             └── AuthContext.jsx
  ├── AppDetail.jsx      │   └── AppPreview.jsx
  └── WorkflowsPage.jsx  ├── runtime/
                          │   └── AppRuntime.jsx   ← live CRUD engine
                          └── registry/
                              ├── ComponentRegistry.jsx
                              ├── DynamicForm.jsx
                              └── DynamicTable.jsx
                              │
                              │  ← reads/writes via →
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Base44 SDK (base44Client)                   │
│      entities.AppConfig / Workflow / WorkflowLog             │
│      entities.DynamicRecord (generic app data store)        │
│      auth.me() / auth.logout() / auth.redirectToLogin()      │
└─────────────────────────────────────────────────────────────┘
```

### Rendering Pipeline

```
config_json (string)
    │
    ▼ safeParseJSON
parsed config (object)
    │
    ├─ extractEntities(config) ──► entities[]
    └─ extractPages(config)    ──► pages[]
                                       │
       ┌───────────────────────┬───────┴────────┐
       ▼                       ▼                ▼
  layout: dashboard      layout: crud      page tabs
       │                       │
       ▼                       ▼
  RegistryRenderer       DynamicTable  +  DynamicForm (in Dialog)
  (stat_card / chart / table)
```

---

## 🗃 Data Model

Three platform entities drive Genesis AI (plus one generic data store for
generated app records). All records inherit built-in fields: `id`,
`created_date`, `updated_date`, `created_by_id`.

### `AppConfig` — a generated application definition
| Field         | Type   | Notes |
|---------------|--------|-------|
| `name`        | string | **required** |
| `description` | string | optional |
| `status`      | enum   | `draft` (default) / `active` / `archived` |
| `config_json` | string | **required** — full JSON blueprint |
| `version`     | number | increments on each edit (default `1`) |
| `icon`        | string | lucide-react icon name |
| `color`       | string | theme color hex |

### `Workflow` — an automation rule
| Field             | Type    | Notes |
|-------------------|---------|-------|
| `name`            | string  | **required** |
| `app_config_id`   | string  | optional link to source app |
| `trigger_entity`  | string  | **required** — entity name |
| `trigger_event`   | enum    | **required** — `create` / `update` / `delete` |
| `conditions`      | string  | JSON string of conditions |
| `actions`         | string  | **required** — JSON array of actions |
| `enabled`         | boolean | default `true` |

### `WorkflowLog` — a workflow execution record
| Field             | Type   | Notes |
|-------------------|--------|-------|
| `workflow_id`     | string | **required** |
| `workflow_name`   | string | **required** |
| `trigger_event`   | string | snapshot of the trigger |
| `status`          | enum   | `success` / `failed` / `pending` (default `pending`) |
| `input_data`      | string | JSON trigger payload |
| `output_data`     | string | JSON execution result |
| `error_message`   | string | populated when `status === 'failed'` |
| `duration_ms`     | number | wall-clock duration |

### `DynamicRecord` (generic app-data store)
Used internally by `AppRuntime` so each generated app has persistent data
without a dedicated entity per app. Keyed by `app_config_id` + `entity_type`;
the config-defined fields live inside a JSON blob in `data`.

---

## 📐 Application Configuration Schema

### Top-level keys
| Key        | Type         | Purpose |
|------------|--------------|---------|
| `entities` | `entity[]`  | Data model definitions |
| `pages`    | `page[]`     | UI page definitions |
| `theme`    | `{ primaryColor, name }` | Optional visual theme |

### `entity`
```jsonc
{
  "name": "Task",                // required
  "icon": "CheckSquare",          // optional lucide-react name
  "fields": [                     // required
    { "name": "title", "type": "string", "required": true, "label": "Title" },
    { "name": "status",
      "type": "select",
      "options": ["todo", "in_progress", "done"],
      "default": "todo",
      "label": "Status" }
  ]
}
```

#### Supported field `type` values
`string` · `text` · `number` · `select` · `date` · `boolean` · `email`

`select` fields additionally take `options: string[]` and an optional `default`.

### `page`
```jsonc
// Dashboard layout
{
  "name": "Dashboard",
  "icon": "LayoutDashboard",     // optional
  "layout": "dashboard",
  "components": [
    { "type": "stat_card", "title": "Total Tasks",
      "entity": "Task", "metric": "count",
      "filter": { "status": "done" }            // optional
    },
    { "type": "chart", "chartType": "bar",
      "entity": "Task", "groupBy": "status",
      "title": "Tasks by Status"
    },
    { "type": "table", "entity": "Task",
      "title": "Recent Tasks", "limit": 5
    }
  ]
}

// CRUD layout
{ "name": "Tasks", "icon": "CheckSquare", "layout": "crud", "entity": "Task" }
```

#### Component types (dashboard only)
| `type`      | Purpose | Props |
|-------------|---------|-------|
| `stat_card` | KPI counter | `title`, `entity`, `metric: "count"`, optional `filter` |
| `chart`     | Data visualization | `chartType: "bar" | "pie"`, `entity`, `groupBy`, `title` |
| `table`     | Embedded record table | `entity`, `title`, optional `limit` |

---

## 🧭 Pages & Routes

| Route           | Page             | Auth | Purpose |
|-----------------|------------------|------|---------|
| `/login`        | `Login`          | public | Email + password, Google OAuth, forgot link |
| `/register`     | `Register`       | public | Email + password + OTP verification flow |
| `/forgot-password` | `ForgotPassword` | public | Reset link request |
| `/reset-password` | `ResetPassword` | public | `?token=` + new password |
| `/`             | `Dashboard`      | protected | Personalized KPIs, recent apps, activity |
| `/apps`          | `AppsList`       | protected | Search/filter, activate, delete apps |
| `/apps/new`      | `AppBuilder`     | protected | Create app from JSON config or template |
| `/apps/:id`      | `AppDetail`      | protected | Runtime · Configuration · Schema tabs |
| `/workflows`     | `WorkflowsPage`  | protected | Create / toggle / delete rules + logs |
| `*`              | `PageNotFound`   | public | 404 fallback |

---

## 🔐 Authentication & Security

- Auth is backed by the Base44 Auth provider — no custom auth code.
- Every authenticated page is wrapped in `<ProtectedRoute>`, which redirects
  unauthenticated users to `/login`.
- Three registration states are handled explicitly:
  - **authenticated** → render the app
  - **user not registered** → render `UserNotRegisteredError`
  - **auth required** → redirect to `/login`
- Supported registration flows:
  - Email + password (with OTP verification after sign-up)
  - Google OAuth
  - Password reset via emailed token

---

## 🚀 Getting Started

### Prerequisites
- A Base44 workspace account (the app depends on the Base44 SDK, auth, and entity storage)

### Run locally
The app runs straight on the Base44 platform's preview — no separate
`npm install && npm run dev` is required from the builder. Open it in the
Base44 Studio and click **Preview**.

### Create your first app
1. Click **New Application** from the dashboard or apps list.
2. Either:
   - **Use a template** — pick *Task Manager*, *CRM System*, or *Inventory* from the right sidebar
   - **Author your own** — edit the JSON in the editor
3. Hit **Validate JSON** to make sure your config passes structural checks.
4. Switch to **Live Preview** to play with the rendered app in sandbox mode.
5. Click **Create App** — it's saved as `draft` (v1) and you're routed to its detail page.

### Activate & run
- On the App Detail page, hit **Activate** to flip its status from `draft` → `active`.
- Use the **Runtime** tab to interact with your live app (create/edit/delete records persist).
- Use the **Configuration** tab → **Edit** to modify the JSON; saving auto-increments the version.
- Use the **Schema** tab to visually inspect entities and their field types.

### Define a workflow
1. Open the **Workflows** page from the sidebar.
2. Click **New Workflow**.
3. Provide:
   - **Name** — what this automation does
   - **Entity** — which data type triggers it
   - **Event** — `create` / `update` / `delete`
   - **Actions (JSON)** — e.g. `[{"type":"notification","message":"New record created"}]`
4. Save. Toggle it on/off with the switch.
5. Watch the **Execution Log** on the right (and the dashboard Activity feed) for run history.

---

## 🧭 Usage Guide

| I want to… | Go to… | Action |
|------------|--------|--------|
| See platform-wide metrics | `/` (Dashboard) | glance at KPIs + activity |
| Browse all my apps | `/apps` | search, filter by status, open / pause / delete |
| Create a new app | `/apps/new` | author JSON or load a template, validate, create |
| Run a generated app | `/apps/:id` → Runtime tab | interact with live CRUD + dashboards |
| Edit an app's blueprint | `/apps/:id` → Configuration → Edit | modify JSON and save (versioned) |
| Inspect an app's schema | `/apps/:id` → Schema tab | view entities + fields + types |
| Create an automation | `/workflows` → New Workflow | define trigger + actions |
| Monitor automations | `/workflows` (Execution Log) or Dashboard (Activity) | see run statuses + durations |

---

## 🗺 Roadmap

Potential next steps to evolve Genesis AI:

- 🔲 **Reusable component blocks** — custom user-defined dashboard components
- 🔲 **Multi-tenant RLS per app** — `app_config_id`-scoped row security on `DynamicRecord`
- 🔲 **Workflow action types** — SMS, webhook, email, LLM enrichment
- 🔲 **Visual config editor** — drag-and-drop entities/pages alongside JSON
- 🔲 **Public sharing / deploy** — publish a generated app under its own route
- 🔲 **Export to standalone repo** — eject a generated app as a real codebase
- 🔲 **Scheduled triggers** — cron-based workflow runs
- 🔲 **Audit history diffs** — track every `config_json` change with diffs

---

## 📄 License

This project is built on the Base44 platform. All rights reserved by the
author(s) of this Genesis AI workspace. See your workspace's terms of use for
details on ownership and distribution of generated apps.

---

<p align="center">
  <strong>Genesis AI</strong> · Define → Validate → Preview → Run → Automate
</p>