"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginUser() {
  const router = useRouter();

  const [user, setUser] = useState({
    userName: "",
    password: "",
    role: "USER",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:8090/api/auth/login/user`, {
      method: "POST",
      credentials: "include", //인증정보를 함께 보내는 경우, 쿠키와 같은 것들포함
      //서버에게 주고받는 데이터를 json형태로 하겠다고 선언하는 것
      headers: {
        "Content-Type": "application/json",
      },
      //무엇을 json으로 할지 선언한것
      body: JSON.stringify(user),
    });
    if (response.ok) {
      alert("login success");
      //router.push(`/article/${params.id}`);
    } else {
      alert("login fail");
    }
  };

  //로그아웃을 위한 메소드
  const handleLogout = async () => {
    const response = await fetch("http://localhost:8090/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      alert("logout success");
      //router.push(`/article/${params.id}`);
    } else {
      alert("logout fail");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    //console.log({...article, [name]: value});
  };

  return (
    <>
      <h4>로그인</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label>성명</label>
          <input type="text" name="userName" onChange={handleChange}></input>
        </div>
        <div>
          <label>패스워드</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
          ></input>
        </div>
        <div>
          <input type="submit" value="로그인" />
          {/* <button type="submit">등록</button> */}
        </div>
      </form>
      <button onClick={handleLogout}>로그아웃</button>
    </>
  );
}
