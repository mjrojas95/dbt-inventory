"use client"

import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, placeholder, ...props }, ref) => {
    return (
      <select
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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