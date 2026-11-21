# LOOP X — Flagship 3D Website

> **Strategy · Creative · Growth**  
> *Where ideas enter the loop. ∞ And come out bigger.*

A high-end, cinematic, scroll-driven 3D web experience built with Three.js, procedural Web Audio, and precision typography.

---

## 🚀 Quick Start (Local)

### 1. View Instantly (No Setup Required)
Double-click `standalone.html` or `index.html` in your browser.

### 2. Run Local Development Server
```bash
# Start the local server
npm start
```
Then visit: **[http://localhost:3000](http://localhost:3000)**

### 3. Build Production Bundle
```bash
npm run build
```

---

## 🌐 How to Deploy to Your Own Domain (e.g. `loopx.world`)

Because this project is a high-performance static web application, you can host it for **free** with global CDN caching and free SSL.

### Option A: Deploy to Vercel (Recommended)
1. Install Vercel CLI (or use the web dashboard at [vercel.com](https://vercel.com)):
   ```bash
   npx vercel
   ```
2. Follow the 2-step prompt to deploy.
3. Go to **Project Settings → Domains** and add `loopx.world`.
4. Point your DNS records (A/CNAME) to Vercel.

### Option B: Deploy to Netlify
1. Drag and drop the `loop-x-hero` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
2. Go to **Domain Management → Custom Domains** and connect `loopx.world`.

### Option C: Deploy to GitHub Pages
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: launch LOOP X website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/loop-x.git
   git push -u origin main
   ```
2. In GitHub repository **Settings → Pages**, select `main` branch.
3. Add your custom domain `loopx.world`.

---

## 📁 Project Structure

```
loop-x-hero/
├── index.html            # Main scroll-driven editorial page
├── standalone.html       # 100% self-contained single-file version (works offline)
├── styles.css            # Luxury obsidian aesthetic, glassmorphism & typography
├── server.js             # Zero-dependency local Node server
├── package.json          # Dependencies & build scripts (esbuild, three)
├── js/
│   ├── main.js           # Three.js engine & scroll synchronization
│   ├── loop-geometry.js  # 3D Lemniscate architecture & particle systems
│   └── audio.js          # Procedural Web Audio synthesizer engine
└── dist/
    └── app.bundle.js     # Optimized production distribution bundle
```
