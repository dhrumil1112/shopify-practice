---
trigger: always_on
---

# Shopify Horizon Theme - Global AI IDE Rules

## Primary Objective

Always generate code that follows the Shopify Horizon Theme architecture and conventions.

Never generate Dawn-style or generic Shopify code unless explicitly requested.

---

# General Rules

- Follow Shopify Theme Best Practices.
- Follow Horizon code patterns.
- Keep all code modular.
- Never duplicate functionality.
- Prefer reusable snippets over repeated markup.
- Use Liquid first.
- Use JavaScript only when Liquid cannot solve the problem.
- Avoid jQuery unless the existing Horizon theme already uses it.
- Never introduce external libraries without request.

---

# File Structure

Respect Horizon architecture.

Use:

Sections
Snippets
Blocks
Assets

Never create random files.

If functionality belongs inside an existing snippet, extend that snippet.

If functionality belongs inside an existing block, extend the block.

Do not rewrite complete files unless requested.

Only modify the necessary code.

---

# Liquid Rules

Always use:

{% liquid %}

instead of multiple assign tags whenever possible.

Example:

{% liquid
assign product = section.settings.product
assign image = product.featured_image
%}

Avoid unnecessary capture tags.

Avoid nested if statements.

Prefer:

unless

where appropriate.

Use:

default

instead of extra conditionals.

Use:

render

instead of include.

Never use deprecated include.

---

# Settings Rules

Always expose merchant configurable options through schema.

If new functionality is added:

Create schema settings.

Use visible_if whenever applicable.

Group settings logically.

Use:

Headers

Appearance

Typography

Layout

Spacing

Padding

Colors

Behavior

Advanced

Never hardcode values that should be configurable.

---

# CSS Rules

Never use inline styles unless Horizon already does.

Reuse existing utility classes.

Prefer CSS variables.

Use existing spacing variables.

Example:

--padding-sm

--padding-md

--spacing--size

Do not introduce arbitrary spacing.

Follow mobile-first CSS.

Avoid !important.

Do not override existing Horizon CSS unless necessary.

---

# JavaScript Rules

Always scope JavaScript.

Never use:

document.querySelector(...)

globally.

Instead:

Use section root.

Use closest().

Use component root.

Never affect other sections.

Every accordion must work independently.

Never create global event listeners if delegation can be used.

Destroy listeners when Shopify editor reloads sections.

Support:

Shopify Theme Editor

shopify:section:load

shopify:block:select

shopify:section:unload

Avoid polling.

Avoid unnecessary MutationObservers.

---

# Accordion Rules

Each accordion must only affect itself.

Never close accordions outside its own container.

Always scope:

closest()

Example:

Accordion Group
Accordion Item
Accordion Item
Accordion Item

Opening one item must never affect:

Footer

FAQ

Product Accordion

Collection Filters

unless explicitly intended.

---

# Responsive Rules

Desktop

Tablet

Mobile

must be independent.

Never use desktop logic for mobile.

Never use mobile logic for desktop.

Desktop menus should remain unchanged unless requested.

---

# Accessibility

Always preserve:

aria-expanded

aria-controls

role

tabindex

focus management

Keyboard navigation.

Never remove accessibility attributes.

---

# Performance

Avoid unnecessary DOM queries.

Cache selectors.

Use event delegation.

Avoid layout thrashing.

Avoid multiple reflows.

Avoid duplicate listeners.

---

# Images

Always use Shopify image_url.

Example:

image
| image_url: width: 800
| image_tag

Never hardcode image URLs.

Support responsive images.

Use lazy loading.

---

# Forms

Always use Shopify form helpers.

Never manually recreate customer forms.

Preserve validation.

---

# Translation

Never hardcode merchant-facing text.

Use translation keys.

Example:

t:names.menu

t:settings.heading

---

# Theme Editor Compatibility

Every feature must work with:

Shopify Theme Editor

Dynamic Rendering

Block Reordering

Section Reloading

Section Rendering API

Do not rely on page refreshes.

---

# Code Style

Keep code readable.

Keep indentation consistent.

Explain complex logic with comments.

Do not remove existing comments unless necessary.

Avoid one-letter variable names.

Use descriptive variable names.

---

# Existing Code

Always preserve existing functionality.

Never rewrite working code.

Modify only the required logic.

Backward compatibility is mandatory.

---

# Debugging

When fixing bugs:

First identify root cause.

Avoid workaround fixes.

Avoid changing unrelated files.

Minimize code changes.

Explain why the issue occurred.

---

# Before Writing Code

Always determine:

Can Liquid solve this?

Can existing Horizon components be reused?

Will this break Theme Editor?

Will this affect another section?

Can this be configurable?

Only then generate code.

---

# Output Rules

When providing code:

1. Explain the approach.

2. Mention the file(s) to edit.

3. Show only modified code.

4. Mark where code should be inserted.

5. Preserve formatting.

6. Preserve Horizon conventions.

Never rewrite entire files unless explicitly requested.

---

# Default Mindset

Think like a Horizon Theme maintainer.

Prefer extending existing architecture over replacing it.

Every change should be modular, reusable, configurable, editor-compatible, accessible, performant, and isolated.
