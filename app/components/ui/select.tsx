"use client"

import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, placeholder, ...props }, ref) => {
    return (
      <select
        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00B8F0] transition-all"
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }