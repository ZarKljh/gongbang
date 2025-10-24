package com.gobang.gobang.domain.inquiry.repository;

import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
}
