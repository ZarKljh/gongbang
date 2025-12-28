package com.gobang.gobang.domain.notification.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.notification.dto.NotificationResponse;
import com.gobang.gobang.domain.notification.entity.Notification;
import com.gobang.gobang.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SiteUserRepository siteUserRepository;

    private SiteUser findSiteUser(String nameOrEmail) {
        return siteUserRepository.findByUserName(nameOrEmail)
                .or(() -> siteUserRepository.findByEmail(nameOrEmail))
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
    }

    public List<NotificationResponse> getMyNotifications(String nameOrEmail) {
        SiteUser user = findSiteUser(nameOrEmail);

        return notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId())

                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public long getUnreadCount(String nameOrEmail) {
        SiteUser user = findSiteUser(nameOrEmail);
        return notificationRepository.countByUser_IdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, String nameOrEmail) {
        SiteUser user = findSiteUser(nameOrEmail);

        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 없습니다."));

        if (!n.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }

        n.markAsRead();
    }
}
