import {
  Breadcrumb,
  Card, Col, Form,
  List, Row,
  Spin
} from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import React, { useEffect, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import productApi from "../../../apis/productApi";
import triangleTopRight from "../../../assets/icon/Triangle-Top-Right.svg";
import { numberWithCommas } from "../../../utils/common";
import "./productList.css";


const ProductList = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [nameCategory, setNamecategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);

  let { id } = useParams();
  const history = useHistory();
  const match = useRouteMatch();

  const handleReadMore = (id) => {
    console.log(id);
    history.push("/product-detail/" + id);
    window.location.reload();
  };

  const handleCategoryDetails = (id) => {
    const newPath = match.url.replace(/\/[^/]+$/, `/${id}`);
    history.push(newPath);
    window.location.reload();
  };

  useEffect(() => {
    (async () => {
      try {
        await productApi.getProductCategory(id).then((response) => {
          // Lọc danh sách sản phẩm chỉ lấy những sản phẩm có trạng thái là 'Available'
          const availableProducts = response.filter(product => product.approved === true);

          // Cập nhật state với danh sách sản phẩm chỉ có trạng thái 'Available'
          setProductDetail(availableProducts);
        });
        const response = await productApi.getCategory({ limit: 50, page: 1 });
        setCategories(response);

        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
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
                  <span>Sản phẩm </span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div className="container box">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryDetails(category.id)}
                  className="menu-item-1"
                >
                  <div
                    className="menu-category-1"
                    style={{ fontWeight: category.id === id ? 'bold' : 'normal',
          color: category.id === id ? 'red' : 'black',
          fontSize: category.id === id ? '1.2em' : '1em',}}
                  >
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="list-products container"
              key="1"
              style={{ marginTop: 0, marginBottom: 50 }}
            >
              <Row>
                <Col span={12}>
                  <div className="title-category">
                    <div class="title">
                      <h3 style={{ paddingTop: "30px" }}>DANH SÁCH SẢN PHẨM</h3>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="button-category">
                  </div>
                </Col>
              </Row>
              <Row
                gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
                className="row-product-details"
              >
                <List
                  grid={{
                    gutter: 16,
                    column:
                      productDetail.length >= 4 ? 4 : productDetail.length,
                  }}
                  size="large"
                  className="product-list"
                  pagination={{
                    onChange: (page) => {
                      window.scrollTo(0, 0);
                    },
                    pageSize: 12,
                  }}
                  dataSource={productDetail}
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
                                    {item.minPrice === item.maxPrice ?
                                      `${numberWithCommas(Number(item.minPrice))}đ` :
                                      `${numberWithCommas(Number(item.minPrice))}đ - ${numberWithCommas(Number(item.maxPrice))}đ`}
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
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default ProductList;
