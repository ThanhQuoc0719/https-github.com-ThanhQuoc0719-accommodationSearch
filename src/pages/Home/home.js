import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import Texty from "rc-texty";
import React, { useEffect, useState } from "react";
import "../Home/home.css";


import {
  BackTop,
  Carousel,
  Col,
  Row,
  Spin,
  Select,
  Input,
  Button
} from "antd";
import { useHistory } from "react-router-dom";
import bookmarkApi from "../../apis/bookmarkApi";
import roomApi from "../../apis/roomApi";
import roomCategoryApi from "../../apis/roomCategoryApi";
import { getItemFromLocalStorage } from "../../apis/storageService";
import { numberWithCommas } from "../../utils/common";
const { Option } = Select;
const { Search } = Input;

const Home = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const history = useHistory();

  const handleReadMore = (id) => {
    console.log(id);
    history.push("product-detail/" + id);
  };

  const handleCategoryDetails = (id) => {
    console.log(id);
    history.push("product-list/" + id);
  };

  const [bookmarkedItems, setBookmarkedItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const userId = getItemFromLocalStorage("user");

        await roomApi.getAllRooms().then(async (response) => {
          const availableProducts = response.filter(product => product.approved === true);
          availableProducts.forEach(product => {
            product.createTime = new Date(parseInt(product.createTime));
          });

          console.log(availableProducts)
          // Sắp xếp danh sách phòng theo thời gian tạo mới nhất
          availableProducts.sort((a, b) => b.createTime - a.createTime);
          console.log(availableProducts)

          setProductList(availableProducts);
          // Lấy danh sách bookmark của người dùng
          const bookmarksResponse = await bookmarkApi.getBookmarksByUser(userId.id);
          setBookmarkedItems(bookmarksResponse.map(bookmark => bookmark.room.id));

        });
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }


      try {
        const response = await roomCategoryApi.getAllRoomCategories();
        console.log(response);
        setCategories(response);
      } catch (error) {
        console.log(error);
      }


    })();
  }, []);
  const handleSortChange = (value) => {
    setSortOption(value);
    let sorted = [...productList];
    if (value === 'priceAsc') {
      sorted.sort((a, b) => a.minPrice - b.minPrice);
    } else if (value === 'priceDesc') {
      sorted.sort((a, b) => b.minPrice - a.minPrice);
    } else if (value === 'sizeAsc') {
      sorted.sort((a, b) => a.minArea - b.minArea);
    }
    setProductList(sorted);
  };
  const handleBookmark = async (roomId) => {
    try {
      const userId = getItemFromLocalStorage("user");

      if (bookmarkedItems.includes(roomId)) {
        await bookmarkApi.unbookmarkRoom(userId.id, roomId);
        setBookmarkedItems(bookmarkedItems.filter(id => id !== roomId));
      } else {
        await bookmarkApi.bookmarkRoom(userId.id, roomId);
        setBookmarkedItems([...bookmarkedItems, roomId]);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const [location, setLocation] = useState('Toàn quốc');
  const [price, setPrice] = useState('Chọn giá');
  const [size, setSize] = useState('Chọn diện tích');

  return (
    <Spin spinning={false}>
      <div
        style={{
          background: "#FFFFFF",
          overflowX: "hidden",
          overflowY: "hidden",
          paddingTop: 15,
        }}
        className="home"
      >
        <div
          style={{ background: "#FFFFFF" }}
          className="container-banner banner-promotion"
        >
          <Row justify="center" align="top" key="1">
            <Col span={4}>
              <ul className="menu-tree">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    onClick={() => handleCategoryDetails(category.id)}
                  >
                    <div className="menu-category">
                      {category.name}
                      {/* <RightOutlined /> */}
                    </div>
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={15}>
              <Carousel autoplay className="carousel-image">

                <div className="img">
                  <img
                    style={{ width: "100%", height: 575 }}
                    src="https://file4.batdongsan.com.vn/resize/1275x717/2024/04/10/20240410144042-460c_wm.jpg"
                    alt=""
                  />
                </div>
                <div className="img">
                  <img
                    style={{ width: "100%", height: 575 }}
                    src="https://file4.batdongsan.com.vn/2024/04/10/20240410144042-8fa0_wm.jpg"
                    alt=""
                  />
                </div>
                <div className="img">
                  <img
                    style={{ width: "100%", height: 575 }}
                    src="https://file4.batdongsan.com.vn/resize/1275x717/2024/04/10/20240410144042-d87e_wm.jpg"
                    alt=""
                  />
                </div>
              </Carousel>

            </Col>
            <Col span={5}>
              <div class="right-banner image-promotion">
                <a
                  href="#"
                  class="right-banner__item"
                >
                  <img
                    src="https://file4.batdongsan.com.vn/2023/06/02/20230602132657-b0f3_wm.jpg"
                    alt="Giá rẻ bất ngờ"
                    loading="lazy"
                    style={{ width: "100%", height: 182 }}
                    class="right-banner__img"
                  />
                </a>
                <a
                  href="#"
                  class="right-banner__item"
                >
                  <img
                    style={{ width: "100%", height: 182 }}
                    src="https://file4.batdongsan.com.vn/crop/348x174/2024/04/03/20240403163001-cad5_wm.jpg"
                    alt="THIẾT KẾ ĐẸP"
                    loading="lazy"
                    class="right-banner__img"
                  />
                </a>
                <a
                  href="#"
                  class="right-banner__item"
                >
                  <img
                    style={{ width: "100%", height: 182 }}
                    src="https://file4.batdongsan.com.vn/resize/1275x717/2024/04/04/20240404143409-31c0_wm.jpg"
                    alt="THIẾT KẾ ĐẸP"
                    loading="lazy"
                    class="right-banner__img"
                  />
                </a>
              </div>
            </Col>
          </Row>
          <div className="p-6">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <Search
                placeholder="Phòng trọ, nhà trọ"
                enterButton="Tìm kiếm"
                size="large"
                className="w-1/3"
              />
              <Select
                value={location}
                onChange={(value) => setLocation(value)}
                size="large"
                className="w-1/4"
              >
                <Option value="Quy nhơn">Quy nhơn</Option>
              </Select>
              <Select
                value={price}
                onChange={(value) => setPrice(value)}
                size="large"
                className="w-1/4"
              >
                <Option value="Chọn giá">Chọn giá</Option>
                <Option value="Dưới 1 triệu">Dưới 1 triệu</Option>
                <Option value="1 - 2 triệu">1 - 2 triệu</Option>
                <Option value="2 - 3 triệu">2 - 3 triệu</Option>
                <Option value="3 - 5 triệu">3 - 5 triệu</Option>
                <Option value="5 - 7 triệu">5 - 7 triệu</Option>
                <Option value="7 - 10 triệu">7 - 10 triệu</Option>
                <Option value="Trên 10 triệu">Trên 10 triệu</Option>
              </Select>
              <Select
                value={size}
                onChange={(value) => setSize(value)}
                size="large"
                className="w-1/4"
              >
                <Option value="Chọn diện tích">Chọn diện tích</Option>
                <Option value="Dưới 20 m²">Dưới 20 m²</Option>
                <Option value="20 - 30 m²">20 - 30 m²</Option>
                <Option value="30 - 50 m²">30 - 50 m²</Option>
                <Option value="50 - 70 m²">50 - 70 m²</Option>
                <Option value="70 - 100 m²">70 - 100 m²</Option>
                <Option value="Trên 100 m²">Trên 100 m²</Option>
              </Select>
              <Select
                value={sortOption}
                onChange={handleSortChange}
                size="large"
                className="w-1/4"
              >
                <Option value="default">Mặc định</Option>
                <Option value="priceAsc">Giá tăng dần</Option>
                <Option value="priceDesc">Giá giảm dần</Option>
                <Option value="sizeAsc">Diện tích tăng dần</Option>
              </Select>
              <Button type="primary" size="large">
                Tìm kiếm
              </Button>
            </div>
            <h2 className="text-center text-2xl font-bold mb-6">Tìm kiếm chỗ thuê ưng ý</h2>
            <div className="product-promotion">
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/gift.png"
                    alt="Sách 1"
                  />
                </div>
                <div class="product-name">Gift Books For You</div>
              </div>
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/sticker.png"
                    alt="Sách 2"
                  />
                </div>
                <div class="product-name">Đa Dạng phòng trọ</div>
              </div>
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/manga.png"
                    alt="Sách 3"
                  />
                </div>
                <div class="product-name">Nhiều Ưu Đãi</div>
              </div>
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/teen.png"
                    alt="Sách 2"
                  />
                </div>
                <div class="product-name">Phù Hợp Đa Dạng Lứa Tuổi</div>
              </div>
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/gift.png"
                    alt="Sách 3"
                  />
                </div>
                <div class="product-name">Số Lượng Trọ Lớn</div>
              </div>
              <div class="product-card">
                <div class="product-image">
                  <img
                    src="https://nhasachphuongnam.com/images/promo/274/sticker.png"
                    alt="Sách 2"
                  />
                </div>
                <div class="product-name">Phòng Trọ Sáng Tạo</div>
              </div>
            </div>
          </div>

        </div>


        <div className="image-one">
          <div className="texty-demo">
            <Texty>Khuyến Mãi</Texty>
          </div>
          <div className="texty-title">
            <p>
              Phòng Trọ <strong style={{ color: "#3b1d82" }}>Mới</strong>
            </p>
          </div>


          <div className="list-products container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList.slice(0, 20).map((item) => (
              <div
                className="col-product cursor-pointer"
                onClick={() => handleReadMore(item.id)}
                key={item.id}
              >
                <div className="show-product relative  border rounded-lg hover:shadow-lg">
                  {item.images.length > 0 ? (
                    <img
                      className="image-product w-full h-48 object-cover rounded"
                      src={item.images[0]}
                      alt={item.name}
                    />
                  ) : (
                    <img
                      className="image-product w-full h-48 object-cover rounded"
                      src={require('../../assets/image/NoImageAvailable.jpg')}
                      alt="No Image Available"
                    />
                  )}
                  <div className="wrapper-products mt-4">
                    <p className="title-product text-lg font-semibold truncate">
                      {item.title}
                    </p>

                    <div className="truncate">Diện tích:  {item.minArea} - {item.maxArea} m2</div>
                    <div className="truncate">Đối tượng: {item.target}</div>

                    <div className="price-amount mt-2">
                      <p className="price-product text-xl font-bold text-red-600">
                        {item.minPrice === item.maxPrice ?
                          `${numberWithCommas(Number(item.minPrice))}đ` :
                          `${numberWithCommas(Number(item.minPrice))}đ - ${numberWithCommas(Number(item.maxPrice))}đ`}
                      </p>
                      <div
                        className="bookmark-icon text-2xl"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn chặn sự kiện click của parent
                          handleBookmark(item.id);
                        }}
                      >
                        {bookmarkedItems.includes(item.id) ? (
                          <HeartFilled className="text-red-500" />
                        ) : (
                          <HeartOutlined className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            ))}
          </div>
        </div>
        <div></div>

        <section class="py-10 bg-white sm:py-16 lg:py-24">
          <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="max-w-2xl mx-auto text-center">
              <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">Quy trình tìm phòng trọ</h2>
              <p class="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-600">Hãy thực hiện các bước dưới đây để tìm được căn phòng trọ phù hợp với nhu cầu của bạn.</p>
            </div>

            <div class="relative mt-12 lg:mt-20">
              <div class="absolute inset-x-0 hidden xl:px-44 top-2 md:block md:px-20 lg:px-28">
                <img class="w-full" src="https://cdn.rareblocks.xyz/collection/celebration/images/steps/2/curved-dotted-line.svg" alt="" />
              </div>

              <div class="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700">1</span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Tìm kiếm</h3>
                  <p class="mt-4 text-base text-gray-600">Duyệt danh sách phòng trọ và tìm kiếm căn phòng phù hợp với nhu cầu của bạn.</p>
                </div>

                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700">2</span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Xem chi tiết</h3>
                  <p class="mt-4 text-base text-gray-600">Xem thông tin chi tiết về phòng trọ, bao gồm hình ảnh, vị trí và tiện nghi.</p>
                </div>

                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700">3</span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Đặt phòng</h3>
                  <p class="mt-4 text-base text-gray-600">Chọn phòng trọ bạn muốn và tiến hành đặt phòng.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <BackTop style={{ textAlign: "right" }} />
    </Spin>
  );
};

export default Home;
