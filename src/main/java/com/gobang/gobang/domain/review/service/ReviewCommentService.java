package com.gobang.gobang.domain.review.service;

import ch.qos.logback.classic.Logger;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.review.dto.ReviewCommentDto;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import com.gobang.gobang.domain.review.repository.ReviewCommentRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewCommentService {
    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final Rq rq;

    // 판매자 댓글 작성 전용
    @Transactional
    public Optional<ReviewComment> createComment(ReviewCommentDto.CreateRequest dto) {
        // 1리뷰 존재 여부 확인
        Optional<Review> reviewOpt = reviewRepository.findById(dto.getReviewId());
        if (reviewOpt.isEmpty()) return Optional.empty();


        // 리뷰당 댓글 1개 제한
        if (reviewCommentRepository.findByReview(reviewOpt.get()).isPresent()) {
            return Optional.empty();
        }

        // 로그인 사용자 검증 (SELLER만 가능)
        SiteUser seller = rq.getSiteUser();

        // 테스트용으로 열어둠
//        if (seller == null || seller.getRole() != RoleType.SELLER) return Optional.empty();

        // 테스트용 user 허용. 로그인 된 사용자 모두
        SiteUser user = rq.getSiteUser();
        if (user == null || !(user.getRole().equals(RoleType.USER) || user.getRole().equals(RoleType.SELLER))) {
            return Optional.empty();
        }

        // 댓글 생성
        ReviewComment comment = ReviewComment.builder()
                .review(reviewOpt.get())
                .reviewComment(dto.getReviewComment())
//                .createdBy(seller.getUserName()) //BaseEntity의 createdBy에 저장
                .createdBy(user.getUserName())
                .build();

        // 저장 후 반환
        ReviewComment saved = reviewCommentRepository.save(comment);
        return Optional.of(saved);
    }

    // 댓글 수정
//    @Transactional
//    public Optional<ReviewComment> updateComment(Long commentId, String newContent) {
//        return reviewCommentRepository.findById(commentId)
//                .map(comment -> {
//                    comment.setContent(newContent);
//                    return reviewCommentRepository.save(comment);
//                });
//    }
//
//    // 댓글 삭제
//    @Transactional
//    public boolean deleteComment(Long commentId) {
//        if (reviewCommentRepository.existsById(commentId)) {
//            reviewCommentRepository.deleteById(commentId);
//            return true;
//        }
//        return false;
//    }
}
