# LOOP X — Flagship 3D Website

> **Strategy · Creative · Growth**  
> *Where ideas enter the loop. ∞ And come out bigger.*

A high-end, cinematic, scroll-driven 3D web experience built with Three.js, procedural Web Audio, and precision editorial typography.

---

## 🚀 Quick Start (Local)

### 1. Run Local Development Server
```bash
# Start the local HTTP server
npm start
```
Then visit: **[http://localhost:3000](http://localhost:3000)**

### 2. Build Production Bundle
```bash
npm run build
```

---

## 🌐 How to Host on Cloudflare Pages or GitHub Pages

This project is fully static and pre-bundled. It requires zero server runtime and can be hosted for **free** on any edge CDN with SSL and global caching.

### 🌟 Option 1: Cloudflare Pages (Recommended - Ultra Fast)

#### Method A: Direct Upload (Drag & Drop — No Git required)
1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**.
2. Name your project (e.g. `loop-x`).
3. Drag and drop this `loop-x` folder (or upload it).
4. Click **Deploy site**. Your website is live worldwide instantly!

#### Method B: Connect via GitHub
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: production ready for cloudflare and github pages"
   git push origin main
   ```
2. In Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `.`
5. Click **Save and Deploy**. Cloudflare will auto-deploy on every push!

---

### 🐙 Option 2: GitHub Pages

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: production ready for github pages"
   git push -u origin main
   ```
2. Go to your repository on GitHub → **Settings** → **Pages**.
3. Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
4. In ~60 seconds, your site is published at `https://YOUR_USERNAME.github.io/loop-x/`.

---

## 📁 Clean Production Structure

```
loop-x/
├── index.html            # Main scroll-driven 3D editorial page
├── styles.css            # Obsidian aesthetic, glassmorphism & typography
├── dist/
│   ├── app.bundle.js     # Production compiled JavaScript bundle
│   └── app.bundle.js.map # Source map
├── assets/
│   └── loopx-favicon.png # Brand favicon & social share asset
├── js/
│   ├── main.js           # Three.js engine & scroll synchronization
│   ├── loop-geometry.js  # 3D Lemniscate geometry & particle systems
│   └── audio.js          # Procedural Web Audio synthesizer engine
├── _headers              # Cloudflare Pages security & performance caching rules
├── .nojekyll             # GitHub Pages static serving bypass
├── server.js             # Zero-dependency local Node server
└── package.json          # Dependencies & build scripts (esbuild, three)
```
