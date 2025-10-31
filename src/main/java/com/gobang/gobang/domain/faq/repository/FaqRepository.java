package com.gobang.gobang.domain.faq.repository;

import com.gobang.gobang.domain.faq.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface FaqRepository extends JpaRepository<Faq, UUID>, JpaSpecificationExecutor<Faq> { }

