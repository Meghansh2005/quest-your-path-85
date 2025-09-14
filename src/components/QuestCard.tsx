import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuestCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "primary" | "secondary";
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const QuestCard = ({ 
  children, 
  onClick, 
  className, 
  variant = "default",
  disabled = false,
  style
}: QuestCardProps) => {
  const variants = {
    default: "quest-card",
    primary: "quest-card border-2 border-primary/30 shadow-primary",
    secondary: "quest-card border-2 border-secondary/30 shadow-secondary",
  };

  return (
    <div
      className={cn(
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && onClick && "hover:scale-[1.02]",
        className
      )}
      onClick={!disabled ? onClick : undefined}
      style={style}
    >
      {children}
    </div>
  );
};