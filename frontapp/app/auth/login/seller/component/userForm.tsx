// auth/signup/seller/components/UserForm.tsx
import React from "react";

interface Props {
  userInfo: {
    email: "";
    password: "";
    confirmPassword: "";
    userName: "";
    gender: "";
    birth: "";
    nickName: "";
    mobilePhone: "";
  };
  setUserInfo: (info: any) => void;
  onNext: () => void;
}

export default function UserForm({ userInfo, setUserInfo, onNext }: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  return (
    <div>
      <h3>사용자 정보 입력</h3>
      <label>이름</label>
      <input
        type="text"
        name="userName"
        value={userInfo.userName}
        onChange={handleChange}
      />
      <label>성별</label>
      <select name="gender" value={userInfo.gender} onChange={handleChange}>
        <option value="">선택</option>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>
      <label>생년월일</label>
      <input
        type="date"
        name="birthDate"
        value={userInfo.birthDate}
        onChange={handleChange}
      />
      <button type="button" onClick={onNext}>
        다음 단계
      </button>
    </div>
  );
}
