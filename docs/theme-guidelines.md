# Eventify Theme Principles & Design Guidelines

This document outlines the design principles and technical implementation of the Eventify theming system. Our goal is to ensure that a **single source of truth** controls the application's appearance, allowing for global theme updates by modifying only the CSS path.

## Core Principle: CSS Variables as the Source of Truth

The application's design is driven entire by **CSS Variables** defined in `app/globals.css`.

**Rule #1**: never hardcode hex colors (e.g., `#ffffff`, `#c96442`) in components or pages.
**Rule #2**: Always use the semantic variable names (e.g., `var(--background)`, `var(--primary)`) or their Tailwind/Object equivalents.

### 1. The Root Configuration (`app/globals.css`)

All colors are defined in the `:root` pseudo-class for light mode and `.dark` class for dark mode.

```css
:root {
  /* Base */
  --background: #f5f4ee; /* Warm White */
  --foreground: #3d3929; /* Dark Grey Text */

  /* Sidebar Specific */
  --sidebar: #f5f4ee;
  --sidebar-active: #c96442; /* Terracotta */
  --sidebar-active-fg: #ffffff; /* White */

  /* UI Elements */
  --primary: #c96442;
  --primary-foreground: #ffffff;
  --border: #ebebeb;
}
```

**To change the theme**: Simply update the hex values in `app/globals.css`. The entire app (Sidebar, Admin Panel, Buttons) will update automatically.

---

## 2. Technical Stack Integration

To ensure these variables work seamlessly across our tech stack:

### A. Tailwind CSS (`tailwind.config.js`)

We map Tailwind utility classes to these CSS variables.

- Usage: `bg-background`, `text-primary`, `border-sidebar-border`.

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      primary: {
        DEFAULT: 'var(--primary)',
        foreground: 'var(--primary-foreground)'
      },
      // ...
    }
  }
}
```

### B. JavaScript/MUI (`lib/colors.config.js` & `lib/mui-theme.js`)

For Material UI components that require JS objects, we import the configuration.
**Crucially**, `colors.config.js` mirrors the hex values to ensure server-side rendering and MUI consistency.

> **Note**: If you change a color in `globals.css`, please ensure `lib/colors.config.js` is updated to match if exact hex parity is needed for canvas/JS-only tools.

---

## 3. Component Design Rules

When creating or modifying components (Sidebar, Navbar, Cards):

1.  **Backgrounds**: Use `bg-background` or `bgcolor: 'background.default'`.
2.  **Text**: Use `text-foreground` or `color: 'text.primary'`.
3.  **Active States**: Use `bg-primary` with `text-primary-foreground`.
4.  **Borders**: Use `border-border` or `borderColor: 'divider'`.

### Example: Sidebar Item

❌ **Bad (Hardcoded)**:

```jsx
<Box sx={{ bgcolor: '#c96442', color: 'white' }}> ... </Box>
```

✅ **Good (Themed)**:

```jsx
<Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}> ... </Box>
// OR
<div className="bg-primary text-primary-foreground"> ... </div>
```

---

## 4. Maintenance

- **Changing the Color Scheme**:
  1.  Open `app/globals.css`.
  2.  Modify the Hex codes in `:root`.
  3.  (Optional) Update `lib/colors.config.js` if you need the raw hex values in JS logic.
  4.  Verify the app; all components will reflect the new colors instantly.

This architecture ensures Eventify remains visually consistent and easily themeable.
