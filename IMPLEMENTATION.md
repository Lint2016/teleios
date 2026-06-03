# Teleios Church — Prioritized Implementation Backlog

Work through **one item at a time**. Mark status as you complete each phase.

| Status | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |

---

## Phase 0 — Critical fixes (foundation)

| # | Task | Why | Status |
|---|------|-----|--------|
| 0.1 | Fix `script.js` syntax (unclosed `initializeFormAnimations`) | Entire site JS was broken, including carousel | `[x]` |
| 0.2 | Fix about-section image carousel | Community photos should rotate reliably | `[x]` |
| 0.3 | Replace Tawk.to with WhatsApp float (`067 163 0558`) | Better fit for SA churches; direct pastoral contact | `[x]` |

---

## Phase 1 — Trust & freshness (highest ROI)

| # | Task | Why | Status |
|---|------|-----|--------|
| 1.1 | Update **events** (remove stale Dec 2023; add recurring Sunday/Wednesday + special services) | Dead dates undermine credibility | `[x]` |
| 1.2 | Replace placeholder **phone** with `067 163 0558` / `+27 67 163 0558` in contact + footer | Consistent contact info | `[x]` |
| 1.3 | Wire **real PayFast / PayPal** merchant URLs (not generic homepages) | Optional — deferred until merchant account exists | `[—]` |
| 1.4 | Confirm **bank EFT details** (account number, reference) with church admin | Avoid wrong donations | `[x]` |
| 1.5 | Add **Plan Your Visit** section (parking, kids, duration, what to expect) | Top visitor conversion path | `[x]` |

---

## Phase 2 — Content & engagement

| # | Task | Why | Status |
|---|------|-----|--------|
| 2.1 | Enable **prayer request** form (uncomment + Formspree field + privacy note) | Pastoral care pathway | `[—]` skipped |
| 2.2 | **YouTube sermon thumbnails** on cards + link to channel | Sermons feel alive, not placeholder | `[x]` |
| 2.3 | **Watch Online** CTA → YouTube channel / latest live (not only Mighty Network) | Clear online worship path | `[x]` |
| 2.4 | Fix nav: **Community** (external) vs **Ministries** (`#ministries` section) | Remove duplicate `id` / confusion | `[x]` |
| 2.5 | **Pastors / leaders** section with photos and short bios | Trust through faces | `[x]` |
| 2.6 | **Newsletter** signup (Mailchimp / Brevo embed) | Stay connected beyond Sunday | `[x]` |

---

## Phase 3 — SEO, accessibility, performance

| # | Task | Why | Status |
|---|------|-----|--------|
| 3.1 | `JSON-LD` (Church, Place, opening hours) | Local search / rich results | `[x]` |
| 3.2 | `sitemap.xml`, `robots.txt`, canonical URL, OG image 1200×630 | Discoverability | `[x]` |
| 3.3 | Skip link + `prefers-reduced-motion` (pause carousel/animations) | Accessibility | `[x]` |
| 3.4 | POPIA **privacy policy** + form consent line | Legal compliance (ZA) | `[x]` |
| 3.5 | Lighthouse pass: WebP images, font-display, lazy load hero assets | Speed on mobile data | `[~]` lazy/preconnect done; WebP optional |

---

## Phase 4 — Dynamic content (reduce manual HTML)

| # | Task | Why | Status |
|---|------|-----|--------|
| 4.1 | **Google Calendar** embed or API for events | Auto-updating schedule | `[x]` |
| 4.2 | **YouTube playlist** sync for sermon grid | No hand-editing each sermon | `[x]` RSS feed from channel |
| 4.3 | Sermon **series** pages (title, dates, notes PDF) | Premium preaching archive | `[ ]` |

---

## Phase 5 — Platform & integrations (longer term)

| # | Task | Why | Status |
|---|------|-----|--------|
| 5.1 | Headless CMS (Sanity / Contentful) or Astro site | Pastors update without code | `[ ]` |
| 5.2 | ChMS widgets (Planning Center / Breeze) for groups & registration | Operational church tooling | `[ ]` |
| 5.3 | Recurring giving + tax receipts via PayFast | Stewardship at scale | `[ ]` |
| 5.4 | Member portal (optional) | Giving history, groups, prayer wall | `[ ]` |

---

## Suggested order (one at a time)

1. ~~**1.1** Events refresh~~  
2. ~~**1.2** Phone number consistency~~  
3. ~~**1.4** Bank EFT details (Standard Bank · 303046430 · 051001)~~  
4. ~~**1.5** Plan Your Visit~~  
5. ~~**2.1** Prayer request~~ *(skipped)*  
6. ~~**2.2–2.4** YouTube + nav~~  
7. ~~**Phase 3** SEO & POPIA (mostly complete)~~  
8. ~~**4.2** YouTube sermon auto-load~~  
9. ~~**2.5** Pastors / leaders section~~  
10. ~~**2.6** Newsletter signup~~  
11. ~~**4.1** Google Calendar embed URL in `site-config.js` (optional)~~  
12. **1.3** PayFast — when merchant account exists *(next)*

---

## Notes

- WhatsApp international link: `https://wa.me/27671630558`
- Giving (EFT): Standard Bank · Teleios Church SA · **303046430** · branch **051001**
- PayFast (when ready): register at [payfast.co.za](https://www.payfast.co.za), then replace the “coming soon” note with your payment link.
- YouTube channel: [Teleios Church](https://www.youtube.com/channel/UCIqka1KcckcYRK3DXynQbiw) — sermons load via RSS in `youtube-sermons.js`.
- **Deploy:** set `siteUrl` in `site-config.js` to your real domain if not `teleioschurch.co.za`.
- **Google Calendar:** paste public embed URL into `googleCalendarEmbedUrl` in `site-config.js` to show calendar above events.
- Mark items `[x]` in this file as each task ships.
