package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    // 사용자별 찜목록 조회
    List<WishList> findBySiteUser(SiteUser siteUser);

    // 사용자와 상품으로 찜목록 조회
    Optional<WishList> findBySiteUserAndProduct(SiteUser siteUser, Product product);

    // 상품별 찜 개수
    long countByProduct(Product product);

    // 사용자별 찜 개수
    long countBySiteUser(SiteUser siteUser);

    // 찜 여부 확인
    boolean existsBySiteUserAndProduct(SiteUser siteUser, Product product);
}