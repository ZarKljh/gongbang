"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [activeSubTab, setActiveSubTab] = useState("product");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTimeLeft, setAuthTimeLeft] = useState(0);
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const API_BASE_URL = "/api";

  // 클라이언트 전용: 쿠키에서 accessToken 가져오기
  const getTokenFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/accessToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // JWT 파싱 유틸
  const parseJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT 파싱 실패:", e);
      return null;
    }
  };

  // 클라이언트에서만 토큰과 userId 설정
  useEffect(() => {
    const t = getTokenFromCookie();
    if (t) {
      setToken(t);
      const decoded = parseJWT(t);
      const id = decoded?.id || decoded?.userId || decoded?.sub || null;
      setUserId(id);
    } else {
      console.warn("❌ accessToken을 찾을 수 없습니다.");
      setLoading(false);
    }
  }, []);

  const [userData, setUserData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [followList, setFollowList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalCoupons: 0,
    totalReviews: 0,
    membershipLevel: "Newbie",
  });

  // userId가 세팅되면 데이터 로드
  useEffect(() => {
    if (!userId) return;
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchOrders(),
        fetchAddresses(),
        fetchPaymentMethods(),
        fetchWishList(),
        fetchFollowList(),
        fetchCoupons(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(data);
      setTempData(data);
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (error) {
      console.error("주문 내역 조회 실패:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user-addresses?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(data);
    } catch (error) {
      console.error("배송지 조회 실패:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/payment-methods?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(data);
    } catch (error) {
      console.error("결제수단 조회 실패:", error);
    }
  };

  const fetchWishList = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/wishlists?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishList(data);
    } catch (error) {
      console.error("위시 목록 조회 실패:", error);
    }
  };

  const fetchFollowList = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/follows?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowList(data);
    } catch (error) {
      console.error("팔로우 목록 조회 실패:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/coupons?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data);
    } catch (error) {
      console.error("쿠폰 조회 실패:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/${userId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch (error) {
      console.error("통계 조회 실패:", error);
    }
  };

  // SMS 인증 타이머
  useEffect(() => {
    if (isAuthenticated && authTimeLeft > 0) {
      const timer = setInterval(() => {
        setAuthTimeLeft((prev) => {
          if (prev <= 1) {
            setIsAuthenticated(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated, authTimeLeft]);

  // SMS 인증
  const handleAuth = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/sms`,
        { userId, phone: userData?.mobilePhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setIsAuthenticated(true);
        setAuthTimeLeft(21600);
        alert("SMS 인증이 완료되었습니다.");
      }
    } catch (error) {
      console.error("SMS 인증 실패:", error);
      alert("인증에 실패했습니다.");
    }
  };

  // 기타 편집 함수들 (기존 동일)
  const handleEdit = (section) => {
    if (!isAuthenticated) {
      alert("정보 수정을 위해서는 SMS 인증이 필요합니다.");
      return;
    }
    setEditMode({ ...editMode, [section]: true });
    setTempData({ ...userData });
  };

  const handleSave = async (section) => {
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/users/${userId}`, tempData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(data);
      setEditMode({ ...editMode, [section]: false });
      alert("정보가 수정되었습니다.");
    } catch (error) {
      console.error("정보 수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  const handleCancel = (section) => {
    setTempData({ ...userData });
    setEditMode({ ...editMode, [section]: false });
  };

  const handleAddAddress = async (addressData) => {
    try {
      await axios.post(`${API_BASE_URL}/user-addresses`, { ...addressData, userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAddresses();
      alert("배송지가 추가되었습니다.");
    } catch (error) {
      console.error("배송지 추가 실패:", error);
      alert("배송지 추가에 실패했습니다.");
    }
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      await axios.patch(`${API_BASE_URL}/user-addresses/${addressId}`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAddresses();
      alert("배송지가 수정되었습니다.");
    } catch (error) {
      console.error("배송지 수정 실패:", error);
      alert("배송지 수정에 실패했습니다.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/user-addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAddresses();
      alert("배송지가 삭제되었습니다.");
    } catch (error) {
      console.error("배송지 삭제 실패:", error);
      alert("배송지 삭제에 실패했습니다.");
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await axios.post(`${API_BASE_URL}/payment-methods`, { ...paymentData, userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPaymentMethods();
      alert("결제수단이 추가되었습니다.");
    } catch (error) {
      console.error("결제수단 추가 실패:", error);
      alert("결제수단 추가에 실패했습니다.");
    }
  };

  const handleRemoveWish = async (wishlistId) => {
    try {
      await axios.delete(`${API_BASE_URL}/wishlists/${wishlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWishList();
    } catch (error) {
      console.error("찜 삭제 실패:", error);
    }
  };

  const handleUnfollow = async (followId) => {
    try {
      await axios.delete(`${API_BASE_URL}/follows/${followId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFollowList();
    } catch (error) {
      console.error("언팔로우 실패:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <div>로딩중...</div>
      </div>
    );
  }

  if (!token || !userId) {
    return (
      <div>
        <div>
          <p>로그인이 필요합니다.</p>
          <button onClick={() => window.location.href = '/auth/login'}>
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div>
        <div>사용자 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* 왼쪽 사이드바 */}
      <div>
        <h1>{userData.userName}</h1>
        
        <nav>
          <div>
            <h2>나의 쇼핑정보</h2>
            <ul>
              <li>
                <button onClick={() => setActiveTab('orders')}>
                  주문배송조회
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')}>
                  상품 리뷰
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('coupons')}>
                  쿠폰
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2>나의 계정정보</h2>
            <ul>
              <li>
                <button onClick={() => setActiveTab('profile')}>
                  회원정보수정
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('addresses')}>
                  배송지 관리
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('payment')}>
                  결제수단
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('wishlist')}>
                  나의 좋아요
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2>고객센터</h2>
            <ul>
              <li>1:1 문의</li>
              <li>상품 Q&A 내역</li>
              <li>FAQ</li>
            </ul>
          </div>
        </nav>
      </div>

      {/* 오른쪽 콘텐츠 */}
      <div>
        <div>
          
          {/* SMS 인증 배너 */}
          {!isAuthenticated && (
            <div>
              <span>정보 수정을 위해 SMS 인증이 필요합니다 (6시간 유효)</span>
              <button onClick={handleAuth}>
                인증하기
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div>
              인증 완료 - 남은 시간: {formatTime(authTimeLeft)}
            </div>
          )}

          {/* 등급 및 포인트 정보 */}
          <div>
            <table>
              <thead>
                <tr>
                  <th>멤버십 등급</th>
                  <th>적립금</th>
                  <th>상품 리뷰</th>
                  <th>쿠폰</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{stats.membershipLevel}</td>
                  <td>{stats.totalPoints}</td>
                  <td>{stats.totalReviews}</td>
                  <td>{stats.totalCoupons}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 주문배송조회 */}
          {activeTab === 'orders' && (
            <div>
              <div>
                <h2>최근 주문</h2>
                <button>
                  더보기 <ChevronRight size={16} />
                </button>
              </div>

              {orders.length === 0 ? (
                <div>
                  주문 내역이 없습니다.
                </div>
              ) : (
                <div>
                  {orders.map(order => (
                    <div key={order.orderId}>
                      <div>
                        <div>
                          <p>{order.createdDate}</p>
                          <p>주문번호: {order.orderCord}</p>
                        </div>
                        <span>
                          {order.deliveryStatus}
                        </span>
                      </div>
                      
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx}>
                          <p>{item.productName}</p>
                          <p>
                            {item.price?.toLocaleString()}원 / {item.quantity}개
                          </p>
                        </div>
                      ))}

                      <div>
                        <p>
                          {order.trackingNumber && `운송장: ${order.trackingNumber}`}
                        </p>
                        <p>
                          총 {order.totalPrice?.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 회원정보수정 */}
          {activeTab === 'profile' && (
            <div>
              <div>
                <h2>회원정보수정</h2>
                {!editMode.profile ? (
                  <button onClick={() => handleEdit('profile')}>
                    수정
                  </button>
                ) : (
                  <div>
                    <button onClick={() => handleSave('profile')}>
                      저장
                    </button>
                    <button onClick={() => handleCancel('profile')}>
                      취소
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div>
                  <label>이름</label>
                  {editMode.profile ? (
                    <input
                      type="text"
                      value={tempData.userName}
                      onChange={(e) => setTempData({...tempData, userName: e.target.value})} />
                  ) : (
                    <p>{userData.userName}</p>
                  )}
                </div>

                <div>
                  <label>닉네임</label>
                  {editMode.profile ? (
                    <input
                      type="text"
                      value={tempData.nickName}
                      onChange={(e) => setTempData({...tempData, nickName: e.target.value})} />
                  ) : (
                    <p>{userData.nickName}</p>
                  )}
                </div>

                <div>
                  <label>이메일</label>
                  {editMode.profile ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) => setTempData({...tempData, email: e.target.value})} />
                  ) : (
                    <p>{userData.email}</p>
                  )}
                </div>

                <div>
                  <label>휴대폰</label>
                  {editMode.profile ? (
                    <input
                      type="tel"
                      value={tempData.mobilePhone}
                      onChange={(e) => setTempData({...tempData, mobilePhone: e.target.value})} />
                  ) : (
                    <p>{userData.mobilePhone}</p>
                  )}
                </div>

                <div>
                  <label>생년월일</label>
                  {editMode.profile ? (
                    <input
                      type="date"
                      value={tempData.birth}
                      onChange={(e) => setTempData({...tempData, birth: e.target.value})} />
                  ) : (
                    <p>{userData.birth}</p>
                  )}
                </div>

                <div>
                  <label>성별</label>
                  {editMode.profile ? (
                    <select value={tempData.gender} onChange={(e) => setTempData({...tempData, gender: e.target.value})}>
                      <option value="MALE">남성</option>
                      <option value="FEMALE">여성</option>
                    </select>
                  ) : (
                    <p>{userData.gender === 'MALE' ? '남성' : '여성'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 배송지 관리 */}
          {activeTab === 'addresses' && (
            <div>
              <div>
                <h2>배송지 관리</h2>
                <button onClick={() => alert('배송지 추가 모달을 열어주세요')}>
                  + 새 배송지 추가
                </button>
              </div>

              <div>
                {addresses.map(addr => (
                  <div key={addr.userAddressId}>
                    <div>
                      <div>
                        <span>{addr.recipientName}</span>
                        {addr.isDefault && (
                          <span>기본배송지</span>
                        )}
                      </div>
                      <div>
                        <button onClick={() => alert('배송지 수정 모달을 열어주세요')}>
                          수정
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.userAddressId)}>
                          삭제
                        </button>
                      </div>
                    </div>
                    <p>[{addr.zipcode}]</p>
                    <p>{addr.baseAddress}</p>
                    <p>{addr.detailAddress}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결제수단 */}
          {activeTab === 'payment' && (
            <div>
              <div>
                <h2>결제수단</h2>
                <button onClick={() => alert('결제수단 추가 모달을 열어주세요')}>
                  + 결제수단 추가
                </button>
              </div>

              <div>
                {paymentMethods.map(method => (
                  <div key={method.paymentId}>
                    <div>
                      <div>
                        <div>
                          <span>
                            {method.type === 'CARD' ? '신용카드' : '계좌이체'}
                          </span>
                          {method.defaultPayment && (
                            <span>기본결제</span>
                          )}
                        </div>
                        <p>{method.cardCompany || method.bankName}</p>
                        <p>{method.cardNumber || method.accountNumber}</p>
                      </div>
                      <button>수정</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 나의 좋아요 */}
          {activeTab === 'wishlist' && (
            <div>
              <div>
                <h2>나의 좋아요</h2>
                <div>
                  <button onClick={() => setActiveSubTab('product')}>
                    Product
                  </button>
                  <button onClick={() => setActiveSubTab('brand')}>
                    Brand
                  </button>
                </div>
              </div>

              {activeSubTab === 'product' && (
                <div>
                  {wishList.length === 0 ? (
                    <div>
                      좋아요한 상품이 없습니다.
                    </div>
                  ) : (
                    <div>
                      {wishList.map(item => (
                        <div key={item.wishlistId}>
                          <div></div>
                          <div>
                            <p>{item.productName}</p>
                            <p>{item.price?.toLocaleString()}원</p>
                            <button onClick={() => handleRemoveWish(item.wishlistId)}>
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'brand' && (
                <div>
                  {followList.length === 0 ? (
                    <div>
                      팔로우한 브랜드가 없습니다.
                    </div>
                  ) : (
                    <div>
                      {followList.map(follow => (
                        <div key={follow.followId}>
                          <div>
                            <div></div>
                            <div>
                              <p>{follow.studioName}</p>
                              <p>{follow.createdAt}</p>
                            </div>
                          </div>
                          <button onClick={() => handleUnfollow(follow.followId)}>
                            언팔로우
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 쿠폰 */}
          {activeTab === 'coupons' && (
            <div>
              <div>
                <h2>쿠폰</h2>
              </div>

              {coupons.length === 0 ? (
                <div>
                  보유한 쿠폰이 없습니다.
                </div>
              ) : (
                <div>
                  {coupons.map(coupon => (
                    <div key={coupon.couponId}>
                      <div>
                        <div>
                          <p>{coupon.name}</p>
                          <p>
                            {coupon.discountCategory === 'RATE' 
                              ? `${coupon.discountRate}% 할인` 
                              : `${coupon.discountAmount?.toLocaleString()}원 할인`}
                          </p>
                          <p>유효기간: {coupon.expiredAt}</p>
                        </div>
                        <span>
                          {coupon.couponStatus ? '사용가능' : '사용완료'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 상품리뷰 */}
          {activeTab === 'reviews' && (
            <div>
              <div>
                <h2>상품 리뷰</h2>
              </div>
              <div>
                작성한 리뷰가 없습니다.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}