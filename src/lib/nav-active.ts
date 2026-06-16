/** Shared active-state logic for sidebar and mobile drawer nav. */
export function isActiveNavItem(href: string, activePath: string): boolean {
  if (href === "/") return activePath === "/";
  if (href === "/docs" || href === "/guides" || href === "/reference") {
    return activePath === href;
  }
  return activePath === href || activePath.startsWith(`${href}/`);
}
