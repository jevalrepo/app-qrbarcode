# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run android        # compile + launch on Android device/emulator (full native build)
npm run ios            # compile + launch on iOS simulator
npm run start          # JS bundler only (no native recompile — use after npm run android)
npm run web            # run on browser
```

Any change to native modules (new npm package with native code) requires `npm run android`, not just `npm run start`.

## Stack

- **Expo SDK 54** with `expo-router` (file-based routing, typed routes enabled)
- **NativeWind v4** — Tailwind CSS for React Native. Both `className` and inline `style` are used; prefer `style` for dynamic/theme-dependent values
- **TypeScript** throughout
- Android package / iOS bundle ID: `com.qrclean.app`

## Architecture

### Routing (`app/`)
File-based routing via expo-router:
- `app/_layout.tsx` — root layout: wraps everything in `SettingsProvider`, initializes ads (`initializeAds`) and RevenueCat (`useRevenueCat`)
- `app/(tabs)/` — bottom tab navigator: `index`, `history`, `generate`, `settings`
- `app/scanner.tsx` — full-screen modal (camera)
- `app/result.tsx` — slide-up modal showing scan result + actions
- `app/help.tsx`, `app/privacy.tsx` — slide-up modals

### Global State (`context/SettingsContext.tsx`)
Single context persisted to AsyncStorage under key `qrclean_settings`. Exposes:
- `settings` — `{ theme, autoOpenUrls, haptics, language, accentColor, isPro }`
- `updateSettings(partial)` — merges + persists
- `useThemeScheme()`, `useAccent()`, `useT()` — convenience hooks

`isPro` is the source of truth for all feature gating. It is set by RevenueCat on startup via `useRevenueCat` and overrides any locally stored value.

### History Hooks (`hooks/`)
Two parallel hooks with identical shape:
- `useHistory` — AsyncStorage key `qrclean_history`, max 10 items
- `useGenerationHistory` — AsyncStorage key `qrclean_generations`, max 10 items

`GenerationItem` intentionally uses `scannedAt` (not `generatedAt`) so it can be cast to `HistoryItem` and rendered by `ScanResultCard` without changes.

Both hooks expose a `reload()` function. The History screen calls both on focus via `useFocusEffect` to sync state across hook instances (hooks do not share state between screens — only AsyncStorage is shared).

`clearHistory` / `clearGenerationHistory` preserve favorited items.

### QR Type System (`lib/detectType.ts`)
`detectType(data)` regex-classifies scanned strings into `QRType`. `getTypeColor` returns `accent` for URLs so it follows the user's theme color. All type metadata (labels, icons, colors) lives here.

### Monetization

**Ads (`lib/ads.ts`, `lib/initAds.ts`, `components/BannerAdView.tsx`)**
- `USE_PRODUCTION_ADS = false` in `lib/ads.ts` — flip to `true` before Play Store release
- `BannerAdView` returns `null` if `settings.isPro` is true (no ads for PRO users)
- Interstitial ad logic in `lib/useInterstitialAd.ts`; `.web.ts` files are platform stubs

**Scan gate (`lib/scanGate.ts`)**
- Free users: 5 scans/day, resets at midnight, stored under `@scan_gate`
- `scanner.tsx` skips gate entirely when `settings.isPro` is true
- Debug: home screen has a button to simulate the limit (`@scan_gate` count = 5)

**RevenueCat (`hooks/useRevenueCat.ts`, `lib/revenueCat.ts`)**
- Entitlement ID: `QR & BARCODE SCANNER Pro`
- Android API key: `test_KxtxUkNtJOfrnDvsRlpSdTrmlpv` (test key — replace for production)
- iOS API key: set `REPLACE_IOS_KEY_HERE` in `hooks/useRevenueCat.ts`
- `useRevenueCat()` is called once in `RootNavigator` (inside `SettingsProvider`)
- `lib/revenueCat.ts` exports `presentPaywall()`, `restorePurchases()`, `presentCustomerCenter()`

### Internationalization (`lib/i18n.ts`)
Two locales: `es` (default) and `en`. `en` is typed as `typeof es` — adding a key to `es` requires adding it to `en` or TypeScript will error. Use `useT()` to access translations.

### Debug Buttons (Home screen)
`app/(tabs)/index.tsx` contains two temporary debug buttons — simulate scan limit and toggle `isPro`. Remove before production release.

## Key Patterns

**Platform-specific files:** `.web.ts` suffix for web stubs (e.g. `initAds.web.ts`, `useInterstitialAd.web.ts`, `BannerAdView.web.tsx`). Metro picks these automatically on web builds.

**Native module guards:** Modules like `react-native-google-mobile-ads` and `react-native-purchases` are guarded with `TurboModuleRegistry.get(...)` checks or try/catch before `require()` to avoid crashes when native layer isn't compiled yet.

**Theme colors:** `isDark ? '#0A0A0A' : '#FFFFFF'` pattern is used consistently. Never hardcode colors without a dark/light pair.

