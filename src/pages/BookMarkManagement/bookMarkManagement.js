import {
  EditOutlined
} from '@ant-design/icons';
import {
  Breadcrumb, Button, Card,
  Form,
  message,
  notification,
  Row,
  Select,
  Spin, Table
} from "antd";
import L from "leaflet";
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import bookmarkApi from '../../apis/bookmarkApi';
import roomApi from "../../apis/roomApi";
import { getItemFromLocalStorage } from "../../apis/storageService";
import uploadFileApi from "../../apis/uploadFileApi";
import "./bookMarkManagement.css";
const { Option } = Select;


const BookMarkManagement = (props) => {

  const [orderList, setOrderList] = useState([]);
 
  
  const handleUnBookMark = async (roomId) => {
    try {
      const userId = getItemFromLocalStorage("user");

        await bookmarkApi.unbookmarkRoom(userId.id, roomId);
        
        message.success('Đã hủy yêu thích phòng này');
        
       
        handleList();
    } catch (error) {
        message.error('Đã xảy ra lỗi khi hủy yêu thích phòng');
        console.error('Failed to unbookmark room', error);
    }
};

  const columns = [
    {
      title: "Tên dãy trọ",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room?.title}</span>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room?.preciseAddress}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room?.description}</span>
      ),
    },

    {
      title: "Danh mục",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room?.category?.name}</span>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room?.contactInfo}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div>
          <Row>
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ width: 150, borderRadius: 15, height: 30 }}
              onClick={() => handleUnBookMark(record.room.id)}
            >{"Hủy yêu thích"}
            </Button>
            
          </Row>
        </div >
      ),
    },
  ];

  const handleList = () => {
    (async () => {
      try {
        const user = getItemFromLocalStorage("user");

        await bookmarkApi.getBookmarksByUser(user.id).then((item) => {
          console.log(item);
          setOrderList(item);
        });

      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
  }

  useEffect(() => {
    handleList();

  }, []);


 

  return (
    <div>
      <Spin spinning={false}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>Quản lý yêu thích</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div style={{ marginBottom: 30 }}>
             
              <Card>
                <Table
                  columns={columns}
                  dataSource={orderList}
                  rowKey="id"
                  pagination={{ position: ["bottomCenter"] }}
                />
              </Card>
            </div>
          </div>

        </Card>
      </Spin>
    </div>
  );
};

export default BookMarkManagement;
