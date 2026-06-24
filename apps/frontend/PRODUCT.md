# Product

## Register

brand + product

> **Split register:** The home page (`/`) is **brand** — design IS the experience, visual identity is the deliverable. App screens (cart, checkout, orders, admin) are **product** — design serves the workflow. Apply the brand register to the landing surface; apply the product register to functional screens.

## Users

**Primary:** Hungry customers on mobile and desktop. Context: purposeful, time-sensitive, appetite-driven. They arrive wanting food and leave the moment anything slows them down or fails to look good.

**Secondary:** Restaurant / store admins managing products and orders. Context: desktop, task-driven, repeat use. They care about efficiency, not aesthetics.

## Product Purpose

FoodHub is a food delivery web app: customers browse a categorised menu, add items to cart, check out, and track orders. Success for the customer = placing an order in under 2 minutes from landing. Secondary success = an HR reviewer or portfolio audience immediately recognises premium design quality and remembers the interface 30 seconds after closing the tab.

## Brand Personality

**Warm · Fast · Premium**

Feels like a high-end restaurant that also happens to deliver. Appetite-stimulating, trustworthy, swift. The design should evoke the warmth of a well-lit dining room, not the urgency of a discount banner. The amber brand color carries the warmth; the Fraunces / Cairo type system carries the premium; clean spacing carries the calm.

## Anti-references

- **Talabat / DoorDash** — utility orange, crowded layout, aggressive discount banners, too much visual noise
- **Generic SaaS (Stripe / Linear)** — cold sans-serif, developer-brained, dark mode first, no appetite
- **Fast food chains (McDonald's / KFC sites)** — loud red/yellow, clip-art food imagery, promotional overload
- **Default shadcn / Tailwind starter** — cold navy primary, pure white background, zero brand identity, indistinguishable from every other side-project

## Design Principles

1. **Appetite before utility.** Every screen should make the food look desirable before it makes anything functional. Images are the primary content; UI is the frame.

2. **Premium without pretension.** High-end aesthetic, accessible to everyone. No exclusivity signals, no jargon, no cold minimalism. The brand is warm, not intimidating.

3. **Speed is the promise.** In a delivery app, UI latency equals broken trust. Skeleton states, instant feedback, and smooth transitions earn the customer's patience between taps.

4. **Bilingual first-class.** Arabic RTL is not a translated afterthought — it is an equal first-class experience. Every typographic and layout decision must hold in both languages. Cairo replaces Fraunces in RTL; no italic synthesis; logical CSS properties throughout.

5. **One color, infinite contexts.** Deep amber (`#D4700A`, primary) is the entire brand identity. Use it with restraint and discipline — on CTAs, active states, prices, the logo — never as a flood. Let white space and the food imagery carry the warmth.

## Accessibility & Inclusion

- **WCAG AA minimum** — 4.5:1 for body text, 3:1 for large text and UI components
- **Full RTL support** — Arabic is a first-class locale with Cairo as the type system
- **Reduced motion** — all animations must degrade to instant transitions under `prefers-reduced-motion: reduce`
- **Keyboard navigation** — visible focus rings, logical tab order throughout all functional screens
