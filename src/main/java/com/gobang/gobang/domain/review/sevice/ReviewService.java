package com.gobang.gobang.domain.review.sevice;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    // 리뷰 다건 조회
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // 리뷰 단건 조회
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    // 리뷰 등록
    @Transactional
    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    // 리뷰 수정
    @Transactional
    public Optional<Review> updateReview(Long id, Review updatedReview) {
        return reviewRepository.findById(id).map(review -> {
            review.setContent(updatedReview.getContent());
            review.setRating(updatedReview.getRating());
            review.setUpdatedAt(updatedReview.getUpdatedAt());
            return reviewRepository.save(review);
        });
    }


    // 리뷰 삭제
    @Transactional
    public boolean deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return true;
        }
        return false;
    }
}