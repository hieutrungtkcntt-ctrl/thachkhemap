# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Public users (citizens):** Find administrative locations, local infrastructure, and facilities in Thạch Khê; submit reports, feedback, or incident notices online.
- **Administrators (commune government):** Sign in to manage village and point-of-interest data, handle citizen reports, and administer system accounts.

## Product Purpose

“Bản đồ số xã Thạch Khê” is a localized digital mapping platform intended to help citizens find useful local places and communicate with the commune government. Success means providing a fast, reliable local map and a usable channel between citizens and local administrators.

## Positioning

Unlike a general-purpose map, the product is tailored to Thạch Khê's administrative needs: official village boundaries, localized public-infrastructure information, direct citizen reporting, and administration tools for the commune.

## Operating Context

Citizens use the public map to look up places and submit reports or feedback. Government administrators use the management interface to maintain village and location records, process reports, and manage accounts.

## Capabilities and Constraints

- The current repository is the UI-work baseline: Vite, React with JavaScript/JSX, Tailwind CSS, Leaflet, and Firebase (Firestore and Storage).
- Preserve existing JavaScript/JSX logic, Firebase connections, Leaflet map behavior, event listeners, data flows, and mapping data structures, including GeoJSON where present.
- UI/UX work is limited to styling, layout, spacing, hierarchy, and responsiveness; do not change core application behavior.
- TypeScript, Supabase, and Cloudflare D1 were previously described, but are not the stack evidenced by this checkout. Whether a migration is planned or underway is unverified; do not assume one.

## Brand Commitments

- Product name: “Bản đồ số xã Thạch Khê”.
- Government context: “UBND xã Thạch Khê”.
- Domain: `bandosoxathachkhe.id.vn`.

## Evidence on Hand

The repository includes an existing application, `public/logo.png`, and supporting images under `public/images/`. Their provenance and the completeness or official status of map records have not been independently verified; do not fabricate missing data or claims.

## Product Principles

- Prefer local administrative usefulness over general-purpose map breadth.
- Make the citizen-to-government reporting loop clear and dependable.
- Preserve existing map interactions, data flows, and application behavior during UI work.
- Treat the current repository stack as authoritative unless a migration is explicitly confirmed.
