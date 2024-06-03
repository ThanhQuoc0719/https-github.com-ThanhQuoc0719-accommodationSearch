import {
  Avatar, Breadcrumb, Button, Card, Carousel, Col, Form,
  Input, List, Modal, Rate, Row,
  Spin,
  message
} from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Paragraph from "antd/lib/typography/Paragraph";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import roomApi from "../../../apis/roomApi";
import triangleTopRight from "../../../assets/icon/Triangle-Top-Right.svg";
import { numberWithCommas } from "../../../utils/common";
import "./productDetail.css";
import L from "leaflet";

import iconMarker from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import axios from "axios";
import roomTypeApi from "../../../apis/roomTypeApi";
import roomReviewApi from "../../../apis/roomReviewApi";
import { getItemFromLocalStorage } from "../../../apis/storageService";

const { TextArea } = Input;

const ProductDetail = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [recommend, setRecommend] = useState([]);
  const [loading, setLoading] = useState(true);
  let { id } = useParams();
  const history = useHistory();
  const [visible2, setVisible2] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const handleReadMore = (id) => {
    console.log(id);
    history.push("/product-detail/" + id);
    window.location.reload();
  };

  const handleOpenModal = () => {
    setVisible2(true);
  };

  const handleCloseModal = () => {
    setVisible2(false);
  };

  const handleRateChange = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const icon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow
  });

  const handleReviewSubmit = async () => {
    // Tạo payload để gửi đến API
    const userId = getItemFromLocalStorage("user");

    if (!userId) {
      return history.push("/login")
    }

    const payload = {
      comment,
      rating,
      userId: userId.id
    };

    // Gọi API đánh giá và bình luận
    await roomReviewApi.addRoomReview(id, payload)
      .then((response) => {
        console.log(response);
        // Xử lý khi gọi API thành công
        console.log("Review created");
        // Đóng modal và thực hiện các hành động khác nếu cần
        message.success("Thông báo:" + response);
        handleList();
        handleCloseModal();
      })
      .catch((error) => {
        // Xử lý khi gọi API thất bại
        console.error("Error creating review:", error);
        // Hiển thị thông báo lỗi cho người dùng nếu cần
        message.error("Đánh giá thất bại: " + error);
      });
  };

  const [reviews, setProductReview] = useState([]);
  const [reviewsCount, setProductReviewCount] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [user, setUser] = useState(null);
  const [roomType, setRoomType] = useState(null);

  const getAddressCoordinates = async (address) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { latitude: lat, longitude: lon };
      } else {
        throw new Error("No coordinates found for the address");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      throw error;
    }
  };

  const [maxArea, setMaxArea] = useState(0);
  const [minArea, setMinArea] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minPrice, setMinPrice] = useState(0);

  const handleList = () => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        setUser(user);


        const calculateAverageRating = (reviews) => {
          if (!reviews || reviews.length === 0) {
            return 0; // Trả về 0 nếu không có đánh giá hoặc không có đánh giá nào
          }

          console.log(reviews)

          let totalRating = 0;
          reviews.forEach(review => {
            totalRating += Number(review.rating);
          });

          console.log(totalRating)

          const averageRating = totalRating / reviews.length;
          return averageRating;
        };

        await roomReviewApi.getRoomReviews(id).then(async (item) => {
          const averageRating = calculateAverageRating(item);
          console.log(averageRating)
          setAvgRating(averageRating);
          setProductReview(item);
        })

        await roomApi.getRoomById(id).then(async (item) => {
          setProductDetail(item);

          const address = `${item.ward}, ${item.city}`;
          console.log(address);
          const location = await getAddressCoordinates(address);
          console.log(location);
          setLatitude(location.latitude);
          setLongitude(location.longitude);
          updateMap();
          setProductReviewCount(item.reviewStats);
          console.log(((reviewsCount[4] || 0) / reviews.length) * 100);
        });

        const roomTypes = await roomTypeApi.getRoomTypesByRoom(id);
        setRoomType(roomTypes);

        // Tìm diện tích cao nhất và thấp nhất
        const areas = roomTypes.map(room => room.area);
        const maxAreaValue = Math.max(...areas);
        const minAreaValue = Math.min(...areas);
        setMaxArea(maxAreaValue);
        setMinArea(minAreaValue);

        const prices = roomTypes.map(room => room.price);
        const maxPriceValue = Math.max(...prices);
        const minPriceValue = Math.min(...prices);
        setMaxPrice(maxPriceValue);
        setMinPrice(minPriceValue);

        await roomApi.getAllRooms().then((item) => {
          const availableProducts = item.filter(product => product.approved === true);
          setRecommend(availableProducts);
        });



        setLoading(false);

      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
  }

  useEffect(() => {
    handleList();
    window.scrollTo(0, 0);
  }, []);

  function formatCreatedAt(createdAt) {
    if (!createdAt) return "";

    const now = new Date();
    const createdDate = new Date(createdAt * 1000);
    const diffMilliseconds = now - createdDate;
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else {
      const day = ("0" + createdDate.getDate()).slice(-2);
      const month = ("0" + (createdDate.getMonth() + 1)).slice(-2);
      const year = createdDate.getFullYear();
      const hours = ("0" + createdDate.getHours()).slice(-2);
      const minutes = ("0" + createdDate.getMinutes()).slice(-2);
      return `${hours}:${minutes} ngày ${day}/${month}/${year}`;
    }
  }

  const [mapKey, setMapKey] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Hàm này được gọi mỗi khi latitude hoặc longitude thay đổi
  const updateMap = () => {
    setMapKey(prevKey => prevKey + 1);
  };

  const handleMarkerClick = (data) => {
    var url = "https://www.google.com/maps/place/" + latitude + "," + longitude;
    window.open(url, "_blank");
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const handleViewDetails = (id) => {
    history.push('/profile-rooms/'+ id);
  };

  return (
    <div>
      <Spin spinning={false}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  {/* <HomeOutlined /> */}
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="http://localhost:3500/product-list/643cd88879b4192efedda4e6">
                  {/* <AuditOutlined /> */}
                  <span>Sản phẩm</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>{productDetail?.title}</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <Row gutter={12} style={{ marginTop: 20 }}>
              <Col span={14}>
                {productDetail?.images?.length > 0 ? (
                  <Carousel autoplay className="carousel-image">
                    {productDetail?.images?.map((item) => (
                      <div className="img" key={item}>
                        <img src={item} alt="" />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <Card className="card_image" bordered={false}>
                    {productDetail?.images && productDetail.images.length > 0 && (
                      <img src={productDetail.images[0]} alt="" />
                    )}
                    <div className="promotion"></div>
                  </Card>
                )}
                <div className="mt-4 p-4 bg-white rounded shadow">
                  <div className="flex items-center">
                    <img src={productDetail?.user?.avatar} alt="avatar" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h2 className="text-lg font-bold">{productDetail?.user?.username}</h2>
                      <p className="text-sm text-gray-600">Email: {productDetail?.user?.email}</p>
                      <p className="text-sm text-gray-600">Số điện thoại: {productDetail?.user?.phoneNumber}</p>
                      <p className="text-sm text-gray-600">Giới thiệu: {productDetail?.user?.selfIntroduction ? productDetail?.user?.selfIntroduction : "Không có thông tin"}</p>
                      <Button type="primary" className="mt-2" onClick={() => handleViewDetails(productDetail?.user?.id)}>Xem chi tiết</Button>

                    </div>
                  </div>
                </div>
              </Col>

              <Col span={9}>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="items-center mb-4">

                    <div>
                      <h1 className="text-xl font-semibold">{productDetail?.title}</h1>
                      <div className="text-xl font-semibold">
                        {productDetail?.promotion === productDetail?.price ? (
                          productDetail?.promotion?.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
                        ) : (
                          productDetail?.price?.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
                        )}
                      </div>
                      <Rate disabled value={avgRating} />
                    </div>

                  </div>
                  <div>
                    <p>Diện tích từ: {minArea} - {maxArea}m2</p>
                    <p>Giá phòng từ: {minPrice.toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    })} - {maxPrice?.toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    })}</p>

                  </div>
                  <div >
                    <p className="text-sm">Ngày tạo: {formatCreatedAt(productDetail?.create_time)}</p>
                  </div>

                  {/* <div className="mb-4">

                    <div className="border-t border-gray-200 pt-4">
                      <h2 className="text-lg font-semibold">Ưu đãi</h2>
                      <div className="mt-2">
                        <p className="text-sm">Nhiều sản phẩm lựa chọn</p>
                        <p className="text-sm">Tặng thêm phiếu mua hàng</p>
                        <p className="text-sm">Giảm giá cho khách hàng mới</p>
                      </div>
                    </div>

                  </div> */}
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      onClick={openModal}
                      disabled={productDetail?.status === 'Unavailable' || productDetail?.status === 'Discontinued'}
                    >
                      Xem liên hệ
                    </Button>
                  </div>
                </div>

                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  contentLabel="Liên hệ Zalo"
                >
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Liên hệ Zalo</h2>
                    <p>Đây là liên kết đến Zalo của chúng tôi: <a href="your_zalo_link_here">Zalo</a></p>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 mt-4" onClick={closeModal}>Đóng</button>
                  </div>
                </Modal>

                <div style={{ marginTop: 15 }}>
                  <MapContainer style={{ height: 300 }} key={mapKey} center={[latitude, longitude]} zoom={16} scrollWheelZoom={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[latitude, longitude]} icon={icon}>
                      <Popup>
                        <div>
                          <h3>{productDetail?.title}</h3>
                          <p>Mô tả: {productDetail?.description}</p>
                          <p>Diện tích:  {productDetail.minArea === productDetail.maxArea ?
                          `${productDetail.minArea}m2` :
                          `${productDetail.minPrice}m2 - ${productDetail.maxPrice}m2`}</p>
                          <p>Giá:   {productDetail.minPrice === productDetail.maxPrice ?
                          `${numberWithCommas(Number(productDetail.minPrice))}đ` :
                          `${numberWithCommas(Number(productDetail.minPrice))}đ - ${numberWithCommas(Number(productDetail.maxPrice))}đ`}</p>
                          <p>Liên hệ: {productDetail?.contactInfo}</p>
                          <Button type="primary" onClick={() => handleMarkerClick(productDetail)}>Chỉ đường</Button>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                </div>
              </Col>
              <Col span={7}>

              </Col>
            </Row>
            <div className="overflow-x-auto mt-4">
              <h2 className="text-xl font-bold mb-4">Danh sách các phòng</h2>
              <table className="table-auto min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diện tích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiện ích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomType?.map((roomType, index) => (
                    <tr key={roomType.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roomType.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roomType.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roomType.price} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roomType.area} m<sup>2</sup></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {roomType.amenities.map((amenity, index) => (
                          <span key={index} className="inline-block bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs font-semibold mr-1 mb-1">{amenity}</span>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{roomType.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="describe">
              <div className="title_total">
                Giới thiệu "{productDetail?.title}"
              </div>
              <div
                className="describe_detail_description"
                dangerouslySetInnerHTML={{ __html: productDetail?.description }}
              ></div>
            </div>

            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Liên hệ Zalo"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Liên hệ Zalo</h2>
                <p>Đây là liên kết đến Zalo của chúng tôi: <a href="your_zalo_link_here">Zalo</a></p>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 mt-4" onClick={closeModal}>Đóng</button>
              </div>
            </Modal>

            <Row gutter={12} style={{ marginTop: 20 }}>
              <Col span={16}>
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {productDetail?.categoryTotal}
                      </div>
                      <div className="title_total">
                        Đánh giá & nhận xét "{productDetail?.title}"
                      </div>

                      <p class="subtitle" style={{ marginTop: 30 }}>Bạn đánh giá sản phẩm này</p>
                      <div class="group_comment">
                        <Button
                          type="primary"
                          className="button_comment"
                          size={"large"}
                          onClick={handleOpenModal}
                          disabled={!user}
                        >
                          Đánh giá ngay
                        </Button>
                      </div>
                      <Modal
                        visible={visible2}
                        onCancel={handleCloseModal}
                        onOk={handleReviewSubmit}
                        okText="Gửi đánh giá"
                        cancelText="Hủy"
                      >
                        <h2>Đánh giá và bình luận</h2>
                        <Rate
                          value={rating}
                          onChange={handleRateChange}
                          style={{ marginBottom: 10 }}
                        />
                        <TextArea
                          placeholder="Nhập bình luận của bạn"
                          value={comment}
                          onChange={handleCommentChange}
                        ></TextArea>
                      </Modal>
                    </div>
                    <div style={{ marginTop: 40 }}>
                      <Card>
                        <div style={{ padding: 20 }}>

                          <List
                            itemLayout="horizontal"
                            dataSource={reviews}
                            renderItem={(item, index) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      src={`https://img.lovepik.com/free-png/20211130/lovepik-cartoon-avatar-png-image_401205251_wh1200.png`}
                                    />
                                  }
                                  title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <a href="https://ant.design" style={{ marginRight: '8px' }}>
                                        {item?.user?.username}
                                      </a>
                                      <Rate allowHalf disabled defaultValue={item.rating} />
                                    </div>

                                  }
                                  description={item?.comment}
                                />
                              </List.Item>
                            )}
                          />

                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            <div></div>

            <div className="price" style={{ marginTop: 40 }}>
              <h1 className="product_name">Phòng trọ bạn có thể quan tâm</h1>
            </div>
            <Row
              gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
              className="row-product-details"
            >
              <List
                grid={{
                  gutter: 16,
                  column:
                    recommend.length >= 4 ? 4 : recommend.length,
                }}
                size="large"
                className="product-list"
                dataSource={recommend.slice(0, 4)}
                renderItem={(item) => (
                  <List.Item>
                    <div
                      className="show-product"
                      onClick={() => handleReadMore(item.id)}
                    >
                      {item.images.length > 0 ? (
                        <img className="image-product" src={item.images[0]} />
                      ) : (
                        <img
                          className="image-product"
                          src={require("../../../assets/image/NoImageAvailable.jpg")}
                        />
                      )}
                      <div className="wrapper-products">
                        <Paragraph
                          className="title-product"
                          ellipsis={{ rows: 2 }}
                        >
                          {item.title}
                        </Paragraph>
                        <div className="price-amount">
                          <React.Fragment>
                            {
                              <React.Fragment>
                                <Paragraph className="price-product">
                                  {item?.price && numberWithCommas(item?.price)}đ
                                </Paragraph>
                              </React.Fragment>}
                          </React.Fragment>
                        </div>
                      </div>
                    </div>

                  </List.Item>
                )}
              ></List>
            </Row>
          </div>


        </Card>


      </Spin>
    </div>
  );
};

export default ProductDetail;