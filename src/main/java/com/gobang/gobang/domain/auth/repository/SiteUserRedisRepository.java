package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteUserRedisRepository extends CrudRepository<SiteUser, Long> {
    Optional<SiteUser> findByUserName(String userName);
}
