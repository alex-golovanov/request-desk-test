# Request desk

- Use Bun for installs, scripts, and tests. Keep dependency changes intentional and commit the Bun lockfile.
- Keep API request and response schemas in the API workspace. Consume the exported API type in the web workspace.
- Keep shared interface primitives in `apps/web/src/components/ui` and request workflow code in `apps/web/src/features/requests`.
- Keep demo history in memory and use fictional requests in examples and checks.
- Update the README when a command or workflow changes. Run the affected tests, type checks, lint, and formatting checks before committing.
