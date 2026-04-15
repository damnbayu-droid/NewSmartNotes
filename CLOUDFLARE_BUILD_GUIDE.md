# Cloudflare Pages Build Guide (v4.4.0)

This guide contains the exact settings required to deploy the **Hardened Smart Notes Intelligence Suite** to Cloudflare Pages.

## 🛠️ Build Configuration

| Setting | Value |
|:---|:---|
| **Build Command** | `npm run build` (standard) or `npx @cloudflare/next-on-pages@1` (legacy) |
| **Build Output Directory** | `.vercel/output/static` |
| **Root Directory** | `/next-app` |
| **Compatibility Date** | `2024-04-01` (or newer) |
| **Compatibility Flags** | `nodejs_compat` |

## 🏗️ Architecture
- **Framework**: Next.js 16.2.3 (Turbopack)
- **Runtime**: Edge (Cloudflare Verified)
- **Rendering**: Dynamic (Forced for Dashboard/Login)

## 🔑 Environment Variables & Secrets

### 1. Build Phase (Optional but Recommended)
For static generation features, you can add variables to your `wrangler.toml` or the Cloudflare Dashboard under **Settings > Build & Deploy > Environment Variables**.

### 2. Runtime Phase (CRITICAL)
Your Supabase client requires secrets to function live. You MUST set these in the Cloudflare Dashboard:
1.  Go to **Workers & Pages** > Your Project.
2.  Navigate to **Settings > Functions**.
3.  Scroll to **Environment Variables (Production)**.
4.  Add:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SERVICE_ROLE_KEY`
5.  **Re-deploy** to apply the secrets.

## 🏗️ Deployment Troubleshooting

### "Could not find a declaration file for module 'react-signature-canvas'"
- **Fix**: Resolved in v4.4.0 via `types/react-signature-canvas.d.ts` and explicit `tsconfig.json` inclusion.

### "Route segment config not allowed in Proxy file"
- **Fix**: Resolved by migrating from `proxy.ts` back to the standard `middleware.ts` for Cloudflare bridge support.

### "Compatibility Flag Required"
- **Fix**: Ensure `nodejs_compat` is enabled. Without this, the Edge runtime will fail to process certain React 19 / Next.js 16 dependencies.

---
*Created by Antigravity v4.0*
