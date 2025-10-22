"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Main() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);


  const fetchAll = async () => {
    try {
      // 카테고리 + 서브카테고리 병렬 요청
      const [categoryRes, subCategoryRes] = await Promise.all([
        fetch("http://localhost:8090/api/category/v1"),
        fetch("http://localhost:8090/api/category/v1/sub"),
      ]);

      const categoryData = await categoryRes.json();
      const subCategoryData = await subCategoryRes.json();

      setCategories(categoryData.data.categoryList);
      setSubCategories(subCategoryData.data.subCategoryList); // API 구조와 맞추기
    } catch (err) {
      console.error("fetchAll error:", err);
    }
  };





  return (
    <>
      <h4>Main - 번호 / 제목 / 생성일</h4>
      {categories.length == 0 ? (
        <p>조회 내용이 없습니다.</p>
      ) : (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              {category.id} /
              <Link href={`/abc/${category.id}`}>{category.name}</Link> /
              {category.createdDate}
            </li>
          ))}
        </ul>
      )}

      <h4>Sub - 번호 / 제목 / 생성일</h4>
      {subCategories.length == 0 ? (
        <p>조회 내용이 없습니다.</p>
      ) : (
        <ul>
          {subCategories.map((subcategory) => (
            <li key={subcategory.id}>
              {subcategory.id} /
              <Link href={`/abc/${subcategory.id}`}>{subcategory.name}</Link> /
              {subcategory.createdDate}
            </li>
          ))}
        </ul>
      )}

      <p>1번</p>
    </>
  );
}
