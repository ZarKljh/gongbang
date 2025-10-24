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
      <div>
        <label>이메일</label>
        <input
          type="text"
          name="email"
          value={userInfo.email}
          onChange={onChange}
          placeholder="소문자로입력해주세요"
        />
      </div>
      <div>
        <label>패스워드</label>
        <input
          type="password"
          name="password"
          value={userInfo.password}
          onChange={onChange}
          placeholder="패스워드"
        />
      </div>
      <div>
        <label>패스워드확인</label>
        <input
          type="password"
          name="confirmPassword"
          value={userInfo.confirmPassword}
          onChange={onChange}
          placeholder="패스워드를 다시 입력해주세요"
        />
      </div>
      <div>
        <label>성명</label>
        <input
          type="text"
          name="userName"
          value={userInfo.userName}
          onChange={onChange}
          placeholder="한글로 적어주세요"
        />
      </div>
      <div>
        <label>성별</label>
        <select name="gender" value={userInfo.gender} onChange={onChange}>
          <option value="" disabled>
            성별을 선택해주세요
          </option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
      </div>
      <div>
        <label>생년월일</label>
        <input
          type="date"
          name="birth"
          value={userInfo.birth}
          onChange={onChange}
          min="1900-01-01"
        />
      </div>
      <div>
        <label>닉네임</label>
        <input
          type="text"
          name="nickName"
          value={userInfo.nickName}
          onChange={onChange}
          placeholder="50자이내로 적어주세요"
        />
      </div>
      <div>
        <label>휴대전화</label>
        <input
          type="text"
          name="mobilePhone"
          value={userInfo.mobilePhone}
          onChange={onChange}
          placeholder="번호만적어주세요"
        />
      </div>
      <button type="button" onClick={onNext}>
        다음 단계
      </button>
    </div>
  );
}
