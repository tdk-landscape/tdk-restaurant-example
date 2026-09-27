# GitHub Project Template: TDK Landscape Delivery

This repository includes a ready-made [GitHub Projects](https://docs.github.com/issues/planning-and-tracking-with-projects) template for planning work on a TDK landscape. Once created, it appears under **Recommended templates** when anyone in the `tdk-landscape` organization creates a new project.

| What | Where |
| --- | --- |
| Template spec (fields, options, sample items, labels) | [`.github/project-template/template.json`](../.github/project-template/template.json) |
| Project README shown inside the project | [`.github/project-template/readme.md`](../.github/project-template/readme.md) |
| Script that creates the project and marks it as a template | [`.github/project-template/create-project-template.mjs`](../.github/project-template/create-project-template.mjs) |
| Manual workflow that runs the script | [`.github/workflows/project-template.yml`](../.github/workflows/project-template.yml) |
| Issue forms that match the project fields | [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE) |

## What the template contains

- **Status**: Backlog, Ready, In progress, In review, Done
- **Stack**: guest, kitchen, operations, platform
- **Resource**: one option per `appName` in `services/*/*/service.json`, plus `new resource` and `cross-cutting`
- **Phase**: Pre-Alpha, Alpha, Beta, Out of Scope (the phases in [`.tdk/project.json`](../.tdk/project.json))
- **Priority** (P0 to P2), **Size** (XS to XL), **Estimate**, **Target date**, **Sprint** (two-week iterations)
- Six sample draft items that show how to write resource-scoped work
- Repository labels `stack:*`, `new-resource`, `bug`, `enhancement`

## 1. Create the project

You need a token that can create organization projects. The default Actions `GITHUB_TOKEN` cannot do this.

- **Classic PAT:** scopes `project` and `repo`.
- **Fine-grained PAT:** resource owner `tdk-landscape`, with organization *Projects: read and write* and repository *Issues: read and write* on this repository.

### Option A: from your machine

```bash
# Preview. Makes no API calls.
node .github/project-template/create-project-template.mjs --dry-run

# Create it
GITHUB_TOKEN=<your token> node .github/project-template/create-project-template.mjs
```

Options: `--org`, `--repo`, `--title`, `--no-items`, `--no-labels`, `--no-template`, `--force`. Run with `--help` for details.

### Option B: from GitHub Actions

1. Add the token as the repository secret `PROJECT_TEMPLATE_TOKEN`.
2. Go to **Actions → Create project template → Run workflow**.
3. Run it once with *dry run* checked, then again with it unchecked.

The script stops if a project with the same title already exists, so re-running it does not create duplicates. Pass `--force` if you want a second copy.

## 2. Finish in the browser

The GitHub API cannot create views or project workflows, so set these up by hand. Open the project URL that the script printed.

1. **Views**
   - Rename *View 1* to **Board**. Layout: Board. Column field: Status.
   - Add a view **By stack**. Layout: Table. Group by: Stack. Show Resource, Priority, Size, Sprint.
   - Add a view **Roadmap**. Layout: Roadmap. Dates: Target date. Group by: Phase.
2. **Workflows** (*⋯ → Workflows*): turn on *Item closed → Done* and *Pull request merged → Done*. Leave *Auto-add* off on the template. Turn it on in projects created from the template, pointed at their own repository.

## 3. Add it to the organization's recommended templates

1. Open [organization settings → Projects](https://github.com/organizations/tdk-landscape/settings/projects).
2. Make sure **Enable Projects for the organization** is on.
3. Under **Recommended templates**, choose **Add template** and select **TDK Landscape Delivery (template)**.

This step needs an organization owner. The script already marked the project as a template (the same as *Settings → Templates → Make template* in the project).

## Using the template

*New project → Recommended → TDK Landscape Delivery*, or open the template project and choose **Use this template**. The copy includes the fields, views, draft items, and workflows. Auto-add is the one exception and must be set up again. Then:

1. Replace the `Resource` options with the `appName` values from your own landscape.
2. Link your repository (*Settings → Linked repositories*).
3. Turn on *Auto-add to project* for your repository.
