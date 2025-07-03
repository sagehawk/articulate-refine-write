
import { cn } from "@/lib/utils";

export const slideInFromLeft = "animate-in slide-in-from-left duration-300 ease-out";
export const fadeIn = "animate-in fade-in duration-500 ease-out";
export const slideUp = "animate-in slide-in-from-bottom duration-400 ease-out";

export const AnimatedContainer = ({ 
  children, 
  className,
  animation = fadeIn 
}: { 
  children: React.ReactNode;
  className?: string;
  animation?: string;
}) => {
  return (
    <div className={cn(animation, className)}>
      {children}
    </div>
  );
};
