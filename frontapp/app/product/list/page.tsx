"use client";

import { useEffect, useState } from "react";

// 타입 정의 (백엔드 DTO 구조에 맞춰 수정 가능)
type Category = {
  id: number;
  name: string;
};

type SubCategory = {
  id: number;
  name: string;
  categoryId: number;
};

export default function product() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategoriesByCat, setSubCategoriesByCat] = useState<
    Record<number, SubCategory[]>
  >({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async (): Promise<void> => {
    try {
      // 1 카테고리 목록 먼저 요청
      const res = await fetch("http://localhost:8090/api/category/v1");
      if (!res.ok) throw new Error("카테고리 조회 실패");
      const data = await res.json();

      const categoryList: Category[] = data.data.categoryList;
      setCategories(categoryList);

      // 2 카테고리 ID별로 서브카테고리 병렬 요청
      const subPromises = categoryList.map(async (cat) => {
        const res = await fetch(
          `http://localhost:8090/api/category/v1/${cat.id}/sub`
        );
        if (!res.ok) throw new Error(`서브카테고리 조회 실패: ${cat.id}`);
        const subData = await res.json();
        return [cat.id, subData.data.subCategoryList] as const;
      });

      // 3 모든 fetch 결과를 병렬로 처리
      const results = await Promise.all(subPromises);

      // 4 categoryId를 key로 하는 객체 구조로 변환
      const subMap: Record<number, SubCategory[]> = {};
      results.forEach(([catId, subs]) => {
        subMap[catId] = subs;
      });

      setSubCategoriesByCat(subMap);
    } catch (err) {
      console.error("fetchAll error:", err);
    }
  };
  return (
    <>
      <nav class="category-tree" aria-label="카테고리 메뉴">
        <h2>카테고리</h2>
        {categories.map((cat) => (
          <ul class="category-list" key={cat.id}>
            <li class="category-item">
              <button class="category-toggle" aria-expanded="false">
                {cat.name} <span class="icon">+</span>
              </button>
              <ul class="subcategory-list">
                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                  <li key={sub.id}>
                    <a href="#">{sub.name}</a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        ))}
      </nav>

      <section class="filter-area">
        <h2 class="filter-title">필터영역</h2>
        <ul class="filter-list">
          <li class="filter-item">
            <button type="button">필터 1</button>
          </li>
          <li class="filter-item">
            <button type="button">필터 2</button>
          </li>
          <li class="filter-item">
            <button type="button">필터 3</button>
          </li>
          <li class="filter-item">
            <button type="button">필터 4</button>
          </li>
          <li class="filter-item">
            <button type="button">필터 5</button>
          </li>
        </ul>
      </section>
    </>
  );
}
