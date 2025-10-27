"use client";

import { useState, useEffect } from "react";
import "@/app/personal/page.css"
import api from "../utils/api"

export default function Personal() {
  const [user, setUser] = useState([]);
  const [cart, setCart] = useState([]);
  const [follow, setFollow] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItem, setOrderItem] = useState([]);
  const [payment, setPaymentData] = useState([]);
  const [userAddress, setUserAddressData] = useState([]);
  const [wishList, setWishListData] = useState([]);

  useEffect(() => {
    getUser();
    getCart();
    getFollow();
    getDelivery();
    getOrders();
    getOrderItem();
    getPayment();
    getUserAddress();
    getWishList();
  }, []);

  const getUser = async () => {
    const result = await fetch(`http://localhost:8090/api/v1/mypage/${user.id}`).then(
            (row) => row.json()
        );
        setUser(result.data.user);
        console.log(result.data.user);
  }

  const getCart = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/cart").then(
            (row) => row.json()
        );
        setCart(result.data.cart);
        console.log(result.data.cart);
  }

  const getFollow = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/follow").then(
            (row) => row.json()
        );
        setFollow(result.data.follow);
        console.log(result.data.follow);
  }

  const getDelivery = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/delivery").then(
            (row) => row.json()
        );
        setDelivery(result.data.delivery);
        console.log(result.data.delivery);
  }

  const getOrders = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/orders").then(
            (row) => row.json()
        );
        setOrders(result.data.orders);
        console.log(result.data.orders);
  }

  const getOrderItem = async () => {
    const result = await fetch(`http://localhost:8090/api/v1/mypage/orders/${orders.orderId}`).then(
            (row) => row.json()
        );
        setOrderItem(result.data.orderItem);
        console.log(result.data.orderItem);
  }

  const getPayment = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/payment-methods").then(
            (row) => row.json()
        );
        setPaymentData(result.data.payment);
        console.log(result.data.payment);
  }

  const getUserAddress = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/addresses").then(
            (row) => row.json()
        );
        setUserAddressData(result.data.userAddress);
        console.log(result.data.userAddress);
  }

  const getWishList = async () => {
    const result = await fetch("http://localhost:8090/api/v1/mypage/wishlist").then(
            (row) => row.json()
        );
        setWishListData(result.data.wishList);
        console.log(result.data.wishList);
  }

  return (
    <>
      <h4>마이페이지</h4>
      <div>{}</div>
      <div className="container_box">
        <div className="container">
          <div className="myCategory">
            <a className="me user">내 정보 관리</a>
            <a className="me oder_delivery">주문 및 배송 관리</a>
            <a className="me cart">장바구니</a>
            <a className="me wishList">위시 리스트</a>
            <a className="me follow">팔로우</a>
            <a className="me address">배송지 관리</a>
            <a className="me payment">결제 수단 관리</a>
          </div>
          
          <div className="userState_box">
            <div className="myState">
              <div className="profileImage"></div>
              <div className="myProfile_box">
                <span>{user.userName} 님 안녕하세요.</span>
                <span>아이디 : {user.id}</span>
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

            <div className="my_info_box">
              <div>
                
              </div>
            </div>

            <div className="order_delivery_box">
              <span>배송 관리</span>
              <div className="delivery_box">
                <div className="before_delivery">
                  <span>배송 대기 상품</span>
                  <span>0</span>
                </div>
                <div className="during_delivery">
                  <span>배송 중 상품</span>
                  <span>0</span>
                </div>
                <div className="delivery_complete">
                  <span>배송 완료 상품</span>
                  <span>0</span>
                </div>
              </div>
              <span>주문 관리</span>
              <div className="order_box">
                <span>주문 일시</span>
                <div className="order">
                  <div className="order_product_img">
                    <div className="order_product_img_1"></div>
                    <div className="order_product_img_2"></div>
                    <div className="order_product_img_3"></div>
                  </div>
                   <a /*onClick={}*/ className="order_detail_btn">◦◦◦<br />더보기</a>
                  <div className="order_info">
                    <span>상품 정보</span>
                    <span>상품 수량</span>
                    <span>상품 총 가격</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}