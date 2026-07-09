# Prompt: Scoped Single-Open Accordion for Shopify Theme

## ✅ TL;DR — How to Enable Single-Open on Any Accordion

To make a set of accordions behave in single-open mode (opening one closes the others),
**add only this one line** to the `{% render 'accordion-custom-component' %}` call:

```liquid
accordion_group: section.id
```

That's it. No JS changes, no other file changes needed.
All `accordion-custom-component` calls that share the same `section.id` will automatically
close each other when one opens. Accordions without this line are always independent.

> ⚠️ Always use `section.id` — NOT `block.section.id` (invalid in Shopify Liquid).
> ⚠️ Make sure a comma exists on the line before `accordion_group:` (Liquid syntax rule).

---

## Context

This Shopify theme uses a custom Web Component called `accordion-custom` (defined in `assets/accordion-custom.js`) to power all accordion UI across the site — including the FAQ section, Footer Menu, cart, filters, and sorting.

The theme renders accordions via a shared Liquid snippet: `snippets/accordion-custom-component.liquid`, which wraps a `<details>/<summary>` pair inside `<accordion-custom>` custom element.

Accordion rows in the FAQ/content sections are rendered by `blocks/_accordion-row.liquid`, which calls `accordion-custom-component`.

The Footer Menu is rendered by `blocks/menu.liquid`, which also calls `accordion-custom-component`.

---

## Implemented Behavior

### Single-Open (one accordion open at a time) — SCOPED per section

- When you open accordion B while accordion A is already open, **A closes automatically**.
- This behavior is **opt-in** and **scoped**: only accordions that share the same `data-accordion-group` attribute value will close each other.
- Accordions **without** a `data-accordion-group` are completely independent and do not affect any other accordion.

### How it works (technical)

**`assets/accordion-custom.js` — `#closeOtherAccordions()` method:**
```js
#closeOtherAccordions() {
  const group = this.dataset.accordionGroup || null;

  // Single-open is opt-in via named group.
  // Accordions with no group (cart, filters, etc.) are always independent.
  if (group === null) return;

  const allAccordions = document.querySelectorAll(
    `accordion-custom[data-accordion-group="${group}"]`
  );

  allAccordions.forEach((other) => {
    if (other === this) return;
    other.details.open = false; // close siblings in same group
  });
}
```

Called inside `handleClick` only when the accordion is currently closed (i.e., being opened):
```js
if (!this.details.open) {
  this.#closeOtherAccordions();
}
```

**`snippets/accordion-custom-component.liquid` — renders the group attribute:**
```liquid
{% if accordion_group %}
  data-accordion-group="{{ accordion_group }}"
{% endif %}
```

**`blocks/_accordion-row.liquid` — FAQ rows pass section ID as group:**
```liquid
{% render 'accordion-custom-component',
  children: accordion_row_children,
  open_by_default_on_desktop: block_settings.open_by_default,
  open_by_default_on_mobile: block_settings.open_by_default,
  accordion_group: section.id
%}
```
> ⚠️ Use `section.id` NOT `block.section.id`. In Shopify Liquid, `block.section` is not a valid property — only `section.id` is available in block templates.

**`blocks/menu.liquid` — Footer menus pass section ID as group (optional):**
```liquid
{% render 'accordion-custom-component',
  children: menu_accordion_children,
  class: menu_class,
  disable_on_desktop: true,
  open_by_default_on_desktop: true,
  disable_on_mobile: should_disable_on_mobile,
  open_by_default_on_mobile: should_open_by_default_on_mobile,
  accordion_group: section.id
%}
```

---

## Scoping Rules

| Component | `data-accordion-group` set? | Single-open behavior? |
|---|---|---|
| FAQ accordion rows (same section) | ✅ `section.id` | ✅ Opening one closes others in that section |
| Footer Menu columns (same section) | ✅ `section.id` | ✅ Opening one closes others in that footer section |
| Cart summary accordion | ❌ None | ❌ Always independent |
| Filter facets | ❌ None | ❌ Always independent |
| Sorting accordion | ❌ None | ❌ Always independent |
| Two different FAQ sections on same page | Different `section.id` | ✅ Each section isolated |

---

## Rules / Constraints

1. **Do NOT change `#setDefaultOpenState()`** — it controls open/closed state on desktop vs. mobile breakpoint switch and is unrelated to single-open behavior.
2. **Do NOT use `data-accordion-group` on cart, filter, or sorting accordions** — they must remain independent.
3. **Always use `section.id` (not `block.id` or `block.section.id`)** when passing the group in a block template.
4. **The `accordion-custom-component.liquid` snippet is shared** — any parameter added must be documented in its `@param` block at the top.
5. **Comma syntax in Liquid `{% render %}` calls** — every parameter except the last must end with a comma or Liquid will throw a parse error.

---

## Files Involved

- `assets/accordion-custom.js` — Web Component JS, contains `#closeOtherAccordions()`
- `snippets/accordion-custom-component.liquid` — shared wrapper snippet, renders `data-accordion-group`
- `blocks/_accordion-row.liquid` — FAQ accordion rows, passes `accordion_group: section.id`
- `blocks/menu.liquid` — Footer menus, passes `accordion_group: section.id`
