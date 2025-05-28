import React, { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import api from "../utils/api"
const DeliveryAdd = () => {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors }, 
    trigger 
  } = useForm();

  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id || null; // Check for location.state more succinctly.

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    de_digit: '',
    status: '',
  });

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setValue(name, value, { shouldValidate: true });
    await trigger(name); 
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const form = new FormData();
      form.append('title', data.title);
      form.append('status', data.status);
      form.append('de_digit', data.de_digit);

      if (id) {
        form.append('id', id);
      }

      // Corrected spelling in the endpoint.
      await api.post("/delivery/upsert", form, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      NotificationManager.removeAll();
      NotificationManager.success(
        id ? 'Delivery updated successfully!' : 'Delivery added successfully!'
      );

      setTimeout(() => {
        navigate('/delivery-list');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      NotificationManager.removeAll();
      NotificationManager.error(
        id ? 'Failed to update delivery.' : 'Failed to add delivery.'
      );
    }
  };

  // Fetch existing delivery details if editing
  useEffect(() => {
    if (id) {
      const fetchDeliveryData = async () => {
        try {
          const response = await api.get(`/delivery/getbyid/${id}`);
          const fetchedData = response.data;

          setFormData(fetchedData);
          Object.entries(fetchedData).forEach(([key, value]) => setValue(key, value));
        } catch (error) {
          console.error('Error fetching delivery details:', error);
          NotificationManager.error('Failed to load delivery details.');
        }
      };
      fetchDeliveryData();
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
                <h2 
                  className="text-lg font-semibold ml-4" 
                  style={{ color: '#000000', fontSize: '24px', fontFamily: 'Montserrat' }}
                >
                  Delivery Management
                </h2>
              </div>

              <div className="h-full px-6 max-w-5xl">
                <div className="bg-white h-[67vh] w-full rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    {/* Delivery Title */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label 
                          htmlFor="title" 
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          Delivery Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          name="title"
                          {...register('title', { required: 'Delivery Title is required' })}
                          value={formData.title}
                          type="text"
                          className="border rounded-lg p-3 mt-1 w-full h-14"
                          style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}
                          onChange={handleChange}
                          placeholder="Enter delivery title"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm text-start">{errors.title.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Digit */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label 
                          htmlFor="de_digit" 
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          Delivery Digit <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="de_digit"
                          name="de_digit"
                          {...register('de_digit', { required: 'Delivery Digit is required' })}
                          value={formData.de_digit}
                          type="number"
                          className="border rounded-lg p-3 mt-1 w-full h-14"
                          style={{ borderRadius: '8px', border: '1px solid #EAEAFF' }}
                          onChange={handleChange}
                          placeholder="Enter delivery digit"
                        />
                        {errors.de_digit && (
                          <p className="text-red-500 text-sm text-start">{errors.de_digit.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Status */}
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      <div className="flex flex-col">
                        <label 
                          htmlFor="status" 
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          Product Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="status"
                          name="status"
                          {...register('status', { required: 'Delivery Status is required' })}
                          value={formData.status}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="" disabled>
                            Select Product Status
                          </option>
                          <option value="1">Publish</option>
                          <option value="0">Unpublish</option>
                        </select>
                        {errors.status && (
                          <p className="text-red-500 text-sm text-start">{errors.status.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`py-2 mt-6 float-start ${
                        id ? 'bg-green-500 hover:bg-green-600' : 'bg-[#393185] hover:bg-[#6e66bd]'
                      } text-white rounded-lg w-[150px] h-12 font-[Montserrat] font-bold`}
                      style={{ borderRadius: '8px' }}
                    >
                      {id ? 'Edit Delivery' : 'Add Delivery'}
                    </button>
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

export default DeliveryAdd;
