# Dexie/React/TypeScript/Vite App Template

This template provides a minimal setup to get React working w/ Dexie-cloud generically.

While this is a standalone app, it is designed to be used as a template for your own projects.


## Features

- Data browser
- CRUD tables
- Manage users


## Bootstrap Database

- `npx dexie-cloud create`
- This generates `dexie-cloud.json` and `dexie-cloud.key`. Place them next to `index.html` so they are served from the web root.
- `npx dexie-cloud whitelist http://localhost:3000`
- Create `roles.json`
- `npx dexie-cloud import roles.json`


## Provide Schema

Administrators need to supply the application with a description of the tables
and their primary keys. The easiest way is to export the database schema using
the Dexie Cloud CLI:

- `npx dexie-cloud export --json > public/export.json`

The generated `export.json` file contains a top-level `schema` object mapping
each table to its primary key specification. Place this file in the `public`
folder and restart the app. The schema drives the generic data grids for all
tables except **Users**, **Realms**, and **Roles**.


## Cruft

Pragmatically, most of this app is cruft—beyond the basic CRUD functionality, it is mostly optional.
