package com.gobang.gobang.domain.review.service;

import ch.qos.logback.classic.Logger;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.review.dto.ReviewCommentDto;
import com.gobang.gobang.domain.review.dto.request.CommentCreateRequest;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import com.gobang.gobang.domain.review.repository.ReviewCommentRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewCommentService {
    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final StudioRepository studioRepository;
    private final Rq rq;

    @Transactional
    public Optional<ReviewComment> createComment(CommentCreateRequest req) {
        Optional<Review> reviewOpt = reviewRepository.findById(req.getReviewId());
        if (reviewOpt.isEmpty()) return Optional.empty();

        // 현재 로그인한 유저 가져오기
        SiteUser user = rq.getSiteUser();
        if (user == null) return Optional.empty();

        // 스튜디오(판매자) 찾기
        Studio studio = studioRepository.findBySiteUser(user)
                .orElseThrow(() -> new IllegalStateException("판매자 스튜디오가 존재하지 않습니다."));

        // 리뷰당 댓글 1개 제한
        if (reviewCommentRepository.findByReview(reviewOpt.get()).isPresent()) {
            return Optional.empty();
        }

        // 댓글 생성
        ReviewComment comment = ReviewComment.builder()
                .review(reviewOpt.get())
                .studio(studio)
                .reviewComment(req.getReviewComment())
                .siteUser(user)
                .createdBy(user.getUserName())
                .createdDate(LocalDateTime.now())
                .build();

        return Optional.of(reviewCommentRepository.save(comment));
    }

    public Optional<ReviewComment> getCommentByReviewId(Long reviewId) {
        return reviewCommentRepository.findFirstByReview_ReviewId(reviewId);
    }

//@Transactional
//public Optional<ReviewComment> createComment(Long reviewId, CommentCreateRequest req) {
//    Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
//    if (reviewOpt.isEmpty()) return Optional.empty();
//
//    // 리뷰당 댓글 1개 제한
//    if (reviewCommentRepository.findByReview(reviewOpt.get()).isPresent()) {
//        return Optional.empty();
//    }
//
//    SiteUser user = rq.getSiteUser();
//    if (user == null) return Optional.empty();
//
//    ReviewComment comment = ReviewComment.builder()
//            .review(reviewOpt.get())
//            .reviewComment(req.getReviewComment())
//            .createdBy(user.getUserName())
//            .build();
//
//    return Optional.of(reviewCommentRepository.save(comment));
//}


    // 댓글 수정
    public Optional<ReviewComment> findByCommentId(Long commentId) {
        return reviewCommentRepository.findById(commentId);
    }

    @Transactional
    public RsData<ReviewComment> modifyComment(
            ReviewComment comment,
            @NotBlank(message = "수정할 댓글 내용을 입력해주세요.") String newComment
    ) {

        SiteUser currentUser = rq.getSiteUser();
        if (currentUser == null) {
            return RsData.of("401", "로그인 후 이용 가능합니다.");
        }

        if (!comment.getSiteUser().getId().equals(currentUser.getId())) {
            return RsData.of("403", "본인이 작성한 댓글만 수정할 수 있습니다.");
        }

        if (newComment == null || newComment.trim().isEmpty()) {
            return RsData.of("400", "수정할 댓글 내용을 입력해주세요.");
        }

        // 댓글 내용 수정
        comment.setReviewComment(newComment);
        comment.setModifiedDate(LocalDateTime.now());

        reviewCommentRepository.save(comment);

        return RsData.of(
                "200",
                "%d번 댓글이 수정되었습니다.".formatted(comment.getCommentId()),
                comment
        );
    }

    // 댓글 삭제
    @Transactional
    public RsData<Void> deleteComment(Long reviewId, Long commentId, Long currentUserId, String role) {
        Optional<ReviewComment> optComment = reviewCommentRepository.findById(commentId);

        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));


        // 리뷰 ID 불일치 시 방어(관리자 예외)
        if (!comment.getReview().getReviewId().equals(reviewId)
                && !role.contains("ADMIN")) {
            return RsData.of("400", "잘못된 요청입니다.");
        }

        // 작성자 일치시 삭제
        if (!comment.getSiteUser().getId().equals(currentUserId)
                && !role.contains("ADMIN")) {
            return RsData.of("403", "삭제 권한이 없습니다.");
        }

        reviewCommentRepository.delete(comment);

        return RsData.of("200", "%d번 댓글이 삭제되었습니다.".formatted(commentId));
    }
}
