package com.gobang.gobang;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootTest
class GobangApplicationTests {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SiteUserRepository siteUserRepository;

    @Autowired
    private ImageRepository imageRepository;

    // 테스트 데이터를 돌리기 전 아래 sql문 실행해야합니다.
    // ALTER TABLE tbl_review DROP CONSTRAINT IF EXISTS tbl_review_order_item_id_key;

    // 32번 상품 스마일 뱃지(->키링 변경) 테스트 리뷰 데이터
    @Test
    public void initProduct32Reviews() {

        System.out.println(" productId=32 스마일 키링 테스트 리뷰 생성 시작!");

        long productId = 32L;


        // ------------------------------
        // 1) 유저 로드 (기존 방식과 동일)
        // ------------------------------
        List<SiteUser> users = siteUserRepository.findByRole(RoleType.USER);

        if (users.size() < 40) {
            throw new RuntimeException("리뷰 생성에 필요한 유저가 40명 이상 필요합니다.");
        }

        users = users.subList(0, 40);

        System.out.println("✔ 유저 " + users.size() + "명 로드 완료");


        // ------------------------------
        // 2) 이미지 파일 목록
        // ------------------------------

        List<String> photoImages = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            photoImages.add("/images/키링리뷰" + i + ".jpg");
        }

        String photoExtraImage = "/images/키링리뷰10-1.jpg";

        // 중복 방지
        Collections.shuffle(photoImages);


        // ------------------------------
        // 3) 포토 리뷰가 될 리뷰 번호 10개 랜덤 선정
        // ------------------------------

        int totalReviews = 38;
        int photoReviewCount = 10;

        List<Integer> reviewNumbers = new ArrayList<>();
        for (int i = 1; i <= totalReviews; i++) reviewNumbers.add(i);

        Collections.shuffle(reviewNumbers);   // 랜덤 섞기

        List<Integer> photoIndexes = reviewNumbers.subList(0, photoReviewCount); // 랜덤 10개
        Collections.sort(photoIndexes); // 정렬은 선택사항 (보기 좋게)

        System.out.println("📸 포토 리뷰 번호 = " + photoIndexes);


        // ------------------------------
        // 4) 리뷰 랜덤 내용 + 4.8 평균용 별점 구성
        // ------------------------------

        Random random = new Random();

        List<String> randomContents = List.of(
                "너무 귀여운 키링이에요! 가지고 다닐 때마다 기분 좋아져요. 항상 보고 긍정적으로 생각하며 웃으려고 구매했어요. 항상 웃음 가득한 하루를 보내려구요.",
                "선물로 줬는데 반응 최고였어요!",
                "퀄리티가 정말 좋아요. 가격도 정말 착하고 깔끔해서 다른 키링들과 조합도 좋네요.",
                "색감도 사진 그대로 예쁘고 마감이 깔끔합니다!",
                "배송도 하루만에 오고 포장도 깔끔해서 제 자신한테 선물을 한 느낌이었어요. 감사합니다. 번창하세요 사장님~",
                "핸드메이드 감성 그 자체!",
                "가방에 달았는데 너무 잘 어울려요.",
                "베이지 색감이 진짜 예쁩니다.",
                "선물용으로도 강추합니다!!!",
                "사진보다 실물이 더 귀여워용 심플하면서도 존재감 있어서 어디에나 잘 어울립니다!",
                "튼튼하고 디테일도 좋아요.",
                "생각보다 크기도 적당하고 만족!",
                "친구들이 어디서 샀냐고 물어봐요.",
                "포장도 정성스럽게 되어 있어서 감동ㅜㅜ 많이 파세요!!ㅎㅎ",
                "잃어버리면 재구매 의사 100% 귀엽고 퀄리티 좋아요.",
                "색상이 하나뿐인게 아쉽지만 그래도 예뻐서 마음에 들어요! 다른 색상도 만들어주세요 사장님~!~!",
                "귀여워요옹",
                "기분 좋아지는 키링입니다. 지니고 있으면 웃을 일만 생길 거 같네요.",
                "크기 딱 적당하고 어떤 가방이든 잘 어울려요!",
                "작지만 존재감이 확실해요."
        );

        int userIndex = 0;


        // ------------------------------
        // 5) 리뷰 38개 생성 시작
        // ------------------------------

        for (int i = 1; i <= totalReviews; i++) {

            System.out.println(" productId=" + productId + " 리뷰 생성 (" + i + "/" + totalReviews + ")");

            SiteUser writer = users.get(userIndex % users.size());
            userIndex++;

            // 평균 별점 4.3~4.5
            double r = Math.random();
            int rating;

            if (r < 0.05) rating = 1;
            else if (r < 0.05) rating = 2;
            else if (r < 0.15) rating = 3;
            else if (r < 0.50) rating = 4;
            else rating = 5;
            int viewCount = (int)(Math.random() * 20);
            int likeCount = (int)(Math.random() * 10);

            String content = randomContents.get(random.nextInt(randomContents.size()));

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
                    .modifiedDate(LocalDateTime.now())
                    .isActive(true)
                    .build();

            Review savedReview = reviewRepository.save(review);


            // ------------------------------
            // 6) 랜덤 포토 리뷰 처리
            // ------------------------------

            if (photoIndexes.contains(i)) {

                boolean isLastPhotoReview =
                        i == photoIndexes.get(photoReviewCount - 1);

                int photoIndex = photoIndexes.indexOf(i);

                if (isLastPhotoReview) {
                    // 마지막 포토 리뷰: 사진 2장 (10번째 사진 + 10-1)
                    String imgUrl1 = photoImages.get(9); // shuffled 10번째
                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(imgUrl1)
                            .imageFileName(imgUrl1.substring(imgUrl1.lastIndexOf("/") + 1))
                            .sortOrder(0)
                            .build());

                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(photoExtraImage)
                            .imageFileName("키링리뷰10-1.jpg")
                            .sortOrder(1)
                            .build());
                } else {
                    // 일반 포토 리뷰 1장 (중복 없음)
                    String imgUrl = photoImages.get(photoIndex);
                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(imgUrl)
                            .imageFileName(imgUrl.substring(imgUrl.lastIndexOf("/") + 1))
                            .sortOrder(0)
                            .build());
                }
            }

        }

        System.out.println("🎉 productId=32 랜덤 포토 리뷰 포함 38개 생성 완료!");
    }

    @Test
    public void initProduct75Reviews() {

        System.out.println(" productId=75 네이비 러그(문앞 발매트) 테스트 리뷰 생성 시작!");

        long productId = 75L;


        // ------------------------------
        // 1) 유저 로드 (기존 방식과 동일)
        // ------------------------------
        List<SiteUser> users = siteUserRepository.findByRole(RoleType.USER);

        if (users.size() < 40) {
            throw new RuntimeException("리뷰 생성에 필요한 유저가 40명 이상 필요합니다.");
        }

        users = users.subList(0, 40);

        System.out.println("✔ 유저 " + users.size() + "명 로드 완료");


        // ------------------------------
        // 2) 이미지 파일 목록
        // ------------------------------

        List<String> photoImages = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            photoImages.add("/images/러그리뷰" + i + ".jpg");
        }

        String photoExtraImage = "/images/러그리뷰6-1.jpg";

        // 중복 방지
        Collections.shuffle(photoImages);


        // ------------------------------
        // 3) 포토 리뷰가 될 리뷰 번호 10개 랜덤 선정
        // ------------------------------

        int totalReviews = 24;
        int photoReviewCount = 6;

        List<Integer> reviewNumbers = new ArrayList<>();
        for (int i = 1; i <= totalReviews; i++) reviewNumbers.add(i);

        Collections.shuffle(reviewNumbers);   // 랜덤 섞기

        List<Integer> photoIndexes = reviewNumbers.subList(0, photoReviewCount); // 랜덤 6개 (추가예정)
        Collections.sort(photoIndexes); // 정렬은 선택사항 (보기 좋게)

        System.out.println("📸 포토 리뷰 번호 = " + photoIndexes);


        // ------------------------------
        // 4) 리뷰 랜덤 내용 + 4.8 평균용 별점 구성
        // ------------------------------

        Random random = new Random();

        List<String> randomContents = List.of(
                "집 분위기랑 잘 어울려서 너무 만족해요",
                "네이비 색감이 진짜 고급스러워요",
                "두께감 있어서 발바닥이 포근해요",
                "문 앞 공간이 깔끔해 보이네요",
                "물 흡수도 잘 되고 금방 마르는 느낌이에요",
                "털 빠짐 없이 깔끔해서 좋습니다",
                "미끄럼 방지가 잘 되어 있어서 안전해요",
                "가격 대비 퀄리티 최고예요",
                "발매트 하나로 분위기가 확 달라져요",
                "재질이 부드러워서 맨발로 밟으면 기분 좋아요",
                "사이즈가 딱 적당해서 문 앞에 딱 맞아요",
                "청소하기도 쉬워서 편리해요",
                "배송도 빠르고 포장도 깔끔했어요",
                "사진보다 실물이 더 예쁘네요",
                "오염도 잘 안 보이는 색이라 좋아요",
                "세탁 후에도 모양이 그대로 유지돼요",
                "바닥에 착 붙어서 밀림이 없어요",
                "고양이도 좋아해서 계속 누워있어요",
                "발매트 찾다가 이번에 제대로 샀네요",
                "부엌이나 현관 어디에 둬도 잘 어울려요",
                "가성비 너무 좋아서 추가 구매 고민 중이에요",
                "생각보다 더 푹신해서 놀랐어요",
                "패턴이 심플해서 인테리어용으로도 좋아요",
                "사이즈 다양했으면 더 사고 싶어요"

        );

        int userIndex = 0;


        // ------------------------------
        // 5) 리뷰 24개 생성 시작
        // ------------------------------

        for (int i = 1; i <= totalReviews; i++) {

            System.out.println(" productId=" + productId + " 리뷰 생성 (" + i + "/" + totalReviews + ")");

            SiteUser writer = users.get(userIndex % users.size());
            userIndex++;

            // 평균 별점 4.5?
            double r = Math.random();
            int rating;

            if (r < 0.05) rating = 1;
            else if (r < 0.07) rating = 2;
            else if (r < 0.15) rating = 3;
            else if (r < 0.38) rating = 4;
            else rating = 5;
            int viewCount = (int)(Math.random() * 20);
            int likeCount = (int)(Math.random() * 10);

            String content = randomContents.get(random.nextInt(randomContents.size()));

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
                    .modifiedDate(LocalDateTime.now())
                    .isActive(true)
                    .build();

            Review savedReview = reviewRepository.save(review);


            // ------------------------------
            // 6) 랜덤 포토 리뷰 처리
            // ------------------------------

            if (photoIndexes.contains(i)) {

                boolean isLastPhotoReview =
                        i == photoIndexes.get(photoReviewCount - 1);

                int photoIndex = photoIndexes.indexOf(i);

                if (isLastPhotoReview) {
                    // 마지막 포토 리뷰: 사진 2장 (10번째 사진 + 10-1)
                    String imgUrl1 = photoImages.get(5); // shuffled 10번째
                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(imgUrl1)
                            .imageFileName(imgUrl1.substring(imgUrl1.lastIndexOf("/") + 1))
                            .sortOrder(0)
                            .build());

                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(photoExtraImage)
                            .imageFileName("러그리뷰6-1.jpg")
                            .sortOrder(1)
                            .build());
                } else {
                    // 일반 포토 리뷰 1장 (중복 없음)
                    String imgUrl = photoImages.get(photoIndex);
                    imageRepository.save(Image.builder()
                            .refType(Image.RefType.REVIEW)
                            .refId(savedReview.getReviewId())
                            .imageUrl(imgUrl)
                            .imageFileName(imgUrl.substring(imgUrl.lastIndexOf("/") + 1))
                            .sortOrder(0)
                            .build());
                }
            }

        }

        System.out.println("🎉 productId=75 랜덤 포토 리뷰 포함 24개 생성 완료!");
    }


    // 1~180 상품 모두 랜덤 갯수의 리뷰 생성
    @Test
    public void generateRandomReviewSQL() {

        String[] contents = {
                "너무 좋아요!", "만족합니다.", "퀄리티 최고예요.", "선물용으로 샀어요.",
                "배송 빨라요.", "귀여워요!", "강추합니다.", "실물이 더 예쁨",
                "가격 대비 좋아요.", "재구매 의사 100%"
        };

        Random random = new Random();

        System.out.println("------ SQL 생성 시작 ------");

        for (int productId = 1; productId <= 180; productId++) {

            int reviewCount = random.nextInt(100) + 1;  // 1 ~ 100개 랜덤

            for (int idx = 1; idx <= reviewCount; idx++) {

                int rating = (random.nextDouble() < 0.8) ? 5 : 4;  // 별점 높게
                int userId = 101 + random.nextInt(100); // 101~200 랜덤 유저

                String content = contents[random.nextInt(contents.length)];

                long orderId = productId * 1000 + idx;
                long orderItemId = productId * 2000 + idx;

                String sql = String.format(
                        "INSERT INTO tbl_review (order_id, order_item_id, product_id, user_id, rating, content, review_like, view_count, created_by, created_date, modified_date, is_active) " +
                                "VALUES (%d, %d, %d, %d, %d, '%s', %d, %d, 'system', NOW(), NOW(), true);",
                        orderId, orderItemId, productId, userId, rating, content,
                        random.nextInt(20), random.nextInt(50)
                );

                System.out.println(sql);
            }
        }

        System.out.println("------ SQL 생성 완료 ------");
    }

    // 테스트 돌리면 로그인 상태.
    // 테스트 종류 후 로그아웃 처리
    @AfterEach
    public void logoutAfterTest() {
        SecurityContextHolder.clearContext();
        System.out.println("테스트 종료 → SecurityContext 초기화 (로그아웃)");

    }
}