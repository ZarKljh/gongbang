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
    @Query(
            value = """
            SELECT u.*
            FROM site_user u
            WHERE u.role <> 'ADMIN'
              AND (:role IS NULL   OR u.role   = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (
                    :q IS NULL
                    OR u.user_name ILIKE CONCAT('%', :q, '%')
                    OR u.email      ILIKE CONCAT('%', :q, '%')
              )
            ORDER BY u.created_date DESC
            """,
            countQuery = """
            SELECT COUNT(*)
            FROM site_user u
            WHERE  u.role <> 'ADMIN'
              AND (:role IS NULL   OR u.role   = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (
                    :q IS NULL
                    OR u.user_name ILIKE CONCAT('%', :q, '%')
                    OR u.email      ILIKE CONCAT('%', :q, '%')
              )
            """,
            nativeQuery = true
    )
    Page<SiteUser> searchForAdmin(
            @Param("role") String role,
            @Param("status") String status,
            @Param("q") String q,
            Pageable pageable
    );



}
