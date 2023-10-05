import React, { useMemo } from "react";

import { Skeleton, Card, Button, Typography, Table } from "antd";
import { CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { handlePrice, getKey } from "@/utils";

const { Meta } = Card;
const { Title, Text } = Typography;

interface OrderItem {
  key: number;
  item: string;
  amount: string | number | JSX.Element;
}

const columns: ColumnsType<OrderItem> = [
  {
    title: "产品",
    dataIndex: "item",
    key: "item",
  },
  {
    title: "价格",
    dataIndex: "amount",
    key: "amount",
  },
];

interface PropsType {
  loading: boolean;
  order: any;
  onCheckout: () => void;
}

export const CheckOutCard: React.FC<PropsType> = React.memo(
  ({ loading, order, onCheckout }) => {
    const navigate = useNavigate();

    const getSum = () => {
      // 做条件渲染时，一定要做判空处理，否则会报错： undefined of null,导致页面渲染失败
      return order && order.orderItems
        ? order.orderItems
            .map(
              (s) =>
                s.originalPrice * (s.discountPresent ? s.discountPresent : 1)
            )
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        : 0;
    }

    const getPaymentData = useMemo(() => {
      return order
        ? order.orderItems.map((i, index) => ({
            key: getKey(),
            item: i.title,
            amount: i.discountPresent ? (
              <>
                <Text delete>¥ {handlePrice(i.originalPrice)} </Text>{" "}
                <Text type="danger" strong>
                  ¥ {handlePrice(i.originalPrice * i.discountPresent)}
                </Text>
              </>
            ) : (
              <>
                <Text>¥ {handlePrice(i.originalPrice)} </Text>
              </>
            ),
          }))
        : [];
    }, [order]);

    return (
      <Card
        style={{ width: 600, marginTop: 50 }}
        actions={[
          order && order.state === "Completed" ? (
            <Button
              type="primary"
              onClick={() => {
                navigate("/");
              }}
              loading={loading}
            >
              <HomeOutlined />
              回到首页
            </Button>
          ) : (
            <Button
              type="primary"
              danger
              onClick={onCheckout}
              loading={loading}
            >
              <CheckCircleOutlined />
              支付
            </Button>
          ),
        ]}
      >
        <Skeleton loading={loading} active>
          <Meta
            title={
              <Title level={2}>
                {order && order.state === "Completed"
                    ? "支付成功"
                    : "总计： " + getSum() + "元"
                  }
              </Title>
            }
            description={
              <Table<OrderItem>
                columns={columns}
                dataSource={getPaymentData}
                showHeader={false}
                size="small"
                bordered={false}
                pagination={false}
              />
            }
          />
        </Skeleton>
      </Card>
    );
  }
);

CheckOutCard.displayName = 'CheckOutCard'; 