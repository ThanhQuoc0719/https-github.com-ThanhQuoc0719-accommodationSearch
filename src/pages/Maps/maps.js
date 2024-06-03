import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Spin, Button, Input, Slider } from "antd";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import roomApi from "../../apis/roomApi";
import { numberWithCommas } from "../../utils/common";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Maps = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapRendered, setMapRendered] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [areaRange, setAreaRange] = useState([0, 1000000]); // Default price range
  const [gender, setGender] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState([0, 10000000]); // Default price range
  const history = useHistory();
  const fetchRooms = async () => {
    try {
      const response = await roomApi.getAllRooms();

      setRooms(response);
      setLoading(false);
      setMapRendered(true);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, []);


  const icon = L.icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  });


  const handleMarkerClick = (roomId) => {
    history.push(`/product-detail/${roomId}`);
  };

  const handleSearchChange = (e) => {
    setSearchAddress(e.target.value);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let filteredRooms = [];

      if (searchAddress.trim() !== "") {
        filteredRooms = rooms.filter(room =>
          room.preciseAddress.toLowerCase().includes(searchAddress.toLowerCase()) ||
          room.ward.toLowerCase().includes(searchAddress.toLowerCase())
        );
      } else {
        fetchRooms()
      }

      setRooms(filteredRooms);
      setLoading(false);
      setMapRendered(true);
    } catch (error) {
      console.error("Error searching address:", error);
      setLoading(false);
    }
  };


  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };

  const handleAreaRangeChange = (value) => {
    setAreaRange(value);
  };
  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };
  const filteredRooms = rooms.filter(room => room.price >= priceRange[0] && room.price <= priceRange[1] && room.area >= areaRange[0] && room.area <= areaRange[1] && (gender === 'Tất cả' || room.target === gender));

  return (
    <div>
      <Spin spinning={loading}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="http://localhost:3500/product-list/643cd88879b4192efedda4e6">
                  <span>Bản đồ</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div style={{ marginTop: 40 }}>
              <h1 className="product_name">Danh sách phòng trọ</h1>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <Input
                  placeholder="Nhập địa chỉ để tìm kiếm"
                  value={searchAddress}
                  onChange={handleSearchChange}
                  style={{ width: 300, marginRight: 10 }}
                />
                <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
              </div>
              <div>
                <Slider
                  range
                  min={0}
                  max={10000000}
                  defaultValue={[0, 10000000]}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span>Giá từ: {numberWithCommas(priceRange[0])} đ</span>
                  <span>Đến: {numberWithCommas(priceRange[1])} đ</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Diện tích(m2) từ: </span>
                <Input
                  style={{ width: '30%', padding: '5px', borderRadius: '5px' }}
                  value={areaRange[0]}
                  onChange={e => handleAreaRangeChange([e.target.value, areaRange[1]])}
                />
                <span>Đến: </span>
                <Input
                  style={{ width: '30%', padding: '5px', borderRadius: '5px' }}
                  value={areaRange[1]}
                  onChange={e => handleAreaRangeChange([areaRange[0], e.target.value])}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Giới tính:</span>
                <select
                  style={{ padding: '5px', borderRadius: '5px' }}
                  value={gender}
                  onChange={handleGenderChange}
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>
          </div>
          {mapRendered && (
            <div>
              <MapContainer center={[13.7589649, 109.2129864]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredRooms.map((room, index) => (
                  <Marker key={index} position={[room?.latitude || 0, room?.longitude || 0]} icon={icon}>

                    <Popup>
                      <div  style={{ width: '300px', height: '300px' }} className="rounded-lg p-4">
                        <div className="flex">
                          <div className="w-full pr-4">
                            <h3 className="text-lg font-semibold mb-2">{room.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">Diện tích trung bình: {room.area}</p>
                            <p className="text-sm text-gray-600 mb-2">Giá: {numberWithCommas(room.price)} đ</p>
                            <p className="text-sm text-gray-600 mb-2">Liên hệ: {room.contactInfo}</p>
                            <Button type="primary" onClick={() => handleMarkerClick(room.id)}>Chi tiết</Button>
                          </div>

                          <div className="w-1/2">
                            <img src={room.images[0]} alt={room.title} className="w-full rounded-lg" />
                          </div>
                        </div>
                      </div>

                    </Popup>
                  </Marker>

                ))}
              </MapContainer>
            </div>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default Maps;
