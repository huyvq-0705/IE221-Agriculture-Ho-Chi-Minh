"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Menu,
  X,
  Home,
  BookOpen,
  Info,
  Phone,
  LogIn,
  UserPlus
} from "lucide-react"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname?.startsWith(href))

  const mobileLinkBase =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors"

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-extrabold tracking-tight text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          AgriHCM
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  Blog
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/products"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  Sản Phẩm
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/about/contact"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex gap-3">
            <Button asChild className="rounded-full px-5 py-2">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full bg-emerald-600 px-5 py-2 hover:bg-emerald-700">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700 hover:text-emerald-700 rounded-full border border-transparent hover:border-emerald-200"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-full sm:w-80 p-0 bg-white/95 backdrop-blur-md border-l border-emerald-100 data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-lg font-bold tracking-tight text-emerald-600"
              >
                AgriHCM
              </Link>
             
            </div>

            {/* Drawer body */}
            <div className="flex h-[calc(100dvh-3.5rem)] flex-col justify-between">
              <nav className="px-2 py-4 space-y-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${
                    isActive("/")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${
                    isActive("/blog")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  Blog
                </Link>

                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${
                    isActive("/about")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Info className="h-5 w-5" />
                  About
                </Link>

                <Link
                  href="/about/contact"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${
                    isActive("/about/contact")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Phone className="h-5 w-5" />
                  Contact
                </Link>
              </nav>

              {/* Sticky CTA area */}
              <div className="sticky bottom-0 mt-2 border-t bg-white/80 backdrop-blur-md px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] space-y-3">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full h-11 rounded-full text-base">
                    <Link href="/login" className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full h-11 rounded-full text-base bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/signup" className="flex items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Sign up
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
