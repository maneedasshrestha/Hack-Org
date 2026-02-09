import type { LinkProps } from "next/link";

import Link from "next/link";

// ----------------------------------------------------------------------

interface RouterLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  ref?: React.RefObject<HTMLAnchorElement | null>;
}

export function RouterLink({ href, ref, ...other }: RouterLinkProps) {
  return <Link ref={ref} href={href} {...other} />;
}
