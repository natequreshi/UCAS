"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();

  const roleLabel = session?.user?.role
    ? (ROLE_LABELS[session.user.role] ?? session.user.role)
    : "";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-white">
      {/* Page title area */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 leading-none">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <Button variant="ghost" size="icon" className="relative text-gray-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors outline-none">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {session?.user?.name ? initials(session.user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {session?.user?.name ?? "Loading…"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
                <Badge variant="secondary" className="w-fit mt-1 text-xs">
                  {roleLabel}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
