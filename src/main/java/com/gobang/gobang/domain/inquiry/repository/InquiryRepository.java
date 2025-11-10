package com.gobang.gobang.domain.inquiry.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;


public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    long countByAnsweredFalse();

    long countByTypeAndAnsweredFalse(InquiryType type);

    @Modifying
    @Transactional
    @Query("update Inquiry i set i.answered = true where i.answered = false")
    int markAllAnswered();

    @Modifying @Transactional
    @Query("update Inquiry i set i.answered = true where i.answered = false and i.type = :type")
    int markAllAnsweredByType(@Param("type") InquiryType type);


    Page<Inquiry> findByUser(SiteUser user);

    Page<Inquiry> findByUserAndAnswered(SiteUser user, boolean answered);

    Page<Inquiry> findByUserAndType(SiteUser user, InquiryType type);

    Page<Inquiry> findByUserAndTypeAndAnswered(SiteUser user, InquiryType type, boolean answered);
}
