package com.gobang.gobang.domain.seller.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.personal.entity.Follow;
import com.gobang.gobang.domain.product.dto.response.SellerFollowResponse;
import com.gobang.gobang.domain.seller.repository.SellerFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SellerFollowService {


    private final SellerFollowRepository sellerFollowRepository;

    @Transactional
    public SellerFollowResponse toggleFollow(Long studioId, Long userId) {

        // 이미 팔로우 되어있는지 조회
        Optional<Follow> existing = sellerFollowRepository
                .findByStudio_StudioIdAndSiteUser_Id(studioId, userId);

        boolean followed;

        if (existing.isPresent()) {
            // 🔥 이미 팔로우 → 언팔로우
            sellerFollowRepository.delete(existing.get());
            followed = false;
        } else {
            // 🔥 팔로우 추가
            Follow follow = Follow.builder()
                    // Studio PK만 필요하니 프록시 엔티티 형태로 묶어줌
                    .studio(Studio.builder().studioId(studioId).build())
                    .siteUser(SiteUser.builder().id(userId).build())
                    // createdAt은 @PrePersist에서 자동 세팅되니 생략 가능
                    .build();

            sellerFollowRepository.save(follow);
            followed = true;
        }

        // 팔로워 수 재조회
        long followerCount = sellerFollowRepository.countByStudio_StudioId(studioId);

        // 응답 DTO 반환
        return new SellerFollowResponse(followed, followerCount);
    }
}
