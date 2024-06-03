import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  Breadcrumb, Button, Card, Col, Image,
  Form,
  Input,
  InputNumber,
  Modal,
  PageHeader,
  Row,
  Space,
  Spin, Table, Popconfirm,
  notification,
  Select
} from "antd";
import moment from "moment";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getItemFromLocalStorage } from "../../apis/storageService";
import uploadFileApi from "../../apis/uploadFileApi";
import axiosClient from "../../apis/axiosClient";
import roomTypeApi from "../../apis/roomTypeApi";
import roomApi from "../../apis/roomApi";

import "./roomTypeManagement.css";
import roomCategoryApi from '../../apis/roomCategoryApi';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import iconMarker from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import axios from "axios";
const { Option } = Select;

const center = {
  lat: 13.769393,
  lng: 109.225697,
}

function DraggableMarker({ onWardNameChange }) {
  const [draggable, setDraggable] = useState(false)
  const [position, setPosition] = useState(center)
  const markerRef = useRef(null)
  const [wardName, setWardName] = useState('');

  const sendWardNameToRoomManagement = (newWardName) => {
    onWardNameChange(newWardName);
  };

  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newLatLng = marker.getLatLng();
          localStorage.setItem("location", newLatLng)
          setPosition(newLatLng)

          // Call the OSM API to get the location details
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`);

          // Extract the ward name and set it
          const wardName = response.data.address.suburb;
          const newWardName = response.data.address.suburb;
          setWardName(newWardName);
          // Gọi callback function để gửi wardName cho RoomManagement
          sendWardNameToRoomManagement(newWardName);

          console.log(wardName)
        }
      },
    }),
    [onWardNameChange],
  )


  const icon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow
  });

  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    >
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {draggable
            ? 'Marker is draggable'
            : 'Click here to make marker draggable'}
        </span>
      </Popup>
    </Marker>
  )
}

const RoomTypeManagement = (props) => {

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idRoom, setIdRoom] = useState(true);
  let { id } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const icon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow
  });

  const handleChangeImage = async (e) => {
    setLoading(true);
    const response = await uploadFileApi.uploadFile(e);
    if (response) {
      setUploadFile(response);
    }
    setLoading(false);
  }

  const [file, setUploadFile] = useState();
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);


  const handleOkUser = async (values) => {
    setLoading(true);

    const formData = {
      "name": values.name,
      "description": values.description,
      "price": values.price,
      "area": values.area,
      "images": [file],
      "amenities": values.amenities,
      "status": values.status,
      "user": { "id": getItemFromLocalStorage("user").id },
      "room": { "id": values.room_id},
    };
    try {
      return roomTypeApi.addRoomType(formData).then(response => {
        if (response.error == "Tên phòng trọ đã tồn tại.") {
          setLoading(false);
          return notification["error"]({
            message: `Thông báo`,
            description:
              'Tên phòng trọ đã tồn tại.',

          });
        }

        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description:
              'Tạo phòng trọ thất bại',
          });
        }
        else {
          notification["success"]({
            message: `Thông báo`,
            description:
              'Tạo phòng trọ thành công',
          });
          setOpenModalCreate(false);
          handleList();
        }
      })

    } catch (error) {
      throw error;
    }
  }

  const handleUpdateCategory = async (values) => {
    setLoading(true);
    const formData = {
      "name": values.name,
      "description": values.description,
      "price": values.price,
      "area": values.area,
      "images": [file],
      "amenities": values.amenities,
      "status": values.status,
      "user": { "id": getItemFromLocalStorage("user").id },
      "room": { "id": values.room_id},
    };
    try {
      return roomTypeApi.updateRoomType(idRoom, formData).then(response => {
        if (response.error == "Tên loại phòng trọ đã tồn tại.") {
          setLoading(false);
          return notification["error"]({
            message: `Thông báo`,
            description:
              'Tên loại phòng trọ đã tồn tại.',

          });
        }
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description:
              'Chỉnh sửa phòng trọ thất bại',
          });
        }
        else {
          notification["success"]({
            message: `Thông báo`,
            description:
              'Chỉnh sửa phòng trọ thành công',
          });
          handleList();
          setOpenModalUpdate(false);
        }
      })

    } catch (error) {
      throw error;
    }
  }

  const handleEditCategory = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        setIdRoom(id);
        const response = await roomTypeApi.getRoomTypeById(id);
        if (response) {
          const { price, amenities, name, area, room, description, status} = response;

          // Set các trường về lại form
          form2.setFieldsValue({
            price,
            name,
            area,
            room_id: room.id,
            description,
            status,
            amenities
          });
        }
        console.log(form2);
        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  }

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await roomTypeApi.deleteRoomType(id).then(response => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description:
              'Xóa phòng thất bại',

          });
          setLoading(false);
        }
        else {
          notification["success"]({
            message: `Thông báo`,
            description:
              'Xóa phòng thành công',

          });
          handleList();
          setLoading(false);
        }
      }
      );

    } catch (error) {
      console.log('Failed to fetch event list:' + error);
    }
  }

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
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Dãy phòng phòng",
      dataIndex: "room",
      key: "room",
      render: (room) => (
        <span>{room.title}</span>
      ),
    },
    {
      title: "Chủ phòng",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <span>{user.username}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
              onClick={() => handleEditCategory(record.id)}
            >{"Chỉnh sửa"}
            </Button>
            <div
              style={{ marginTop: 8 }}>
              <Popconfirm
                title="Bạn có chắc chắn xóa phòng này?"
                onConfirm={() => handleDeleteCategory(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ width: 150, borderRadius: 15, height: 30 }}
                >{"Xóa"}
                </Button>
              </Popconfirm>
            </div>
          </Row>
        </div >
      ),
    },
  ];

  const [category, setCategoryList] = useState([]);


  const handleList = () => {
    (async () => {
      try {
        const user = getItemFromLocalStorage("user");

        await roomTypeApi.getRoomTypesByUser(user.id).then((item) => {
          console.log(item);
          setOrderList(item);
        });

        await roomApi.getRoomsByUser(user.id).then((res) => {
          console.log(res);
          setCategoryList(res);
          setLoading(false);
        });

        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
  }

  const handleFilter = async (name) => {
    try {
      const res = await roomTypeApi.searchRoomTypes(name.target.value);
      setOrderList(res);

    } catch (error) {
      console.log('search to fetch category list:' + error);
    }
  }


  useEffect(() => {
    handleList();

  }, []);

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false)
    }
    console.log('Clicked cancel button');
  };

  const amenitiesOptions = [
    'wifi',
    'giặt sấy',
    'điều hòa',
    'bể bơi',
    'phòng gym',
    'chỗ để xe',
    'an ninh 24/7'
  ];

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
                  <span>Quản lý phòng trọ </span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div style={{ marginBottom: 30 }}>
              <div style={{ marginTop: 20 }}>
                <div id="my__event_container__list">
                  <PageHeader
                    subTitle=""
                    style={{ fontSize: 14 }}
                  >
                    <Row>
                      <Col span="18">
                        <Input
                          placeholder="Tìm kiếm theo tên"
                          allowClear
                          onChange={handleFilter}
                          style={{ width: 300 }}
                        />
                      </Col>
                      <Col span="6">
                        <Row justify="end">
                          <Space>
                            <Button onClick={showModal} icon={<PlusOutlined />} style={{ marginLeft: 10 }} >Tạo phòng trọ</Button>
                          </Space>
                        </Row>
                      </Col>
                    </Row>

                  </PageHeader>
                </div>
              </div>
              <br></br>
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

          <Modal
            title="Tạo bài đăng trọ"
            visible={openModalCreate}
            style={{ top: 100, width: 1500 }}
            onOk={() => {
              form
                .validateFields()
                .then((values) => {
                  form.resetFields();
                  handleOkUser(values);
                })
                .catch((info) => {
                  console.log('Validate Failed:', info);
                });
            }}
            onCancel={() => handleCancel("create")}
            okText="Hoàn thành"
            cancelText="Hủy"
            width={1500}
          >
            <Form
              form={form}
              name="campgroundCreate"
              layout="vertical"
              scrollToFirstError
            >
              <Form.Item
                name="name"
                label="Tên phòng"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên phòng!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tên phòng" />
              </Form.Item>


              <Form.Item
                name="price"
                label="Giá"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập giá!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <InputNumber placeholder="Giá" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mô tả!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input.TextArea placeholder="Mô tả" />
              </Form.Item>

              <Form.Item
                name="amenities"
                label="Tiện ích"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ít nhất một tiện ích!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn tiện ích"
                >
                  {amenitiesOptions.map((amenity) => (
                    <Option key={amenity} value={amenity}>
                      {amenity}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="area"
                label="Diện tích"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập diện tích!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <InputNumber placeholder="Diện tích" style={{ width: '100%' }} />
              </Form.Item>


              <Form.Item
                name="images"
                label="Chọn ảnh"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ảnh!',
                  },
                ]}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                  id="avatar"
                  name="file"
                />
              </Form.Item>

              <Form.Item
                name="room_id"
                label="Dãy trọ"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn dãy trọ!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                  {category.map((item, index) => {
                    return (
                      <Option value={item.id} key={index} >
                        {item.title}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn trạng thái!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="Đang sử dụng">Đang sử dụng</Select.Option>
                  <Select.Option value="Chưa sử dụng">Chưa sử dụng</Select.Option>
                </Select>
              </Form.Item>

            </Form>
          </Modal>

          <Modal
            title="Chỉnh sửa phòng trọ phòng trọ"
            visible={openModalUpdate}
            style={{ top: 100 }}
            onOk={() => {
              form2
                .validateFields()
                .then((values) => {
                  form2.resetFields();
                  handleUpdateCategory(values);
                })
                .catch((info) => {
                  console.log('Validate Failed:', info);
                });
            }}
            onCancel={handleCancel}
            okText="Hoàn thành"
            cancelText="Hủy"
            width={600}
          >
            <Form
              form={form2}
              name="campgroundCreate"
              layout="vertical"
              scrollToFirstError
            >
             <Form.Item
                name="name"
                label="Tên phòng"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên phòng!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tên phòng" />
              </Form.Item>


              <Form.Item
                name="price"
                label="Giá"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập giá!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <InputNumber placeholder="Giá" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mô tả!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input.TextArea placeholder="Mô tả" />
              </Form.Item>

              <Form.Item
                name="amenities"
                label="Tiện ích"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ít nhất một tiện ích!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn tiện ích"
                >
                  {amenitiesOptions.map((amenity) => (
                    <Option key={amenity} value={amenity}>
                      {amenity}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="area"
                label="Diện tích trung bình"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập diện tích!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <InputNumber placeholder="Diện tích" style={{ width: '100%' }} />
              </Form.Item>


              <Form.Item
                name="images"
                label="Chọn ảnh"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ảnh!',
                  },
                ]}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                  id="avatar"
                  name="file"
                />
              </Form.Item>

              <Form.Item
                name="room_id"
                label="Dãy trọ"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn dãy trọ!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                  {category.map((item, index) => {
                    return (
                      <Option value={item.id} key={index} >
                        {item.title}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn trạng thái!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="Đang sử dụng">Đang sử dụng</Select.Option>
                  <Select.Option value="Chưa sử dụng">Chưa sử dụng</Select.Option>
                </Select>
              </Form.Item>

            </Form>
          </Modal>
        </Card>
      </Spin>
    </div>
  );
};

export default RoomTypeManagement;
