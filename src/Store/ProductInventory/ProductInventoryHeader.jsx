import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const InnerHeader = ({ onSearch, name }) => {
    const navigate=useNavigate();
  return (
    <div>
        <div>
            <div className="bg-[#f7fbff] p-6 w-[1000px]">
                <div className=" flex items-center justify-between h-9" style={{ height: "36px" }}>
                    <div className="flex items-center mt-6  mb-4">
                        <Link onClick={() => { navigate(-1) }} className="cursor-pointer ml-6">
                            <ArrowBackIosNewIcon />
                        </Link>
                        <h2 className="text-lg font-semibold ml-4 " style={{ color: '#000000', fontSize: '24px', fontFamily: 'Montserrat' }}>{name}</h2>
                    </div>
                    <div className=' flex items-center gap-3'>
                        <div className="hidden sm:flex  items-center border border-input rounded-lg bg-white shadow-sm top-[104px] h-9 opacity-100 " style={{ border: '1px solid #EAE5FF', boxShadow: '0px 0px 1px 1px #00000033' }}>
                            <input type="search" placeholder="Search" className="outline-none text-sm placeholder-gray-600 px-3 py-2 rounded-l-lg font-[Montserrat] h-9 w-[300px]" style={{ borderRadius: '8px 0 0 8px' }} onChange={onSearch} />
                            <img src="/image/action/search-normal.svg" alt="Search" className="w-9 h-5 text-[#131313]" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default InnerHeader