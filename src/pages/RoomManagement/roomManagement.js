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
import roomApi from "../../apis/roomApi";
import "./roomManagement.css";
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

  const eventHandlers = useMemo(() => {
    const sendWardNameToRoomManagement = (newWardName) => {
      onWardNameChange(newWardName);
    };
  
    return {
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newLatLng = marker.getLatLng();
          localStorage.setItem("location", newLatLng);
          setPosition(newLatLng);
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`);   
          const newWardName = response.data.address.suburb;
          sendWardNameToRoomManagement(newWardName);  
        }
      },
    };
  }, [onWardNameChange]);


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
            ? 'Marker đang đi chuyển'
            : 'Click vào để di chuyển marker'}
        </span>
      </Popup>
    </Marker>
  )
}

const RoomManagement = (props) => {

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

    // Kiểm tra nếu không có dữ liệu trong localStorage
    if (!localStorage.getItem("location")) {
      // Sử dụng API Geolocation để lấy vị trí của người dùng
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const formData = {
              "title": values.title,
              "description": values.description,
              "city": "Quy Nhơn",
              "ward": values.ward,
              "preciseAddress": values.preciseAddress,
              "contactInfo": values.contactInfo,
              "price": values.price,
              "area": values.area,
              "images": [file],
              // "videos": [values.videos],
              "target": values.target,
              "amenities": values.amenities,
              "user": {
                "id": getItemFromLocalStorage("user").id
              },
              "category": {
                "id": values.category
              },
              "latitude": latitude,
              "longitude": longitude
            };
            try {
              return roomApi.addRoom(formData).then(response => {
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
          },
          (error) => {
            // Xử lý lỗi nếu trình duyệt không cho phép truy cập vị trí hoặc có lỗi xảy ra
            console.error("Lỗi khi lấy vị trí:", error.message);
          }
        );
      } else {
        console.error("Trình duyệt không hỗ trợ Geolocation");
      }
    } else {
      // Nếu có dữ liệu trong localStorage, thực hiện các thao tác tiếp theo
      const latlon = localStorage.getItem("location");
      const latlonArray = latlon.split(",");
      const latitude = parseFloat(latlonArray[0].split("(")[1].trim());
      const longitude = parseFloat(latlonArray[1].split(")")[0].trim());
      // Sử dụng vị trí từ localStorage để thực hiện các thao tác tiếp theo
      const formData = {
        "title": values.title,
        "description": values.description,
        "city": "Quy Nhơn",
        "ward": values.ward,
        "preciseAddress": values.preciseAddress,
        "contactInfo": values.contactInfo,
        "price": values.price,
        "area": values.area,
        "images": [file],
        // "videos": [values.videos],
        "target": values.target,
        "amenities": values.amenities,
        "user": {
          "id": getItemFromLocalStorage("user").id
        },
        "category": {
          "id": values.category
        },
        "latitude": latitude,
        "longitude": longitude
      };
      try {
        return roomApi.addRoom(formData).then(response => {
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

   
  }

  const handleUpdateCategory = async (values) => {
    setLoading(true);
    const formData = {
      "title": values.title,
      "description": values.description,
      "city": values.city,
      "ward": values.ward,
      "preciseAddress": values.preciseAddress,
      "contactInfo": values.contactInfo,
      "price": values.price,
      "area": values.area,
      "images": [file],
      "amenities": values.amenities,
      // "videos": values.videos,
      "target": values.target,
      "user": {
        "id": getItemFromLocalStorage("user").id
      },
      "category": {
        "id": values.category
      },
    };
    try {
      return roomApi.updateRoom(idRoom, formData).then(response => {
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
        const response = await roomApi.getRoomById(id);
        if (response) {
          const { price, amenities, title, area, category, city, contactInfo, description, district, preciseAddress, target, status, ward } = response;

          // Set các trường về lại form
          form2.setFieldsValue({
            price,
            title,
            area,
            category: category.id,
            city,
            contactInfo,
            description,
            district,
            preciseAddress,
            ward,
            status,
            target,
            // videos,
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
      await roomApi.deleteRoom(id).then(response => {
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
      title: "Mô tả",
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

        await roomApi.getRoomsByUser(user.id).then((item) => {
          console.log(item);
          setOrderList(item);
        });

        await roomCategoryApi.getAllRoomCategories({ page: 1, limit: 10000 }).then((res) => {
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
      const res = await roomApi.searchRooms(name.target.value);
      setOrderList(res);

    } catch (error) {
      console.log('search to fetch category list:' + error);
    }
  }

  const [wardName, setWardName] = useState('');

  // Callback function để nhận dữ liệu từ DraggableMarker
  const handleWardNameChange = (newWardName) => {
    console.log(newWardName)
    setWardName(newWardName);

    form.setFieldsValue({
      ward: newWardName,
    });
  };

  useEffect(() => {
    handleList();

  }, [wardName]);

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
                  <span>Quản lý dãy trọ</span>
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
                            <Button onClick={showModal} icon={<PlusOutlined />} style={{ marginLeft: 10 }} >Tạo bài đăng trọ </Button>
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
                name="title"
                label="Tiêu đề"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tiêu đề!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tiêu đề" />
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
                name="city"
                label="Thành phố"
                initialValue="Quy Nhơn"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập thành phố!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Quy Nhơn" disabled />
              </Form.Item>

              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập phường/xã!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Phường/Xã" value={wardName} onChange={(e) => setWardName(e.target.value)} />
              </Form.Item>


              <Form.Item
                name="preciseAddress"
                label="Địa chỉ chi tiết"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập địa chỉ chi tiết!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Địa chỉ chi tiết" />
              </Form.Item>

              <Form.Item
                name="contactInfo"
                label="Thông tin liên hệ"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập thông tin liên hệ!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Thông tin liên hệ" />
              </Form.Item>

              {/* <Form.Item
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
              </Form.Item> */}


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

              {/* <Form.Item
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
              </Form.Item> */}


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
                name="category"
                label="Danh mục"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn danh mục!',
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
                        {item.name}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>

              {/* <Form.Item
                name="videos"
                label="Video"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập đường dẫn video!',
                  },
                ]}
              >
                <Input placeholder="Video" />
              </Form.Item> */}

              <Form.Item
                name="target"
                label="Giới tính"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn giới tính!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn mục tiêu">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Tất cả">Tất cả</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="leaflet-map"
                label="Chọn vị trí trên map"
                style={{ marginBottom: 10 }}
              >
                <MapContainer center={center}
                  zoom={13} scrollWheelZoom={false} >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker onWardNameChange={handleWardNameChange} />
                </MapContainer>
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
                name="title"
                label="Tiêu đề"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tiêu đề!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tiêu đề" />
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
                name="city"
                label="Thành phố"
                initialValue="Quy Nhơn"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập thành phố!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Quy Nhơn" disabled />
              </Form.Item>

              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập phường/xã!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Phường/Xã" value={localStorage.getItem("wardName")} />
              </Form.Item>

              <Form.Item
                name="preciseAddress"
                label="Địa chỉ chi tiết"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập địa chỉ chi tiết!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Địa chỉ chi tiết" />
              </Form.Item>

              <Form.Item
                name="contactInfo"
                label="Thông tin liên hệ"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập thông tin liên hệ!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Thông tin liên hệ" />
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
                name="category"
                label="Danh mục"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn danh mục!',
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
                        {item.name}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>

              {/* <Form.Item
                name="videos"
                label="Video"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập đường dẫn video!',
                  },
                ]}
              >
                <Input placeholder="Video" />
              </Form.Item> */}

              <Form.Item
                name="target"
                label="Giới tính"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn giới tính!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Tất cả">Tất cả</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="leaflet-map"
                label="Chọn vị trí trên map"
                style={{ marginBottom: 10 }}
              >
                <MapContainer center={center}
                  zoom={13} scrollWheelZoom={false}   style={{ height: "300px", width: "400px" }} >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker onWardNameChange={handleWardNameChange} />
                </MapContainer>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Spin>
    </div>
  );
};

export default RoomManagement;
