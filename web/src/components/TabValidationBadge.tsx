import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface TabValidationBadgeProps {
  isValid: boolean;
  hasWarnings: boolean;
  hasErrors: boolean;
}

export function TabValidationBadge({
  isValid,
  hasWarnings,
  hasErrors,
}: TabValidationBadgeProps) {
  if (hasErrors || !isValid) {
    return (
      <XCircle className="h-4 w-4 text-destructive inline-block ml-1.5" />
    );
  }

  if (hasWarnings) {
    return (
      <AlertCircle className="h-4 w-4 text-amber-500 inline-block ml-1.5" />
    );
  }

  return (
    <CheckCircle2 className="h-4 w-4 text-green-500 inline-block ml-1.5" />
  );
}
