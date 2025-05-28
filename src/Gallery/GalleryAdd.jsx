import React, { useEffect, useState } from 'react'
import Header from '../common/Header'
import { Link, useNavigate } from 'react-router-dom'
import { useLoading } from '../Context/LoadingContext';
import { useLocation } from 'react-router-dom';
// import Loader from '../common/Loader';
import axios from 'axios';
import ImageUploader from '../common/ImageUploader';
import { useForm } from 'react-hook-form';
import api from "../utils/api"
const GalleryAdd = () => {
  const {  register,  handleSubmit,  setValue,clearErrors,  formState: { errors },  trigger,} = useForm();
  const navigate = useNavigate();
  const location=useLocation()
  const id = location.state ? location.state.id : null;
  // const { isLoading, setIsLoading } = useLoading();
  const [image, setImage] = useState(null);
  const [Products, setProducts] = useState([]);
  const [galleryCategory, setgalleryCategory] = useState([]);
  const [formData, setFormData] = useState({ id : id || null,    pid: '',    cat_id: '',    img: '',    status: '',  });

  useEffect(() => {
    // setIsLoading(true);

    const timer = setTimeout(() => {
      // setIsLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [location]);
  // }, [location, setIsLoading]);

  useEffect(() => {
    if(id){
      fetchGallery(id)
    }
    const fetchProducts = async () => {
      try {
        const response = await api.get('/product/all', {
          withCredentials: true,
      });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching Products:', error);
      }
    };

    const fetchGalleryCategory=async()=>{
      try {
          const response=await api.get(`/category/all`)
          setgalleryCategory(response.data)
      } catch (error) {
          console.error("Error fetching galleries:", error);
      }
  }

    fetchProducts();
    fetchGalleryCategory();
  }, []);

  const fetchGallery=async(id)=>{
    try {
      const response=await api.get(`/galleries/${id}`)
      const gallery=response.data;
      setFormData({
        id,
        pid : gallery.pid,
        cat_id : gallery.cat_id,
        img: gallery.img,
        status: gallery.status,
      })
    } catch (error) {
      
    }
  }

  const handleChange = async(e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      id : prevData.id
    }));
    setValue(name,value,{shouldValidate:true});
    await trigger(name)
  };

  const handleImageUploadSuccess = (imageUrl) => {
    setFormData((prevData) => ({
      ...prevData,
      img: imageUrl,
    }));
    setValue('img',imageUrl,{shouldValidate:true})
    clearErrors('img')
  };

  const onsubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    try {
      const response = await api.post("/galleries/upsert",
         formData
         ,
         {
          withCredentials: true, 
        }
        );
      console.log("Gallery added successfully:", response.data);
      alert("Gallery added successfully!");
      // navigate("/gallery-list");
    } catch (error) {
      console.error("Error adding Gallery:", error);
      alert("An error occurred while adding the Gallery.");
    }
  };

  return (
    <div>
      {/* {isLoading && <Loader />} */}
      <div className="flex bg-[#f7fbff]">
      
      <main className="flex-grow">
        <Header />
        <div className="container mx-auto">
          <div className="flex items-center mt-6  mb-4">
            {/* <Link to="/rolesList" className="cursor-pointer ml-6">
              
            </Link> */}
            <h2 className="text-lg font-semibold ml-4 header" >Gallery Management</h2>
          </div>

          {/* Form Container */}
          <div className="h-full px-6 max-w-5xl" style={{paddingTop:'24px'}}> 
            <div className="bg-white h-[70vh] w-full rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto " style={{scrollbarWidth:'none'}} >
              <form className="mt-4" onSubmit={handleSubmit(onsubmit)}>
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1  mt-6">
                <div className="flex flex-col">
                    <label  htmlFor="pid"   className="text-sm font-medium text-start text-[12px] font-[Montserrat]" > Select Product </label>
                    <select  name="pid"  id="pid" {...register('pid',{required:"Product is required"})}  value={formData.pid} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" onChange={handleChange} >
                      <option value="" disabled selected>Select Product</option>
                        {
                          Products.map((Products) => (
                            <option key={Products.id} value={Products.id}>
                              {Products.title}
                            </option>
                          )
                        )}
                    </select>
                    {errors.pid && (<p className='text-red-500 text-sm text-start'>{errors.pid.message}</p>)}
                  </div>
                                  
                </div>
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1  mt-6">
                <div className="flex flex-col">
                    <label  htmlFor="cat_id"   className="text-sm font-medium text-start text-[12px] font-[Montserrat]" > Select Gallery Category </label>
                    <select  name="cat_id" {...register('cat_id',{required:"Gallery Category is required"})} id="cat_id" value={formData.cat_id} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" onChange={handleChange} >
                      <option value="" disabled selected>Choose Gallery Category</option>
                      {
                          galleryCategory.map((galleryCategory) => (
                            <option key={galleryCategory.id} value={galleryCategory.id}>
                              {galleryCategory.title}
                            </option>
                          )
                        )}            
                    </select>
                    {errors.cat_id && (<p className='text-red-500 text-sm text-start'>{errors.cat_id.message}</p>)}
                  </div>
                </div>
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                    {/* facility image*/}
                    <div className="flex flex-col">
                      <label  htmlFor="img"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]">Gallery  Image</label>
                      <input type="file" id='img' name='img' onChange={handleChange} />
                      {formData.img && (
                      <div className="mt-4">
                        <img
                          src={formData.img}
                          alt="Uploaded Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    </div>
                    
                </div>

                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                  {/* gallery Status */}
                  <div className="flex flex-col">
                    <label  htmlFor="status"   className="text-sm font-medium text-start text-[12px] font-[Montserrat]" >Gallery Status </label>
                    <select  name="status"  {...register('status',{required:"Gallery status is required"})}  id="status" value={formData.status}  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" onChange={handleChange} >
                      <option value="" disabled selected>Select Status</option>
                      <option value={1}>Publish</option>
                      <option value={0}>Unpublish</option>
                    </select>
                    {errors.status && (<p className='text-red-500 text-sm text-start'>{errors.status.message}</p>)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-start mt-6 gap-3">
                <button   type="submit"   className={`py-2 mt-6 float-start ${     id ? 'bg-green-500 hover:bg-green-600' : 'bg-[#393185] hover:bg-[#393185]'   } text-white rounded-lg w-[150px] h-12 font-[Montserrat] font-bold`}   style={{ borderRadius: '8px' }} >   {id ? 'Edit Menu Gallery' : 'Add Gallery'}  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
        {/* Footer */}
        {/* <Footer /> */}
      </main>
    </div>
    </div>
  )
}

export default GalleryAdd