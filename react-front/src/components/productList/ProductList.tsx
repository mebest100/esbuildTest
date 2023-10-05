import React, { useMemo } from "react";

import { Link } from "react-router-dom";
import { List, Rate, Space, Image, Tag, Typography, Button } from "antd";

import { LikeOutlined, StarOutlined } from "@ant-design/icons";

import { handlePrice, getKey } from "@/utils";
import { useSelector } from "@/redux/hooks";
import {
  delSingleShoppingCartItem,
  getShoppingCart,
} from "@/redux/shoppingCart/slice";
import { useDispatch } from "react-redux";
import styles from "./ProductList.module.css"

const { Text } = Typography;

interface Product {
  departureCity: string;
  description: string;
  discountPresent: number;
  id: string;
  originalPrice: number;
  price: number;
  rating: number;
  title: string;
  touristRoutePictures: any[];
  travelDays: string;
  tripType: string;
  cid?: string;
  isSearch?: boolean;
}
interface PropsType {
  data: Product[];
  paging?: any;
  isSearch?: boolean;
  onPageChange?: (curPage, clickPage, pageSize) => void;
}

const listData = (productList: Product[], isSearch: boolean) =>
  productList.map((p) => ({
    cid: p.cid,
    id: p.id,
    title: p.title,
    description: p.description,
    tags: (
      <>
        {p.departureCity && <Tag color="#f50">{p.departureCity}出发</Tag>}
        {p.travelDays && <Tag color="#108ee9">{p.travelDays} 天 </Tag>}
        {p.discountPresent && <Tag color="#87d068">超低折扣</Tag>}
        {p.tripType && <Tag color="#2db7f5">{p.tripType}</Tag>}
      </>
    ),
    imgSrc: p.touristRoutePictures[0].url,
    price: p.price,
    originalPrice: p.originalPrice,
    discountPresent: p.discountPresent,
    rating: p.rating,
    isSearch: isSearch,
  }));

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export const ProductList: React.FC<PropsType> = React.memo(
  ({ data, paging, isSearch, onPageChange }) => {
    const dispatch = useDispatch();
    const jwt = useSelector((s) => s.user.token) as string;

    const products = useMemo(() => {
      return listData(data, isSearch as boolean);
    }, [data]);

    const delCartItem = (itemId) => {
      return (e) => {
        //这里必须通过return返回(不能直接dispatch)，否则会报错：不能将类型“void”分配给类型“MouseEventHandler<HTMLElement>
        dispatch(delSingleShoppingCartItem({ jwt, itemId }));
        dispatch(getShoppingCart(jwt));
      };
    };  

    return (
      <>
        <List      
          itemLayout="vertical"
          size="large"
          pagination={
            paging
              ? {
                  current: paging.currentPage,
                  onChange: (ClickPage, pageSize) =>
                    onPageChange &&
                    onPageChange(
                      paging.currentPage,
                      ClickPage,
                      pageSize
                    ),
                  pageSize: paging.pageSize,
                  total: paging.totalCount,
                  style: {textAlign: "center"} //style用来设置分页组件居中显示（默认最右）
                }
              : false
          }
          dataSource={products}
          footer={
            paging && (
              <div className={styles["footer"]}>
                <span>
                  搜索总路线: <Text strong>{paging.totalCount}</Text> 条
                </span>
                <span>
                  当前第: <strong> {paging.currentPage} </strong> 页
                </span>
              </div>
            )
          }
          renderItem={(item) => (
            <List.Item
              key={getKey()}
              actions={[
                <IconText
                  icon={StarOutlined}
                  text="156"
                  key="list-vertical-star-o"
                />,
                <IconText
                  icon={LikeOutlined}
                  text="156"
                  key="list-vertical-like-o"
                />,
                <>
                  <Rate allowHalf defaultValue={3} value={item.rating} />
                  <Text
                    strong
                    style={{ width: "20px" }}
                    className="ant-rate-text"
                  >
                    {item.rating}
                  </Text>
                </>,
                // 此处是条件渲染
                item.isSearch ? null : (
                  <Button
                    size="small"
                    type="primary"
                    danger
                    onClick={delCartItem(item.cid)}
                  >
                    删除
                  </Button>
                ),
              ]}
              extra={
                // extra为List的额外内容，通常位于最右侧
                <Image width={272} height={172} alt="image" src={item.imgSrc} />
              }
            >
              <List.Item.Meta
                title={
                  <>
                    {item.discountPresent ? (
                      <>
                        <Text style={{ fontSize: 20, fontWeight: 400 }} delete>
                          ¥ {handlePrice(item.originalPrice)}
                        </Text>
                        <Text
                          type="danger"
                          style={{ fontSize: 20, fontWeight: 400 }}
                        >
                          {" "}
                          ¥ {handlePrice(item.price)}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 20, fontWeight: 400 }}>
                        ¥ {handlePrice(item.price)}
                      </Text>
                    )}
                    <Link to={"/detail/" + item.id}> {item.title}</Link>
                  </>
                }
                description={item.tags}
              />
              {item.description}
            </List.Item>
          )}
        />
        {/* <TestExport msg="123" /> */}
      </>
    );
  }
);

type PropsType2 = {
  msg: string;
};

const style: object = {
  textAlign: "center",
  fontWeight: "bold",
  color: "red",
  marginTop: "20px",
};

export const TestExport: React.FC<PropsType2> = ({ msg }) => {
  return <div style={style}> {msg}</div>;
};

ProductList.displayName = 'ProductList';
