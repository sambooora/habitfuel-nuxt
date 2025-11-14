export const themeLight: Record<string, string> = {
  '--bg': '#ffffff',
  '--fg': '#111827',
  '--muted': '#6b7280',
  '--card': '#f9fafb',
  '--border': '#e5e7eb',
}

export const themeDark: Record<string, string> = {
  '--bg': '#0b1220',
  '--fg': '#e5e7eb',
  '--muted': '#9ca3af',
  '--card': '#111827',
  '--border': '#1f2937',
}

export function applyThemeVars(root: HTMLElement, vars: Record<string, string>) {
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val)
  }
}