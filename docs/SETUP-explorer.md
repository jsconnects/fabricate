# Setup Guide — Getting the Explorer Live

This guide is for getting the Layer 1 Explorer deployed to GitHub Pages from the Fabricate repo. Estimated time: 15–20 minutes.

## Prerequisites

- A public GitHub repository named `fabricate` under the `jsconnects` user (or whatever username you use; if different, update `vite.config.js`)
- The Fabricate starter contents from earlier in this conversation merged into the repo
- The Explorer contents from this artifact bundle merged into the `explorer/` directory

## Step 1: Merge Explorer into Fabricate

If you haven't already, copy everything from this Explorer bundle into your Fabricate repo's `explorer/` directory. The contents to copy:

```
explorer/
├── README.md                   # Replaces the earlier stub
├── package.json
├── package-lock.json           # Generated when you run npm install
├── vite.config.js
├── index.html
├── data/
│   └── mit-data.json
├── src/
│   ├── main.jsx
│   └── ACIMITExplorer.jsx
└── .gitignore                  # If not already present at repo root
```

Also copy:

```
.github/workflows/deploy-explorer.yml
```

into the **repo root**, not the explorer directory. (GitHub Actions workflows must live at `<repo>/.github/workflows/`.)

And the updated `architecture.md` content goes to `<repo>/docs/architecture.md`.

## Step 2: Update Vite config if your username isn't `jsconnects`

Open `explorer/vite.config.js`. The `base` option is currently set to `/fabricate/`. This works as long as:

- Your GitHub repo is named exactly `fabricate`
- It's at the root of your user account (not under an organization with a different default Pages path)

If either of those isn't true, update the `base` value to match the path GitHub Pages will serve from. For a repo at `https://github.com/<user>/<repo>`, the base path is typically `/<repo>/`.

## Step 3: Test the build locally (optional but recommended)

```bash
cd explorer
npm install
npm run build
npm run preview
```

If `preview` starts and the page loads correctly at the URL it prints, the build is good. Note that local preview uses a slightly different base path than the production deploy — minor visual differences are expected; what matters is that the page renders.

## Step 4: Commit and push

```bash
git add .
git commit -m "Add Layer 1 Explorer with GitHub Pages deployment"
git push
```

## Step 5: Enable GitHub Pages

Go to your repo on GitHub:

1. **Settings → Pages**
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. That's it. The workflow will run on the next push to `main`.

If the workflow has already run from your push in Step 4, the deploy may have already happened. Check **Actions** tab to see the workflow status. The first run typically completes in 1–2 minutes.

## Step 6: Verify the deploy

Once the workflow completes, the Explorer should be live at:

**https://jsconnects.github.io/fabricate/**

(Replace `jsconnects` with your username if different.)

If you see a 404, the most common causes are:

- GitHub Pages source not set to "GitHub Actions" (Step 5)
- The `base` path in `vite.config.js` doesn't match your actual Pages URL path
- The workflow is still running — check the Actions tab

## What to do after it's live

1. **Add the live URL to the top-level README.** The Layer 1 row in the roadmap table can be updated from "Working" to a clickable link.
2. **Pin the repo on your GitHub profile.** Public projects with live demos rank above projects without them when recruiters scan profiles.
3. **Add the link to your LinkedIn featured section.** "Fabricate — ACI MIT Explorer" with the Pages URL.
4. **Move on to Layer 2.** The Explorer being live is the inflection point for the project's portfolio value. Don't keep polishing Layer 1 indefinitely; the workbook pipeline is where most of the differentiation lives.

## Troubleshooting

**Build fails locally with a Node version error.**
Vite 5 requires Node 18+. Run `node --version` to check. The GitHub Actions workflow uses Node 20.

**Workflow runs but Pages shows old content.**
GitHub Pages can take a minute to propagate after a successful deploy. Wait, then hard-refresh your browser. If the issue persists, check the workflow logs in the Actions tab.

**Search doesn't work after deploy.**
Search is purely client-side; if the page loads but search is broken, it's a JS error — open the browser console to see what's failing. Most likely cause is a JSON parse failure on the data file.

**Study Mode doesn't show exam tags.**
Toggle is in the top-right header bar. Click the checkbox. If exam tags still don't show on a class you expected to have one, check `data/mit-data.json` for that class entry — only some classes have `exam` fields.
