package com.gobang.gobang.domain.admin.service;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.notification.entity.Notification;
import com.gobang.gobang.domain.notification.repository.NotificationRepository;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import com.gobang.gobang.global.mail.ShopMailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminShopService {

    private final StudioRepository studioRepository;
    private final SiteUserRepository siteUserRepository;
    private final ShopMailService shopMailService;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Studio updateStatus(Long studioId, StudioStatus newStatus, String rejectReason) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new IllegalArgumentException("Studio not found: " + studioId));

        StudioStatus oldStatus = studio.getStatus();

        // 1) 스튜디오 상태 변경
        studio.setStatus(newStatus);
        studioRepository.save(studio);

        SiteUser owner = studio.getSiteUser(); // Studio가 owner를 들고 있다고 가정 (너희 코드 그대로)

        // 2) PENDING → APPROVED 가 되는 순간에만 USER → SELLER 승급
        if (owner != null && oldStatus != StudioStatus.APPROVED && newStatus == StudioStatus.APPROVED) {
            if (owner.getRole() != RoleType.SELLER && owner.getRole() != RoleType.ADMIN) {
                owner.setRole(RoleType.SELLER);
                siteUserRepository.save(owner);
            }
        }

        // 3) REJECTED 로 바뀌는 경우, 반려 안내 메일 발송
        if (owner != null && oldStatus != StudioStatus.REJECTED && newStatus == StudioStatus.REJECTED) {
            if (rejectReason != null && !rejectReason.isBlank()) {
                shopMailService.sendShopRejectedMail(
                        owner.getEmail(),
                        studio.getStudioName(),
                        rejectReason
                );
            }
        }

        // 4) 승인/반려 알림 생성 (중복 방지)
        if (owner != null) {
            // 승인 알림
            if (oldStatus != StudioStatus.APPROVED && newStatus == StudioStatus.APPROVED) {
                notificationRepository.save(new Notification(owner, "입점이 승인되었습니다.", null));
            }

            // 반려 알림
            if (oldStatus != StudioStatus.REJECTED && newStatus == StudioStatus.REJECTED) {
                notificationRepository.save(new Notification(owner, "입점이 반려되었습니다. 등록된 이메일을 확인해주세요.", null));
            }
        }

        return studio;
    }
}
