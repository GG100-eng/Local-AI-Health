# Local AI Health Companion

A privacy-first health companion prototype. The main web app is in `artifacts/health-companion`; the repository also includes the surrounding Replit workspace packages and prototypes.

## Run locally

Requires Node.js 24 and pnpm.

```sh
pnpm install
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/health-companion run dev
```

Build the app with:

```sh
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/health-companion run build
```

The app uses browser-side model inference and stores journal/chat data locally in the browser. Model files are downloaded from Hugging Face when needed. This is an experimental prototype, not medical advice or a substitute for professional care; contact local emergency services for urgent symptoms.
