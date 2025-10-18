import React from 'react'
import noInfoCar from "./../../../assets/noInfoCar.jpeg"
const ProfileCar = () => {
  return (
    <div className='container max-w-full h-screen bg-[white] flex flex-col items-center '>
        <h1 className='font-bold m-10'>Chưa có thông tin xe</h1>
      <img src={noInfoCar} alt="" className='w-[80rem] rounded-2xl opacity-50' />
    </div>
  )
}

export default ProfileCar
