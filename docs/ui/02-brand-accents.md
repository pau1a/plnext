# Brand accent utilities

The Paula gradient, crimson dot markers, and pill dividers are now available as
shared SCSS mixins in [`src/styles/accents.scss`](../../src/styles/accents.scss).
Use these helpers to keep hero sections and headers aligned with the brand
system.

## Mixins

| Mixin | Purpose | Notes |
| --- | --- | --- |
| `brand-gradient-overlay` | Adds the teal-to-graphite gradient backdrop and dark mode variant. | Apply to a container that already controls its layout. Inner wrappers should set `position: relative`/`z-index` to sit above the overlay. |
| `brand-dot-label($dot-size, $gap)` | Prepends a crimson dot with shadow to inline labels and headings. | Works on inline-flex containers. Override the optional arguments when a tighter rhythm is required. |
| `brand-accent-divider($height, $width)` | Renders the crimson pill divider. | Defaults to full-width. Pass custom height/width for inline pills. |

All mixins can be `@include`-ed inside SCSS modules:

```scss
@use "@/styles/accents.scss" as accents;

.heroTitleWord {
  @include accents.brand-dot-label();
}
```

## Utility classes

If you need to opt in via markup instead of SCSS modules, the same styles are
available as global utility classes:

- `.u-brand-gradient-overlay`
- `.u-brand-dot-label`
- `.u-brand-pill-divider`

These follow the same behaviour as the mixins and can be composed with existing
layout utilities.
