<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Capacitor Build
- `npm run cap:build` — builds Next.js and syncs native projects
- `npm run cap:open:ios` — opens Xcode project
- `npm run cap:open:android` — opens Android Studio project
- `npm run cap:sync` — syncs web assets to native projects

The app loads the Vercel-deployed URL in a WebView. To update the native app after website changes:
1. Run `npm run cap:build`
2. Open the platform project (`npm run cap:open:ios` / `npm run cap:open:android`)
3. Build and submit from Xcode / Android Studio

To generate icons from a new logo:
```
npx capacitor-assets generate --iconBackgroundColor "#000000" --splashBackgroundColor "#000000"
```
