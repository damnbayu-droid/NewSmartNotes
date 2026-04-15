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

## 🔑 Environment Variables

Ensure the following variables are set in the Cloudflare Pages Dashboard (**Settings > Functions > Variables**):

*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `NEXT_PUBLIC_APP_URL` (Set to your custom domain or Pages URL)
*   `SERVICE_ROLE_KEY` (Required for admin functions)

## 🏗️ Deployment Troubleshooting

### "Could not find a declaration file for module 'react-signature-canvas'"
- **Fix**: Resolved in v4.4.0 via `types/react-signature-canvas.d.ts` and explicit `tsconfig.json` inclusion.

### "Route segment config not allowed in Proxy file"
- **Fix**: Resolved by migrating from `proxy.ts` back to the standard `middleware.ts` for Cloudflare bridge support.

### "Compatibility Flag Required"
- **Fix**: Ensure `nodejs_compat` is enabled. Without this, the Edge runtime will fail to process certain React 19 / Next.js 16 dependencies.

---
*Created by Antigravity v4.0*
