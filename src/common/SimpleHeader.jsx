import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const SimpleHeader = ({ onSearch, name }) => {
    const navigate=useNavigate();
  return (
    <div className="bg-[#f7fbff] p-6 w-full">
        <div>
            <div >
                <div className=" flex items-center justify-between h-9" style={{ height: "36px" }}>
                    <div className="flex items-center mt-6  mb-4">
                        <Link onClick={() => { navigate(-1) }} className="cursor-pointer  text-[#393185]">
                            <ArrowBackIosNewIcon />
                        </Link>
                        <h2 className="text-lg font-semibold ml-4 " style={{ color: '#393185', fontSize: '24px', fontFamily: 'Montserrat' }}>{name}</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SimpleHeader