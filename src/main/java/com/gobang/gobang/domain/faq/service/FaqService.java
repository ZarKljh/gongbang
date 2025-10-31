package com.gobang.gobang.domain.faq.service;

import com.gobang.gobang.domain.faq.dto.*;
import com.gobang.gobang.domain.faq.entity.Faq;
import com.gobang.gobang.domain.faq.repository.FaqCategoryRepository;
import com.gobang.gobang.domain.faq.repository.FaqRepository;
import com.gobang.gobang.domain.faq.repository.FaqSpecs;
import org.springframework.lang.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FaqService {
    private final FaqRepository repo;
    private final FaqCategoryRepository catRepo;

    @Transactional(readOnly = true)
    public Page<FaqRes> listPublic(@Nullable UUID categoryId, @Nullable String slug, @Nullable String q, Pageable pageable) {
        Specification<Faq> spec = Specification.allOf(
                FaqSpecs.published(true),
                FaqSpecs.categoryId(categoryId),
                FaqSpecs.categorySlug(slug),
                FaqSpecs.keyword(q)
        );

        Sort sort = pageable.getSort().isUnsorted()
                ? Sort.by(Sort.Order.asc("category.name"), Sort.Order.asc("orderNo"), Sort.Order.asc("createdAt"))
                : pageable.getSort();

        var page = repo.findAll(spec, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort));
        return page.map(FaqRes::from);
    }

    @Transactional(readOnly = true)
    public Page<FaqRes> listAdmin(@Nullable UUID categoryId, @Nullable String q, Pageable pageable) {
        Specification<Faq> spec = Specification.allOf(
                FaqSpecs.categoryId(categoryId),
                FaqSpecs.keyword(q)
        );
        var page = repo.findAll(spec, pageable);
        return page.map(FaqRes::from);
    }

    @Transactional
    public FaqRes create(FaqCreateReq req) {
        var cat = catRepo.findById(req.categoryId()).orElseThrow();
        var f = new Faq();
        f.setCategory(cat);
        f.setQuestion(req.question());
        f.setAnswer(req.answer());
        f.setOrderNo(Optional.ofNullable(req.orderNo()).orElse(0));
        f.setPublished(Optional.ofNullable(req.published()).orElse(true));
        return FaqRes.from(repo.save(f));
    }

    @Transactional public FaqRes update(UUID id, FaqUpdateReq req) {
        var f = repo.findById(id).orElseThrow();
        var cat = catRepo.findById(req.categoryId()).orElseThrow();
        f.setCategory(cat);
        f.setQuestion(req.question());
        f.setAnswer(req.answer());
        f.setOrderNo(Optional.ofNullable(req.orderNo()).orElse(0));
        f.setPublished(Optional.ofNullable(req.published()).orElse(true));
        return FaqRes.from(f);
    }

    @Transactional public void delete(UUID id) { repo.deleteById(id); }

    @Transactional public FaqRes publish(UUID id, boolean value) {
        var f = repo.findById(id).orElseThrow();
        f.setPublished(value);
        return FaqRes.from(f);
    }

    @Transactional public void reorder(List<IdOrderItem> items) {

    }
}
