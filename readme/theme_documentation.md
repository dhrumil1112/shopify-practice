# Shopify Theme — Agent Context Documentation

> Feed this entire file to any AI agent before asking it to modify this Shopify theme.
> Last updated: 2026-07-09

---

## 1. Theme Identity

- **Base Theme**: Shopify Horizon (official Shopify theme)
- **Theme Type**: Online Store 2.0 (sections everywhere, JSON templates)
- **Local Path**: `c:\Dhrumil\Shopify\Practice\Latest Shopify Theme\shopify-practice`
- **Customization Level**: The team has extended the base theme with custom JS logic and Liquid parameter additions. Do not treat it as a vanilla Horizon theme.

---

## 2. File Structure Overview

```
shopify-practice/
├── assets/           # JS modules, CSS, SVG icons
├── blocks/           # Reusable block templates (theme blocks)
├── config/           # settings_schema.json + settings_data.json
├── layout/           # theme.liquid (main layout), password.liquid
├── sections/         # Section templates (rendered via JSON templates)
├── snippets/         # Reusable Liquid partials (no schema)
└── templates/        # JSON templates (index.json, product.json, etc.)
```

### Key Counts
- **Sections**: 42 files
- **Blocks**: 95 files
- **Snippets**: 122 files
- **JS Assets**: ~80 module files
- **Templates**: 13 (index, product, collection, cart, blog, article, page, search, 404, gift_card, password, list-collections, page.contact)

---

## 3. Layout & Entry Point

### `layout/theme.liquid`
The single HTML shell for the entire store. Key responsibilities:
- Renders `<head>` with meta tags, stylesheets, fonts, scripts, CSS variables
- Inlines a `<script>` to calculate `--header-height`, `--header-group-height`, `--top-row-height` CSS variables without layout shift
- Renders `{% sections 'header-group' %}` and `{% sections 'footer-group' %}` as section groups
- Renders `{{ content_for_layout }}` as the main content area (driven by JSON templates)
- Renders global overlays at body end: `cart-drawer`, `theme-drawer`, `search-modal`, `quick-add-modal`

### `layout/password.liquid`
Used only on the password-protected storefront page.

---

## 4. JavaScript Architecture

### Module System
All JS uses **native ES Modules** with an **importmap** defined in `snippets/scripts.liquid`. Modules are aliased under `@theme/`:

```js
import { isMobileBreakpoint, mediaQueryLarge } from '@theme/utilities';
import Component from '@theme/component';
```

Key importmap aliases:
| Alias | File |
|---|---|
| `@theme/utilities` | `utilities.js` |
| `@theme/component` | `component.js` |
| `@theme/product-form` | `product-form.js` |
| `@theme/variant-picker` | `variant-picker.js` |
| `@theme/section-renderer` | `section-renderer.js` |
| `@theme/morph` | `morph.js` |
| `@theme/scrolling` | `scrolling.js` |
| `@theme/theme-drawer` | `theme-drawer.js` |
| `@theme/quick-add` | `quick-add.js` |

All scripts are loaded as `type="module"` with `fetchpriority="low"` in `snippets/scripts.liquid`.

### Custom Web Components Pattern
The theme uses **custom HTML elements** (Web Components) as the primary JS architecture pattern. Every interactive UI feature is a `customElements.define(...)` class:

```js
class AccordionCustom extends HTMLElement {
  connectedCallback() { /* setup */ }
  disconnectedCallback() { /* cleanup */ }
}
customElements.define('accordion-custom', AccordionCustom);
```

**Important**: All event listeners are registered with an `AbortController` signal and cleaned up in `disconnectedCallback()`:
```js
#controller = new AbortController();
connectedCallback() {
  const { signal } = this.#controller;
  this.addEventListener('click', handler, { signal });
}
disconnectedCallback() {
  this.#controller.abort(); // removes all listeners
}
```

### Key Custom Elements (JS files)
| Element Tag | JS File | Purpose |
|---|---|---|
| `accordion-custom` | `accordion-custom.js` | Accordion open/close, single-open scoping |
| `product-form` | `product-form.js` | Add-to-cart, variant selection, cart updates |
| `variant-picker` | `variant-picker.js` | Variant swatch/button interaction |
| `cart-drawer` | `cart-drawer.js` | Slide-out cart drawer |
| `predictive-search` | `predictive-search.js` | Live search suggestions |
| `slideshow-component` | `slideshow.js` | Hero/slideshow carousel |
| `product-card` | `product-card.js` | Product card interactions |
| `quick-add` | `quick-add.js` | Quick add to cart modal |
| `header-component` | `header.js` | Sticky header, transparent header |
| `header-drawer` | `header-drawer.js` | Mobile menu drawer |

### `assets/utilities.js`
Central utility module. Key exports:
- `isMobileBreakpoint()` — returns `true` when viewport < 750px
- `mediaQueryLarge` — `MediaQueryList` for `(min-width: 750px)` breakpoint
- `calculateHeaderGroupHeight()` — syncs `--header-height` CSS var
- `updateTransparentHeaderOffset()` — manages transparent header CSS vars

---

## 5. Accordion System (Custom Implementation)

> This is the most heavily customized feature in this theme. Read carefully before touching any accordion.

### Architecture
Three layers work together:

```
snippets/accordion-custom-component.liquid   ← Liquid wrapper (renders <accordion-custom>)
assets/accordion-custom.js                  ← Web Component (handles JS behavior)
snippets/accordion-styles.liquid            ← Shared CSS for accordion dividers
```

### `accordion-custom` Web Component (`assets/accordion-custom.js`)

**Must contain** a `<details>/<summary>` pair as its direct child:
```html
<accordion-custom data-accordion-group="section-abc">
  <details class="details">
    <summary>Title</summary>
    <div class="details-content">Content</div>
  </details>
</accordion-custom>
```

**Supported `data-*` attributes on `<accordion-custom>`:**

| Attribute | Type | Effect |
|---|---|---|
| `data-disable-on-mobile="true"` | boolean | Prevents toggle on mobile (≤749px) |
| `data-disable-on-desktop="true"` | boolean | Prevents toggle on desktop (≥750px) |
| `data-close-with-escape="true"` | boolean | Closes on Escape key press |
| `data-accordion-group="<id>"` | string | Groups accordions for single-open behavior |
| `data-disable-animation-on-desktop="true"` | boolean | Disables CSS transition on desktop |

**Supported marker attributes on `<accordion-custom>` element:**

| Attribute | Effect |
|---|---|
| `open-by-default-on-desktop` | Opens by default on desktop; re-applied on breakpoint change |
| `open-by-default-on-mobile` | Opens by default on mobile; re-applied on breakpoint change |

**Single-Open (Accordion Group) Behavior:**

When `data-accordion-group` is set to the same value on multiple `accordion-custom` elements, opening one will automatically close all others in the same group.

```js
// In #closeOtherAccordions():
// - Only runs if data-accordion-group is set (opt-in)
// - Closes all accordion-custom with the same group value
// - Accordions WITHOUT a group are always independent
```

**Rule**: Accordions WITHOUT `data-accordion-group` are always independent — opening one never affects any other.

### `snippets/accordion-custom-component.liquid`

The shared Liquid snippet that renders `<accordion-custom>`. Always use this snippet — never write raw `<accordion-custom>` HTML.

**All available parameters:**
```liquid
{% render 'accordion-custom-component',
  children: accordion_content,       {string} Required. The <details> HTML content
  class: 'my-class',                 {string} Optional. CSS class on <accordion-custom>
  open: true,                        {boolean} Optional. Sets open marker attribute
  open_by_default_on_desktop: true,  {boolean} Optional.
  open_by_default_on_mobile: true,   {boolean} Optional.
  disable_on_desktop: true,          {boolean} Optional.
  disable_on_mobile: true,           {boolean} Optional.
  disable_animation_on_desktop: true,{boolean} Optional.
  close_with_escape: true,           {boolean} Optional.
  data_filter_param_name: 'color',   {string} Optional. For filter facets.
  accordion_group: section.id        {string} Optional. Enables single-open scoping.
%}
```

**⚠️ Critical Rules for `accordion_group`:**
1. Use `section.id` — NOT `block.section.id` (`block.section` is invalid in Shopify Liquid)
2. `block.id` gives a unique ID per block — use only if you want each accordion to be its own independent group
3. Every parameter except the last must have a trailing comma (Liquid syntax)

### Where Accordions Are Used

| Location | File | `accordion_group` | Single-open? |
|---|---|---|---|
| FAQ / Content accordion rows | `blocks/_accordion-row.liquid` | `section.id` | ✅ Yes |
| Footer menu columns | `blocks/menu.liquid` | `section.id` | ✅ Yes (mobile) |
| Cart discount code | `snippets/cart-summary.liquid` | None | ❌ Independent |
| Product filters (list) | `snippets/list-filter.liquid` | None | ❌ Independent |
| Product filters (price) | `snippets/price-filter.liquid` | None | ❌ Independent |
| Sorting | `snippets/sorting.liquid` | None | ❌ Independent |
| Cart order summary | `snippets/cart-summary.liquid` | None | ❌ Independent |
| Header drawer mobile menu | `snippets/header-drawer.liquid` | None | ❌ Independent |
| Disclosures (language/currency) | `blocks/disclosures.liquid` | None | ❌ Independent |

### How to Enable Single-Open on Any New Accordion
Just add `accordion_group: section.id` to the `{% render 'accordion-custom-component' %}` call. That's the only change needed.

---

## 6. Liquid Architecture Patterns

### Section vs Block vs Snippet

| Type | Has Schema? | Has `section` var? | Has `block` var? | Rendered by |
|---|---|---|---|---|
| Section | ✅ Yes | ✅ Yes | ❌ No | JSON templates / `{% section %}` |
| Block | ✅ Yes | ✅ Yes | ✅ Yes | `{% content_for 'blocks' %}` inside section |
| Snippet | ❌ No | Inherits parent | Inherits parent | `{% render 'name', params %}` |

**Important Liquid variable scoping with `{% render %}`:**
- `{% render %}` creates an isolated scope — parent variables are NOT automatically available
- You must explicitly pass every variable the snippet needs as a parameter
- Exception: `settings`, `request`, `shop`, `routes` are always available globally

### Naming Conventions
- Sections: `kebab-case.liquid` (e.g., `hero.liquid`, `main-collection.liquid`)
- Block files that are "private" (not meant to be used standalone): prefix with `_` (e.g., `_accordion-row.liquid`, `_announcement.liquid`)
- Snippets: `kebab-case.liquid`

### `snippets/section.liquid`
A central section wrapper snippet used by many sections and the `_blocks.liquid` AI section wrapper. Handles:
- Section width (page-width vs full-width)
- Background color with contrast override
- Padding and spacing styles

### `sections/_blocks.liquid`
Overrides Shopify's default AI-generated block wrapper. Renders all theme blocks through the `snippets/section.liquid` system.

### Translation Keys
All user-visible strings use `t:` translation keys. Never hardcode English strings directly in schema `label`, `name`, `content` fields. Use:
```json
"label": "t:settings.background_color"
```

---

## 7. CSS Architecture

### Main Stylesheet
`assets/base.css` — monolithic base stylesheet (~100KB). Contains all base styles, CSS custom properties, component styles.

### CSS Custom Properties System
Global design tokens are set as CSS custom properties on `:root` via `snippets/theme-styles-variables.liquid`. Key variables:

```css
--header-height          /* set inline by JS on page load */
--header-group-height    /* total sticky header area height */
--animation-speed-slow   /* standard transition duration */
--animation-easing       /* standard easing function */
--color-border           /* theme border color */
--font-heading--family   /* heading font family */
--font-body--family      /* body font family */
```

### Breakpoints
| Name | Value | Usage |
|---|---|---|
| Mobile | `max-width: 749px` | Mobile-only styles |
| Desktop | `min-width: 750px` | Desktop-only styles |
| Tablet | `min-width: 750px and max-width: 989px` | Tablet layout |
| Wide | `min-width: 990px` | Desktop+ layout |

`isMobileBreakpoint()` in JS matches the 750px breakpoint. `mediaQueryLarge` is the `matchMedia('(min-width: 750px)')` query.

### `{% stylesheet %}` in Block/Section Files
Blocks and sections can include co-located CSS using `{% stylesheet %}` tags. Shopify deduplicates these — a stylesheet is only output once even if the same block is rendered multiple times on a page.

---

## 8. Theme Settings (Global)

From `config/settings_data.json` — key current values:

| Setting | Value | Notes |
|---|---|---|
| `type_body_font` | `inter_n4` | Inter Regular |
| `type_heading_font` | `inter_n7` | Inter Bold |
| `type_accent_font` | `bricolage_grotesque_n7` | Accent/Display font |
| `page_width` | `narrow` | Page max-width variant |
| `card_hover_effect` | `none` | No card lift/shadow on hover |
| `cart_type` | `drawer` | Cart uses slide-out drawer |
| `auto_open_cart_drawer` | `true` | Drawer opens automatically on add-to-cart |
| `show_add_discount_code` | `true` | Discount field shown in cart |
| `color_palette.background` | `#ffffff` | White background |
| `color_palette.foreground` | `#000000` | Black text |
| `color_palette.color1` | `#333333` | Dark grey |
| `color_palette.color2` | `#f5f5f5` | Light grey |

### Color Palette Tokens
Used throughout via `{{ settings.color_palette.background }}` etc.

---

## 9. Header System

### Files
- `sections/header.liquid` — main header section (54KB, complex)
- `snippets/header-drawer.liquid` — mobile hamburger drawer (57KB)
- `snippets/header-actions.liquid` — search, cart, account icons
- `blocks/_header-menu.liquid` — desktop mega-menu
- `assets/header.js`, `header-drawer.js`, `header-menu.js` — JS

### `header-component` Web Component
The main header element. Handles:
- Sticky behavior
- Transparent header mode (overlays first section)
- Breakpoint changes
- Mobile vs desktop menu style detection (drawer vs inline)

### Mobile Breakpoint Detection for Header
```js
const isTouchDevice = 'ontouchstart' in window && navigator.maxTouchPoints > 0;
const hasReachedMinimum = overflowList?.hasAttribute('minimum-reached');
headerComponent.dataset.menuStyle = isTouchDevice || hasReachedMinimum ? 'drawer' : 'menu';
```

---

## 10. Footer System

### Files
- `sections/footer.liquid` — footer section
- `sections/footer-utilities.liquid` — copyright, policy links row
- `sections/footer-group.json` — section group config

### Footer Layout
Auto-calculates grid columns based on number of blocks (max 4 per row). Handles orphan items (last-row centering) with CSS grid and `--grid-columns`, `--last-row-count` custom properties.

### Footer Menu Accordion Behavior
`blocks/menu.liquid` renders each footer menu column. On mobile (≤749px), if `show_as_accordion` is enabled for a menu block, it becomes a collapsible accordion. It uses `accordion-custom-component` with:
- `disable_on_desktop: true` (always expanded on desktop)
- `open_by_default_on_desktop: true` (always open on desktop)
- `accordion_group: section.id` (single-open within same footer section on mobile)

---

## 11. Cart System

- **Cart type**: Drawer (slide-out panel)
- `snippets/cart-drawer.liquid` — drawer shell
- `snippets/cart-products.liquid` — line items list
- `snippets/cart-summary.liquid` — subtotal, discounts, checkout
- `assets/cart-drawer.js` — open/close, AJAX updates
- `assets/component-cart-items.js` — quantity changes, remove items

Cart uses Shopify AJAX Cart API at `routes.cart_add_url`, `routes.cart_change_url`, `routes.cart_update_url` (exposed via global `Theme.routes` JS object in `scripts.liquid`).

---

## 12. Product Pages

### Templates
- `templates/product.json` — default product template
- `sections/product-information.liquid` — main product info section
- `sections/featured-product.liquid` — for embedding a product in other pages

### Key Blocks in Product Section
- `_product-details.liquid` — variant picker, buy buttons, price
- `_product-media-gallery.liquid` — image/video gallery
- `buy-buttons.liquid` — add-to-cart + accelerated checkout

### Variant Picker
`blocks/variant-picker.liquid` + `assets/variant-picker.js`. Handles swatch colors, button variants, URL updates, media gallery sync.

---

## 13. Collection & Filtering

- `templates/collection.json` → `sections/main-collection.liquid`
- Filtering via `snippets/list-filter.liquid` (tag/option filters) and `snippets/price-filter.liquid`
- Sorting via `snippets/sorting.liquid`
- All filter/sort UI uses accordion-custom but WITHOUT `accordion_group` (independent)
- `assets/facets.js` — AJAX filter/sort updates without page reload
- `assets/paginated-list.js` — infinite scroll or pagination

---

## 14. Known Customizations (What This Team Changed)

These are additions/modifications on top of base Horizon that any AI agent must be aware of:

### 1. Scoped Single-Open Accordion (`accordion-custom.js`)
**Change**: Modified `#closeOtherAccordions()` to be opt-in via `data-accordion-group`.

**Before** (base Horizon): All accordions globally closed each other on open.

**After** (this store): Only accordions sharing the same `data-accordion-group` value close each other. Accordions without a group are fully independent.

**Files changed**:
- `assets/accordion-custom.js` — `#closeOtherAccordions()` method
- `snippets/accordion-custom-component.liquid` — added `accordion_group` param support
- `blocks/_accordion-row.liquid` — passes `accordion_group: section.id`
- `blocks/menu.liquid` — passes `accordion_group: section.id`

### 2. Installed Apps
From `settings_data.json`:
- **XB Wishlist** (`shopify://apps/xb-wishlist`) — enabled
- **Shopify Inbox Chat** (`shopify://apps/inbox`) — installed but **disabled**

---

## 15. Rules for AI Agents Making Changes

### General Rules
1. **Never use `block.section.id`** — it's invalid Liquid. Use `section.id`.
2. **Never hardcode English strings** in schema labels/names — use `t:` translation keys.
3. **Every Liquid `{% render %}` parameter** except the last must have a trailing comma.
4. **CSS goes in `{% stylesheet %}` blocks** inside section/block files, or in `base.css` for global styles. Never use inline `style` tags for theming.
5. **JS goes in `assets/`** as ES modules. Import via the `@theme/` importmap aliases.
6. **Don't add `<script>` tags directly in Liquid files** — register new JS as an asset and load it via `snippets/scripts.liquid`.
7. **Use `AbortController` pattern** for all event listeners in custom elements.

### Accordion Rules
1. To add single-open behavior to any accordion group: add `accordion_group: section.id` to the `{% render 'accordion-custom-component' %}` call.
2. Never add `accordion_group` to: cart, filters, sorting, or search accordions.
3. Use `accordion-custom-component.liquid` snippet — never write raw `<accordion-custom>` HTML.
4. Always wrap accordion content in a `<details>/<summary>` pair inside the snippet call.

### Section/Block Rules
1. New sections go in `sections/` with a `{% schema %}` block.
2. New block types go in `blocks/` with a `{% schema %}` block.
3. Blocks intended only for internal use (not user-addable standalone) should be prefixed with `_`.
4. Register new block types in the relevant section's schema `"blocks"` array.

### Breakpoint Rules
- Mobile: `max-width: 749px`
- Desktop: `min-width: 750px`
- JS check: use `isMobileBreakpoint()` from `@theme/utilities`
- React to breakpoint changes: use `mediaQueryLarge.addEventListener('change', handler)`

---

## 16. Quick Reference: Common Patterns

### Render an Accordion Section
```liquid
{% capture my_accordion_content %}
  <details class="details">
    <summary class="details__header">My Title</summary>
    <div class="details-content">My content here</div>
  </details>
{% endcapture %}

{% render 'accordion-custom-component',
  children: my_accordion_content,
  open_by_default_on_desktop: true,
  accordion_group: section.id
%}
```

### Access Theme Settings in Liquid
```liquid
{{ settings.color_palette.background }}
{{ settings.type_heading_font }}
{{ settings.cart_type }}
```

### Access Theme Routes in JS
```js
const cartUrl = Theme.routes.cart_add_url;
const searchUrl = Theme.routes.predictive_search_url;
```

### Import a Utility in JS
```js
import { isMobileBreakpoint, mediaQueryLarge } from '@theme/utilities';
import Component from '@theme/component';
```

### Check Current Template in Liquid
```liquid
{% if template.name == 'product' %}...{% endif %}
{% if template == 'index' %}...{% endif %}
```

### Check Current Template in JS
```js
const template = Theme.template.name; // 'product', 'collection', etc.
```
