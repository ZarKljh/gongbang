package com.gobang.gobang.domain.mypage.repository;


import com.gobang.gobang.domain.mypage.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // 사용자별 장바구니 목록 조회
    List<Cart> findByUser_Id(Long userId);

    // 사용자와 상품으로 장바구니 조회
    Optional<Cart> findByUser_IdAndProduct_Id(Long userId, Long productId);

    // 사용자별 장바구니 전체 삭제
    void deleteByUser_Id(Long userId);

    // 사용자별 장바구니 개수
    long countByUser_Id(Long userId);
}