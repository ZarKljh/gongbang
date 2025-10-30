"use client";
import React, { useState, useEffect } from "react";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [activeSubTab, setActiveSubTab] = useState("product");

  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [followList, setFollowList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await fetch("http://localhost:8090/api/v1/mypage/me");
        const dataUser = await resUser.json();
        setUserData(dataUser.data || null);

        const resOrders = await fetch("http://localhost:8090/api/v1/mypage/orders");
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.data || []);

        const resAddresses = await fetch("http://localhost:8090/api/v1/mypage/addresses");
        const dataAddresses = await resAddresses.json();
        setAddresses(dataAddresses.data || []);

        const resPayments = await fetch("http://localhost:8090/api/v1/mypage/payment-methods");
        const dataPayments = await resPayments.json();
        setPaymentMethods(dataPayments.data || []);

        const resWishList = await fetch("http://localhost:8090/api/v1/mypage/wishlist");
        const dataWishList = await resWishList.json();
        setWishList(dataWishList.data || []);

        const resFollow = await fetch("http://localhost:8090/api/v1/mypage/follow");
        const dataFollow = await resFollow.json();
        setFollowList(dataFollow.data || []);

        const resCoupons = await fetch("http://localhost:8090/api/v1/mypage/coupon");
        const dataCoupons = await resCoupons.json();
        setCoupons(dataCoupons.data || []);

        const resCart = await fetch("http://localhost:8090/api/v1/mypage/cart");
        const dataCart = await resCart.json();
        setCart(dataCart.data || []);

      } catch (err) {
        console.error("데이터 fetch 실패", err);
      }
    };

    fetchData();
  }, []);

  if (!userData) return <div>로딩중...</div>;

  return (
    <div>
      {/* 왼쪽 메뉴 */}
      <div>
        <h1>{userData.userName}</h1>
        <nav>
          <button onClick={() => setActiveTab("orders")}>주문배송조회</button>
          <button onClick={() => setActiveTab("reviews")}>상품 리뷰</button>
          <button onClick={() => setActiveTab("coupons")}>쿠폰</button>
          <button onClick={() => setActiveTab("profile")}>회원정보수정</button>
          <button onClick={() => setActiveTab("addresses")}>배송지 관리</button>
          <button onClick={() => setActiveTab("payment")}>결제수단</button>
          <button onClick={() => setActiveTab("wishlist")}>나의 좋아요</button>
          <button onClick={() => setActiveTab("cart")}>장바구니</button>
        </nav>
      </div>

      {/* 오른쪽 콘텐츠 */}
      <div>
        {activeTab === "profile" && (
          <div>
            <h2>회원정보</h2>
            <p>이름: {userData.userName}</p>
            <p>닉네임: {userData.nickName}</p>
            <p>이메일: {userData.email}</p>
            <p>휴대폰: {userData.mobilePhone}</p>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2>최근 주문</h2>
            {orders.length === 0 && <p>주문 내역이 없습니다.</p>}
            {orders.map(order => (
              <div key={order.orderId}>
                <p>주문번호: {order.orderCord}</p>
                <p>총액: {order.totalPrice}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <h2>배송지 관리</h2>
            {addresses.map(addr => (
              <div key={addr.userAddressId}>
                <p>{addr.recipientName}</p>
                <p>{addr.baseAddress} {addr.detailAddress}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payment" && (
          <div>
            <h2>결제수단</h2>
            {paymentMethods.map(p => (
              <div key={p.paymentId}>
                <p>{p.cardCompany} {p.cardNumber}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2>찜 목록</h2>
            {wishList.map(item => (
              <div key={item.wishlistId}>{item.productName} - {item.price}</div>
            ))}
          </div>
        )}

        {activeTab === "coupons" && (
          <div>
            <h2>쿠폰</h2>
            {coupons.map(c => (
              <div key={c.couponId}>{c.name}</div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2>상품 리뷰</h2>
            <p>작성한 리뷰가 없습니다.</p>
          </div>
        )}

        {activeTab === "cart" && (
          <div>
            <h2>장바구니</h2>
            {cart.length === 0 && <p>장바구니가 비어있습니다.</p>}
            {cart.map(item => (
              <div key={item.cartId}>
                <p>상품: {item.productName}</p>
                <p>수량: {item.quantity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
