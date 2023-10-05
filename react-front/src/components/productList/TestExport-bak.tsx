import React from "react";

type PropsType = {
    msg: string;
}

const style: object = {
  "text-align": "center",
  fontWeight: "bold",
  color: "red",
};

export const TestExport: React.FC<PropsType> = ({ msg }) => {
  return <div style={style}> This is Module Export Test: {msg}</div>;
};


