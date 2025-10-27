package com.gobang.gobang.domain.personal.initData;

import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.service.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class InitData {

    @Bean
    CommandLineRunner initEntityData(
            SiteUserService siteUserService,
            StudioService studioService,
            CartService cartService,
            OrdersService orderService,
            UserAddressService userAddressService,
            PaymentMethodService paymentMethodService,
            WishListService wishListService,
            FollowService followService) {

        return args -> {
            // 1. 사용자 데이터 초기화
            siteUserService.initUser("user1", "user1@example.com", "password123", "유저1", "USER", "ACTIVE", "010-1234-5678", "MALE");
            siteUserService.initUser("user2", "user2@example.com", "password123", "유저2", "USER", "ACTIVE", "010-2345-6789", "FEMALE");
            siteUserService.initUser("user3", "user3@example.com", "password123", "유저3", "USER", "ACTIVE", "010-3456-7890", "MALE");
            siteUserService.initUser("seller1", "seller1@example.com", "password123", "판매자1", "SELLER", "ACTIVE", "010-9876-5432", "FEMALE");
            siteUserService.initUser("seller2", "seller2@example.com", "password123", "판매자2", "SELLER", "ACTIVE", "010-8765-4321", "MALE");

            System.out.println("사용자 데이터 초기화 완료!");

            // 2. 스튜디오 데이터 초기화
            studioService.initStudio("seller1", "감성소품샵", "따뜻한 감성을 담은 소품들을 판매합니다.",
                    "shop1@example.com", "010-1111-2222", "02-1234-5678", "123-45-67890",
                    "서울특별시 강남구 테헤란로 123", "4층 401호", "06234");

            studioService.initStudio("seller2", "미니멀라이프", "심플하고 세련된 인테리어 소품을 제공합니다.",
                    "shop2@example.com", "010-2222-3333", "02-2345-6789", "234-56-78901",
                    "서울특별시 마포구 홍대입구역 456", "지상 2층", "04044");

            System.out.println("스튜디오 데이터 초기화 완료!");

            // 3. 장바구니 데이터 초기화 (상품이 있다고 가정)
            cartService.initCart("user1", 1L, 2L);  // userId: user1, productId: 1, quantity: 2
            cartService.initCart("user1", 2L, 1L);
            cartService.initCart("user2", 1L, 3L);

            System.out.println("장바구니 데이터 초기화 완료!");

            // 4. 배송지 데이터 초기화
            userAddressService.initAddress("user1", "홍길동", "서울특별시 강남구 역삼동 123-45",
                    "아파트 101동 1001호", "06234", true);

            userAddressService.initAddress("user1", "김철수", "경기도 성남시 분당구 정자동 67-89",
                    "오피스텔 502호", "13561", false);

            userAddressService.initAddress("user2", "이영희", "서울특별시 송파구 잠실동 111-22",
                    "빌라 201호", "05551", true);

            System.out.println("배송지 데이터 초기화 완료!");

            // 5. 결제수단 데이터 초기화
            paymentMethodService.initPaymentMethod("user1", "CARD", "신한카드", "1234-5678-****-****",
                    null, null, true);

            paymentMethodService.initPaymentMethod("user1", "BANK", null, null,
                    "국민은행", "123-456-******", false);

            paymentMethodService.initPaymentMethod("user2", "CARD", "현대카드", "9876-5432-****-****",
                    null, null, true);

            System.out.println("결제수단 데이터 초기화 완료!");

            // 6. 주문 데이터 초기화 (상품이 있다고 가정)
            orderService.initOrder("user1", "ORD-2024-0001", new BigDecimal("45000"), 1L, 2L,
                    new BigDecimal("22500"), "PREPARING", "TRK-2024-0001");

            orderService.initOrder("user2", "ORD-2024-0002", new BigDecimal("38000"), 2L, 1L,
                    new BigDecimal("38000"), "PREPARING", "TRK-2024-0002");

            System.out.println("주문/배송 데이터 초기화 완료!");

            // 7. 위시리스트 데이터 초기화 (상품이 있다고 가정)
            wishListService.initWishList("user1", 1L);
            wishListService.initWishList("user1", 2L);
            wishListService.initWishList("user2", 1L);
            wishListService.initWishList("user3", 3L);

            System.out.println("위시리스트 데이터 초기화 완료!");

            // 8. 팔로우 데이터 초기화
            followService.initFollow("user1", 1L);  // user1 -> studio1
            followService.initFollow("user1", 2L);  // user1 -> studio2
            followService.initFollow("user2", 1L);  // user2 -> studio1
            followService.initFollow("user3", 1L);  // user3 -> studio1

            System.out.println("팔로우 데이터 초기화 완료!");

            System.out.println("모든 엔티티 데이터 초기화 완료!");
        };
    }
}