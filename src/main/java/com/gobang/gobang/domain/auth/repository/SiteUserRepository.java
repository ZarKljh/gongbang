package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteUserRepository extends JpaRepository<SiteUser, Long> {
    SiteUser findByEmail(String email);
}
