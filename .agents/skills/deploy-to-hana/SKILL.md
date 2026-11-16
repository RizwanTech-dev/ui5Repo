---
name: deploy-to-hana
description: "Inspect a project and deploy its SAP HANA HDI database artifacts, such as tables, procedures, functions, views, and table data. Use when asked to deploy, publish, or verify artifacts from a db/ directory to SAP HANA."
user-invocable: true
---

# Deploy to SAP HANA

This is the canonical shared entry point for the `deploy-to-hana` skill.

Use this skill to discover HANA artifacts, identify the project's configured deployment command and target without deploying, then deploy only after the user confirms. It is not standing permission to connect to or change a database.

## When to use

- The user requests deployment or verification of database artifacts from `db/` to SAP HANA.
- A code or schema change needs an HDI deployment procedure.
- The project needs a reusable HANA deployment workflow.

## Procedure

1. Read [`deployToHana_skill.md`](./deployToHana_skill.md). Recursively inspect the project for HANA artifact directories and deployable files, including `.hdbtable`, `.hdbprocedure`, `.hdbfunction`, and any other suffixes supported by the project's HDI configuration. Note required related artifacts and dependencies.
2. Inspect project manifests, scripts, deployment configuration, and docs to identify the exact existing deployment command and target. Do not run the command during discovery. Do not guess either value. Check credential configuration without reading or exposing credential values.
3. If the artifact scope, command, and target are identified reliably and credentials are already configured securely, ask exactly this question, with no preamble or additional confirmation questions:

   **Database artifacts and the deployment command have been identified. Do you want to proceed with the HANA deployment? (Yes/No)**

   Do not ask separately about tables, procedures, data loads, schema changes, production, or individual detected artifacts. This confirmation covers the identified deployment as a whole. If the target or command cannot be determined reliably, explain the specific issue and stop instead of asking the confirmation question or guessing.
4. If the user answers **No**, cancel immediately; run no deployment command and make no deployment-related changes. If the user answers **Yes**, execute the identified command against the identified target and verify its result. Report the outcome concisely; never claim success if execution or verification failed.
5. Preserve credential and destructive-operation safeguards below. A Yes authorizes only the identified deployment and target; stop if the command would expose credentials, targets a different environment, or requires an unapproved action outside that deployment.

## Safety

- Never deploy, undeploy, drop, or otherwise change a database without explicit approval for the target and action.
- The exact Yes/No confirmation above is the required explicit approval for the identified deployment and target, including its normal deployment effects. Do not expand its scope.
- Do not use production credentials or target production unless the user explicitly approves that deployment through the confirmation above for the reliably identified production target.
- Do not add credentials to shell history, source files, logs, skill files, or command output.
- If credentials are absent, would need to be exposed, or cannot be used through the established secure mechanism, stop and explain the specific issue; do not ask additional questions.
- If the target, deployment command, or scope is unclear, stop and explain the specific issue rather than guessing or asking additional questions.
