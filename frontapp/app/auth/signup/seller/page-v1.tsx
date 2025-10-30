// auth/signup/seller/page.tsx
"use client";
import React, { useState } from "react";

//사용자정보 입력폼과 매장(studio)정보 입력폼을 index.tsx를 통해  한꺼번에 import한다
import { UserForm, StudioForm } from "./component v1/index.jsx";

export default function SellerSignupPage() {
  const [step, setStep] = useState(1);

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userName: "",
    gender: "",
    birth: "",
    nickName: "",
    mobilePhone: "",
  });

  const [studioInfo, setStudioInfo] = useState({
    categoryId: "",
    studioName: "",
    studioDescription: "",
    studioMobile: "",
    studioOfficeTell: "",
    studioFax: "",
    studioEmail: "",
    studioBusinessNumber: "",
    studioAddPostNumber: "",
    studioAddMain: "",
    studioAddDetail: "",
    businessNumber: "",
    address: "",
  });

  const handleNext = () => setStep(2);

  const handleSubmit = async () => {
    const payload = {
      ...userInfo,
      ...studioInfo,
      role: "SELLER",
    };

    const response = await fetch(
      "http://localhost:8090/api/auth/signup/seller",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      alert("회원가입 완료!");
    } else {
      alert("회원가입 실패");
    }
  };

  return (
    <section>
      <h3>셀러 회원가입페이지</h3>
      {step === 1 && (
        <UserForm
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          onNext={handleNext}
        />
      )}
      {step === 2 && (
        <StudioForm
          studioInfo={studioInfo}
          setStudioInfo={setStudioInfo}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
