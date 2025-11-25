"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CartSheet from "@/components/CartSheet";
import { useLoginRequiredToast } from "@/components/LoginRequiredToast";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Menu,
  Home,
  BookOpen,
  Info,
  Phone,
  LogIn,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showLoginToast } = useLoginRequiredToast();

  if (pathname?.startsWith("/checkout")) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  const mobileLinkBase =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors";

  const handleCartButton = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!user) {
      showLoginToast();
      return;
    }
    setCartOpen(true);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-xl md:text-2xl font-extrabold tracking-tight text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          AgriHCM
        </Link>

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
                <button
                  onClick={handleCartButton}
                  className="relative flex items-center justify-center text-gray-700 hover:text-emerald-700 transition-colors"
                  title="Giỏ hàng"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar>
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.username ?? "User"} />
                    ) : null}
                    <AvatarFallback>
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.username ?? "User"}</span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={"/profile"}>
                    <span className="flex items-center gap-2">Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>

                {/* New: Orders link in dropdown */}
                <DropdownMenuItem asChild>
                  <Link href={"/orders"}>
                    <span className="flex items-center gap-2">Đơn hàng</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  <span className="flex items-center gap-2">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Button asChild className="rounded-full bg-emerald-600 px-5 py-2 hover:bg-emerald-700">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </div>
          )}
        </div>

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
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-lg font-bold tracking-tight text-emerald-600"
              >
                AgriHCM
              </Link>
            </div>

            <div className="flex h-[calc(100dvh-3.5rem)] flex-col justify-between">
              <nav className="px-2 py-4 space-y-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${isActive("/") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"}`}
                >
                  <Home className="h-5 w-5" />
                  Trang chủ
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${isActive("/blog") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"}`}
                >
                  <BookOpen className="h-5 w-5" />
                  Bài viết
                </Link>

                {/* Added: Products link for mobile */}
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${isActive("/products") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Sản Phẩm
                </Link>

                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${isActive("/about") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"}`}
                >
                  <Info className="h-5 w-5" />
                  Về chúng tôi
                </Link>

                <Link
                  href="/about/contact"
                  onClick={() => setOpen(false)}
                  className={`${mobileLinkBase} ${isActive("/about/contact") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"}`}
                >
                  <Phone className="h-5 w-5" />
                  Liên hệ
                </Link>

                {/* Mobile cart button (mirrors desktop) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    handleCartButton();
                  }}
                  className={`${mobileLinkBase} text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 w-full text-left`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng
                </button>
              </nav>

              <div className="sticky bottom-0 mt-2 border-t bg-white/80 backdrop-blur-md px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] space-y-3">
                {/* If user logged in: show profile / orders / logout in mobile bottom area */}
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full h-11 rounded-full text-base">
                        <Link href="/profile" className="flex items-center justify-center gap-2" onClick={() => setOpen(false)}>
                          <UserPlus className="h-5 w-5" />
                          Hồ sơ
                        </Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button asChild className="w-full h-11 rounded-full text-base bg-emerald-50 hover:bg-emerald-100">
                        <Link href="/orders" className="flex items-center justify-center gap-2" onClick={() => setOpen(false)}>
                          <ShoppingCart className="h-5 w-5" />
                          Đơn hàng
                        </Link>
                      </Button>
                    </SheetClose>

                    <Button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="w-full h-11 rounded-full text-base"
                      variant="outline"
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </nav>
  );
}
