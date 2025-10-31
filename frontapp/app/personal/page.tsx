'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { ChevronRight } from "lucide-react";
import "@/app/personal/page.css"
import Head from "next/head";

export default function MyPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [activeTab, setActiveTab] = useState('orders')
    const [activeSubTab, setActiveSubTab] = useState('product')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authTimeLeft, setAuthTimeLeft] = useState(0)
    const [tokenInput, setTokenInput] = useState('')
    const [editMode, setEditMode] = useState({})
    const [loading, setLoading] = useState(true)

    const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

    const [userData, setUserData] = useState<any>(null)
    const [tempData, setTempData] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [addresses, setAddresses] = useState<any[]>([])
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [wishList, setWishList] = useState<any[]>([])
    const [followList, setFollowList] = useState<any[]>([])
    const [stats, setStats] = useState<any>({
        totalPoints: 0,
        totalReviews: 0,
        membershipLevel: 'Newbie',
    })

    // 모달
    const [isAddressModal, setIsAddressModal] = useState(false)
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [isOrdersModal, setIsOrdersModal] = useState(false)
    const [newAddress, setNewAddress] = useState({
        recipientName: '',
        zipcode: '',
        baseAddress: '',
        detailAddress: '',
        extraAddress: '',
        isDefault: false,
    });
    // ------------------- 유저 정보 가져오기 -------------------
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });

                if (data.code === "401") {
                    window.location.href = "/auth/login";
                    return;
                }

                setUserData(data?.data || null);
            } catch (error: any) {
                console.error("사용자 정보 조회 실패:", error);
                alert("사용자 정보를 불러오는 중 문제가 발생했습니다. 다시 로그인 해주세요.");
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (!userData?.id) return;

        const loadAllData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchOrders(userData.id),
                    fetchAddresses(userData.id),
                    fetchPaymentMethods(userData.id),
                    fetchWishList(userData.id),
                    fetchFollowList(userData.id),
                    fetchStatsData(userData.id),
                ]);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [userData]);

    //모달이 열릴 때 스크립트를 로드 -->주소
    useEffect(() => {
        if (isAddressModal && !window.daum) {
            const script = document.createElement("script");
            script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isAddressModal]);

    // ------------------- API 요청 함수 -------------------
    const fetchOrders = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/orders?userId=${id}`, { withCredentials: true });
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('주문 내역 조회 실패:', error);
            setOrders([]);
        }
    };

    const fetchAddresses = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/addresses?userId=${id}`, { withCredentials: true });
            setAddresses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('배송지 조회 실패:', error);
            setAddresses([]);
        }
    };

    const fetchPaymentMethods = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/payment-methods?userId=${id}`, { withCredentials: true });
            setPaymentMethods(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('결제수단 조회 실패:', error);
            setPaymentMethods([]);
        }
    };

    const fetchWishList = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/wishlist?userId=${id}`, { withCredentials: true });
            setWishList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('위시 목록 조회 실패:', error);
            setWishList([]);
        }
    };

    const fetchFollowList = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/follow?userId=${id}`, { withCredentials: true });
            setFollowList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('팔로우 목록 조회 실패:', error);
            setFollowList([]);
        }
    };

    const fetchStatsData = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`${API_BASE_URL}/stats?userId=${id}`, { withCredentials: true });
            setStats(data);
        } catch (error) {
            console.error('통계 조회 실패:', error);
        }
    }

    // 카카오 주소 AIP
    const sample6_execDaumPostcode = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert("카카오 우편번호 API가 아직 로드되지 않았습니다.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                let extraAddr = '';

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) extraAddr += data.bname;
                    if (data.buildingName !== '' && data.apartment === 'Y')
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    if (extraAddr !== '') extraAddr = ' (' + extraAddr + ')';
                }

                //React state로 업데이트
                setNewAddress(prev => ({
                    ...prev,
                    zipcode: data.zonecode,
                    baseAddress: addr,
                    extraAddress: extraAddr,
                }));
            },
        }).open();
    };

    // ------------------- 이메일 인증 -------------------
    const handleSendEmail = async () => {
        if (!userData?.email) return alert("사용자 이메일이 없습니다.");
        try {
            await axios.post(`${API_BASE_URL}/mail/send`, {
                email: userData.email,
                userId: userData.id,
                userName: userData.userName
            }, { headers: { "Content-Type": "application/json" } });
            alert("인증 메일이 발송되었습니다. 메일을 확인해주세요.");
        } catch (error: any) {
            console.error("메일 발송 실패:", error);
            alert("메일 발송에 실패했습니다.");
        }
    };

    const handleVerifyToken = async () => {
        if (!tokenInput) return alert("인증번호를 입력해주세요.");
        try {
            const { data } = await axios.post(`${API_BASE_URL}/mail/verify`, {
                email: userData.email,
                token: tokenInput,
            });
            if (data.status === "success") {
                setIsAuthenticated(true);
                alert("이메일 인증이 완료되었습니다.");
            } else if (data.status === "expired") {
                alert("인증번호가 만료되었습니다. 다시 발송해주세요.");
            } else {
                alert("인증번호가 올바르지 않습니다.");
            }
        } catch (error) {
            console.error("인증 실패:", error);
            alert("인증 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        if (isAuthenticated && authTimeLeft > 0) {
            const timer = setInterval(() => {
                setAuthTimeLeft(prev => {
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

    // ------------------- 회원 정보 수정 -------------------
    const handleEdit = (section: string) => {
        if (!isAuthenticated) return alert('정보 수정을 위해 이메일 인증이 필요합니다.');
        setEditMode({ ...editMode, [section]: true });
        setTempData({ ...userData });
    };

    const handleSave = async (section: string) => {
        if (!userData?.id) return;
        if (newPassword && newPassword !== confirmPassword) 
            return alert('비밀번호와 확인 비밀번호가 일치하지 않습니다.');

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/me/${userData.id}`,
                {
                    nickName: tempData.nickName,
                    email: tempData.email,
                    mobilePhone: tempData.mobilePhone,
                    ...(newPassword ? { password: newPassword } : {}),
                },
                { withCredentials: true }
            );

            if (data.resultCode === "200" && data.data) {
                setUserData(data.data);
                setEditMode({ ...editMode, [section]: false });
                setNewPassword('');
                setConfirmPassword('');
                alert(data.msg || '정보가 수정되었습니다.');
            } else {
                console.error('정보 수정 실패:', data);
                alert(`수정에 실패했습니다: ${data.msg || '오류가 발생했습니다.'}`);
            }
        } catch (error: any) {
            console.error('정보 수정 실패:', error.response?.data || error.message);
            alert('수정에 실패했습니다.');
        }
    };

    const handleCancel = (section: string) => {
        setTempData({ ...userData })
        setEditMode({ ...editMode, [section]: false })
    }

    // 저장 함수
    const handleSaveAddress = async () => {
        if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
            return alert('이름과 주소를 모두 입력해주세요.');
        }

        try {
            const { data } = await axios.post(
            `${API_BASE_URL}/addresses`,
            newAddress,
            { withCredentials: true }
            );

            if (data.resultCode === '200') {
                alert('배송지 등록 성공');
                setAddresses([...addresses, data.data]); // 기존 목록에 추가
                setIsAddressModal(false); // 모달 닫기
                setNewAddress({ recipientName: '', zipcode: '', baseAddress: '', detailAddress: '', extraAddress: '', isDefault: false });
            } else {
                alert(`등록 실패: ${data.msg}`);
            }
        } catch (error) {
            console.error(error);
            alert('배송지 등록 중 오류가 발생했습니다.');
        }
    };

    // ------------------- 로딩 / 로그인 체크 -------------------
    if (loading) return <div>로딩중...</div>
    if (!userData) return <div>로그인이 필요합니다. <button onClick={() => 
        window.location.href='/auth/login'}>로그인하기</button></div>

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}시간 ${m}분 ${s}초`
    }
    
    /** ------------------- 렌더링 ------------------- */
    return (
        <div className="mypage-container">
            {/* 왼쪽 사이드바 */}
            <div className="mypage-sidebar">
                <h1>{userData.userName}</h1>

                <nav>
                <div className="nav-section">
                    <h2>나의 쇼핑정보</h2>
                    <ul>
                    <li>
                        <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>주문배송조회</button>
                    </li>
                    <li>
                        <button className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>상품 리뷰</button>
                    </li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h2>나의 계정정보</h2>
                    <ul>
                    <li>
                        <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>회원정보수정</button>
                    </li>
                    <li>
                        <button className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>배송지 관리</button>
                    </li>
                    <li>
                        <button className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>결제수단</button>
                    </li>
                    <li>
                        <button className={`nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>나의 좋아요</button>
                    </li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h2>고객센터</h2>
                    <ul>
                        <li>상품 문의 내역</li>
                    </ul>
                </div>
                </nav>
            </div>

            {/* 오른쪽 콘텐츠 */}
            <div className="main-content">
                <div className="content-wrapper">
                {/* 이메일 인증 */}
                {!isAuthenticated ? (
                    <div className="auth-banner">
                    <span>정보 수정을 위해 이메일 인증이 필요합니다 (5시간 유효)</span>
                    <button onClick={handleSendEmail}>인증 메일 발송</button>
                    <input 
                        type="text" 
                        placeholder="인증번호 입력" 
                        value={tokenInput} 
                        onChange={(e) => setTokenInput(e.target.value)} 
                    />
                    <button onClick={handleVerifyToken}>인증 확인</button>
                    </div>
                ) : (
                    <div className="auth-banner success">인증 완료 {/*- 남은 시간: {formatTime(authTimeLeft)}*/}</div>
                )}

                {/* 등급 및 포인트 정보 */}
                <div className="stats-table">
                    <table>
                    <thead>
                        <tr>
                        <th>프로필</th>
                        <th>문의 수</th>
                        <th>상품 리뷰</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td><div className="profile-image"></div></td>
                        <td>{stats.totalInquiries || 0}</td>
                        <td>{stats.totalReviews || 0}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                {/* 주문배송조회 */}
                {activeTab === 'orders' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>최근 주문</h2>
                        <button className='btn-primary' onClick={() => setIsOrdersModal(true)}>더보기 <ChevronRight size={16} /></button>
                    </div>

                    {isOrdersModal && (
                        <div className='orders-modal'
                            onClick={() => setIsOrdersModal(false)} // 바깥 클릭 시 닫힘
                        >
                            <div className='orders-modal-content'
                            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                            >
                            <button className='orders-modal-close'
                                onClick={() => setIsOrdersModal(false)}
                            >
                                &times;
                            </button>

                            <h2 style={{ marginBottom: '10px' }}>상세주문 확인</h2>
                            <p>상세주문 폼</p>
                            </div>
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <div className="empty-state">주문 내역이 없습니다.</div>
                    ) : (
                        <div>
                        {orders.map((order) => (
                            <div key={order.orderId} className="order-card">
                            <div className="order-header">
                                <div>
                                <p className="order-date">{order.createdDate}</p>
                                <p className="order-date">주문번호: {order.orderCord}</p>
                                </div>
                                <span className="order-status">{order.deliveryStatus}</span>
                            </div>

                            {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="order-item">
                                <p className="order-item-name">{item.productName}</p>
                                <p className="order-item-detail">
                                    {item.price?.toLocaleString()}원 / {item.quantity}개
                                </p>
                                </div>
                            ))}

                            <div className="order-footer">
                                <p className="order-date">{order.trackingNumber && `운송장: ${order.trackingNumber}`}</p>
                                <p className="order-total">총 {order.totalPrice?.toLocaleString()}원</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                )}

                {/* 회원정보수정 */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>회원정보수정</h2>
                        {!editMode.profile ? (
                        <button className="btn-primary" onClick={() => handleEdit('profile')}>수정</button>
                        ) : (
                        <div style={{display: 'flex', gap: '8px'}}>
                            <button className="btn-primary" onClick={() => handleSave('profile')}>저장</button>
                            <button className="btn-secondary" onClick={() => handleCancel('profile')}>취소</button>
                        </div>
                        )}
                    </div>

                    <div>
                        <div className="form-group">
                            <label>이름</label>
                            <p>{userData.userName}</p> {/* 읽기 전용 */}
                        </div>

                        <div className="form-group">
                            <label>닉네임</label>
                            {editMode.profile ? (
                                <input
                                    type="text"
                                    value={tempData.nickName || ''}
                                    onChange={(e) => setTempData({ ...tempData, nickName: e.target.value })}
                                    className="editable"
                                />
                            ) : (
                                <p>{userData.nickName}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>비밀번호</label>
                            {editMode.profile ? (
                                <input
                                    type="password"
                                    placeholder="새 비밀번호 입력"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="editable"
                                />
                            ) : (
                                <p>********</p>
                            )}
                        </div>

                        {editMode.profile && (
                            <div className="form-group">
                                <label>비밀번호 확인</label>
                                <input
                                    type="password"
                                    placeholder="비밀번호 재입력"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>이메일</label>
                            {editMode.profile ? (
                                <input
                                    type="email"
                                    value={tempData.email || ''}
                                    onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                    className="editable"
                                />
                            ) : (
                                <p>{userData.email}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>휴대폰</label>
                            {editMode.profile ? (
                                <input
                                    type="tel"
                                    value={tempData.mobilePhone || ''}
                                    onChange={(e) => setTempData({ ...tempData, mobilePhone: e.target.value })}
                                    className="editable"
                                />
                            ) : (
                                <p>{userData.mobilePhone}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>생년월일</label>
                            <p>{userData.birth}</p>
                        </div>

                        <div className="form-group">
                            <label>성별</label>
                            <p>{userData.gender === 'MALE' ? '남성' : '여성'}</p>
                        </div>
                    </div>
                    </div>
                )}

                {/* 배송지 관리 */}
                {activeTab === 'addresses' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>배송지 관리</h2>
                        <button className="btn-primary" onClick={() => setIsAddressModal(true)}>+ 새 배송지 추가</button>
                    </div>
                    {isAddressModal && (
                        <div
                            className="address-modal"
                            onClick={() => setIsAddressModal(false)} // 바깥 클릭 시 닫힘
                        >
                            <div
                            className="address-modal-content"
                            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                            >
                                <button
                                    className="address-modal-close"
                                    onClick={() => setIsAddressModal(false)}
                                >
                                    &times;
                                </button>

                                <h2 style={{ marginBottom: '10px' }}>새 배송지 추가</h2>
                                <input
                                    type="text" placeholder="수령인 이름"
                                    value={newAddress.recipientName}
                                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                                /><br />

                                <input type="text" id="sample6_postcode" placeholder="우편번호" 
                                    value={newAddress.zipcode}
                                    readOnly
                                />

                                {/* 여기서 onClick을 React 방식으로 */}
                                <input
                                    type="button"
                                    value="우편번호 찾기"
                                    onClick={sample6_execDaumPostcode}
                                    className="btn-primary"
                                /><br />

                                <input type="text" id="sample6_address" placeholder="주소"
                                    value={newAddress.baseAddress}
                                    readOnly
                                />
                                <input type="text" id="sample6_extraAddress" placeholder="참고항목" value={newAddress.extraAddress} readOnly />
                                <input type="text" id="sample6_detailAddress" placeholder="상세주소"
                                    value={newAddress.detailAddress}
                                    onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                                /><br />
                                <label>
                                    <input
                                    type="checkbox"
                                    checked={newAddress.isDefault}
                                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                    />
                                    기본 배송지로 설정
                                </label><br />

                                <button className="btn-primary" onClick={handleSaveAddress}>저장</button>
                            </div>
                        </div>
                    )}

                    {addresses.length === 0 ? (
                        <div className="empty-state">등록된 배송지가 없습니다.</div>
                    ) : (
                        <div>
                        {addresses.map((addr) => (
                            <div key={addr.userAddressId} className="address-card">
                            <div className="card-header">
                                <div className="card-title">
                                <span>{addr.recipientName}</span>
                                {addr.isDefault && <span className="badge">기본배송지</span>}
                                </div>
                                <div className="card-actions">
                                <button className="link-btn" onClick={() => alert('배송지 수정 모달을 열어주세요')}>수정</button>
                                <button className="link-btn delete" onClick={() => handleDeleteAddress(addr.userAddressId)}>삭제</button>
                                </div>
                            </div>
                            <div className="card-content">
                                <p>[{addr.zipcode}]</p>
                                <p>{addr.baseAddress}</p>
                                <p>{addr.detailAddress}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                )}

                {/* 결제수단 */}
                {activeTab === 'payment' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>결제수단</h2>
                        <button className="btn-primary" onClick={() => setIsPaymentModal(true)}>+ 결제수단 추가</button>
                    </div>
                    {isPaymentModal && (
                        <div className='payment-modal'
                            onClick={() => setIsPaymentModal(false)} // 바깥 클릭 시 닫힘
                        >
                            <div className='payment-modal-content'
                            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                            >
                            <button className='payment-modal-close'
                                onClick={() => setIsPaymentModal(false)}
                            >
                                &times;
                            </button>

                            <h2 style={{ marginBottom: '10px' }}>새 결제수단 추가</h2>
                            <p>결제수단 폼</p>
                            </div>
                        </div>
                    )}

                    {paymentMethods.length === 0 ? (
                        <div className="empty-state">등록된 결제수단이 없습니다.</div>
                    ) : (
                        <div>
                        {paymentMethods.map((method) => (
                            <div key={method.paymentId} className="payment-card">
                            <div className="card-header">
                                <div>
                                <div className="card-title">
                                    <span>{method.type === 'CARD' ? '신용카드' : '계좌이체'}</span>
                                    {method.defaultPayment && <span className="badge">기본결제</span>}
                                </div>
                                <div className="card-content" style={{marginTop: '8px'}}>
                                    <p>{method.cardCompany || method.bankName}</p>
                                    <p>{method.cardNumber || method.accountNumber}</p>
                                </div>
                                </div>
                                <button className="link-btn">수정</button>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                )}

                {/* 나의 좋아요 */}
                {activeTab === 'wishlist' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>나의 좋아요</h2>
                    </div>
                    
                    <div className="tab-nav">
                        <button className={`subtab-btn ${activeSubTab === 'product' ? 'active' : ''}`} onClick={() => setActiveSubTab('product')}>Product</button>
                        <button className={`subtab-btn ${activeSubTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveSubTab('brand')}>Brand</button>
                    </div>

                    {activeSubTab === 'product' && (
                        <div className="subtab-content">
                        {wishList.length === 0 ? (
                            <div className="empty-state">좋아요한 상품이 없습니다.</div>
                        ) : (
                            <div className="wishlist-grid">
                            {wishList.map((item) => (
                                <div key={item.wishlistId} className="wishlist-item">
                                <div className="wishlist-image"></div>
                                <div className="wishlist-info">
                                    <p>{item.productName}</p>
                                    <p className="price">{item.price?.toLocaleString()}원</p>
                                    <button className="link-btn delete" onClick={() => handleRemoveWish(item.wishlistId)}>삭제</button>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    )}

                    {activeSubTab === 'brand' && (
                        <div className="subtab-content">
                        {followList.length === 0 ? (
                            <div className="empty-state">팔로우한 브랜드가 없습니다.</div>
                        ) : (
                            <div>
                            {followList.map((follow) => (
                                <div key={follow.followId} className="brand-item">
                                <div className="brand-info">
                                    <div className="brand-logo"></div>
                                    <div>
                                    <p className="brand-name">{follow.studioName}</p>
                                    <p className="brand-date">{follow.createdAt}</p>
                                    </div>
                                </div>
                                <button className="btn-secondary" onClick={() => handleUnfollow(follow.followId)}>언팔로우</button>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    )}
                    </div>
                )}

                {/* 상품리뷰 */}
                {activeTab === 'reviews' && (
                    <div className="tab-content">
                    <div className="section-header">
                        <h2>상품 리뷰</h2>
                    </div>
                    <div className="empty-state">작성한 리뷰가 없습니다.</div>
                    </div>
                )}
                </div>
            </div>
        </div>
        
    )
}