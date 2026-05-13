# http status

Next.js API server that extracts the media ID for an nhentai gallery URL or gallery ID.

## Deploy to Vercel
```bash
vercel --prod
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, or call the API directly:

```bash
curl "http://localhost:3000/api/status?url=https%3A%2F%2Fsoujpa.in%2Fstart%2F3918588%2F3918588_9.avif"
```

## Plain Node.js server

This repo also includes a dependency-free Node.js server:

```bash
npm run dev:node
```

Example response:

```http
HTTP/2 200 
```

```http
HTTP/2 404 
```

## Vercel

Deploy this repo to Vercel as a normal Next.js project. The Next.js route is serverless-compatible and uses Node's `https.request`:

```text
/api/status?url=https%3A%2F%2Fsoujpa.in%2Fstart%2F3918588%2F3918588_9.avif
```

Example deployed URL:

```text
https://http-status-flax.vercel.app/api/status?url=https%3A%2F%2Fsoujpa.in%2Fstart%2F3918588%2F3918588_9.avif
```

The endpoint caches successful lookups at the Vercel edge for one day.
