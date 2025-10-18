import React from 'react'

const EditingButton = ({variant = "primary", children, onClick, className = ""}) => {
    const baseStyle = "font-medium px-6 py-2 rounded-lg transition-colors";
    const variants = {
        primary: "bg-orange-500 hover:bg-orange-600 text-[white]",
        secondary: "bg-gray-400 hover:bg-gray-500 text-[white]",
    }
  return (
    <button onClick = {onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
        {children}
    </button>
  )
}

export default EditingButton
