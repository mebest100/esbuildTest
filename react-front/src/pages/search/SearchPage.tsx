import React from "react";
import styles from "./SearchPage.module.css";

import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useDispatch } from "react-redux";
import { useSelector } from "@/redux/hooks";
import { searchProduct } from "@/redux/productSearch/slice";
import { FilterArea, TestExport, ProductList } from "@/components";
// import { ProductList } from "@/components/productList/ProductList";

import { MainLayout } from "@/layouts/mainLayout";

type MatchParams = {
  keyword: string;
};

export const SearchPage: React.FC = React.memo(() => {
  const { keyword } = useParams<MatchParams>(); // 这里的keyword必须跟App.tsx中定义路由的动态路由的参数变量名必须一致

  const loading = useSelector((state) => state.productSearch.loading);
  const error = useSelector((state) => state.productSearch.error);
  const pagination = useSelector((state) => state.productSearch.pagination);
  const productList = useSelector((state) => state.productSearch.data);

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(
      searchProduct({
        nextPage: 1,
        pageSize: 5,
        keyword,
      })
    );
  }, [dispatch, keyword, location]);

  const onPageChange = (curPage, clickPage, pageSize) => {
    if (curPage == clickPage) return;
    
    dispatch(
      searchProduct({
        nextPage: clickPage,
        pageSize,
        keyword,
      })
    );
  };

  if (loading) {
    return (
      <Spin
        size="large"
        style={{
          marginTop: 200,
          marginBottom: 200,
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        }}
      />
    );
  }

  if (error) {
    return <div>网站出错:{error}</div>;
  }

  return (
    <MainLayout>
      {/* 分类过滤器 */}
      <div className={styles["product-list-container"]}>
        <FilterArea />
      </div>
      {productList.length == 0 && <TestExport msg="无此旅游线路！" />}
      {/* 产品列表 */}
      <div className={styles["product-list-container"]}>
        <ProductList
          data={productList}
          paging={pagination}
          isSearch={true}
          onPageChange={onPageChange}
        />
      </div>
    </MainLayout>
  );
});
