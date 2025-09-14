import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  variant?: "primary" | "secondary" | "success";
}

export const ProgressBar = ({ progress, className, variant = "primary" }: ProgressBarProps) => {
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-quest-success",
  };

  return (
    <div className={cn("w-full bg-muted rounded-full h-3 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full progress-fill rounded-full transition-all duration-700 ease-out",
          variants[variant]
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};