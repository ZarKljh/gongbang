package com.gobang.gobang.domain.member.repository;

import com.gobang.gobang.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
