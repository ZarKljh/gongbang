"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignupUser() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userName: "",
    gender: "",
    birth: "",
    nickName: "",
    mobilePhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //ToDo: 입력값validate 코드 작성
    /*
    const birthDateTime = formData.birth ? `${formData.birth}T00:00:00` : null;

    const payload = {
      ...formData,
      birth: birthDateTime,
    };
    */
    const response = await fetch(`http://localhost:8090/api/auth/signup/user`, {
      method: "POST",
      //서버에게 주고받는 데이터를 json형태로 하겠다고 선언하는 것
      headers: {
        "Content-Type": "application/json",
      },
      //무엇을 json으로 할지 선언한것
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("회원가입 성공하였습니다. 로그인을 해주세요");
      router.push("/");
    } else {
      alert("회원가입에 실패하였습니다");
    }
  };

  return (
    <section>
      <h3>일반회원 회원가입페이지</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이메일</label>
          <input
            type="text"
            name="email"
            onChange={handleChange}
            value={formData.email}
            placeholder="소문자로입력해주세요"
          />
        </div>
        <div>
          <label>패스워드</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            placeholder="패스워드"
          />
        </div>
        <div>
          <label>패스워드확인</label>
          <input
            type="password"
            name="confirmPassword"
            onChange={handleChange}
            value={formData.confirmPassword}
            placeholder="패스워드를 다시 입력해주세요"
          />
        </div>
        <div>
          <label>성명</label>
          <input
            type="text"
            name="userName"
            onChange={handleChange}
            value={formData.userName}
            placeholder="한글로 적어주세요"
          />
        </div>
        <div>
          <label>성별</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
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
            value={formData.birth}
            onChange={handleChange}
            min="1900-01-01"
          />
        </div>
        <div>
          <label>닉네임</label>
          <input
            type="text"
            name="nickName"
            value={formData.nickName}
            onChange={handleChange}
            placeholder="50자이내로 적어주세요"
          />
        </div>
        <div>
          <label>휴대전화</label>
          <input
            type="text"
            name="mobilePhone"
            value={formData.mobilePhone}
            onChange={handleChange}
            placeholder="번호만적어주세요"
          />
        </div>
        <div>
          <input type="submit" value="저장" />
          {/* <button type="submit">등록</button> */}
        </div>
      </form>
    </section>
  );
}
