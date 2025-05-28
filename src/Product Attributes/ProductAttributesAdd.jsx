import React, { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import api from "../utils/api"

const ProductAttributesAdd = () => {
  const {  register,  handleSubmit,  setValue,  formState: { errors },  trigger,} = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [product,setProduct]=useState([])
  const [formData, setFormData] = useState({product_id: '', subscribe_price: '',  normal_price: '',  title: '',  discount:'',  out_of_stock:'',subscription_required:''});

  useEffect(()=>{
    if(id){ 
      const fetchProductAttributeById=async()=>{
        try {
          const response=await api.get(`/product-attribute/getbyid/${id}`)
          console.log(response.data)
          const fetchData=response.data
          setFormData(fetchData)
          Object.entries(fetchData).forEach(([key,value])=>setValue(key,value))
        } catch (error) {
            console.error(error)
            NotificationManager.removeAll();
            NotificationManager.error("Failed To load Product Attributes")
        }
      }
      fetchProductAttributeById()
     }
  },[id,setValue])

  useEffect(()=>{
    const fetchProduct=async()=>{
      try {
        const response=await api.get("/product/all");
        setProduct(response.data);
      } catch (error) {
          console.error(error)
          NotificationManager.removeAll()
          NotificationManager.error("Failed Tofetch products")
      }      
    }
    fetchProduct()
  },[])

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setValue(name, value, { shouldValidate: true });
    await trigger(name); 
  };

  const onSubmit = async (data) => {
    try {
      // console.log("Submitted data:", data); // Check the form data passed from react-hook-form
      // Append data from the form
      const form = new FormData();
      form.append('product_id', data.product_id);
      form.append('subscribe_price', data.subscribe_price);
      form.append('normal_price', data.normal_price);
      form.append('title', data.title);
      form.append('discount', data.discount);
      form.append('out_of_stock', data.out_of_stock);
      form.append('subscription_required', data.subscription_required);

      if (id) {
        form.append('id', id);
      }
  
      
      await api.post("/product-attribute/upsert", form, {
        headers: {
          'Content-Type': 'application/json',
      },
      });
  
      NotificationManager.removeAll();
      NotificationManager.success(id ? 'ProductAttribute updated successfully!' : 'ProductAttribute added successfully!');
      setTimeout(() => {
        navigate('/product-attribute-list');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      NotificationManager.removeAll();
      NotificationManager.error(id ? 'Failed to update ProductAttribute.' : 'Failed to add ProductAttribute.');
    }
  };
  
  return (
    <div>
      <div>
        <div className="flex bg-[#f7fbff]">
          <main className="flex-grow">
            <Header />
            <div className="container mx-auto">
              <div className="flex items-center mt-6 mb-4">
                <Link onClick={() => navigate(-1)} className="cursor-pointer ml-6">
                  <ArrowBackIosNewIcon />
                </Link>
                <h2  className="text-lg font-semibold ml-4"   style={{ color: '#000000', fontSize: '24px', fontFamily: 'Montserrat' }}  > Product Attribute Management  </h2>
              </div>

              <div className="h-full px-6 max-w-5xl">
                <div className="bg-white h-[67vh] w-full rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                   
                    {/* select product */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="product_id"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]">  Select product  <span className='text-red-500'>*</span></label>
                        <select   id="product_id"   name="product_id"   {...register('product_id', { required: 'product  is required' })}   value={formData.product_id || ''}   onChange={handleChange}   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" >
                          <option value="" disabled> Select Product  </option>
                          {
                            product.map((product)=>(
                              <option key={product.id} value={product.id}>{product.title} </option>
                            ))
                          }
                        </select>
                        {errors.product && (  <p className="text-red-500 text-sm text-start">{errors.product_id.message}</p>)}
                      </div>
                    </div>

                    {/* Product title */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="title"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> Product Type <span className='text-red-500'>*</span></label>
                        <input  id="title"  name="title"  {...register('title', { required: 'product name is required' })}  value={formData.title}  type="text"  className="border rounded-lg p-3 mt-1 w-full h-14"  style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}  onChange={handleChange}  placeholder="Enter product title"/>
                        {errors.type && (<p className="text-red-500 text-sm text-start">{errors.title.message}</p>   )}
                      </div>
                    </div>

                    {/* product Discount */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="discount"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> Product Discount <span className='text-red-500'>*</span></label>
                        <input  id="discount"  name="discount"  {...register('discount', { required: 'product name is required' })}  value={formData.discount}  discount="text"  className="border rounded-lg p-3 mt-1 w-full h-14"  style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}  onChange={handleChange}  placeholder="Enter product discount"/>
                        {errors.discount && (  <p className="text-red-500 text-sm text-start">{errors.discount.message}</p>   )}
                      </div>
                    </div>
                    
                    {/* product Price */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="subscribe_price"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> Product Price <span className='text-red-500'>*</span></label>
                        <input  id="subscribe_price"  name="subscribe_price"  {...register('subscribe_price', { required: 'product subscribe_price is required' })}  value={formData.subscribe_price}  subscribe_price="text"  className="border rounded-lg p-3 mt-1 w-full h-14"  style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}  onChange={handleChange}  placeholder="Enter product subscribe price"/>
                        {errors.subscribe_price && (  <p className="text-red-500 text-sm text-start">{errors.subscribe_price.message}</p>   )}
                      </div>
                    </div>

                    {/*product subscription_required Price */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="normal_price"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> Product Normal Price <span className='text-red-500'>*</span></label>
                        <input  id="normal_price"  name="normal_price"  {...register('normal_price', { required: 'product name is required' })}  value={formData.normal_price}  type="number"  className="border rounded-lg p-3 mt-1 w-full h-14"  style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}  onChange={handleChange}  placeholder="Enter product  normal price"/>
                        {errors.normal_price && (  <p className="text-red-500 text-sm text-start">{errors.normal_price.message}</p>   )}
                      </div>
                    </div>

                    {/* product Out OF Stock? */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="out_of_stock"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]">  Out OF Stock? <span className='text-red-500'>*</span></label>
                        <select   id="out_of_stock"   name="out_of_stock"   {...register('out_of_stock', { required: 'Product out of stock  is required' })}   value={formData.out_of_stock}   onChange={handleChange}   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" >
                          <option value="" disabled> Select Status </option>
                          <option value="1">Yes</option>
                          <option value="0">No</option>
                          
                        </select>
                        {errors.out_of_stock && (  <p className="text-red-500 text-sm text-start">{errors.out_of_stock.message}</p>)}
                      </div>
                    </div>


                    {/* subscription_required ? */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="subscription_required"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> subscription_required Required?  <span className='text-red-500'>*</span></label>
                        <select  name="subscription_required"  id="subscription_required"  {...register('subscription_required', { required: 'category is required' })}  value={formData.subscription_required || ''}  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" onChange={handleChange}>
                          <option value="" disabled>Select Status</option>
                          <option value="1">Yes</option>
                          <option value="0">No</option>
                        </select>
                        {errors.cat_id && (  <p className="text-red-500 text-sm text-start">{errors.subscription_required.message}</p>   )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button   type="submit"   className={`py-2 mt-6 float-start bg-[#393185] text-white rounded-lg w-[150px] h-12 font-[Montserrat] font-bold`}   style={{ borderRadius: '8px' }} >   {id ? 'Edit Menu product' : 'Add product'}  </button>
                  </form>
                </div>
              </div>
            </div>
          </main>
          <NotificationContainer />
        </div>
      </div>
    </div>
  );
};

export default ProductAttributesAdd;
