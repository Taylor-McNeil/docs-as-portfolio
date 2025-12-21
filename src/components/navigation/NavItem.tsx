"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MethodBadge } from "./MethodBadge";

type Method = "GET" | "POST" | "PUT" | "PATCH";

interface NavItemProps {
  href: string;
  label: string;
  method: Method;
}

const activeStyles: Record<Method, string> = {
  GET: "bg-method-get-bg text-method-get",
  POST: "bg-method-post-bg text-method-post",
  PUT: "bg-method-put-bg text-method-put",
  PATCH: "bg-method-patch-bg text-method-patch",
};

export function NavItem({ href, label, method }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
          isActive
            ? `${activeStyles[method]} font-semibold`
            : "text-foreground hover:bg-surface-card font-medium"
        }`}
      >
        <MethodBadge method={method} active={isActive} />
        <span className="ml-2">{label}</span>
      </Link>
    </li>
  );
}