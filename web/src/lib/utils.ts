import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get provider logo
export const getProviderLogo = (provider: string) => {
  const providerLower = provider.toLowerCase();
  const logoMap: Record<string, string> = {
    chatgpt: "/gpt.svg",
    openai: "/gpt.svg",
    deepseek: "/deepseek.svg",
    claude: "/claude.svg",
    anthropic: "/claude.svg",
    gladiaster: "/gladiaster.png",
  };
  return logoMap[providerLower] || "/gpt.svg";
};
