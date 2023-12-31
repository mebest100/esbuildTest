import React, { useMemo } from "react";
import styles from "./ProductIntro.module.css";

import { Typography, Carousel, Image, Rate, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { handlePrice, getKey } from "@/utils";

interface PropsType {
  title: string;
  shortDescription: string;
  price: string | number;
  coupons: string;
  points: string;
  discount: string;
  rating: string | number;
  pictures: string[];
}

interface RowType {
  title: string;
  description: string | number | React.ReactNode;
  key: number | string;
}

const columns: ColumnsType<RowType> = [
  {
    title: "title",
    dataIndex: "title",
    key: getKey(),
    align: "left",
    width: 120,
  },
  {
    title: "description",
    dataIndex: "description",
    key: getKey(),
    align: "center",
  },
];

export const ProductIntro: React.FC<PropsType> = React.memo(
  ({ title, shortDescription, price, coupons, discount, rating, pictures }) => {
    const tableDataSource: RowType[] = useMemo(() => {
      return [
        {
          key: 0,
          title: "路线名称",
          description: title,
        },
        {
          key: 1,
          title: "价格",
          description: (
            <>
              ¥{" "}
              <Typography.Text type="danger" strong>
                {handlePrice(price)}
              </Typography.Text>
            </>
          ),
        },
        {
          key: 2,
          title: "限时抢购折扣",
          description: discount ? (
            <>
              ¥ <Typography.Text delete>{handlePrice(price)}</Typography.Text>{" "}
              <Typography.Text type="danger" strong>
                ¥ {handlePrice(discount)}
              </Typography.Text>
            </>
          ) : (
            "暂无折扣"
          ),
        },
        {
          key: 3,
          title: "领取优惠",
          description: coupons ? discount : "无优惠券可领",
        },
        {
          key: 4,
          title: "线路评价",
          description: (
            <>
              <Rate allowHalf defaultValue={+rating} />
              <Typography.Text style={{ marginLeft: 10 }}>
                {rating} 星
              </Typography.Text>
            </>
          ),
        },
      ];
    }, [coupons, discount, price, rating, title]);

    return (
      <div className={styles["intro-container"]}>
        <Typography.Title level={4}>{title}</Typography.Title>
        <Typography.Text>{shortDescription}</Typography.Text>
        <div className={styles["intro-detail-content"]}>
          <Typography.Text style={{ marginLeft: 20 }}>
            ¥
            <span className={styles["intro-detail-strong-text"]}>
              {handlePrice(price)}
            </span>
            /人起
          </Typography.Text>
          <Typography.Text style={{ marginLeft: 50 }}>
            <span className={styles["intro-detail-strong-text"]}>{rating}</span>{" "}
            分
          </Typography.Text>
        </div>
        <Carousel autoplay slidesToShow={3}>
          {pictures.map((p) => (
            <Image height={150} src={p} key={getKey()} />
          ))}
        </Carousel>
        <Table<RowType>
          columns={columns}
          dataSource={tableDataSource}
          size="small"
          bordered={false}
          pagination={false}
        />
      </div>
    );
  }
);

ProductIntro.displayName = 'ProductIntro'