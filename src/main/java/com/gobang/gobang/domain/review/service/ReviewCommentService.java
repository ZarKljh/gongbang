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

        // ✅ 현재 로그인한 유저 가져오기
        SiteUser user = rq.getSiteUser();
        if (user == null) return Optional.empty();

        // ✅ 스튜디오(판매자) 찾기
        Studio studio = studioRepository.findBySiteUser(user)
                .orElseThrow(() -> new IllegalStateException("판매자 스튜디오가 존재하지 않습니다."));

        // ✅ 리뷰당 댓글 1개 제한
        if (reviewCommentRepository.findByReview(reviewOpt.get()).isPresent()) {
            return Optional.empty();
        }

        // ✅ 댓글 생성
        ReviewComment comment = ReviewComment.builder()
                .review(reviewOpt.get())
                .studio(studio)
                .reviewComment(req.getReviewComment())
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
    public RsData<Void> deleteComment(Long reviewId, Long commentId) {
        Optional<ReviewComment> optComment = reviewCommentRepository.findById(commentId);

        if (optComment.isEmpty()) {
            return RsData.of("404", "%d번 댓글이 존재하지 않습니다.".formatted(commentId));
        }

        ReviewComment comment = optComment.get();

        // 리뷰 ID 불일치 시 방어
        if (!comment.getReview().getReviewId().equals(reviewId)) {
            return RsData.of("400", "리뷰 ID가 일치하지 않습니다.");
        }

        // studioId 비교 로직 나중에 추가
        // SiteUser currentUser = rq.getSiteUser();
        // if (!Objects.equals(currentUser.getId(), comment.getSeller().getId())) {
        //     return RsData.of("403", "본인이 작성한 댓글만 삭제할 수 있습니다.");
        // }

        reviewCommentRepository.delete(comment);

        return RsData.of("200", "%d번 댓글이 삭제되었습니다.".formatted(commentId));
    }
}
