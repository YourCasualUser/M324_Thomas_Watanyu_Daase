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
| `crate-ci/typos` | v1.52.2 | `276087d9a4f06398b3e04825487805e2d7375888` |

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

- *The Wiki itself*: it had to be enabled in settings, and the repository had to be set public again to even get access to it.

after fixing these issues, I got to test it out.
Here's the Result after I added a new wiki page: [[wiki-actions-result](https://github.com/YourCasualUser/M324_Thomas_Watanyu_Daase/actions/runs/45347428709)]

## Task 4: GitHub Actions Marketplace

`custom_action.yml` uses [typos](https://github.com/crate-ci/typos) v1.52.2, a spell checker for source code and docs. It scans the files in the repo and fails the job if it finds a misspelled word, and it lists the file, the line and the suggested fix. I checked the source and the maintenance first: it's an open source project with regular releases and the last commit was in November 2026. It only reads files, so the job needs just `contents: read`.

I chose to test this, because it can be a good thing to have a spell checker in a repo if many contributors add to the project, and contributors come from all over the world. Depending on each person they have a different profficiency in english, so checking in the docs whatever can be good to uphold that quality.

- **Schedule:** every Monday at 06:17 UTC (`cron: "17 6 * * 1"`).
- **Manual test:** I added `workflow_dispatch`, so I started it from the Actions tab (pick the workflow, then Run workflow).
- **Pinning:** the tag `v1.52.2` is an annotated tag, so it has two hashes. I used the commit hash (the `^{}` line from `git ls-remote`), because the tag object hash doesn't work in `uses:`.
- **Result:** link workflow

Here's the result of that github actions after I manually ran it to test it: [[actions-test](https://github.com/YourCasualUser/M324_Thomas_Watanyu_Daase/actions/runs/45349787925)]
It shows the typo, which was located inside of the index.js and mentions that "Youre" should've been "Your" instead.
