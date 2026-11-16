# SAP HANA Deployment Playbook

Use this concise workflow for each deployment. Inspect first, ask the one required confirmation, and do not deploy until the answer is Yes.

## 1. Discover artifacts, command, and target (read-only)

- Search the repository recursively for database artifact directories and supported deployable files, such as `.hdbtable`, `.hdbprocedure`, `.hdbfunction`, views, sequences, table types, triggers, roles, synonyms, virtual objects, and table-data descriptors/data files.
- Identify module boundaries and artifact support from project configuration such as `.hdiconfig`, package manifests/lockfiles, MTA or deployment descriptors, CI scripts, and existing project documentation. Include dependencies and related configuration in the discovered scope.
- Determine the exact existing deployment command and the environment/container it targets from the project's own configuration. Do not infer a command from an artifact suffix, invent a service or target, or run the deployment command during this step.
- Check that required credentials are configured through the existing secure mechanism without displaying, reading into chat, copying, logging, or committing their values. A credential file's presence alone does not prove its target.
- Do not provide a deployment plan, artifact-by-artifact impact analysis, or summary to the user before confirmation. Discovery is internal; do not make deployment-related changes.

If artifact locations, supported formats, target, credentials, or command are not determinable reliably, do not guess or deploy. Explain the specific blocker concisely and stop; do not ask follow-up questions.

## 2. Ask the single confirmation

Once the artifact scope, deployment command, target, and secure credential setup are identified, ask the user exactly:

**Database artifacts and the deployment command have been identified. Do you want to proceed with the HANA deployment? (Yes/No)**

Ask no other question and do not request separate approvals for tables, procedures, data loads, schema changes, or other artifacts. The answer applies only to the discovered deployment command and target.

## 3. Act on the answer

- **No:** Cancel. Do not execute deployment, install or alter deployment configuration, or make deployment-related changes.
- **Yes:** Execute the identified project command against the identified target, then verify the deployment. Do not switch commands or targets. If execution reveals a different target, credential exposure, or a destructive action beyond the approved deployment, stop and explain the issue rather than proceeding.

When a documented dependency-install command is necessary before the identified deploy command, use the project's lockfile and package manager; do not change dependency manifests. Do not run deployment or install commands before Yes.

## Commands in this repository

This repository defines an HDI database module at `db/`. `db/package.json` declares `@sap/hdi-deploy` and maps `npm start` to `node node_modules/@sap/hdi-deploy/deploy.js`. The root `mta.yaml` also declares an HDI module; determine from the requested environment and available configuration whether direct HDI deployment or an existing MTA/CI route is the applicable command and target. Do not assume one route applies to every environment.

For the configured direct HDI route, the command is `npm start` with `db/` as the working directory. Run it only after the single confirmation. If the required dependencies are unavailable, `npm ci` from `db/` is the repository's lockfile-based preparation command; run it only after Yes and only if needed. Do not guess a Cloud Foundry org, space, MTA target, service name, or schema.

## Verification

After Yes and command execution:

1. Check the command exit status and deployer output. Confirm successful HDI build/deployment and note reported errors or undeployments.
2. Use the project's established HANA verification path to confirm deployed objects in the identified HDI container/schema. Where available, inspect the catalog or Database Explorer for the artifacts in scope, including procedures, functions, tables, views, and related objects.
3. Run only appropriate read-only checks against the identified target. Do not guess a schema name or print credentials.
4. Report success or failure briefly, including verification status. Do not claim success if execution or verification failed.

## Safety and troubleshooting

- Never hardcode, expose, echo, or commit credentials. Never inspect a credentials file's contents to determine whether it exists or which target it contains; use only the project's safe documented configuration.
- The one Yes is explicit approval for the identified deployment and its ordinary deployment effects. Do not exceed its target or scope. Do not use destructive/forced undeploy options or perform separately destructive operations. If the known command requires such an operation, stop and explain the specific issue; do not ask for another confirmation.
- If secure credentials are absent, the target or command is ambiguous, configuration conflicts, or artifact support/dependencies cannot be established, stop and explain the specific issue rather than guessing or asking additional questions.
- On authentication, build, dependency, or verification failure, report the specific failure concisely. Do not silently retry against another target or change deployment configuration to bypass the failure.

No live deployment is performed during discovery or skill validation. Repository-specific command/target claims must be rechecked against current project configuration each time; environment connectivity and runtime deployment success are verified only after the approved deployment.
