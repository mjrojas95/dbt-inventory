"use client"

import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none'
    const variantStyles = {
      primary: 'bg-[#00B8F0] text-white hover:bg-[#0096C3]',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      destructive: 'bg-red-500 text-white hover:bg-red-600'
    }
    const sizeStyles = {
      default: 'px-3 py-1.5',
      sm: 'px-2 py-1 text-sm',
      lg: 'px-4 py-2'
    }

    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }