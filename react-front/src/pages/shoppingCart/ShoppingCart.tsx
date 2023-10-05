import React from "react";
import styles from "./ShoppingCart.module.css";

import { Row, Col, Affix } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "@/redux/hooks";
import { MainLayout } from "@/layouts/mainLayout";
import { PaymentCard, ProductList } from "@/components";
// import { ProductList } from "@/components/productList/ProductList";
import { clearShoppingCartItem, checkout } from "@/redux/shoppingCart/slice";

export const ShoppingCartPage: React.FC = React.memo(() => {
  const loading = useSelector((s) => s.shoppingCart.loading);
  const shoppingCartItems = useSelector((s) => s.shoppingCart.items);
  const jwt = useSelector((s) => s.user.token) as string;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Row>
        <Col span={16}>
          <div className={styles["product-list-container"]}>
            {/* 下面通过 Object.assign方法合并对象给传入的data属性增加cid：购物车id属性 */}
            <ProductList
              data={shoppingCartItems.map((s) =>
                Object.assign({}, s, { cid: s.id })
              )}
            />
          </div>
        </Col>
        <Col span={8}>
          <Affix>
            <div className={styles["payment-card-container"]}>
              <PaymentCard
                loading={loading}
                originalPrice={shoppingCartItems
                  .map((s) => s.originalPrice)
                  .reduce((a, b) => a + b, 0)}
                price={shoppingCartItems
                  .map(
                    (s) =>
                      s.originalPrice *
                      (s.discountPresent ? s.discountPresent : 1)
                  )
                  .reduce((a, b) => a + b, 0)}
                onCheckout={() => {
                  if (shoppingCartItems.length <= 0) {
                    return;
                  }
                  dispatch(checkout(jwt));
                  navigate("/placeOrder");
                }}
                onShoppingCartClear={() => {
                  dispatch(
                    clearShoppingCartItem({
                      jwt,
                      itemIds: shoppingCartItems.map((s) => s.id),
                    })
                  );
                }}
              />
            </div>
          </Affix>
        </Col>
      </Row>
    </MainLayout>
  );
});
