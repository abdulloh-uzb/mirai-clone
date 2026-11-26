# 0005: The Admin area has its own layout, outside the public site frame

**Status:** accepted (2026-11-26)

The public frame (announcement bar, header, footer, help widget, consent banner) lived in the `[locale]` root layout, so every Admin page rendered inside the marketing site. We split `src/app/[locale]` into a `(site)` route group, whose layout owns that frame, and the `admin` segment, which gets a plain admin shell (sidebar, top bar). The root `[locale]` layout keeps only `<html>`, fonts, theme and i18n providers. Hiding the public header with CSS was the cheap alternative; we rejected it because the header still rendered on the server and every new site-wide element would need another exception.

## Consequences

- Moving every public page into `(site)` changes no URLs, but anything new that belongs to the public frame goes in the `(site)` layout, not the root one.
- Admin pages get no announcement bar, consent banner or help widget.
