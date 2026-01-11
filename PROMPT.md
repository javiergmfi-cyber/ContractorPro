# ContractorPro - Voice-First Invoicing App

## OBJECTIVE
Build a complete "Voice-First" invoicing app for contractors (iOS/Android).
Core Philosophy: "Apple-like Simplicity." One thumb interaction. Zero friction.

## COMPLETION CRITERIA
When ALL of these are true, output: <promise>CONTRACTORPRO COMPLETE</promise>
- [ ] App runs with `npx expo start` without errors
- [ ] NativeWind styles render correctly
- [ ] VoiceButton records audio on press-hold
- [ ] AI service mocks return structured invoice JSON
- [ ] Dashboard shows revenue card + VoiceButton
- [ ] Profile screen saves business info
- [ ] Invoice preview screen displays parsed data
- [ ] Tab navigation works (Dashboard, Invoices, Profile)

## CURRENT STATE CHECK
Before each iteration:
1. Run `npx expo start --no-dev` to verify build
2. Check for TypeScript errors
3. Review what files exist vs what's needed
4. Pick the NEXT incomplete task

## STRICT TECH STACK (DO NOT DEVIATE)
- Framework: React Native (Expo SDK 52+) with Expo Router
- Language: TypeScript (strict)
- Styling: NativeWind v4 (TailwindCSS)
- Icons: lucide-react-native
- Backend/Auth: Supabase (PostgreSQL)
- AI Logic: OpenAI API (gpt-4o-mini) - MOCK FOR NOW
- Voice-to-Text: OpenAI Whisper API - MOCK FOR NOW
- State Management: Zustand
- Audio: expo-av

## DESIGN SYSTEM
```
Background: #FFFFFF (Light) / #000000 (Dark OLED)
Primary: #00D632 (Electric Green - Action/Money)
Alert: #FF9500 (Orange - Unpaid/Warning)
Typography: System Default (San Francisco)
Layout: "Invisible UI" - Massive whitespace, no borders
Haptics: expo-haptics on all major interactions
```

## DIRECTORY STRUCTURE (CREATE EXACTLY THIS)
```
ContractorPro/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Dashboard
│   │   ├── invoices.tsx
│   │   └── profile.tsx
│   ├── invoice/
│   │   ├── [id].tsx
│   │   └── preview.tsx
│   └── +not-found.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── VoiceButton.tsx
│   ├── RecordingOverlay.tsx
│   ├── InvoiceCard.tsx
│   ├── LogoUploader.tsx
│   └── MonogramAvatar.tsx
├── services/
│   ├── ai.ts
│   ├── supabase.ts
│   └── audio.ts
├── store/
│   ├── useInvoiceStore.ts
│   └── useProfileStore.ts
├── lib/
│   ├── constants.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── global.css
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
└── .env.example
```

## PHASE EXECUTION ORDER

### PHASE 1: Setup (DO FIRST)
1. Initialize Expo: `npx create-expo-app@latest . --template blank-typescript`
2. Install Expo Router: `npx expo install expo-router expo-linking expo-constants`
3. Update package.json: `"main": "expo-router/entry"`
4. Install NativeWind v4:
   ```bash
   npm install nativewind tailwindcss
   npx tailwindcss init
   ```
5. Configure tailwind.config.js:
   ```js
   module.exports = {
     content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
     presets: [require("nativewind/preset")],
     theme: {
       extend: {
         colors: {
           primary: "#00D632",
           alert: "#FF9500",
         },
       },
     },
     plugins: [],
   };
   ```
6. Configure babel.config.js:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: [
         ["babel-preset-expo", { jsxImportSource: "nativewind" }],
         "nativewind/babel",
       ],
     };
   };
   ```
7. Configure metro.config.js:
   ```js
   const { getDefaultConfig } = require("expo/metro-config");
   const { withNativeWind } = require("nativewind/metro");
   const config = getDefaultConfig(__dirname);
   module.exports = withNativeWind(config, { input: "./global.css" });
   ```
8. Create global.css:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
9. Install dependencies:
   ```bash
   npx expo install expo-av expo-haptics expo-contacts expo-location expo-image-picker expo-print expo-sharing expo-font react-native-safe-area-context react-native-screens
   npm install zustand lucide-react-native @supabase/supabase-js
   ```
10. Create .env.example with placeholders

### PHASE 2: Core Components
1. Create types/index.ts with Invoice, Profile, Client types
2. Create lib/constants.ts with colors
3. Create lib/utils.ts with formatCurrency
4. Build VoiceButton.tsx:
   - 80x80 circular FAB
   - Electric Green background
   - Mic icon (lucide)
   - onPressIn/onPressOut handlers
   - Haptic feedback
   - Animated scale
5. Build components/ui/*.tsx

### PHASE 3: Screens
1. Create app/_layout.tsx (root with providers, import global.css)
2. Create app/(tabs)/_layout.tsx (tab navigator)
3. Create app/(tabs)/index.tsx (Dashboard with revenue card + VoiceButton)
4. Create app/(tabs)/invoices.tsx (list view)
5. Create app/(tabs)/profile.tsx (business info form)
6. Create app/invoice/preview.tsx

### PHASE 4: Services (MOCK)
1. Create services/ai.ts:
   ```typescript
   export async function transcribeAudio(uri: string): Promise<string> {
     // MOCK: Return dummy transcript
     return "Invoice for John Smith. Lawn mowing service, one hundred fifty dollars.";
   }

   export async function parseInvoice(transcript: string): Promise<ParsedInvoice> {
     // MOCK: Return structured data
     return {
       clientName: "John Smith",
       items: [{ description: "Lawn mowing service", price: 150 }],
       detectedLanguage: "en",
     };
   }
   ```
2. Create services/audio.ts for expo-av recording
3. Create store/useInvoiceStore.ts
4. Create store/useProfileStore.ts

### PHASE 5: Integration
1. Wire VoiceButton to audio recording
2. Connect recording flow to AI service mocks
3. Navigate to preview screen with parsed data
4. Ensure all tabs work

## GOTCHAS TO CHECK
- NativeWind: Must import global.css in root _layout.tsx
- SafeArea: Use SafeAreaView from react-native-safe-area-context
- expo-av: Request permissions before recording
- Haptics: Import from expo-haptics, not native
- Tab icons: Use lucide-react-native

## BUSINESS RULES
- Invoice numbers: Auto-increment INV-0001, INV-0002
- Tax: Optional rate in profile (default 0)
- Currency: USD only, format $1,234.56

## ITERATION STRATEGY
Each loop:
1. Check what exists
2. Find first incomplete item
3. Implement it fully
4. Test with `npx expo start`
5. Fix any errors
6. If all complete → output promise tag
