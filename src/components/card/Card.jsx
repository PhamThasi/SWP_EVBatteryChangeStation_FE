import React from 'react'         
const Card = ({children, className = ""}) => {
  return (
    <div className={`bg-white p-6 w-full max-w-7xl rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  )
}

export default Card
