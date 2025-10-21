package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudioRepository extends JpaRepository<Studio, Long> {
}
