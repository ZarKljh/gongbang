"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Main() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = () => {
    fetch("http://localhost:8090/api/v1/home")
      .then((result) => result.json())
      .then((result) => setThemes(result.data.themeList))
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h4>번호 / 제목 / 생성일</h4>
      {themes.length == 0 ? (
        <p>조회 내용이 없습니다.</p>
      ) : (
        <ul>
          {themes.map((theme) => (
            <li key={theme.id}>
              {theme.id} /
              <Link href={`/product/${theme.id}`}>{theme.name}</Link> /
              {theme.createdDate}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
