---
name: FoodHub
description: Warm, premium bilingual food-delivery interface — the late-night brasserie, online.
colors:
  primary: "#D4700A"
  primary-foreground: "#FFFFFF"
  background: "#FAF8F5"
  foreground: "#1C1410"
  card: "#FEFDFB"
  muted: "#ECE9E4"
  muted-foreground: "#837267"
  accent: "#FAEEE1"
  accent-foreground: "#9A5208"
  border: "#E4DED8"
  destructive: "#E5484D"
  offer-spice: "#2A1810"
  offer-forest: "#0D231A"
  offer-ink: "#191B2A"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "opsz 144"
  display-ar:
    fontFamily: "Cairo, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "0"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    fontVariation: "opsz 72"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "opsz 36"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.2em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "40px"
  xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "12px 36px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  meal-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "16px"
  category-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  category-pill-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
---

# Design System: FoodHub

## 1. Overview

**Creative North Star: "The Late-Night Brasserie"**

FoodHub is a brasserie that happens to live on the web: warm amber light spilling across dark wood, white linen, the quiet confidence of a place that knows its food is good and doesn't need to shout. The interface is appetite-first — food imagery is the loudest element on any screen, and the UI is the frame around the plate, never the plate itself. Warmth comes from a single saffron-amber accent and a serif display voice, not from a flood of color or a wall of discount banners.

This system explicitly rejects four neighbours. It is **not Talabat/DoorDash** — no utility-orange chrome, no crowded grid, no aggressive percent-off banners screaming for the tap. It is **not generic SaaS** — no cold sans-serif everywhere, no dark-mode-first developer aesthetic, no rounded-rectangle sameness. It is **not a fast-food chain site** — no loud red/yellow, no clip-art food, no promotional noise. And above all it is **not a default shadcn starter** — the cold navy `222 47% 11%` primary and pure-white body that ship with the template have been burned out entirely and replaced with a warm amber identity that could not be mistaken for a side project.

The result reads as premium without pretension: high-end, but never exclusionary or intimidating. Generous white space carries calm; the food carries desire; one disciplined amber carries the brand.

**Key Characteristics:**
- Appetite-first: imagery dominates, UI recedes
- One warm accent (saffron-amber), used with restraint
- Serif display voice (Fraunces) against a clean geometric body (DM Sans)
- Bilingual as a first-class concern: Cairo replaces the serif in Arabic, no italic synthesis
- Flat at rest, lift on interaction
- Confident and rounded: pill CTAs, 16px cards

## 2. Colors

A warm, appetite-stimulating palette built on a single saffron-amber accent over warm ivory and espresso neutrals. The HSL custom properties in `globals.css` are the runtime source of truth; the hex values below are their sRGB documentation snapshot.

### Primary
- **Saffron Amber** (`#D4700A`, `hsl(29 91% 44%)`): The entire brand identity in one color. It appears on primary CTAs, the active category pill, product prices, the logo wordmark, focus rings, and the eyebrow rule. Used deliberately and sparingly — never as a background flood.

### Neutral
- **Warm Ivory** (`#FAF8F5`, `hsl(40 30% 97%)`): The body background. Slightly warm, never pure white, never the cream/sand AI default — it's an off-white pulled a hair toward the brand's own warmth.
- **Espresso Ink** (`#1C1410`, `hsl(25 30% 9%)`): Primary text. A warm near-black with a brown undertone, not a cold `#000`.
- **Linen Surface** (`#FEFDFB` / card, `#ECE9E4` / muted): Card backgrounds sit a touch brighter than the body; muted linen carries section bands and skeleton bases.
- **Clay Muted** (`#837267`, `hsl(22 12% 46%)`): Secondary text and captions. Verified ≥4.5:1 on ivory — warm, but never washed out.
- **Warm Border** (`#E4DED8`, `hsl(33 18% 87%)`): Hairline borders and dividers. A warm gray, never a cold `#E5E7EB`.
- **Amber Tint** (`#FAEEE1` accent / `#9A5208` accent-foreground): Soft amber wash behind feature icons and hover states; the deep amber-foreground keeps text on the tint at AA.

### Tertiary (Offer surfaces only)
- **Spice** (`#2A1810`), **Forest** (`#0D231A`), **Ink** (`#191B2A`): Three deep, near-black earth tones for the three special-offer cards. Each carries its own muted accent glow (warm gold, herb green, soft indigo) at low opacity. These replaced three clashing neon gradients — they are dark and cohesive, not loud.

### Named Rules
**The One Amber Rule.** Saffron Amber appears on ≤10% of any screen's surface area. Its rarity is what makes it read as premium. The moment two amber blocks compete, the brand cheapens — pull one back to neutral.

**The No-Cold-Neutral Rule.** Every gray in the system is warm (hue 22–40). A cold `#E5E7EB` border or a pure `#000` heading is forbidden; it breaks the brasserie warmth instantly.

## 3. Typography

**Display Font:** Fraunces (variable optical-size serif, with Georgia / serif fallback)
**Body Font:** DM Sans (geometric sans, with system-ui fallback)
**Arabic Font:** Cairo (covers Arabic + Latin, with system-ui fallback)

**Character:** A contrast pairing, not a matched set — a dramatic optical-size serif against a clean geometric sans. At large optical sizes Fraunces grows bracketed, high-contrast serifs that read like a food-magazine masthead; DM Sans keeps the UI quiet and legible underneath. The two never compete because they sit on opposite sides of the serif/sans axis.

### Hierarchy
- **Display** (Fraunces 700 italic, `opsz 144`, clamp 3rem→4.5rem, line-height 1.1, tracking -0.02em): Hero headline only. The single most characteristic element on the site.
- **Headline** (Fraunces 700, `opsz 72`, clamp 1.875rem→2.25rem): Section titles ("Popular Meals", "Browse Categories").
- **Title** (Fraunces 700, `opsz 36`, 1.25rem): Card-level headings, the logo wordmark, stat values, empty/error-state titles.
- **Body** (DM Sans 400, 1rem, line-height 1.6): All paragraph and UI text. Capped at 65–75ch for prose.
- **Label** (DM Sans 600, 0.75rem, tracking 0.2em, uppercase): The hero eyebrow ("Fresh · Fast · Delivered") and footer column headers. Used once or twice per page, never as a per-section scaffold.

### Named Rules
**The No-Synthesized-Italic Rule.** Arabic script has no italic form. Under `[dir="rtl"]`, Fraunces is swapped for Cairo and `font-style` is forced to `normal` on every heading, link, and span. Synthesized slant on connected Arabic letterforms is forbidden — it shears the script apart. The hero italic and `opsz` inline styles are gated on `locale !== 'ar'` because inline styles cannot be overridden by CSS.

**The Serif-Is-For-Voice Rule.** Fraunces is reserved for headings, prices' siblings, and the wordmark. It never sets body copy, form labels, or button text — that work belongs to DM Sans. The serif is the brand's voice, not its delivery vehicle.

## 4. Elevation

Flat by default, lift on interaction. Surfaces rest flat on the ivory background, separated by warm hairline borders and tonal shifts rather than ambient shadow. Depth is a *response to state*, not a permanent decoration — a card earns its shadow only when the cursor arrives.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 8px 24px -8px rgba(28,20,16,0.12)` + `translateY(-2px)`): Meal cards and offer cards on hover. Warm-tinted, soft, short-throw.
- **Amber CTA glow** (`box-shadow: 0 8px 24px -4px hsl(29 91% 44% / 0.4)`): Primary buttons and the round add-to-cart button. The only colored shadow in the system — it makes the CTA feel lit from within.

### Named Rules
**The Flat-At-Rest Rule.** No card, input, or section carries a base shadow. A `border: 1px` paired with a `box-shadow ≥16px` on the same resting element (the ghost-card tell) is forbidden — pick the warm hairline border at rest, add the lift only on `:hover`.

## 5. Components

### Buttons
- **Shape:** Full pill (`9999px`) for primary CTAs and the round icon add-button; the brand's "confident and rounded" stance.
- **Primary:** Saffron Amber background, white text, `12px 36px` padding, 48px tall, amber glow shadow. The single highest-priority action on any screen.
- **Hover / Focus:** Scales to 1.02 on hover, amber focus ring (`--ring`) at 2px offset for keyboard users. Reduced-motion users get the color change without the scale.
- **Ghost / Text:** The hero's secondary action ("Explore Menu") is a plain text link with a trailing arrow, no border or fill — it stays subordinate to the amber pill. CTA hierarchy is carried by *fill vs. no-fill*, never two filled buttons side by side.

### Chips (Category pills)
- **Style:** Card-background fill, warm 2px border, pill radius, `10px 20px` padding, emoji + label.
- **State:** Active pill flips to amber fill with white text and an amber-tinted shadow; inactive pills border-and-text shift toward amber on hover. Single-select filter behavior.

### Cards (Meal cards)
- **Corner Style:** Softly rounded (`16px`) — never the over-rounded 24/28/32px tell.
- **Background:** Linen card surface over the ivory body.
- **Shadow Strategy:** Flat at rest; hover lift only (see Elevation).
- **Border:** Warm 1px hairline.
- **Internal Padding:** 16px. Layout is a 4/3 image, then title + description, then a footer row: price + star rating on the leading side, round amber add-button on the trailing side.

### Inputs / Fields
- **Style:** Pill search field in the navbar with a leading search icon; warm border, card background.
- **Focus:** Amber ring, no harsh box-shadow.

### Navigation
- **Style:** Sticky translucent header with backdrop blur. Logo is the Fraunces wordmark in amber (Cairo, non-italic, in Arabic). Centered pill search on desktop, second row on mobile.
- **States:** Ghost icon buttons for theme, locale, cart, account; cart shows an amber count badge.

### Signature Component — The Two-Voice Hero
A full-bleed food photograph under a warm espresso gradient (not cold black), carrying a Fraunces `opsz 144` italic headline, a single amber pill CTA beside a text link, and a border-divided stat row in the display face. In Arabic the same hero swaps to Cairo and drops every italic. This is the page's thesis — nothing else on the site looks like it.

## 6. Do's and Don'ts

### Do:
- **Do** keep Saffron Amber (`#D4700A`) on ≤10% of any screen — CTAs, prices, active states, the wordmark. Let imagery and white space carry the warmth.
- **Do** keep every neutral warm (hue 22–40). Borders are `#E4DED8`, headings are `#1C1410`, never cold gray or pure black.
- **Do** swap Fraunces → Cairo and force `font-style: normal` under `[dir="rtl"]`. Gate hero italic and `opsz` inline styles on `locale !== 'ar'`.
- **Do** cap meal-card radius at 16px and use full pills only for buttons, badges, and chips.
- **Do** keep surfaces flat at rest; add the warm hover lift and amber CTA glow as responses to state.
- **Do** carry CTA hierarchy with fill-vs-no-fill: one amber pill, one text link. Verify body text ≥4.5:1 on ivory.

### Don't:
- **Don't** reintroduce the **default shadcn** cold navy primary (`222 47% 11%`) or a pure-white body. That look is the thing this identity was built to erase.
- **Don't** drift toward **Talabat/DoorDash**: no utility-orange chrome, no crowded grids, no aggressive percent-off banners.
- **Don't** adopt a **generic SaaS** posture: no all-sans-serif screens, no dark-mode-first developer aesthetic, no rounded-rectangle sameness.
- **Don't** borrow **fast-food-chain** loudness: no red/yellow, no clip-art food, no promotional noise. Offer cards stay deep and cohesive (Spice/Forest/Ink), never neon gradients.
- **Don't** synthesize italic on Arabic, pair the ghost-card (1px border + ≥16px shadow at rest), over-round cards past 16px, or use a tiny tracked uppercase eyebrow above every section — the hero eyebrow is the only one.
- **Don't** set body copy, labels, or button text in Fraunces. The serif is voice, DM Sans is delivery.
