import React, { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ImageUploader from '../../common/ImageUploader';
import { useForm } from 'react-hook-form';

const AdminDeliveryZoneAdd = () => {
  const {  register,  handleSubmit,  setValue,  formState: { errors },  trigger,} = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [formData, setFormData] = useState({title: '', status: '', category_image_cover: null,category_image_small:null});
  const handleImageUploadSuccess = (imageUrl) => {
    setFormData((prevData) => ({ ...prevData, img: imageUrl }));
    setValue('img', imageUrl, { shouldValidate: true });
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setValue(name, value, { shouldValidate: true });
    await trigger(name);
  };

  const onSubmit = async (data) => {
    console.log(formData);
    try {
      const payload = { ...data, img: formData.img || null, id: id || undefined };

      if (id) {
        console.log('Editing category:', payload);
        NotificationManager.success('Category updated successfully');
      } else {
        console.log('Adding new category:', payload);
        NotificationManager.success('Category added successfully');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      NotificationManager.error('Failed to save category. Please try again.');
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/category/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch category details');
          }
          const fetchedData = await response.json();
          setFormData(fetchedData);
          Object.entries(fetchedData).forEach(([key, value]) => setValue(key, value));
        } catch (error) {
          console.error('Error fetching category details:', error);
          NotificationManager.error('Failed to load category details.');
        }
      };
      fetchData();
    }
  }, [id, setValue]);
  
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
                <h2  className="text-lg font-semibold ml-4"   style={{ color: '#000000', fontSize: '24px', fontFamily: 'Montserrat' }}  > Category Management  </h2>
              </div>

              <div className="h-full px-6 max-w-5xl">
                <div className="bg-white h-[67vh] w-full rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    {/* Category Name */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="title"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]"> Category Name <span className='text-red-500'>*</span></label>
                        <input  id="title"  name="title"  {...register('title', { required: 'Category name is required' })}  value={formData.title}  type="text"  className="border rounded-lg p-3 mt-1 w-full h-14"  style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}  onChange={handleChange}  placeholder="Enter Category Title"/>
                        {errors.title && (  <p className="text-red-500 text-sm text-start">{errors.title.message}</p>   )}
                      </div>
                    </div>

                    {/* Category Status */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label  htmlFor="category_status"  className="text-sm font-medium text-start text-[12px] font-[Montserrat]">  Menu Category Status<span className='text-red-500'>*</span></label>
                        <select   id="category_status"   name="status"   {...register('status', { required: 'Category status is required' })}   value={formData.status}   onChange={handleChange}   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" >
                          <option value="" disabled> Select Status </option>
                          <option value="1">Publish</option>
                          <option value="0">Unpublish</option>
                        </select>
                        {errors.status && (  <p className="text-red-500 text-sm text-start">{errors.status.message}</p>)}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button   type="submit"   className={`py-2 mt-6 float-start ${     id ? 'bg-green-500 hover:bg-green-600' : 'bg-[#393185] hover:bg-[#393185]'   } text-white rounded-lg w-[150px] h-12 font-[Montserrat] font-bold`}   style={{ borderRadius: '8px' }} >   {id ? 'Edit Menu Category' : 'Add Category'}  </button>
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

export default AdminDeliveryZoneAdd;
