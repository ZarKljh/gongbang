package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteUserRepository extends JpaRepository<SiteUser, Long> {
    SiteUser findByEmail(String email);
    Optional<SiteUser> findByUserName(String userName);
    Optional<SiteUser> findByRefreshToken(String refreshToken);

    Optional<SiteUser> findByNickName(String nickName);
}
