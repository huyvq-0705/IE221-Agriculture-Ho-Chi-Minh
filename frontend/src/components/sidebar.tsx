"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Menu,
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/agrihcmAdmin", icon: LayoutDashboard },
  { label: "Products", href: "/agrihcmAdmin/products", icon: Package },
  { label: "Orders", href: "/agrihcmAdmin/orders", icon: ShoppingCart },
  { label: "Users", href: "/agrihcmAdmin/users", icon: Users },
  { label: "Blogs", href: "/agrihcmAdmin/blogs", icon: FileText },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onClick}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className="w-full justify-start gap-3"
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{item.label}</span>
      </Button>
    </Link>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen sticky top-0 w-64 shrink-0 border-r bg-background">
      <div className="flex w-full flex-col">
        <div className="h-14 px-4 flex items-center font-semibold">
          <Link href="/agrihcmAdmin" className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              A
            </span>
            <span className="tracking-tight">AgriHCM Admin</span>
          </Link>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={
                  pathname === item.href || pathname?.startsWith(item.href + "/")
                }
              />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

function MobileTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden h-14 w-full border-b bg-background sticky top-0 z-30 flex items-center px-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="h-14 px-4 flex items-center font-semibold">
            <Link
              href="/agrihcmAdmin"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                A
              </span>
              <span className="tracking-tight">AgriHCM Admin</span>
            </Link>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-3.5rem)] px-2 py-3">
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/")
                  }
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="ml-3 font-semibold">AgriHCM Admin</div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative">
        {/* Mobile top bar + sheet */}
        <MobileTopbar />
        {/* Desktop sidebar */}
        <DesktopSidebar />
      </div>
    </TooltipProvider>
  );
}
