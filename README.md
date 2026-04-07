<div align="center">
  <img src="src/logo.svg" alt="RSS Reader Logo" width="150" height="150" />

  [![Build Status](https://img.shields.io/github/actions/workflow/status/kotaashareddy/Rss/build.yml?branch=main&style=flat-square)](https://github.com/kotaashareddy/Rss/actions)
  [![Version](https://img.shields.io/github/package-json/v/kotaashareddy/Rss?style=flat-square)](https://github.com/kotaashareddy/Rss/releases)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Contributors](https://img.shields.io/github/contributors/kotaashareddy/Rss?style=flat-square)](https://github.com/kotaashareddy/Rss/graphs/contributors)
  [![Stars](https://img.shields.io/github/stars/kotaashareddy/Rss?style=flat-square)](https://github.com/kotaashareddy/Rss/stargazers)

  # Modern RSS Reader
  *A local-first, self-hostable feed aggregator built with React 19 and SQLite — no cloud, no tracking, just reading.*
</div>

---

## 🚀 Quick Start

Get up and running in a single command (requires Node.js & Git):
```bash
git clone https://github.com/kotaashareddy/Rss.git && cd Rss && npm install && npm run dev
```

---

## 📑 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔍 Overview / About](#-overview--about)
- [🤔 Why This Project?](#-why-this-project)
- [✨ Features](#-features)
- [📸 Screenshots / Demo](#-screenshots--demo)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🌍 Deployment & Self-Hosting](#-deployment--self-hosting)
- [🚀 Usage](#-usage)
- [🗂️ Project Structure](#️-project-structure)
- [🔧 Configuration](#-configuration)
- [🧪 Running Tests](#-running-tests)
- [🤝 Contributing](#-contributing)
- [📜 Code of Conduct](#-code-of-conduct)
- [🗺️ Roadmap](#️-roadmap)
- [❓ FAQ](#-faq)
- [👥 Contributors / Authors](#-contributors--authors)
- [🙏 Acknowledgements](#-acknowledgements)
- [📄 License](#-license)

---

## 🔍 Overview / About

Modern RSS Reader is a local-first, self-hostable feed aggregator built with React 19 and SQLite — no cloud, no tracking, just reading. It strips away heavy interfaces, employing a modern approach to RSS parsing and storage to deliver a streamlined reading experience right in your browser. With complete control over feeds, folders, and synchronization, you ensure no critical piece of information ever slips through the cracks. 

## 🤔 Why This Project?

Unlike Miniflux (which requires a Postgres server and Go environment checkout) or Feedly (which is proprietary and cloud-based), **Modern RSS Reader** acts as a completely self-contained local SQLite application. Everything from the frontend UI to the Nitro backend syncing runs seamlessly from a single Node.js script. 
- **Privacy First**: All data is stored in the local `sqlite.db` database. No telemetry, no external accounts.
- **Modern UI**: Designed aggressively minimal to eliminate visual noise. Dark/Light mode out of the gate.
- **Portability**: Want to host it on a Raspberry Pi? Just build the Docker image or run the `.output/server/index.mjs` backend.

## ✨ Features

- **Folder & Feed Management**: Subscribe to RSS feeds easily and categorize them into nested folders.
- **Distraction-Free UI**: Minimalist reading interface featuring customized article cards and an ash-colored date filtering dropdown.
- **Favorites & Offline Support**: Mark your favorite posts effortlessly and revisit them locally.
- **Collapsible Sidebar**: A smooth state-aware navigation panel that can hide down to a 4rem icon-only setup.
- **SQLite Supercharged Backend**: High-performance better-sqlite3 local database with Drizzle ORM mapping. 
- **Light/Dark Mode**: Built-in dynamic next-themes usage for strain-free reading.

## 📸 Screenshots / Demo

*(Add a GIF or link to a demo interface here)*
![App Demo Placeholder](https://via.placeholder.com/800x450?text=Application+Screenshot)

## 🛠️ Tech Stack

- **Client**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand
- **Routing**: @tanstack/react-router & react-start
- **Server/Backend**: Nitro, @tanstack/react-router-ssr, better-sqlite3, Drizzle ORM
- **UI Components**: Shadcn UI, Radix/Base UI, Lucide React

## 📋 Prerequisites

Before you set up this project locally, ensure you have the following installed:

- **Node.js** (v20+ recommended)
- **npm** (v9+) or **pnpm**
- **Git**

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kotaashareddy/Rss.git
   cd Rss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   If you have a `.env.example`, copy it to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   Push the Drizzle ORM schemas into your SQLite store to automatically create your local `sqlite.db`:
   ```bash
   npx drizzle-kit push:sqlite
   ```

5. **Launch development server**
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:3000`.

## 🌍 Deployment & Self-Hosting

You can easily package and run the reader entirely locally or on a VPS (like a DigitalOcean droplet, Raspberry Pi, or Railway).

**Building for Production:**
1. Generate the optimized build outputs:
   ```bash
   npm run build
   ```
2. The bundled frontend and backend will be output to your `.output/` or `dist/` project folder depending on the Vite setup.
3. Start the production server:
   ```bash
   npm run start
   ```

You can use a process manager like **PM2** to keep it running permanently, or bundle the repository in a standard Node.js Docker container. 

## 🚀 Usage

Using the reader is simple:

1. Look to the sidebar and click on the **"+" Add Feed** icon.
2. Enter the valid `.xml` or endpoint URL of the blog/news service you wish to follow.
3. Once synced, you can drag and drop your feed into a generated Folder for simple categorization.
4. Filter posts by `Today` or `All Time` on the top bar to refine exactly what you read.

<details>
  <summary>View programmatic usage examples</summary>

  Adding a feed programmatically over the Nitro backend:
  ```typescript
  await axios.post('/api/feed/subscribe', {
    url: 'https://news.ycombinator.com/rss'
  });
  ```
</details>

## 🗂️ Project Structure

<details>
<summary>Click to expand folder tree</summary>

```text
rss/
├── src/
│   ├── components/       # Reusable React & Shadcn UI components
│   ├── db/               # SQLite and Drizzle schema configuration
│   ├── hooks/            # Custom React hooks (fetch, toggle, state)
│   ├── lib/              # Utility functions and type definitions
│   ├── routes/           # TanStack file-based routing components
│   ├── server/           # Nitro middleware and API endpoints
│   ├── store/            # Zustand global stores (e.g. Navigation)
│   ├── router.tsx        # Base application router configs
│   ├── logo.svg          # Primary vector branding logo
│   └── styles.css        # Tailwind core directives
├── public/               # Static assets
├── package.json          # Node dependencies & CLI scripts
└── vite.config.ts        # Vite + TanStack Plugin configurations
```
</details>

## 🔧 Configuration

The application uses standard `dotenv` configuration. You can copy the contents of `.env.example` into a local `.env` file to customize:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Local dev server running port | `3000` |
| `DB_URL` | Local SQLite file path | `sqlite.db` |
| `VITE_API_URL` | Nitro SSR API endpoints | `/api` |


## 🧪 Running Tests

This open-source repo leverages `vitest`. To run all unit and integration checks:

```bash
npm run test
```

For linting and strict type verifying:
```bash
npm run lint
npm run typecheck
```

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please review our [CONTRIBUTING.md](./CONTRIBUTING.md) for full coding standards.

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please read our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details on our code of conduct, and the process for reporting unacceptable behavior.

## 🗺️ Roadmap

- [ ] Add RSS full-text extraction support using Readability.js
- [ ] Implement OPML import/export features
- [ ] Connect with third-party RSS providers (Feedly, Inoreader via OAuth)
- [ ] Build a Progressive Web App (PWA) manifest for standalone installations.

See the [open issues](https://github.com/kotaashareddy/Rss/issues) for a full list of proposed features (and known issues).

## ❓ FAQ

**Q: Can I access my feeds directly via phone?**
A: Since this operates using a local SQLite database locally hosted, you can deploy the server to services like Vercel or Railway and access the web UI from your mobile browser flawlessly.

**Q: Does this work without internet?**
A: All previously fetched articles are stored safely within the SQLite database. You can read, organize, and favorite saved content totally offline. Attempting to fetch new updates from feeds will require network access.

**Q: Can I sync across devices?**
A: Because instances read from exactly one `sqlite.db` file, standard local setups aren't synchronized. If you deploy it to a single external host however (like a DigitalOcean Droplet), all connected devices logging into that web server share the exact same feeds, state, and favorites natively!

**Q: What RSS formats are supported?**
A: Thanks to `rss-parser`, we seamlessly support standard RSS 2.0, Atom feeds, and generic XML web feeds out-of-the-box. 

**Q: Why doesn't an RSS feed update properly?**
A: Some feeds have intensive rate limits. Ensure the Nitro server syncing middleware isn't requesting new queries more than 5 times a minute. 

## 👥 Contributors / Authors

<a href="https://github.com/kotaashareddy/Rss/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kotaashareddy/Rss" alt="Contributors" />
</a>

## 🙏 Acknowledgements

* [TanStack Router & Start](https://tanstack.com/router)
* [Shadcn UI](https://ui.shadcn.com)
* [Drizzle ORM](https://orm.drizzle.team)
* [RSS Parser By bobby-brennan](https://github.com/rbren/rss-parser)
* [Vite](https://vitejs.dev)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

> ⭐ Star this repo if you find it useful!
