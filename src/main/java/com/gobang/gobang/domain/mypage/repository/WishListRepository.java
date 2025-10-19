package com.gobang.gobang.domain.mypage.repository;

import com.gobang.gobang.domain.mypage.entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishListRepository extends JpaRepository<WishList, Long> {
    List<WishList> findByUserId(Long userId);
    void deleteByWishlistIdAndUserId(Long wishlistId, Long userId);
}
