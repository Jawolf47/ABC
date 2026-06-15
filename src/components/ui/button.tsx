import { type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500",
  secondary: "bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-500",
  outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-50 focus:ring-amber-500",
  ghost: "text-zinc-600 hover:bg-zinc-100 focus:ring-zinc-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
  xl: "px-10 py-4 text-lg",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
