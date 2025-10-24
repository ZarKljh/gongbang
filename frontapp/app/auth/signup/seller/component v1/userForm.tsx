// auth/signup/seller/components/UserForm.tsx
import React from "react";

interface UserInfo {
  email: "";
  password: "";
  confirmPassword: "";
  userName: "";
  gender: "";
  birth: "";
  nickName: "";
  mobilePhone: "";
}
/*
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
*/

interface UserFormProps {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  onNextStep: () => void;
}

export default function UserForm({
  userInfo,
  setUserInfo,
  onNextStep,
}: UserFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  return (
    <div>
      <h4>사용자 정보 입력</h4>
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
        name="birth"
        value={userInfo.birth}
        onChange={handleChange}
      />
      <button type="button" onClick={onNextStep}>
        다음 단계
      </button>
    </div>
  );
}
