"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, type MouseEvent, type ReactNode } from "react";

type SectionLinkProps = {
  hash: string;
  children: ReactNode;
  className?: string;
};

// Links to a section on the home page. Guarantees the scroll happens whether you are
// already on "/" or arriving from any other page, because Next.js hash navigation
// alone is not reliable across a route change.
export function SectionLink({ hash, children, className }: SectionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const target = `/#${hash}`;

  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === "/") {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      router.push(target);
      let tries = 0;
      const id = window.setInterval(() => {
        tries += 1;
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          window.clearInterval(id);
        } else if (tries > 20) {
          window.clearInterval(id);
        }
      }, 80);
    },
    [hash, pathname, router],
  );

  return (
    <a href={target} onClick={onClick} className={className}>
      {children}
    </a>
  );
}