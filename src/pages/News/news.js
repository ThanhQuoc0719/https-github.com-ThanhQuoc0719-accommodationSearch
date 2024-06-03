import { Breadcrumb, Card, Input, List, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import newsApi from "../../apis/newsApi";
import "./news.css";
import moment from "moment";

const { Search } = Input;

const News = () => {
  const [news, setNews] = useState([]);
  let history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        await newsApi.getListNews().then((item) => {
          setNews(item);
        });
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
                  {/* <HomeOutlined /> */}
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="http://localhost:3500/news">
                  {/* <AuditOutlined /> */}
                  <span>Tin tức</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div class="news">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 4,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={news}
                renderItem={(item) => (
                  <Link to={`/news/${item.id}`}>
                    <Card
                      hoverable
                      className="m-4 rounded-lg shadow-md"
                    >
                      <div className="p-4">
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <p className="text-gray-500 mb-2">Thời gian đăng: {moment(item.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
                      </div>
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={item.image}
                          alt="News Image"
                          className="object-cover rounded-b-lg"
                        />
                      </div>
                    </Card>

                  </Link>
                )}
              />

            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default News;
