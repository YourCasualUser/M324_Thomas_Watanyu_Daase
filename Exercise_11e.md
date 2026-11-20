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

`npm ci` vs `npm install`: `npm ci` wipes `node_modules` and installs exactly what's in the lockfile, so every run is the same. If the lockfile is missing or doesn't match `package.json`, it errors out. `npm install` can pick newer versions and change the lockfile.

I also removed the `start` script from `package.json`, since CI does lint, format and test now.

I then did every round of changing something and seeing if github actions succeeds or not. After doing this 3 times, I returned it back to its original form and merged the PR.

## Task 2: Comment on a pull request

`pr-comment.yml` posts a comment on a PR as soon as it's opened, using Comment Pull Request v3.0.1 (pinned to a SHA, see the table).

- **Event:** `pull_request` with type `opened`, so it runs once when the PR is created, not on every push.
- **Permission:** only `pull-requests: write`. The action creates the comment through the GitHub API, and that needs write access to pull requests. Everything else is off, because I set the permissions on the job.

So after doing a pull request, a comment should appear saying 'Thanks for opening this pull request! Lint, format and tests run automatically. Please wait for the checks to pass before merging.'.

PR: [[pull-request](https://github.com/YourCasualUser/M324_Thomas_Watanyu_Daase/pull/2)]

## Task 3: Gollum

`gollum.yml` runs when someone creates or edits a page in the repo's wiki (that's the `gollum` event). It writes a small change log into the job summary: who edited the wiki and which pages changed.

Problems I had to solve:
- **Reading the event:** the event data has a list of the changed pages (`github.event.pages`) with the action, title and link. I turn it into JSON and read it with `jq`.
- **Untrusted input:** page titles are written by users, so I pass them through `env` and never put them directly into the shell script (that could run commands).
- **Permissions:** the job doesn't read or write anything in the repo, so `permissions: {}` turns everything off.
- **Where it runs:** `gollum` workflows only run from the default branch, so the file has to be merged into `main` before it can be tested.
- **The wiki itself:** it has to be enabled (Settings, Features) and have a first page before it can be edited.

Test: TODO (edit a wiki page, then link the workflow run and note anything that went wrong).
