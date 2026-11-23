# Request Desk

Paste a customer request to get a topic and an editable reply draft. Recent requests reopen the original message and the outcome that belongs to it. The demo remembers the latest five completed requests per browser session while the API is running.

## Start locally

Use Bun 1.4 or later. From the repository root, run:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite serves the web app and proxies API calls to Elysia on port 3000. Set `WEB_PORT` or `API_PORT` if either port is in use.

Select **Пример**, then **Составить ответ**. Try `[timeout]`, `[error]`, `[bad-json]`, `[bad-topic]`, or `[empty-draft]` to see manual review. Select a row in **Недавние заявки** to reopen that request. The theme control follows the system by default and can save an explicit light or dark preference.

## Check changes

```sh
bun run check
```

This runs TypeScript checks, Oxlint, Oxfmt in check mode, and the Bun tests. Run `bun run format` to apply formatting.

To run the failure and API contract tests alone, use `bun test apps/api/src`.

## Run the built app

```sh
bun run build
bun run start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). One Bun process serves the built web app and the API. The demo uses a deterministic provider and resets its in-memory history on restart.

`POST /api/triage` accepts `{ "text": "..." }` and returns the outcome specified in the exercise. The interface uses `POST /api/requests` to also record the result in session history. Both endpoints use the supplied `mock-ai.mjs` unchanged.

The draft gives a manager a starting point for a reply. Its benefit can be measured by comparing median handling time on similar requests with and without the assistant.

## Workspaces

- `apps/web` contains the React workbench, shadcn/ui-style primitives, and Tailwind theme tokens.
- `apps/api` owns validation, the 300 ms provider deadline, and the history store. The web client uses Eden Treaty to infer the API types.
- Edit Russian interface copy in `apps/web/src/copy.ts` and demo requests and replies in `apps/api/src/demo-copy.ts`.
- The web build serves [Golos Text](https://github.com/google/fonts/tree/main/ofl/golostext) and [Literata](https://github.com/google/fonts/tree/main/ofl/literata) locally. Their SIL Open Font License files are in `apps/web/src/fonts`.
