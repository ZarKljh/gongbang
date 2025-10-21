"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Main() {
  const [categorys, setCategorys] = useState([]);

  useEffect(() => {
    fetchCategorys();
  }, []);

  const fetchCategorys = () => {
    fetch("http://localhost:8090/api/category/v1")
      .then((result) => result.json())
      .then((result) => setCategorys(result.data.categoryList))
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h4>번호 / 제목 / 생성일</h4>
      {categorys.length == 0 ? (
        <p>조회 내용이 없습니다.</p>
      ) : (
        <ul>
          {categorys.map((category) => (
            <li key={category.id}>
              {category.id} /
              <Link href={`/product/${category.id}`}>{category.name}</Link> /
              {category.createdDate}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
