package com.gobang.gobang.domain.faq.service;

import com.gobang.gobang.domain.faq.dto.*;
import com.gobang.gobang.domain.faq.entity.FaqCategory;
import com.gobang.gobang.domain.faq.repository.FaqCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqCategoryService {
    private final FaqCategoryRepository repo;

    @Transactional(readOnly = true)
    public List<FaqCategoryRes> listPublic() {
        return repo.findAll(Sort.by(Sort.Order.asc("orderNo"), Sort.Order.asc("createdAt")))
                .stream().filter(FaqCategory::isActive).map(FaqCategoryRes::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<FaqCategoryRes> listAdmin(Pageable pageable) {
        var page = repo.findAll(pageable);
        return page.map(FaqCategoryRes::from);
    }

    @Transactional public FaqCategoryRes create(FaqCategoryReq req) {
        if (repo.existsBySlug(req.slug())) throw new IllegalArgumentException("slug exists");
        var c = new FaqCategory();
        c.setName(req.name());
        c.setSlug(req.slug());
        c.setOrderNo(Optional.ofNullable(req.orderNo()).orElse(0));
        c.setActive(Optional.ofNullable(req.active()).orElse(true));
        return FaqCategoryRes.from(repo.save(c));
    }

    @Transactional public FaqCategoryRes update(UUID id, FaqCategoryReq req) {
        var c = repo.findById(id).orElseThrow();
        if (!c.getSlug().equals(req.slug()) && repo.existsBySlug(req.slug())) {
            throw new IllegalArgumentException("slug exists");
        }
        c.setName(req.name());
        c.setSlug(req.slug());
        c.setOrderNo(Optional.ofNullable(req.orderNo()).orElse(0));
        c.setActive(Optional.ofNullable(req.active()).orElse(true));
        return FaqCategoryRes.from(c);
    }

    @Transactional public void reorder(FaqCategoryReorderReq req) {
        var ids = req.items().stream().map(IdOrderItem::id).toList();
        var map = repo.findAllById(ids).stream()
                .collect(Collectors.toMap(FaqCategory::getId, x -> x));
        req.items().forEach(it -> { var c = map.get(it.id()); if (c != null) c.setOrderNo(it.orderNo()); });
        repo.saveAll(map.values());
    }

    @Transactional public void delete(UUID id) {
        try {
            repo.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("category has children faqs");
        }
    }
}
