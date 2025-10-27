package com.gobang.gobang.global.initData;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class InitData {
//
//    @Bean
//    CommandLineRunner initData(
//            ThemeService themeService,
//            CategoryService categoryService,
//            FilterService filterService,
//            SiteUserRepository siteUserRepository,
//            StudioRepository studioRepository,
//            CartRepository cartRepository,
//            OrdersRepository ordersRepository,
//            OrderItemRepository orderItemRepository,
//            DeliveryRepository deliveryRepository,
//            UserAddressRepository userAddressRepository,
//            PaymentMethodRepository paymentMethodRepository,
//            WishListRepository wishListRepository,
//            FollowRepository followRepository,
//            ProductRepository productRepository,
//            PasswordEncoder passwordEncoder) {
//
//        return args -> {
//            // ==================== 테마 데이터 ====================
//            themeService.InitTheme("Gift", "선물추천테마 GIFT", "", 1);
//            themeService.InitTheme("Healing", "힐링/휴식", "", 2);
//            themeService.InitTheme("Interior", "인테리어 소품", "", 3);
//
//            System.out.println("테마 데이터 초기화 완료!");
//
//            // ==================== 카테고리 데이터 ====================
//            categoryService.initCategory("Mood", "감성소품", "", 1);
//            categoryService.initCategory("Mini", "스몰굿즈", "", 2);
//            categoryService.initCategory("Fabric", "패브릭소품", "", 3);
//            categoryService.initCategory("Aroma", "향/아로마", "", 4);
//            categoryService.initCategory("Light", "조명/무드등", "", 5);
//            categoryService.initCategory("Rest", "휴식용품", "", 6);
//
//            // 서브카테고리
//            categoryService.initSubCategory("Mood", "MoodLight", "무드조명", 1);
//            categoryService.initSubCategory("Mood", "DisplayShelf", "소품진열장", 2);
//            categoryService.initSubCategory("Mood", "DeskDeco", "탁상데코", 3);
//
//            categoryService.initSubCategory("Mini", "Keyring", "키링/뱃지", 1);
//            categoryService.initSubCategory("Mini", "Sticker", "스티커/엽서", 2);
//            categoryService.initSubCategory("Mini", "Toy", "인형/피규어", 3);
//
//            categoryService.initSubCategory("Fabric", "Cushion", "쿠션/방석", 1);
//            categoryService.initSubCategory("Fabric", "Rug", "러그/매트", 2);
//            categoryService.initSubCategory("Fabric", "Curtain", "커튼/패브릭포스터", 3);
//
//            categoryService.initSubCategory("Aroma", "Diffuser", "디퓨저", 1);
//            categoryService.initSubCategory("Aroma", "Candle", "캔들", 2);
//            categoryService.initSubCategory("Aroma", "Incense", "인센스", 3);
//
//            categoryService.initSubCategory("Light", "Stand", "스탠드", 1);
//            categoryService.initSubCategory("Light", "Lamp", "무드램프", 2);
//            categoryService.initSubCategory("Light", "LED", "LED소품", 3);
//
//            categoryService.initSubCategory("Rest", "Massage", "안마용품", 1);
//            categoryService.initSubCategory("Rest", "Sleep", "수면용품", 2);
//            categoryService.initSubCategory("Rest", "Sound", "힐링음향기기", 3);
//
//            System.out.println("카테고리 데이터 초기화 완료!");
//
//            // ==================== 필터 데이터 ====================
//            filterService.initGroupFilter("Mood", "STYLE", "분위기", 1, false, true);
//            filterService.initGroupFilter("Mood", "PACKAGE", "포장옵션", 1, false, true);
//            filterService.initGroupFilter("Mood", "PRICE", "가격대", 99, true, true);
//
//            filterService.initGroupFilter("Mini", "COLOR", "색상", 1, false, true);
//            filterService.initGroupFilter("Mini", "DESIGN", "디자인", 2, false, true);
//            filterService.initGroupFilter("Mini", "PRICE", "가격대", 99, true, true);
//
//            filterService.initGroupFilter("Fabric", "MATERIAL", "소재", 1, false, true);
//            filterService.initGroupFilter("Fabric", "COLOR", "색상", 2, false, true);
//            filterService.initGroupFilter("Fabric", "PRICE", "가격대", 99, true, true);
//
//            filterService.initGroupFilter("Aroma", "SCENT", "향", 1, false, true);
//            filterService.initGroupFilter("Aroma", "DURATION", "지속시간", 2, false, true);
//            filterService.initGroupFilter("Aroma", "PRICE", "가격대", 99, true, true);
//
//            filterService.initGroupFilter("Light", "BRIGHTNESS", "밝기", 1, false, true);
//            filterService.initGroupFilter("Light", "COLOR_TEMP", "색온도", 2, false, true);
//            filterService.initGroupFilter("Light", "PRICE", "가격대", 99, true, true);
//
//            filterService.initGroupFilter("Rest", "REST_TYPE", "휴식타입", 1, false, true);
//            filterService.initGroupFilter("Rest", "COLOR", "색상", 4, false, true);
//            filterService.initGroupFilter("Rest", "PRICE", "가격대", 99, true, true);
//
//            // 필터 옵션
//            filterService.initOption("Mood", "STYLE", "따뜻한", "WARM", 1, "CHECKBOX", "MULTI");
//            filterService.initOption("Mood", "STYLE", "미니멀", "MINIMAL", 2, "CHECKBOX", "MULTI");
//            filterService.initOption("Mood", "PACKAGE", "기본포장", "BASIC", 1, "RADIO", "SINGLE");
//            filterService.initOption("Mood", "PACKAGE", "선물포장", "GIFT", 2, "RADIO", "SINGLE");
//            filterService.initOption("Mood", "PRICE", "~1만원", "UNDER_10000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Mood", "PRICE", "1~3만원", "RANGE_1_3", 2, "CHIP", "SINGLE");
//
//            filterService.initOption("Mini", "COLOR", "화이트", "WHITE", 1, "COLOR", "MULTI");
//            filterService.initOption("Mini", "COLOR", "베이지", "BEIGE", 2, "COLOR", "MULTI");
//            filterService.initOption("Mini", "DESIGN", "캐릭터", "CHARACTER", 1, "CHECKBOX", "MULTI");
//            filterService.initOption("Mini", "DESIGN", "심플", "SIMPLE", 2, "CHECKBOX", "MULTI");
//            filterService.initOption("Mini", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Mini", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");
//
//            filterService.initOption("Fabric", "MATERIAL", "면", "COTTON", 1, "CHECKBOX", "MULTI");
//            filterService.initOption("Fabric", "MATERIAL", "극세사", "MICROFIBER", 2, "CHECKBOX", "MULTI");
//            filterService.initOption("Fabric", "COLOR", "아이보리", "IVORY", 1, "COLOR", "MULTI");
//            filterService.initOption("Fabric", "COLOR", "그레이", "GRAY", 2, "COLOR", "MULTI");
//            filterService.initOption("Fabric", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Fabric", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");
//
//            filterService.initOption("Aroma", "SCENT", "플로럴", "FLORAL", 1, "CHECKBOX", "MULTI");
//            filterService.initOption("Aroma", "SCENT", "머스크", "MUSK", 2, "CHECKBOX", "MULTI");
//            filterService.initOption("Aroma", "DURATION", "약 2시간", "HOUR_2", 1, "RADIO", "SINGLE");
//            filterService.initOption("Aroma", "DURATION", "약 4시간", "HOUR_4", 2, "RADIO", "SINGLE");
//            filterService.initOption("Aroma", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Aroma", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");
//
//            filterService.initOption("Light", "BRIGHTNESS", "약함", "LOW", 1, "RADIO", "SINGLE");
//            filterService.initOption("Light", "BRIGHTNESS", "강함", "HIGH", 2, "RADIO", "SINGLE");
//            filterService.initOption("Light", "COLOR_TEMP", "2700K (따뜻한빛)", "TEMP_2700", 1, "SELECT", "SINGLE");
//            filterService.initOption("Light", "COLOR_TEMP", "6500K (밝은빛)", "TEMP_6500", 2, "SELECT", "SINGLE");
//            filterService.initOption("Light", "PRICE", "~3만원", "UNDER_30000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Light", "PRICE", "3만원 이상", "OVER_30000", 2, "CHIP", "SINGLE");
//
//            filterService.initOption("Rest", "REST_TYPE", "안대", "EYE_MASK", 1, "CHECKBOX", "MULTI");
//            filterService.initOption("Rest", "REST_TYPE", "마사지기", "MASSAGER", 2, "CHECKBOX", "MULTI");
//            filterService.initOption("Rest", "COLOR", "베이지", "BEIGE", 1, "COLOR", "MULTI");
//            filterService.initOption("Rest", "COLOR", "네이비", "NAVY", 2, "COLOR", "MULTI");
//            filterService.initOption("Rest", "PRICE", "~3만원", "UNDER_30000", 1, "CHIP", "SINGLE");
//            filterService.initOption("Rest", "PRICE", "3만원 이상", "OVER_30000", 2, "CHIP", "SINGLE");
//
//            System.out.println("필터 데이터 초기화 완료!");
//
//            // ==================== 사용자 데이터 ====================
//            SiteUser user1 = siteUserRepository.findByUserName("user1").orElseGet(() ->
//                    siteUserRepository.save(SiteUser.builder()
//                            .userName("user1")
//                            .email("user1@example.com")
//                            .password(passwordEncoder.encode("password123"))
//                            .nickName("유저1")
//                            .role("USER")
//                            .status("ACTIVE")
//                            .mobilePhone("010-1234-5678")
//                            .gender("MALE")
//                            .birth(LocalDate.of(1990, 1, 1).atStartOfDay())
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            SiteUser user2 = siteUserRepository.findByUserName("user2").orElseGet(() ->
//                    siteUserRepository.save(SiteUser.builder()
//                            .userName("user2")
//                            .email("user2@example.com")
//                            .password(passwordEncoder.encode("password123"))
//                            .nickName("유저2")
//                            .role("USER")
//                            .status("ACTIVE")
//                            .mobilePhone("010-2345-6789")
//                            .gender("FEMALE")
//                            .birth(LocalDate.of(1992, 5, 15).atStartOfDay())
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            SiteUser user3 = siteUserRepository.findByUserName("user3").orElseGet(() ->
//                    siteUserRepository.save(SiteUser.builder()
//                            .userName("user3")
//                            .email("user3@example.com")
//                            .password(passwordEncoder.encode("password123"))
//                            .nickName("유저3")
//                            .role("USER")
//                            .status("ACTIVE")
//                            .mobilePhone("010-3456-7890")
//                            .gender("MALE")
//                            .birth(LocalDate.of(1995, 8, 20).atStartOfDay())
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            SiteUser seller1 = siteUserRepository.findByUserName("seller1").orElseGet(() ->
//                    siteUserRepository.save(SiteUser.builder()
//                            .userName("seller1")
//                            .email("seller1@example.com")
//                            .password(passwordEncoder.encode("password123"))
//                            .nickName("판매자1")
//                            .role("SELLER")
//                            .status("ACTIVE")
//                            .mobilePhone("010-9876-5432")
//                            .gender("FEMALE")
//                            .birth(LocalDate.of(1988, 3, 10).atStartOfDay())
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            SiteUser seller2 = siteUserRepository.findByUserName("seller2").orElseGet(() ->
//                    siteUserRepository.save(SiteUser.builder()
//                            .userName("seller2")
//                            .email("seller2@example.com")
//                            .password(passwordEncoder.encode("password123"))
//                            .nickName("판매자2")
//                            .role("SELLER")
//                            .status("ACTIVE")
//                            .mobilePhone("010-8765-4321")
//                            .gender("MALE")
//                            .birth(LocalDate.of(1985, 12, 25).atStartOfDay())
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            System.out.println("사용자 데이터 초기화 완료!");
//
//            // ==================== 스튜디오 데이터 ====================
//            Studio studio1 = studioRepository.findByStudioName("감성소품샵").orElseGet(() ->
//                    studioRepository.save(Studio.builder()
//                            .siteUser(seller1)
//                            .studioName("감성소품샵")
//                            .studioDescription("따뜻한 감성을 담은 소품들을 판매합니다.")
//                            .studioEmail("shop1@example.com")
//                            .studioMobile("010-1111-2222")
//                            .studioOfficeTell("02-1234-5678")
//                            .studioBusinessNumber("123-45-67890")
//                            .studioAddMain("서울특별시 강남구 테헤란로 123")
//                            .studioAddDetail("4층 401호")
//                            .studioAddPostNumber("06234")
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            Studio studio2 = studioRepository.findByStudioName("미니멀라이프").orElseGet(() ->
//                    studioRepository.save(Studio.builder()
//                            .siteUser(seller2)
//                            .studioName("미니멀라이프")
//                            .studioDescription("심플하고 세련된 인테리어 소품을 제공합니다.")
//                            .studioEmail("shop2@example.com")
//                            .studioMobile("010-2222-3333")
//                            .studioOfficeTell("02-2345-6789")
//                            .studioBusinessNumber("234-56-78901")
//                            .studioAddMain("서울특별시 마포구 홍대입구역 456")
//                            .studioAddDetail("지상 2층")
//                            .studioAddPostNumber("04044")
//                            .createdDate(LocalDateTime.now())
//                            .build())
//            );
//
//            System.out.println("스튜디오 데이터 초기화 완료!");
//
//            // ==================== 배송지 데이터 ====================
//            if (userAddressRepository.findBySiteUser(user1).isEmpty()) {
//                userAddressRepository.save(UserAddress.builder()
//                        .siteUser(user1)
//                        .recipientName("홍길동")
//                        .baseAddress("서울특별시 강남구 역삼동 123-45")
//                        .detailAddress("아파트 101동 1001호")
//                        .zipcode("06234")
//                        .isDefault(true)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                userAddressRepository.save(UserAddress.builder()
//                        .siteUser(user1)
//                        .recipientName("김철수")
//                        .baseAddress("경기도 성남시 분당구 정자동 67-89")
//                        .detailAddress("오피스텔 502호")
//                        .zipcode("13561")
//                        .isDefault(false)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//            }
//
//            if (userAddressRepository.findBySiteUser(user2).isEmpty()) {
//                userAddressRepository.save(UserAddress.builder()
//                        .siteUser(user2)
//                        .recipientName("이영희")
//                        .baseAddress("서울특별시 송파구 잠실동 111-22")
//                        .detailAddress("빌라 201호")
//                        .zipcode("05551")
//                        .isDefault(true)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//            }
//
//            System.out.println("배송지 데이터 초기화 완료!");
//
//            // ==================== 결제수단 데이터 ====================
//            if (paymentMethodRepository.findBySiteUser(user1).isEmpty()) {
//                paymentMethodRepository.save(PaymentMethod.builder()
//                        .siteUser(user1)
//                        .type("CARD")
//                        .cardCompany("신한카드")
//                        .cardNumber("1234-5678-****-****")
//                        .defaultPayment(true)
//                        .createdAt(LocalDateTime.now())
//                        .modifiedDate(LocalDateTime.now())
//                        .build());
//
//                paymentMethodRepository.save(PaymentMethod.builder()
//                        .siteUser(user1)
//                        .type("BANK")
//                        .bankName("국민은행")
//                        .accountNumber("123-456-******")
//                        .defaultPayment(false)
//                        .createdAt(LocalDateTime.now())
//                        .modifiedDate(LocalDateTime.now())
//                        .build());
//            }
//
//            if (paymentMethodRepository.findBySiteUser(user2).isEmpty()) {
//                paymentMethodRepository.save(PaymentMethod.builder()
//                        .siteUser(user2)
//                        .type("CARD")
//                        .cardCompany("현대카드")
//                        .cardNumber("9876-5432-****-****")
//                        .defaultPayment(true)
//                        .createdAt(LocalDateTime.now())
//                        .modifiedDate(LocalDateTime.now())
//                        .build());
//            }
//
//            System.out.println("결제수단 데이터 초기화 완료!");
//
//            // ==================== 장바구니 데이터 (상품이 있을 경우) ====================
//            if (productRepository.count() > 0) {
//                List<Product> products = productRepository.findAll();
//
//                if (cartRepository.findBySiteUser(user1).isEmpty()) {
//                    cartRepository.save(Cart.builder()
//                            .siteUser(user1)
//                            .product(products.get(0))
//                            .quantity(2L)
//                            .createdAt(LocalDateTime.now())
//                            .build());
//
//                    if (products.size() > 1) {
//                        cartRepository.save(Cart.builder()
//                                .siteUser(user1)
//                                .product(products.get(1))
//                                .quantity(1L)
//                                .createdAt(LocalDateTime.now())
//                                .build());
//                    }
//                }
//
//                if (cartRepository.findBySiteUser(user2).isEmpty() && products.size() > 0) {
//                    cartRepository.save(Cart.builder()
//                            .siteUser(user2)
//                            .product(products.get(0))
//                            .quantity(3L)
//                            .createdAt(LocalDateTime.now())
//                            .build());
//                }
//
//                System.out.println("장바구니 데이터 초기화 완료!");
//            }
//
//            // ==================== 주문 데이터 (상품이 있을 경우) ====================
//            if (productRepository.count() > 0 && ordersRepository.count() == 0) {
//                List<Product> products = productRepository.findAll();
//                UserAddress address1 = userAddressRepository.findBySiteUser(user1).stream()
//                        .filter(UserAddress::getIsDefault)
//                        .findFirst()
//                        .orElse(null);
//
//                if (address1 != null) {
//                    Orders order1 = ordersRepository.save(Orders.builder()
//                            .siteUser(user1)
//                            .orderCord("ORD-2024-0001")
//                            .totalPrice(new BigDecimal("45000"))
//                            .build());
//
//                    orderItemRepository.save(OrderItem.builder()
//                            .order(order1)
//                            .product(products.get(0))
//                            .quantity(2L)
//                            .price(new BigDecimal("22500"))
//                            .build());
//
//                    deliveryRepository.save(Delivery.builder()
//                            .order(order1)
//                            .address(address1)
//                            .trackingNumber("TRK-2024-0001")
//                            .deliveryStatus("PREPARING")
//                            .createdDate(LocalDateTime.now())
//                            .modifiedDate(LocalDateTime.now())
//                            .build());
//                }
//
//                UserAddress address2 = userAddressRepository.findBySiteUser(user2).stream()
//                        .filter(UserAddress::getIsDefault)
//                        .findFirst()
//                        .orElse(null);
//
//                if (address2 != null && products.size() > 1) {
//                    Orders order2 = ordersRepository.save(Orders.builder()
//                            .siteUser(user2)
//                            .orderCord("ORD-2024-0002")
//                            .totalPrice(new BigDecimal("38000"))
//                            .build());
//
//                    orderItemRepository.save(OrderItem.builder()
//                            .order(order2)
//                            .product(products.get(1))
//                            .quantity(1L)
//                            .price(new BigDecimal("38000"))
//                            .build());
//
//                    deliveryRepository.save(Delivery.builder()
//                            .order(order2)
//                            .address(address2)
//                            .trackingNumber("TRK-2024-0002")
//                            .deliveryStatus("PREPARING")
//                            .createdDate(LocalDateTime.now())
//                            .modifiedDate(LocalDateTime.now())
//                            .build());
//                }
//
//                System.out.println("주문/배송 데이터 초기화 완료!");
//            }
//
//            // ==================== 위시리스트 데이터 (상품이 있을 경우) ====================
//            if (productRepository.count() > 0 && wishListRepository.count() == 0) {
//                List<Product> products = productRepository.findAll();
//
//                wishListRepository.save(WishList.builder()
//                        .siteUser(user1)
//                        .product(products.get(0))
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                if (products.size() > 1) {
//                    wishListRepository.save(WishList.builder()
//                            .siteUser(user1)
//                            .product(products.get(1))
//                            .createdAt(LocalDateTime.now())
//                            .build());
//
//                    wishListRepository.save(WishList.builder()
//                            .siteUser(user2)
//                            .product(products.get(0))
//                            .createdAt(LocalDateTime.now())
//                            .build());
//                }
//
//                if (products.size() > 2) {
//                    wishListRepository.save(WishList.builder()
//                            .siteUser(user3)
//                            .product(products.get(2))
//                            .createdAt(LocalDateTime.now())
//                            .build());
//                }
//
//                System.out.println("위시리스트 데이터 초기화 완료!");
//            }
//
//            // ==================== 팔로우 데이터 ====================
//            if (followRepository.count() == 0) {
//                followRepository.save(Follow.builder()
//                        .siteUser(user1)
//                        .studio(studio1)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                followRepository.save(Follow.builder()
//                        .siteUser(user1)
//                        .studio(studio2)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                followRepository.save(Follow.builder()
//                        .siteUser(user2)
//                        .studio(studio1)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                followRepository.save(Follow.builder()
//                        .siteUser(user3)
//                        .studio(studio1)
//                        .createdAt(LocalDateTime.now())
//                        .build());
//
//                System.out.println("팔로우 데이터 초기화 완료!");
//            }
//
//            System.out.println("모든 데이터 초기화 완료!");
//        };
//    }
}