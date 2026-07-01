
# Contributing to monime-package

Thank you for your interest in contributing to **monime-package**!  We welcome contributions from everyone—whether it's fixing bugs, adding new features, improving documentation, or suggesting ideas.

This guide outlines how you can contribute effectively.

---

##  Getting Started

1. **Fork & Clone the Repository**

   * Fork the repository on GitHub.
   * Clone it to your local machine:

   ```bash
   git clone https://github.com/Walon-Foundation/monime-package.git
   cd monime-package
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create a New Branch**

   * Follow the naming convention for your branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🛠 Making Changes

**Implement Your Changes**

* Make necessary code changes in your branch.
* Ensure your code follows the project’s **TypeScript style** and conventions.

**Keep Changes Focused**

* Each Pull Request (PR) should focus on a **single feature or bug fix**.
* Keep functions **small and maintainable**.
* Follow the existing layout: an API resource lives as a trio of files —
  the class in `src/resources/`, its request/response types in `src/types/`,
  and (for endpoints that take input) a Zod validator in `src/validators/`.

### Project Layout

```
src/
├── index.ts        # Public entry point (createClient, types, errors)
├── client.ts       # MonimeClient — wires resources to credentials
├── http.ts         # Shared fetch logic, headers, error handling
├── error.ts        # MonimeError / MonimeValidationError
├── resources/      # One class per API resource
├── types/          # Request/response interfaces
└── validators/     # Zod input schemas

test/
├── e2e/                 # End-to-end tests per resource
└── unit/validators/     # Validator unit tests

examples/           # Runnable usage examples
```

---

## Testing & Quality

Before opening a PR, make sure the checks below pass locally:

```bash
pnpm lint-format   # Biome — formats and lints (auto-fixes where possible)
pnpm test          # Vitest — unit and e2e tests
pnpm build         # tsup — verifies the package builds (dual CJS/ESM)
```

* Add or update tests under `test/` for any behavior you change.
* New input-accepting endpoints should ship with a Zod validator **and** a
  matching test in `test/unit/validators/`.
* Formatting and linting are handled by **Biome** (`biome.json`) — don't hand-format.

---

## 📤 Submitting Your Changes

1. **Push Your Branch to GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request (PR)**

   * Go to the **main repository** on GitHub.
   * Click "**New Pull Request**".
   * Provide a **clear description** of your changes and link any relevant issues.

---

## Pull Request Guidelines

* Keep PRs **small and focused**—avoid large, unrelated changes.
* Ensure your code is **well-documented**—add meaningful comments where necessary.
* Update **README.md** or TypeScript types if your changes affect public API.
* Be open to feedback—reviewers may request changes to improve quality.

---

## Coding Conventions

*  Follow existing **TypeScript coding style**.
*  Use **meaningful variable and function names**.
*  Keep functions **single-responsibility** and modular.
*  Write **clear, concise comments** for complex logic.
---

## Reporting Issues

Found a bug or have a suggestion?

1. **Check the GitHub issue tracker** to see if it already exists.
2. If not, **create a new issue** with:

   * A **clear description** of the problem or suggestion.
   * Steps to **reproduce the bug** (if applicable).
   * Relevant **environment info** (Node.js version, TypeScript version, etc.).

---

## Questions?

If you have any questions or need clarification:

* Open an issue on GitHub.
* Join discussions via the project communication channels (if available).

---

## Thank you for contributing to **monime-package**!

