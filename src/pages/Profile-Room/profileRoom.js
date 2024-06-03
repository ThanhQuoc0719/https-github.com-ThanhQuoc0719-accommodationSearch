import React, { useState, useEffect } from 'react';
import axiosClient from '../../apis/axiosClient';
import "./profileRoom.css";
import { Image, Card, Table, Col, Row, Spin } from 'antd';
import { getItemFromLocalStorage } from '../../apis/storageService';
import roomApi from '../../apis/roomApi';
import roomCategoryApi from '../../apis/roomCategoryApi';
import moment from 'moment';

const ProfileRoom = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    avatar: '',
    username: '',
    status: '',
    selfIntroduction: ''
  });

  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [category, setCategoryList] = useState([]);

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => (
        <div>
          <Image src={images[0]} width={100} />
        </div>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Địa chỉ",
      dataIndex: "preciseAddress",
      key: "preciseAddress",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <span>{category?.description}</span>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "contactInfo",
      key: "contactInfo",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>{price.toLocaleString("vi", { style: "currency", currency: "VND" })}</span>
      ),
    },
    {
      title: "Diện tích",
      dataIndex: "area",
      key: "area",
      render: (area) => (
        <span>{area} m²</span>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span>{moment(createdAt).format("DD/MM/YYYY HH:mm")}</span>
      ),
    },
  ];

  const fetchUserDetails = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
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

  const fetchRoomData = async () => {
    const user = getItemFromLocalStorage("user");
    try {
      const rooms = await roomApi.getRoomsByUser(user.id);
      setOrderList(rooms);
    } catch (error) {
      console.log("Failed to fetch room data:", error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const categories = await roomCategoryApi.getAllRoomCategories({ page: 1, limit: 10000 });
      setCategoryList(categories);
    } catch (error) {
      console.log("Failed to fetch category data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchUserDetails(), fetchRoomData(), fetchCategoryData()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <Row className='p-4'>
        <Col span={7}>
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Thông tin tài khoản</h2>
            {formData.avatar && (
              <div className="mb-4 text-center">
                <img src={formData.avatar} alt="Avatar" className="w-32 h-32 rounded-full mx-auto" />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold">Email</label>
              <div className="mt-1 p-2 border border-gray-300 rounded-md">{formData.email}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold">Số điện thoại</label>
              <div className="mt-1 p-2 border border-gray-300 rounded-md">{formData.phoneNumber}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold">Tên đăng nhập</label>
              <div className="mt-1 p-2 border border-gray-300 rounded-md">{formData.username}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold">Giới thiệu bản thân</label>
              <div className="mt-1 p-2 border border-gray-300 rounded-md">
                {formData.selfIntroduction ? formData.selfIntroduction : "Không có thông tin"}
              </div>
            </div>
          </div>
        </Col>
        <Col span={1} />
        <Col span={16}>
          <Card title="Danh sách dãy trọ">
            {loading ? (
              <Spin size="large" />
            ) : (
              <Table
                columns={columns}
                dataSource={orderList}
                rowKey="id"
                scroll={{ x: true }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfileRoom;
