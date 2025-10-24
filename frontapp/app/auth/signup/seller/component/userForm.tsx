import React from "react";
import { UserInfo } from "../types";

interface Props {
  userInfo: UserInfo;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onNext: () => void;
}

export default function UserForm({ userInfo, onChange, onNext }: Props) {
  return (
    <div>
      <h4>사용자 정보 입력</h4>
      <label>이름</label>
      <input
        type="text"
        name="userName"
        value={userInfo.userName}
        onChange={onChange}
      />
      <label>성별</label>
      <select name="gender" value={userInfo.gender} onChange={onChange}>
        <option value="">선택</option>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>
      <label>생년월일</label>
      <input
        type="date"
        name="birth"
        value={userInfo.birth}
        onChange={onChange}
      />
      <button type="button" onClick={onNext}>
        다음 단계
      </button>
    </div>
  );
}
