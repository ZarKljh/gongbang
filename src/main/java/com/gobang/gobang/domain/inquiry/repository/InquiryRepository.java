package com.gobang.gobang.domain.inquiry.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

    List<Inquiry> findByWriter_Id(Long writerId);

    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.writer WHERE i.writer = :writer ORDER BY i.createdAt DESC")
    List<Inquiry> findAllByWriterWithFetchJoin(@Param("writer") SiteUser writer);

    Optional<Inquiry> findByIdAndWriter(Long id, SiteUser writer);

    List<Inquiry> findByWriterAndAnswered(SiteUser writer, boolean answered);

    List<Inquiry> findByWriterAndType(SiteUser writer, InquiryType type);

    long countByWriter_Id(Long writerId);
}