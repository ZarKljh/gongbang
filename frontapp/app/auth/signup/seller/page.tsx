"use client";
import React, { useState } from "react";
import { UserForm, StudioForm } from "./component/index.tsx";
import { UserInfo, StudioInfo } from "./types";

export default function SellerSignupPage() {
  const [step, setStep] = useState(1);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: "",
    password: "",
    confirmPassword: "",
    userName: "",
    gender: "",
    birth: "",
    nickName: "",
    mobilePhone: "",
  });

  const [studioInfo, setStudioInfo] = useState<StudioInfo>({
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
  });

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    //setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStudioInfo({ ...studioInfo, [name]: value });
    //setStudioInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = function () {
    setStep(2);
  };

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

    alert(response.ok ? "회원가입 완료!" : "회원가입 실패");
  };

  return (
    <section>
      <h3>셀러 회원가입페이지</h3>
      {step === 1 && (
        <UserForm
          userInfo={userInfo}
          onChange={handleUserChange}
          onNext={handleNext}
        />
      )}
      {step === 2 && (
        <StudioForm
          studioInfo={studioInfo}
          onChange={handleStudioChange}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
