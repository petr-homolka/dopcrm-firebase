// Malý helper na skládání tříd bez závislosti na clsx — filtruje falsy hodnoty.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
