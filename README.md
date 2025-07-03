# Dexie/React/TypeScript/Vite App Template

This template provides a minimal setup to get React working w/ Dexie-cloud generically.

While this is a standalone app, it is designed to be used as a template for your own projects.


## Features

- Data browser
- CRUD tables
- Manage users


## Bootstrap Database

- `npx dexie-cloud create`
- `npx dexie-cloud whitelist http://localhost:3000`
- At this point, you should have `dexie-cloud.json` and `dexie-cloud.key` files in your project root.
- Copy these files into the `public/` directory so the app can load them at runtime.
- Create `roles.json`
- `npx dexie-cloud import roles.json`


## Cruft

Pragmatically, most of this app is cruft- beyond the basic CRUD functionality, it is mostly optional.