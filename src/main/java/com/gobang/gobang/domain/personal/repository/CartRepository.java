package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // 사용자별 장바구니 목록 조회
    List<Cart> findBySiteUser(SiteUser siteUser);

    // 사용자와 상품으로 장바구니 조회
    Optional<Cart> findBySiteUserAndProduct(SiteUser siteUser, Product product);

    // 사용자별 장바구니 전체 삭제
    void deleteBySiteUser(SiteUser siteUser);

    // 상품 수량
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Cart c WHERE c.siteUser = :siteUser")
    long sumQuantityBySiteUser(@Param("siteUser") SiteUser siteUser);
}