# foodLendar 🍽️

Static, responsive, PWA (installable, works offline) website that displays your
weekly meal menu from a JSON file.

## Project structure

```
foodLendar/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── data/
│   │   └── menu.json        ← EDIT YOUR MENU HERE
│   └── icons/                  PWA icons (already generated)
├── src/
│   ├── main.js                 loads the JSON and renders the menu
│   └── style.css
└── .github/workflows/deploy.yml   automatic deployment to GitHub Pages
```

## 1. Local development

You need [Node.js](https://nodejs.org) 18 or higher.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build      # builds the production version into dist/
npm run preview    # serves that production build locally, to test it
```

## 2. Edit your menu

Edit `public/data/menu.json`. Format:

```json
{
  "week": "Week of June 22-28, 2026",
  "days": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": "Toast with tomato",
        "lunch": "Stewed lentils",
        "dinner": "French omelette"
      }
    }
  ]
}
```

- You can omit `breakfast`, `lunch`, or `dinner` on any day if it doesn't apply; that
  row simply won't be shown.
- The day that matches today's date is highlighted automatically on the site (no need
  to flag it yourself).
- You don't need to touch any code to update the menu: just this JSON file.

## 3. Push to GitHub and deploy with GitHub Actions

1. Create a new repository on GitHub (it can be named whatever you like, for example
   `foodLendar`).
2. Push this project:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: weekly menu"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages** and under "Build and deployment → Source"
   choose **GitHub Actions** (instead of "Deploy from a branch").
4. Done. The `.github/workflows/deploy.yml` workflow will run automatically on every
   `push` to `main`: it installs dependencies, builds the site, and publishes it to
   GitHub Pages. You'll see the public URL (`https://YOUR_USERNAME.github.io/YOUR_REPO/`)
   in the **Actions** tab, inside the `deploy` job, or under Settings → Pages once it
   finishes.

From here on, every time you edit `menu.json` (or any other file) and `git push`, the
site rebuilds and republishes itself, no manual steps needed.

> You don't need to touch `base` in `vite.config.js`: it's set as a relative path
> (`'./'`), so it works the same no matter what your repository is named.

## 4. About the PWA

- The `manifest.webmanifest` and the Service Worker are generated automatically by
  [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) on every build.
- The menu (`menu.json`) gets cached, so the site keeps showing the last loaded menu
  even without a connection.
- To "install" the site: on Chrome/Edge desktop, use the install icon in the address
  bar; on Android, "Add to Home screen"; on iOS Safari, Share → "Add to Home Screen".
- The icons (`public/icons/`) are already generated in the required sizes (192, 512,
  and 512 maskable). If you want to replace them with your own design, swap those PNGs
  while keeping the same filenames and sizes.
