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

export default function Main() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategoriesByCat, setSubCategoriesByCat] = useState<
    Record<number, SubCategory[]>
  >({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async (): Promise<void> => {
    try {
      // 1️⃣ 카테고리 목록 먼저 요청
      const res = await fetch("http://localhost:8090/api/category/v1");
      if (!res.ok) throw new Error("카테고리 조회 실패");
      const data = await res.json();

      const categoryList: Category[] = data.data.categoryList;
      setCategories(categoryList);

      // 2️⃣ 카테고리 ID별로 서브카테고리 병렬 요청
      const subPromises = categoryList.map(async (cat) => {
        const res = await fetch(
          `http://localhost:8090/api/category/v1/${cat.id}/sub`
        );
        if (!res.ok) throw new Error(`서브카테고리 조회 실패: ${cat.id}`);
        const subData = await res.json();
        return [cat.id, subData.data.subCategoryList] as const;
      });

      // 3️⃣ 모든 fetch 결과를 병렬로 처리
      const results = await Promise.all(subPromises);

      // 4️⃣ categoryId를 key로 하는 객체 구조로 변환
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
    <main className="p-4">
      <h1 className="font-bold text-lg mb-4">카테고리 </h1>
      <nav aria-label="카테고리 슬라이더">
        <div class="slider" role="region" aria-roledescription="carousel">
          <button type="button" class="slider-prev" aria-label="이전 카테고리">
            &lt;
          </button>

          <ul class="category-list" role="list">
            {categories.map((cat) => (
              <li key={cat.id} className="mb-6">
                <button type="button" class="category-btn">
                  {" "}
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <button type="button" class="slider-next" aria-label="다음 카테고리">
            &gt;
          </button>
        </div>
      </nav>

      <header class="category-header">
        <div class="header-left">
          <h2 class="header-title">목록별 카테고리</h2>
          <button
            type="button"
            class="menu-toggle"
            aria-label="카테고리 메뉴 열기"
          >
            <span class="menu-icon"></span>
          </button>
        </div>

        <nav class="header-nav" aria-label="상단 메뉴">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="#">이벤트</a>
            </li>
            <li class="nav-item">
              <a href="#">셀러소개</a>
            </li>
            <li class="nav-item">
              <a href="#">문의사항</a>
            </li>
          </ul>
        </nav>
      </header>
      {categories.map((cat) => (
        <ul class="category-list" key={cat.id}>
          <li>
            <strong className="text-lg font-semibold mb-2"> {cat.name}</strong>
            <ul>
              {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                <li key={sub.id}>{sub.name}</li>
              ))}
            </ul>
          </li>
        </ul>
      ))}
    </main>
  );
}
