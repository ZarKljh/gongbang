"use client";

import { useState, useEffect } from "react";
import "@/app/personal/page.css"

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
      <div className="container_box">
        <div className="container">
          <div className="myCategory">
            <p className="me user">내 정보 관리</p>
            <p className="me oder_delivery">주문 및 배송 관리</p>
            <p className="me cart">장바구니</p>
            <p className="me wishList">위시 리스트</p>
            <p className="me follow">팔로우</p>
            <p className="me address">배송지 관리</p>
            <p className="me payment">결제 수단 관리</p>
          </div>
          
          <div className="userState_box">
            <div className="myState">
              <div className="profileImage"></div>
              <div className="myProfile_box">
                <span>닉네임 님 안녕하세요.</span>
                <span>아이디 : id</span>
              </div>
              <div className="myReview_box">
                <span>상품 리뷰</span>
                <span>리뷰 수</span>
              </div>
              <div className="myQna_box">
                <span>문의</span>
                <span>문의 수</span>
              </div>
            </div>
            <div className="order_delivery_box">
              <div className="delivery_box">
                <div></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}