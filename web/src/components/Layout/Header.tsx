"use client";

import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft } from "lucide-react";
import { UserProfile } from "@/components/auth/UserProfile";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
}

export function Header({
  title = "Dashboard",
  subtitle,
  onMenuToggle,
  showBackButton = false,
  onBackClick,
  backButtonText = "Back"
}: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left Section: Menu Button + Back Button + Title */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Only visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Back Button */}
          {showBackButton && onBackClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButtonText}
            </Button>
          )}

          {/* Title Section */}
          {title && (
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Action Buttons - Responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
