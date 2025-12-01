package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.FollowRequest;
import com.gobang.gobang.domain.personal.dto.response.FollowResponse;
import com.gobang.gobang.domain.personal.service.FollowService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<FollowResponse>> followList() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<FollowResponse> follows = followService.getFollowsByUserId(siteUser);
        return RsData.of("200", "팔로우 다건 조회 성공", follows);
    }

    @PostMapping
    public RsData<FollowResponse> addFollow(@RequestBody FollowRequest request) {
        request.setSiteUser(siteUserService.getCurrentUser());
        FollowResponse response = followService.addFollow(request);
        return RsData.of("200", "팔로우 추가 성공", response);
    }

    @DeleteMapping
    public RsData<Void> unfollow(@RequestParam Long studioId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        followService.unfollow(siteUser, studioId);
        return RsData.of("200", "삭제 성공");
    }

    @GetMapping("/check")
    public RsData<Boolean> isFollowing(@RequestParam Studio studio) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        boolean isFollowing = followService.isFollowing(siteUser, studio);
        return RsData.of("200", "팔로우 여부 확인 성공", isFollowing);
    }

    @GetMapping("/count/followers")
    public RsData<Long> getFollowerCount(@RequestParam Studio studio) {
        long count = followService.getFollowerCount(studio);
        return RsData.of("200", "팔로우 수 조회 성공", count);
    }

    @GetMapping("/count/following")
    public RsData<Long> getFollowingCount() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        long count = followService.getFollowingCount(siteUser);
        return RsData.of("200", "팔로잉 수 조회 성공", count);
    }
}