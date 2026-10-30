/** Shared active-state logic for sidebar and mobile drawer nav. */
export function isActiveNavItem(href: string, activePath: string): boolean {
  if (href === "/") return activePath === "/";
  // The API reference index is a hub; its spec pages have their own entries.
  if (href === "/reference") return activePath === href;
  return activePath === href || activePath.startsWith(`${href}/`);
}
