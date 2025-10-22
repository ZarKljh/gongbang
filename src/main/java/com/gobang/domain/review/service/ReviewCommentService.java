package com.gobang.domain.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewCommentService {
//    private final ReviewRepository reviewRepository;
//    private final ReviewCommentRepository reviewCommentRepository;
//
//    // 특정 리뷰 댓글 전체 조회
//    public List<ReviewComment> getCommentsByReview(Long reviewId) {
//        return reviewCommentRepository.findAll()
//                .stream()
//                .filter(comment -> comment.getReview().getId().equals(reviewId))
//                .toList();
//    }
//
//    // 댓글 단건 조회
//    public Optional<ReviewComment> getCommentById(Long id) {
//        return reviewCommentRepository.findById(id);
//    }
//
//    // 판매자 댓글 작성 전용
//    @Transactional
//    public Optional<ReviewComment> createComment(Long reviewId, ReviewComment comment) {
//        return reviewRepository.findById(reviewId)
//                .map(review -> {
//                    comment.setReview(review);
//                    return reviewCommentRepository.save(comment);
//                });
//    }
//
//    // 댓글 수정
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
