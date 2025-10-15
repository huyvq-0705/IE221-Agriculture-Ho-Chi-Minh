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
  UserPlus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth();

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
                  Bài viết
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
                  Về chúng tôi
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/about/contact"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  Liên hệ
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/carts"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-700 hover:underline underline-offset-4 transition-colors"
                >
                  Giỏ hàng
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* PHẦN HIỂN THỊ ĐỘNG */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={'/profile'}>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </span>
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                    </svg>
                  </span>
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Button asChild className="rounded-full px-5 py-2">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="rounded-full bg-emerald-600 px-5 py-2 hover:bg-emerald-700">
                <Link href="/auth/signup">Đăng ký</Link>
              </Button>
            </div>
          )}
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
                  Trang chủ
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
                  Bài viết
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
                  Về chúng tôi
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
                  Liên hệ
                </Link>
              </nav>

              {/* Sticky CTA area */}
              <div className="sticky bottom-0 mt-2 border-t bg-white/80 backdrop-blur-md px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] space-y-3">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full h-11 rounded-full text-base">
                    <Link href="/auth/login" className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Đăng nhập
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full h-11 rounded-full text-base bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/auth/signup" className="flex items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Đăng ký
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
