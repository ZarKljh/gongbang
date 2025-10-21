package com.gobang.gobang.domain.mypage.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.mypage.dto.request.FollowRequest;
import com.gobang.gobang.domain.mypage.dto.response.FollowResponse;
import com.gobang.gobang.domain.mypage.entity.Follow;
import com.gobang.gobang.domain.mypage.repository.FollowRepository;
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

    // 사용자별 팔로우 목록 조회
    public List<FollowResponse> getFollowsByUserId(Long userId) {
        List<Follow> follows = followRepository.findByUser_Id(userId);

        return follows.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 셀러의 팔로워 목록 조회
    public List<FollowResponse> getFollowersBySellerId(Long studioId) {
        List<Follow> followers = followRepository.findByStudioId(studioId);

        return followers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 팔로우 추가
    @Transactional
    public FollowResponse addFollow(FollowRequest request) {
        // 이미 팔로우 중인지 확인
        Optional<Follow> existing = followRepository.existsByUser_IdAndSeller_StudioId(
                request.getUserId(), request.getStudioId());

        if (existing.isPresent()) {
            throw new IllegalStateException("이미 팔로우 중입니다.");
        }

        Follow follow = Follow.builder()
                .user(SiteUser.builder().id(request.getUserId()).build())
                .studioId(request.getSeller())
                .build();

        Follow saved = followRepository.save(follow);
        return convertToResponse(saved);
    }

    // 팔로우 취소
    @Transactional
    public void unfollow(Long userId, Long studioId) {
        Follow follow = followRepository.existsByUser_IdAndSeller_StudioId(userId, studioId)
                .orElseThrow(() -> new IllegalArgumentException("팔로우 정보를 찾을 수 없습니다."));

        followRepository.delete(follow);
    }

    // 팔로우 여부 확인
    public boolean isFollowing(Long userId, Long studioId) {
        return followRepository.existsByUser_IdAndStudioId(userId, studioId);
    }

    // 팔로워 수 조회
    public long getFollowerCount(Long studioId) {
        return followRepository.countByStudioId(studioId);
    }

    // 팔로잉 수 조회
    public long getFollowingCount(Long userId) {
        return followRepository.countByUser_Id(userId);
    }

    // Entity -> Response DTO 변환
    private FollowResponse convertToResponse(Follow follow) {
        return FollowResponse.builder()
                .followId(follow.getFollowId())
                .userId(follow.getUser().getId())
                .seller(follow.getStudioId())
                .sellerName("판매자명") // TODO: Seller 엔티티에서 가져오기
                .createdAt(follow.getCreatedAt())
                .build();
    }
}