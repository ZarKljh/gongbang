package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteUserRepository extends JpaRepository<SiteUser, Long> {
    SiteUser findByEmail(String email);
    Optional<SiteUser> findByUserName(String userName);
    Optional<SiteUser> findByRefreshToken(String refreshToken);

    Optional<SiteUser> findByNickName(String nickName);

    // 관리자 페이지 최근 가입 유저 리스트 추가 - 상진
    List<SiteUser> findAllByOrderByCreatedDateDesc(Pageable pageable);

    // 관리자용 유저 관리 리스트 검색 / 필터 용도 - 상진
    @Query("""
        select u
        from SiteUser u
        where (:role is null or u.role = :role)
          and (:status is null or u.status = :status)
          and (
               :q is null
               or lower(u.userName) like lower(concat('%', :q, '%'))
               or lower(u.email)    like lower(concat('%', :q, '%'))
          )
        order by u.createdDate desc
        """)
    Page<SiteUser> searchForAdmin(
            @Param("role") RoleType role,
            @Param("status") String status,
            @Param("q") String q,
            Pageable pageable
    );

    // 리뷰 테스트 데이터용
    List<SiteUser> findByRole(RoleType roleType);
}
