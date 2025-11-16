package com.gobang.gobang;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
class GobangApplicationTests {

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private SiteUserRepository siteUserRepository;

	@Test
	void initReviewTestData() {

		System.out.println("🔶 테스트 리뷰 데이터 생성 시작!");

		// 👉 테스트용 유저 30명 생성
		List<SiteUser> users = new ArrayList<>();
		for (long i = 1; i <= 30; i++) {
			SiteUser u = SiteUser.builder()
					.email("test" + i + "@example.com")
					.password("1234")
					.userName("테스트유저" + i)
					.nickName("t" + i)
					.mobilePhone("010-0000-" + String.format("%04d", i))
					.role(RoleType.USER)
					.status("ACTIVE")
					.build();

			users.add(siteUserRepository.save(u));
		}

		System.out.println("✔ 유저 30명 생성 완료");

		// 👉 리뷰 데이터 (productId = 11 고정)
		Object[][] data = new Object[][]{
				{101, 501, 1, 5, "정말 예쁘고 향도 좋아요!", 12, 3},
				{102, 502, 2, 4, "배송이 빠르고 만족합니다.", 5, 2},
				{103, 503, 3, 5, "선물용으로 완전 추천!", 8, 4},
				{104, 504, 4, 3, "디자인은 예쁜데 포장이 조금 아쉬워요.", 6, 1},
				{105, 505, 5, 4, "가죽 퀄리티가 좋아요.", 10, 3},
				{106, 506, 6, 5, "향이 진짜 좋아요.", 11, 2},
				{107, 507, 7, 4, "디테일이 섬세하네요.", 7, 1},
				{108, 508, 8, 5, "선물했는데 너무 좋아했어요.", 14, 5},
				{109, 509, 9, 3, "색상이 화면이랑 달라요.", 4, 0},
				{110, 510, 10, 5, "비누 향이 은은해서 좋아요.", 9, 2},
				{111, 511, 11, 5, "정말 예쁘고 향도 좋아요!", 12, 3},
				{112, 512, 12, 4, "배송이 빠르고 만족합니다.", 5, 2},
				{113, 513, 13, 5, "선물용으로 완전 추천!", 8, 4},
				{114, 514, 14, 3, "디자인은 예쁜데 포장이 조금 아쉬워요.", 6, 1},
				{115, 515, 15, 4, "가죽 퀄리티가 좋아요.", 10, 3},
				{116, 516, 16, 5, "향이 진짜 좋아요.", 11, 2},
				{117, 517, 17, 4, "디테일이 섬세하네요.", 7, 1},
				{118, 518, 18, 5, "선물했는데 너무 좋아했어요.", 14, 5},
				{119, 519, 19, 3, "색상이 화면이랑 달라요.", 4, 0},
				{120, 520, 20, 5, "정말 예쁘고 향도 좋아요!", 9, 2},
		};

		for (Object[] row : data) {
			long orderId = (int) row[0];
			long orderItemId = (int) row[1];
			long userIndex = (int) row[2] - 1;
			int rating = (int) row[3];
			String content = (String) row[4];
			int viewCount = (int) row[5];
			int likeCount = (int) row[6];

			SiteUser writer = users.get((int) userIndex);

			Review review = Review.builder()
					.orderId(orderId)
					.orderItemId(orderItemId)
					.productId(11L)        // ⭐ productId 고정
					.siteUser(writer)
					.rating(rating)
					.content(content)
					.reviewLike(likeCount)
					.viewCount(viewCount)
					.createdBy(writer.getNickName())
					.createdDate(LocalDateTime.now())
					.isActive(true)
					.build();

			reviewRepository.save(review);
		}

		System.out.println("🎉 리뷰 20개 생성 완료!");
	}
}
