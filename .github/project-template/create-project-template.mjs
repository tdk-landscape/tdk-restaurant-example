#!/usr/bin/env node
// Creates the "TDK Landscape Delivery" org project from template.json and
// marks it as an organization project template. No dependencies; Node 18+.
//
//   GITHUB_TOKEN=<token> node .github/project-template/create-project-template.mjs
//   node .github/project-template/create-project-template.mjs --dry-run
//
// The token needs the `project` and `repo` scopes (classic PAT), or
// org Projects read/write + repo Issues read/write (fine-grained PAT).
// Marking a project as a template requires admin access to the project.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const API = process.env.GITHUB_API_URL || "https://api.github.com";

const { values: args } = parseArgs({
  options: {
    org: { type: "string", default: "tdk-landscape" },
    repo: { type: "string", default: "tdk-restaurant-example" },
    title: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "no-template": { type: "boolean", default: false },
    "no-items": { type: "boolean", default: false },
    "no-labels": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (args.help) {
  console.log(`Usage: node create-project-template.mjs [options]

  --org <login>     Organization that owns the project (default: tdk-landscape)
  --repo <name>     Repository to link and create labels in (default: tdk-restaurant-example)
  --title <title>   Project title (default: title in template.json)
  --dry-run         Print the plan without calling GitHub
  --no-template     Create the project but do not mark it as a template
  --no-items        Skip the sample draft items
  --no-labels       Skip creating repository labels
  --force           Create even if a project with the same title exists

Token: GITHUB_TOKEN or GH_TOKEN (scopes: project, repo).`);
  process.exit(0);
}

const spec = JSON.parse(readFileSync(join(here, "template.json"), "utf8"));
const readme = readFileSync(join(here, spec.readme), "utf8");
const title = args.title || spec.title;
const dryRun = args["dry-run"];
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!dryRun && !token) {
  console.error("Set GITHUB_TOKEN (scopes: project, repo) or pass --dry-run.");
  process.exit(1);
}

validateSpec(spec);

function validateSpec(s) {
  const known = new Map([["Status", s.status.options.map((o) => o.name)]]);
  for (const f of s.fields) known.set(f.name, f.options?.map((o) => o.name) ?? null);
  for (const item of s.items) {
    for (const [field, value] of Object.entries(item.fields ?? {})) {
      if (!known.has(field)) throw new Error(`Item "${item.title}": unknown field "${field}"`);
      const opts = known.get(field);
      if (opts && !opts.includes(value)) {
        throw new Error(`Item "${item.title}": "${value}" is not an option of "${field}"`);
      }
    }
  }
}

async function graphql(query, variables) {
  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "tdk-project-template",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    const msg = json.errors?.map((e) => e.message).join("; ") || `${res.status} ${res.statusText}`;
    throw new Error(`GraphQL: ${msg}`);
  }
  return json.data;
}

async function rest(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "tdk-project-template",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

const step = (msg) => console.log(`• ${msg}`);

// Plain text only: GitHub requires a description on every option.
const optionInput = (o) => ({ name: o.name, color: o.color, description: o.description ?? "" });

function iterationConfig(f) {
  const start = new Date();
  // Start sprints on the next Monday.
  start.setUTCDate(start.getUTCDate() + ((8 - start.getUTCDay()) % 7 || 7));
  return {
    startDate: start.toISOString().slice(0, 10),
    duration: f.iteration?.durationDays ?? 14,
    iterations: [],
  };
}

async function main() {
  if (dryRun) {
    step(`[dry-run] create project "${title}" in ${args.org}, linked to ${args.org}/${args.repo}`);
    step(`[dry-run] set description and README (${readme.length} chars)`);
    step(`[dry-run] Status options: ${spec.status.options.map((o) => o.name).join(", ")}`);
    for (const f of spec.fields) {
      const opts = f.options ? `: ${f.options.map((o) => o.name).join(", ")}` : "";
      step(`[dry-run] field ${f.name} (${f.dataType})${opts}`);
    }
    if (!args["no-items"]) for (const i of spec.items) step(`[dry-run] draft item "${i.title}"`);
    if (!args["no-template"]) step("[dry-run] mark project as template");
    if (!args["no-labels"]) step(`[dry-run] labels: ${spec.labels.map((l) => l.name).join(", ")}`);
    return;
  }

  const { organization, repository } = await graphql(
    `query($org: String!, $repo: String!, $title: String!) {
      organization(login: $org) {
        id
        projectsV2(first: 20, query: $title) { nodes { number title url } }
      }
      repository(owner: $org, name: $repo) { id }
    }`,
    { org: args.org, repo: args.repo, title },
  );

  const existing = organization.projectsV2.nodes.find((p) => p.title === title);
  if (existing && !args.force) {
    console.error(`Project "${title}" already exists: ${existing.url}\nRe-run with --force to create another.`);
    process.exit(1);
  }

  const { createProjectV2 } = await graphql(
    `mutation($ownerId: ID!, $repositoryId: ID!, $title: String!) {
      createProjectV2(input: { ownerId: $ownerId, repositoryId: $repositoryId, title: $title }) {
        projectV2 {
          id number url
          field(name: "Status") { ... on ProjectV2SingleSelectField { id } }
        }
      }
    }`,
    { ownerId: organization.id, repositoryId: repository.id, title },
  );
  const project = createProjectV2.projectV2;
  step(`created project #${project.number}: ${project.url}`);

  await graphql(
    `mutation($projectId: ID!, $shortDescription: String!, $readme: String!) {
      updateProjectV2(input: { projectId: $projectId, shortDescription: $shortDescription, readme: $readme }) {
        projectV2 { id }
      }
    }`,
    { projectId: project.id, shortDescription: spec.shortDescription, readme },
  );
  step("set description and README");

  // Field name -> { id, options: Map(optionName -> optionId) }
  const fields = new Map();
  const toField = (f) => ({ id: f.id, options: new Map((f.options ?? []).map((o) => [o.name, o.id])) });

  const { updateProjectV2Field } = await graphql(
    `mutation($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]) {
      updateProjectV2Field(input: { fieldId: $fieldId, singleSelectOptions: $options }) {
        projectV2Field { ... on ProjectV2SingleSelectField { id options { id name } } }
      }
    }`,
    { fieldId: project.field.id, options: spec.status.options.map(optionInput) },
  );
  fields.set("Status", toField(updateProjectV2Field.projectV2Field));
  step("configured Status options");

  for (const f of spec.fields) {
    const input = { projectId: project.id, name: f.name, dataType: f.dataType };
    if (f.dataType === "SINGLE_SELECT") input.singleSelectOptions = f.options.map(optionInput);
    if (f.dataType === "ITERATION") input.iterationConfiguration = iterationConfig(f);
    try {
      const { createProjectV2Field } = await graphql(
        `mutation($input: CreateProjectV2FieldInput!) {
          createProjectV2Field(input: $input) {
            projectV2Field {
              ... on ProjectV2Field { id }
              ... on ProjectV2SingleSelectField { id options { id name } }
              ... on ProjectV2IterationField { id }
            }
          }
        }`,
        { input },
      );
      fields.set(f.name, toField(createProjectV2Field.projectV2Field));
      step(`created field ${f.name}`);
    } catch (err) {
      // Iteration fields are the newest API surface; don't fail the whole run on them.
      if (f.dataType !== "ITERATION") throw err;
      console.warn(`! could not create ${f.name} (${err.message}); add it in the UI`);
    }
  }

  if (!args["no-items"]) {
    for (const item of spec.items) {
      const { addProjectV2DraftIssue } = await graphql(
        `mutation($projectId: ID!, $title: String!, $body: String) {
          addProjectV2DraftIssue(input: { projectId: $projectId, title: $title, body: $body }) {
            projectItem { id }
          }
        }`,
        { projectId: project.id, title: item.title, body: item.body },
      );
      const itemId = addProjectV2DraftIssue.projectItem.id;
      for (const [name, value] of Object.entries(item.fields ?? {})) {
        const field = fields.get(name);
        if (!field) continue;
        await graphql(
          `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
            updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: $value }) {
              projectV2Item { id }
            }
          }`,
          {
            projectId: project.id,
            itemId,
            fieldId: field.id,
            value: { singleSelectOptionId: field.options.get(value) },
          },
        );
      }
      step(`added draft item "${item.title}"`);
    }
  }

  if (!args["no-template"]) {
    await graphql(
      `mutation($projectId: ID!) {
        markProjectV2AsTemplate(input: { projectId: $projectId }) { projectV2 { id } }
      }`,
      { projectId: project.id },
    );
    step("marked project as template");
  }

  if (!args["no-labels"]) {
    for (const label of spec.labels) {
      const res = await rest("POST", `/repos/${args.org}/${args.repo}/labels`, label);
      if (res.status === 201) step(`created label ${label.name}`);
      else if (res.status === 422) step(`label ${label.name} already exists`);
      else console.warn(`! label ${label.name}: HTTP ${res.status}`);
    }
  }

  console.log(`
Done: ${project.url}

Finish in the browser (GitHub has no API for these):
  1. Views: rename "View 1" to "Board" (layout Board, group by Status),
     add "By stack" (Table, group by Stack), add "Roadmap" (Roadmap, dates: Target date, group by Phase).
  2. Workflows: enable "Auto-add to project" for ${args.org}/${args.repo}, plus "Item closed" -> Done.
  3. https://github.com/organizations/${args.org}/settings/projects
     -> Recommended templates -> add "${title}".`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
