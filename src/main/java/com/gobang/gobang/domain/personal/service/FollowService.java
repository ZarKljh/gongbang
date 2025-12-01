package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.request.FollowRequest;
import com.gobang.gobang.domain.personal.dto.response.FollowResponse;
import com.gobang.gobang.domain.personal.entity.Follow;
import com.gobang.gobang.domain.personal.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final ImageRepository imageRepository;

    // 사용자별 팔로우 목록 조회
    public List<FollowResponse> getFollowsByUserId(SiteUser siteUser) {
        List<Follow> follows = followRepository.findBySiteUser(siteUser);

        return follows.stream()
                .map(item -> FollowResponse.from(item, imageRepository))
                .collect(Collectors.toList());
    }

    // 팔로우 추가
    @Transactional
    public FollowResponse addFollow(FollowRequest request) {
        // 이미 팔로우 중인지 확인
        Optional<Follow> existing = followRepository.findBySiteUserAndStudio(
                request.getSiteUser(), request.getStudio());

        if (existing.isPresent()) {
            throw new IllegalStateException("이미 팔로우 중입니다.");
        }

        Follow follow = Follow.builder()
                .siteUser(SiteUser.builder().id(request.getSiteUser().getId()).build())
                .studio(request.getStudio())
                .build();

        Follow saved = followRepository.save(follow);
        return FollowResponse.from(saved, imageRepository);
    }

    // 팔로우 취소
    @Transactional
    public void unfollow(SiteUser siteUser, Long studioId) {
        followRepository.deleteBySiteUserIdAndStudioStudioId(siteUser.getId(), studioId);
    }

    // 팔로우 여부 확인
    public boolean isFollowing(SiteUser siteUser, Studio studio) {
        return followRepository.existsBySiteUser_AndStudio(siteUser, studio);
    }

    // 팔로워 수 조회
    public long getFollowerCount(Studio studio) {
        return followRepository.countByStudio(studio);
    }

    // 팔로잉 수 조회
    public long getFollowingCount(SiteUser siteUser) {
        return followRepository.countBySiteUser(siteUser);
    }
}