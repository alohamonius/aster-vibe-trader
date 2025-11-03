"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bot,
  TrendingUp,
  History,
  Activity,
  FileText,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Bots",
    href: "/bots",
    icon: Bot,
  },
  {
    name: "Positions",
    href: "/positions",
    icon: TrendingUp,
  },
  {
    name: "Trading History",
    href: "/history",
    icon: History,
  },
  {
    name: "Logs",
    href: "/logs",
    icon: FileText,
  },
  {
    name: "Statistics",
    href: "/stats",
    icon: Activity,
  },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-card border-r", className)}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Gladiaster"
            width={32}
            height={32}
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Gladiaster</h1>
            <p className="text-xs text-muted-foreground">AI Trading</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={onClose}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary text-primary-foreground"
                )}
                size="sm"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
