import React, { useEffect, useState } from 'react';
import Header from '../common/Header';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';
import { FaPen,FaTrash } from "react-icons/fa";
// import { searchFunction } from '../Entity/SearchEntity';
// import GalleryHeader from './GalleryHeader';
// import { useLoading } from '../Context/LoadingContext';
import { useLocation, useNavigate } from 'react-router-dom';
// import Loader from '../common/Loader';
import axios from 'axios';
import InnerHeader from './GalleryHeader';
// import { DeleteEntity } from '../utils/Delete';
// import { handleSort } from '../utils/sorting';

const GalleryList = () => {
    const navigate=useNavigate();
    const [gallery,setgallery]=useState([])
    const location = useLocation();
    // const { isLoading, setIsLoading } = useLoading();
    const [filteredgallery, setFilteredgallery] = useState(gallery);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    useEffect(()=>{
        fetchGallery()
    },[])

    const fetchGallery=async()=>{
        try {
            const response=
            console.log(response.data)
            setgallery(response.data)
            setFilteredgallery(response.data)
        } catch (error) {
            console.error("Error fetching galleries:", error);
        }
    }

    useEffect(() => {
        // setIsLoading(true);
    
        const timer = setTimeout(() => {
        //   setIsLoading(false);
        }, 1000); 
    
        return () => clearTimeout(timer);
      }, [location]);
    //   }, [location, setIsLoading]);

    // for searching
    const handleSearch = (event) => {
        
    };

    // for sorting
    const sortData = (key) => {
        // handleSort(filteredgallery,key,sortConfig,setSortConfig,setFilteredgallery)
    };

    // Calculate paginated gallery
    const indexOfLastgallery = currentPage * itemsPerPage;
    const indexOfFirstgallery = indexOfLastgallery - itemsPerPage;
    const currentgallery = filteredgallery.slice(indexOfFirstgallery, indexOfLastgallery);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredgallery.length / itemsPerPage);

    // for delete
    // const handledelete = async (id) => {
    //     const success = await DeleteEntity("Gallery", id);
    //     if (success) {
    //         const updatedgallery = gallery.filter((gallery) => gallery.id !== id);
    //         setgallery(updatedgallery);
    //         setFilteredgallery(updatedgallery);
    //     }
    // };

    // for update
    // const updateGallery=(id)=>{
    //     navigate('/create-gallery',{state:{id:id}})
    // }

    return (
        <div>
            {/* {isLoading && <Loader />} */}
            <div className="h-screen flex">

                <div className="flex flex-1 flex-col bg-[#f7fbff]">
                    {/* Header */}
                    <Header />
                    {/* Searching, sorting, and main content area */}
                    <InnerHeader onSearch={handleSearch} />
                    {/* Card */}
                    <div className="py-6 px-6 h-full w-[1000px] overflow-scroll scrollbar-none">
                        <div className="bg-white w-full rounded-xl border border-[#EAE5FF] py-4 px-3 overflow-x-auto scrollbar-none">
                            <div className="relative sm:rounded-lg">
                                <table className="min-w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-50 text-xs uppercase font-medium text-white">
                                        <tr>
                                            <th className="px-4 py-3 min-w-[100px]">
                                                Sr. No
                                                <div className="inline-flex items-center ml-2">
                                                    <GoArrowUp className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('slno')} />
                                                    <GoArrowDown className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('slno')} />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 min-w-[150px]"> Gallery Image</th>
                                            <th className="px-4 py-3 min-w-[150px]">
                                                Property Title 
                                                <div className="inline-flex items-center ml-2">
                                                    <GoArrowUp className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('name')} />
                                                    <GoArrowDown className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('name')} />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 min-w-[150px]">
                                                Category Title 
                                                <div className="inline-flex items-center ml-2">
                                                    <GoArrowUp className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('name')} />
                                                    <GoArrowDown className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('name')} />
                                                </div>
                                            </th>
                                            
                                            <th className="px-4 py-3 min-w-[100px]">
                                                Gallery Status
                                                <div className="inline-flex items-center ml-2">
                                                    <GoArrowUp className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                                                    <GoArrowDown className="text-white hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 min-w-[100px]"> Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentgallery.length > 0 ? (
                                            currentgallery.map((gallery, index) => (
                                            <tr key={gallery.id}>
                                                <td className="px-4 py-3">{index + 1 + indexOfFirstgallery}</td>
                                                
                                                <td className="px-4 py-3">
                                                    {gallery.img && gallery.img.trim() !== '' ? (
                                                        <img src={gallery.img} className="w-16 h-16 object-cover rounded-full" height={50} width={50} loading="lazy" alt="" onError={(e) => {
                                                            if (e.target.src !== 'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg') {
                                                                e.target.src = 'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg';
                                                            }
                                                        }} />
                                                    ) : (
                                                        <img src={'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg'} height={50} width={50} loading="lazy" alt="" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{gallery?.pid || "N/A"}</td>
                                                <td className="px-4 py-3">{gallery?.cat_id || "N/A"}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-3 py-1 text-sm rounded-full ${gallery.status === 1 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                                                    >
                                                        {gallery.status === 1 ? "publish" : "unpublish"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button className="bg-[#2dce89] text-white p-2 rounded-full hover:bg-green-600 transition mr-2" >
                                                        <FaPen />
                                                    </button>
                                                    <button className="bg-[#f5365c] text-white p-2 rounded-full hover:bg-red-600 transition" >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center">
                                                    No data available
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bottom-0 left-0 w-full bg-[#f7fbff] py-4 flex justify-between items-center">
                            <span className="text-sm font-normal text-gray-500">
                                Showing <span className="font-semibold text-gray-900">{indexOfFirstgallery + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastgallery, filteredgallery.length)}</span> of <span className="font-semibold text-gray-900">{filteredgallery.length}</span>
                            </span>
                            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 gap-3">
                                <li>
                                    <button onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)} className="previous-button" disabled={currentPage === 1}>
                                        <img src="/image/action/Left Arrow.svg" alt="Left" /> Previous
                                    </button>
                                </li>
                                <li>
                                    <span className="current-page">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </li>
                                <li>
                                    <button onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)} className="next-button" disabled={currentPage === totalPages}>
                                        Next <img src="/image/action/Right Arrow (1).svg" alt="Right" />
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryList;