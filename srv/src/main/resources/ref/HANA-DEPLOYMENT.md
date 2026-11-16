# HANA Deployment Guide

This document explains how to deploy the HDI database artifacts (tables and stored procedures) in the `db/` folder to SAP HANA Cloud.

---

## Project Structure

```
db/
├── src/
│   ├── .hdiconfig                          # HDI plugin configuration
│   ├── loadData.hdbtabledata               # Initial data load config
│   ├── container/
│   │   ├── birt/
│   │   │   ├── birt.hdbtable               # BIRT reports table
│   │   │   ├── birt.csv                    # Initial BIRT data
│   │   │   ├── add_edit_birt_data.hdbprocedure
│   │   │   └── get_birt_data.hdbprocedure
│   │   └── masters/
│   │       └── masters.hdbtable            # Masters table
│   ├── modules/
│   │   ├── modules.hdbtable                # Modules table
│   │   ├── modules.csv                     # Initial modules data
│   │   └── get_modues.hdbprocedure
│   ├── users/
│   │   ├── users.hdbtable                  # Users table
│   │   ├── add_edit_users.hdbprocedure
│   │   ├── get_users.hdbprocedure
│   │   └── get_user_by_id.hdbprocedure
│   └── test/
│       └── hello_db.hdbprocedure           # Test procedure
├── package.json                            # Uses @sap/hdi-deploy
├── default-env.json                        # ⚠️ NOT in git — credentials file (see below)
└── .gitignore
```

---

## Prerequisites

- Node.js v18+ (v24 works with a warning, deployment still succeeds)
- Access to the SAP BTP trial account
- HDI container service key from BTP cockpit (see below)

---

## One-Time Setup

### Step 1 — Install dependencies

```bash
cd db
npm install
```

### Step 2 — Create `default-env.json`

This file is **excluded from git** (listed in `db/.gitignore`). You need to create it manually each time you clone the repo.

1. Go to [BTP Cockpit](https://cockpit.us10.hana.ondemand.com)
2. Navigate to your subaccount → **Cloud Foundry** → **Spaces** → **dev**
3. Go to **Service Instances** → find your HDI container instance
4. Click **Service Keys** → create one if it doesn't exist → copy the JSON

Create `db/default-env.json` with this structure:

```json
{
  "VCAP_SERVICES": {
    "hana": [
      {
        "name": "hdi_db",
        "tags": ["hana"],
        "credentials": {
          << paste your service key JSON here >>
        }
      }
    ]
  }
}
```

> ⚠️ Never commit `default-env.json` to git. It contains HDI container credentials.

---

## Deploying

Run this from the `db/` folder every time you make changes to any `.hdbprocedure` or `.hdbtable` file:

```bash
cd D:\Rizwan\ui5Repo\db
node node_modules/@sap/hdi-deploy/deploy.js
```

A successful deployment ends with:

```
Make succeeded: X files deployed, 0 files undeployed
Deployment to container <schema> done
Application can be stopped.
```

---

## HANA Connection Details

| Property | Value |
|---|---|
| Host | `d046e2df-3ea5-4b14-b0e3-35f7b1a9da6d.hna0.prod-us10.hanacloud.ondemand.com` |
| Port | `443` |
| Schema | `E053FB62C0D740C185A59FC9F6A326E7` |
| Region | `us10` |
| BTP Org | `e4c459e4trial` |
| BTP Space | `dev` |

> Passwords and HDI user credentials are in `default-env.json` (not in git).
> The same JDBC credentials are also in `srv/src/main/resources/application.properties` for the Spring Boot backend.

---

## Verifying Deployed Objects

Open the **SAP HANA Database Explorer** from BTP cockpit and run:

```sql
-- Check tables
SELECT TABLE_NAME, SCHEMA_NAME
FROM SYS.TABLES
WHERE SCHEMA_NAME = 'E053FB62C0D740C185A59FC9F6A326E7'
ORDER BY TABLE_NAME;

-- Check procedures
SELECT PROCEDURE_NAME, SCHEMA_NAME
FROM SYS.PROCEDURES
WHERE SCHEMA_NAME = 'E053FB62C0D740C185A59FC9F6A326E7'
ORDER BY PROCEDURE_NAME;
```

---

## Deployed Tables

| Table | Description |
|---|---|
| `birt` | BIRT report configurations |
| `masters` | Master data for reports |
| `modules` | UI5 application modules/navigation |
| `users` | Application users with profile pictures |

---

## Deployed Procedures

| Procedure | Description |
|---|---|
| `ADD_EDIT_BIRT_DATA` | Insert or update a BIRT report record |
| `GET_BIRT_DATA` | Fetch all BIRT report records |
| `ADD_EDIT_USERS` | Insert or update users (supports batch via JSON array) |
| `GET_USERS` | Fetch all users |
| `GET_USER_BY_ID` | Fetch a single user by ID |
| `GET_MODUES` | Fetch all modules |
| `HELLO_DB` | Test procedure |

---

## Last Deployed

- **Date:** 2026-10-09
- **Deployed by:** sapuzer@gmail.com
- **Files deployed:** 15 (effective 17)
- **Errors:** 0
