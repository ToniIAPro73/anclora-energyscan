# Google Search Console verification — spec v1

## Goal

Allow Google Search Console to verify the `https://energyscan.anclora.com/` URL-prefix property using the supplied HTML meta tag.

## Requirement

The global document `<head>` must include exactly this verification value:

```html
<meta name="google-site-verification" content="uPJU4OPp9NK_vDRZh_rQyFDkhSic0t8cv045WSNE96I" />
```

## Acceptance criteria

- The tag is rendered in the document head on the public home page.
- The verification value matches the value supplied by Toni exactly.
- Existing document metadata and initialization scripts remain intact.

## Scope

This change only adds the verification meta tag. It does not initiate verification in Search Console.
