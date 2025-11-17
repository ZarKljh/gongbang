package com.gobang.gobang;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
class GobangApplicationTests {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SiteUserRepository siteUserRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Test
    void initReviewTestData() {

        System.out.println("🔶 테스트 리뷰 데이터 생성 시작!");

        // ------------------------------
        // 1) 기존 DB에 있는 일반 유저 불러오기
        //    예: ID 101~200 / 혹은 ROLE_USER 만 가져오면 됨
        // ------------------------------
        List<SiteUser> users = siteUserRepository.findAll();
        // 또는 조건 사용:
        // List<SiteUser> users = siteUserRepository.findByRole(RoleType.USER);

        if (users.size() < 40) {
            throw new RuntimeException("리뷰 생성에 필요한 유저가 40명 이상 존재해야 합니다.");
        }

        // 40명만 사용
        users = users.subList(0, 40);

        System.out.println("✔ 유저 " + users.size() + "명 로드 완료");

        // ------------------------------
        // 2) 이미지 파일 목록
        // ------------------------------
        String[] catImages = {
                "/uploads/reviews/고냥이1.jfif",
                "/uploads/reviews/고냥이2.jfif",
                "/uploads/reviews/고냥이3.webp",
                "/uploads/reviews/고냥이4.jfif",
                "/uploads/reviews/고냥이5.jfif",
                "/uploads/reviews/고냥이6.jfif"
        };

        String longText = "이 제품은 정말 만족스러웠습니다. 디자인도 고급스럽고 사용감도 훌륭했습니다. "
                + "특히 포장 상태가 매우 좋았으며 배송도 예상보다 빨랐습니다. "
                + "선물용으로도 손색이 없을 만큼 품질이 좋아서 너무 만족스러웠어요. "
                + "앞으로도 재구매 의사가 있고 주변에도 추천할 예정입니다.";

        int userIndex = 0;

        // ------------------------------
        // 3) productId = 1~20, 리뷰 40개씩 생성 (총 800개)
        // ------------------------------
        for (long productId = 1; productId <= 20; productId++) {

            System.out.println(" productId=" + productId + " 리뷰 생성 시작");

            for (int i = 1; i <= 40; i++) {

                SiteUser writer = users.get(userIndex % users.size());
                userIndex++;

                String content = (i % 10 == 0)
                        ? longText
                        : "이 상품 정말 만족합니다! 테스트 리뷰 " + i;

                int rating = (int)(Math.random() * 5) + 1;
                int viewCount = (int)(Math.random() * 20);
                int likeCount = (int)(Math.random() * 10);

                Review review = Review.builder()
                        .orderId(productId * 1000 + i)
                        .orderItemId(productId * 2000 + i)
                        .productId(productId)
                        .siteUser(writer)
                        .rating(rating)
                        .content(content)
                        .reviewLike(likeCount)
                        .viewCount(viewCount)
                        .createdBy(writer.getNickName())
                        .createdDate(LocalDateTime.now())
                        .isActive(true)
                        .build();

                Review savedReview = reviewRepository.save(review);

                // ------------------------------
                // 4) 60% 확률로 이미지 1장 생성
                // ------------------------------
                if (Math.random() < 0.6) {

                    int imgIndex = (int)((i + productId) % catImages.length);

                    String imgUrl = catImages[imgIndex];
                    String fileName = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);

                    Image img = Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(imgUrl)
                            .imageFileName(fileName)
                            .sortOrder(0)
                            .build();

                    imageRepository.save(img);
                }
            }

            System.out.println("✔ productId " + productId + " 리뷰 40개 생성 완료");
        }

        System.out.println("🎉 리뷰 + 이미지 생성 완료!");
    }

    // 테스트 돌리면 로그인 상태.
    // 테스트 종류 후 로그아웃 처리
    @AfterEach
    public void logoutAfterTest() {
        SecurityContextHolder.clearContext();
        System.out.println("테스트 종료 → SecurityContext 초기화 (로그아웃)");

    }
}