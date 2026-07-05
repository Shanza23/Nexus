# UI Theme Notes (Milestone 1)

The base repo already ships a well-structured Tailwind theme in `tailwind.config.js`.
Rather than replace it, Week 1 confirms and extends it so every new module (calendar,
video call, documents, payments, security) stays visually consistent.

## Color tokens
| Token       | Use                                      |
|-------------|-------------------------------------------|
| `primary`   | Brand blue — buttons, links, active nav    |
| `secondary` | Teal — secondary accents, "connections"    |
| `accent`    | Amber — highlights (e.g. meeting stat card)|
| `success` / `warning` / `error` | Status colors — badges, alerts |
| `gray`      | Tailwind default — text, borders, surfaces |

Each new feature should pick colors **only** from this palette (e.g. `bg-primary-50`,
`text-success-700`) instead of introducing new hex values, so the whole app reads as
one product.

## Typography
- Font: `Inter var` (declared in `fontFamily.sans`) — falls back to system sans-serif.
- Headings use `font-bold`/`font-semibold` with Tailwind's default type scale
  (`text-2xl` for page titles, `text-lg` for card headers, `text-sm` for body/labels).

## Layout & spacing
- Page content sits inside `DashboardLayout` (`Sidebar` + `Navbar` + scrollable main area).
- Sections use `space-y-6` for vertical rhythm and `grid grid-cols-1 md:grid-cols-{n} gap-4/6`
  for responsive stat cards and multi-column layouts — the same pattern used on both dashboards
  and now reused on the Meetings page.
- Cards always use the shared `Card` primitives — never a raw `<div className="bg-white ...">`.

## Motion
- `animate-fade-in` on page containers, `animate-slide-in` for transient elements —
  already defined as custom keyframes in `tailwind.config.js`. Reused as-is.

## Third-party UI matched to the theme
`react-calendar` ships with its own default styling. Its classes are overridden in
`src/index.css` (`.nexus-calendar` block) to use the `primary`/`secondary` tokens above,
so it doesn't look like a bolted-on widget. Any future third-party UI (video call
controls, e-signature pad, payment forms) should get the same treatment: wrap it in a
custom class and re-point its colors at the existing Tailwind tokens rather than
shipping the library's default look.
