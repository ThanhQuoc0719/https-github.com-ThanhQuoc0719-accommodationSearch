import React, { useState, useEffect } from 'react';
import axiosClient from '../../apis/axiosClient';
import "./profile.css";
import { notification } from 'antd';
import uploadFileApi from '../../apis/uploadFileApi';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    avatar: '',
    username: '',
    status: '',
    selfIntroduction: ''
  });

  const [message, setMessage] = useState('');

  const openNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const local = localStorage.getItem("user");
      const user = JSON.parse(local);
      try {
        const response = await axiosClient.get(`/users/${user.id}`);
        const userData = response;
        setFormData({
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          avatar: userData.avatar || '',
          username: userData.username || '',
          status: userData.status || '',
          selfIntroduction: userData.selfIntroduction || ''

        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const local = localStorage.getItem("user");
    const user = JSON.parse(local);
    try {
      const response = await axiosClient.put(`/users/${user.id}`, formData);
      setMessage('Cập nhật thành công!');
      openNotification('success', 'Cập nhật thành công!', 'Thông tin tài khoản đã được cập nhật.');

      console.log(response.data);
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi cập nhật!');
      openNotification('error', 'Cập nhật thất bại!', 'Đã xảy ra lỗi khi cập nhật thông tin.');

      console.error(error);
    }
  };

  const handleFileChange = async (e) => {
    try {
      const downloadURL = await uploadFileApi.uploadFile(e);
      setFormData({
        ...formData,
        avatar: downloadURL,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      openNotification('error', 'Tải lên thất bại!', 'Đã xảy ra lỗi khi tải lên ảnh.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200 py-3">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Thông tin tài khoản</h2>
        {formData.avatar && (
          <div className="mb-4 text-center">
            <img src={formData.avatar} alt="Avatar" className="w-32 h-32 rounded-full mx-auto" />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Ảnh đại diện</label>
            <input
              type="file"
              name="avatar"
              onChange={handleFileChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Giới thiệu bản thân</label>
            <textarea
              name="selfIntroduction"
              value={formData.selfIntroduction}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
         
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
