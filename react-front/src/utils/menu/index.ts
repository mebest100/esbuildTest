import React from "react";

import type { MenuProps } from "antd";

// 查看MenuProps的源码会发现=》MenuProps的items属性对应于ItemType[]数组,继续追溯ItemType源码，会发现ItemType是以下五大类型
// ItemType = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType | null;
// 所以这里定义的MenuItem实际指的这五种类型之一： MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType | null;
// ItemType可以在antd的官方文档看到：https://ant.design/components/menu-cn/#MenuItemType
// 至于为什么MenuItem最后是一个[number], 那是因为items对应的是ItemType类型的数组，因为是五大类型之一，所以这里
// number相当于是以上数组的下标，动态获取ItemType的具体类型
export type MenuItem = Required<MenuProps>["items"][number];

export const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem => {
  return {
   label,
   key,
   icon,
   children,
   type
  } as MenuItem;  // as是TS的类型断言，会将输入的数据根据as后面接的类型关键字，强制推断成该类型。
};
