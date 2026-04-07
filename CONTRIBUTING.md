# Contributing to RSS Reader

First off, thank you for considering contributing to the Modern RSS Reader! It's people like you that make the open source community such a fantastic place to learn, inspire, and create.

## Getting Started

1. Fork the repo and create your branch from `main`.
2. Run `npm install` to install dependencies.
3. If you've modified the schema or need database setup, use `npx drizzle-kit push:sqlite`.
4. Ensure your code passes the linting checks (`npm run lint`).
5. Run the tests to ensure nothing was broken (`npm run test`).

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4. Once your tests pass, open your detailed Pull Request.

## Coding Standards

- We use **Prettier** for code formatting. Please run `npm run format` prior to opening your PR.
- We strictly rely on **TypeScript**. Try avoiding explicit `any` bounds whenever possible.
- Avoid bulky third-party dependencies unless strictly required. 

Thank you for contributing!
