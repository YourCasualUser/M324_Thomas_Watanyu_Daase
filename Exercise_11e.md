# Exercise 11e - CI/CD and GitHub Actions

## External actions and security

How I pick an action: I read its source code, check who maintains it (GitHub's own `actions/*` is safest), check that it still gets updates, that it only needs few permissions, and that it doesn't pull in a lot of dependencies.

Why pin to a full SHA: a tag like `@v7` can be moved to different code later, and my workflow would run it without me noticing. A SHA is one exact version, so it can't change. In 2025 attackers did exactly this to `tj-actions/changed-files` and leaked secrets. Pinning doesn't make an action safe, it just stops silent changes.

How I checked the SHAs: I ran `git ls-remote --tags` on the official repos and took the commit of the release I wanted. The version number stays as a comment.

| Action | Release | SHA |
|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `thollander/actions-comment-pull-request` | v3.0.1 | `24bffb9b452ba05a4f3f77933840a6a841d1b32b` |

## Task 1: Set up CI

What `ci.yml` does:
- **Trigger:** runs when a PR into `main` is opened or updated.
- **Permissions:** `contents: read`, so the token can only read the repo.
- **Runner:** a fresh Ubuntu VM from GitHub. All `run` steps happen in `Exercise2`.
- **Checkout:** gets my code onto the empty runner.
- **Node setup:** installs Node.
- **`npm ci`:** installs the exact versions from the lockfile.
- **Lint / format / test:** `npm run lint`, `npx prettier --check .` (only checks, doesn't change files) and `npm test`. If one fails, the job fails.

Node version: `"22"`, same as my `Dockerfile` (`node:22-slim`). ESLint 10 and mocha 12 both need 22.13 or newer, so 22 works.

`npm ci` vs `npm install`: `npm ci` wipes `node_modules` and installs exactly what's in the lockfile, so every run is the same. If the lockfile is missing or doesn't match `package.json`, it errors out. `npm install` can pick newer versions and change the lockfile.

I also removed the `start` script from `package.json`, since CI does lint, format and test now.

## Task 2: Comment on a pull request

`pr-comment.yml` posts a comment on a PR as soon as it's opened, using Comment Pull Request v3.0.1 (pinned to a SHA, see the table).

- **Event:** `pull_request` with type `opened`, so it runs once when the PR is created, not on every push.
- **Permission:** only `pull-requests: write`. The action creates the comment through the GitHub API, and that needs write access to pull requests. Everything else is off, because I set the permissions on the job.

PR with the comment: TODO
