---
applyTo: '**'
---
👉 Im Agent Mode: Arbeite vollständig autonom – ohne unnötige Rückfragen. Du bist mein "autonomer Peer-Programmierer".

1. Analyse:
   • Scanne das gesamte Projekt, erkenne relevante Dateien & Abhängigkeiten.
2. Planung:
   • Erstelle automatisch einen Plan, um [Problem kurz einfügen] zu lösen.
3. Umsetzung (Schritt für Schritt):
   • Wende Codeänderungen an.
   • Führe nur notwendige Terminal-Befehle aus – *mit Nutzerzustimmung*. **npm run build** nur, wenn wirklich nötig.
   • Überprüfe Build- und Testausgabe, behebe Fehler eigenständig.
   • Wiederhole Iterationen, bis alles compilebar & getestet ist.
4. Abschluss:
   • Gib nur dann Feedback, wenn menschliches Eingreifen zwingend nötig ist.
5. Zusammenfassung:
   • Welche Dateien/Werkzeuge/Commands genutzt?
   • War Build/Test erfolgreich?



Coding standards, domain knowledge, and preferences that AI should follow.

- Use clear and descriptive variable names.
- Write modular and reusable code.
- Include comments and documentation for complex logic.
- Follow the DRY (Don't Repeat Yourself) principle.
- Prioritize performance and optimization.
- Ensure code is easily testable and includes unit tests.

# Project Architecture Overview

This project is a TypeScript-based finance/portfolio management tool with a modern web architecture. The structure is clearly modularized and follows best practices for scalability, maintainability, and testability.

## Key Directories & Their Purpose

- **src/** – Main source code of the project
  - **App.tsx, main.tsx**: Application entry points (React, Vite-based)
  - **config/**: Central configuration files and feature flags
  - **constants/**: Reusable constants and form options
  - **container/**: Domain modules (e.g., analytics, dashboard, finance, portfolio)
  - **hooks/**: Custom React hooks for encapsulating state and logic
  - **locales/**: Internationalization (i18n) with language files
  - **service/**: Service layer (e.g., API communication, domain logic, infrastructure)
  - **store/**: Redux store, actions, middleware, slices (state management)
  - **theme/**: Theme configuration (e.g., MUI theme, ThemeProvider)
  - **types/**: Type definitions for domains, shared, and utility types
  - **ui/**: UI components, dialogs, forms, navigation, dashboard, portfolio, etc.
  - **utils/**: Helper functions and utility methods (e.g., for calculations, caching, parsing)
  - **view/**: (Presumably) views/pages of the application
  - **workers/**: Web workers for asynchronous/performance-intensive tasks

- **public/** – Static assets, possibly additional workers
- **Config files (root)** – Build and tooling configuration (Vite, Tailwind, ESLint, TypeScript, PostCSS)

## Architectural Principles
- **Modularity:** Clear separation of domains, UI, logic, and infrastructure
- **Reusability:** Components, hooks, and utilities are reusable and encapsulated
- **Testability:** Structure supports unit and integration tests
- **Internationalization:** Multilanguage support via `locales/`
- **State Management:** Redux for global state, context for specific use cases
- **Cross-Platform:** Web & iOS (Capacitor/Cordova)

## Guidance for Further Development
- Before implementing new logic, always check if similar logic or functionality already exists as a service or hook. Avoid code or logic duplication wherever possible—**this is critical!**
- When creating generic UI components, ensure they are truly reusable. Only create a new generic component if it is likely to be used in multiple places, and always check first if a similar UI component already exists.
- **Views and Containers:** Maintain a clear separation between view components (responsible for layout and presentation) and container components (responsible for data fetching, state, and logic). Follow this separation strictly in all new code.
- **Types:** All type definitions **must** reside in the `types/` directory. Type definitions should never be placed elsewhere in the codebase.
- **Imports:** Use only the following absolute import paths, as defined in the current project configuration:
  - `@/` (for `src/`)
  - `@/types/` (for `src/types/*`)
  - `@service/` (for `src/service/*`)
  - `@/utils/` (for `src/utils/*`)
  - `@/store/` (for `src/store/*`)
  - `@ui/` (for `src/ui/*`)
  - `@container/` (for `src/container/*`)
  - `@view/` (for `src/view/*`)
Do **not** introduce new absolute import roots. Always use the existing ones listed above. If you need to import from other folders, use relative imports.
- Maintain the architecture and structure to ensure maintainability and scalability.
- **File Reading:** When a file is read, Copilot **must always read the entire file**. For each read action, at least 200 lines must be read at once if the file contains that many lines. Only if the file is smaller may fewer lines be read. This is mandatory.
- **Autonomy & Motivation:** Copilot should work proactively and autonomously, avoid unnecessary questions, and minimize interruptions for the user. Terminal commands should be executed by Copilot whenever possible, and the user should rarely be prompted to run commands manually.

## E2E Consistency & Impact of Changes
- For every change or new function, Copilot MUST always check the end-to-end (E2E) impact on all dependent components (e.g., containers, views, UI, other services or hooks).
- Changes to a service, hook, container, etc. affect all components that use them. Copilot MUST therefore always identify all affected components and ensure that the change remains E2E consistent, meaningful, and functional.
- After each change, it must be checked whether the functionality and logical context in the overall system are preserved. If adjustments are necessary in dependent components, these must be made automatically as well.

---

> **This file serves as a reference for the project architecture. Please always adhere to this structure when extending or refactoring!**