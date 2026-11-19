"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MethodBadge } from "./MethodBadge";
import { useMobileMenu } from "@/components/layout/MobileMenuContext";
import { Method } from "@/components/content/navigation";

interface NavItemProps {
  href: string;
  label: string;
  method: Method;
  /** Nested entries, rendered indented under this link. */
  children?: ReactNode;
}

const activeStyles: Record<Method, string> = {
  GET: "bg-method-get-bg text-method-get",
  POST: "bg-method-post-bg text-method-post",
  PUT: "bg-method-put-bg text-method-put",
  PATCH: "bg-method-patch-bg text-method-patch",
  HEAD: "bg-method-head-bg text-method-head",
  OPTIONS: "bg-method-options-bg text-method-options",
};

export function NavItem({ href, label, method, children }: NavItemProps) {
  const pathname = usePathname();
  const { close: closeMobileMenu } = useMobileMenu();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        scroll={true}
        onClick={closeMobileMenu}
        className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
          isActive
            ? `${activeStyles[method]} font-semibold`
            : "text-foreground hover:bg-surface-card font-medium"
        }`}
      >
        <MethodBadge method={method} active={isActive} />
        <span className="ml-2">{label}</span>
      </Link>
      {children ? (
        <ul className="mt-1 ml-[18px] space-y-1 border-l border-border pl-2">{children}</ul>
      ) : null}
    </li>
  );
}