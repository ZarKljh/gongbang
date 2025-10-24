"use client";

import { useState, useEffect } from "react";

export default function Personal() {
  const [personal, setPersonal] = useState([]);

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = () => {
    setPersonal([...personal, `${personal}`]);
  }

  return (
    <>
      <h4>마이페이지</h4>
      <div>{}</div>
    </>
  );
}