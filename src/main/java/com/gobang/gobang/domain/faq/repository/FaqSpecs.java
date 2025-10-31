package com.gobang.gobang.domain.faq.repository;

import com.gobang.gobang.domain.faq.entity.Faq;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class FaqSpecs {
    public static Specification<Faq> published(boolean v) {
        return (r,q,cb) -> cb.equal(r.get("published"), v);
    }
    public static Specification<Faq> categoryId(@Nullable UUID id) {
        return (r,q,cb) -> id==null ? cb.conjunction() : cb.equal(r.get("category").get("id"), id);
    }
    public static Specification<Faq> categorySlug(@Nullable String slug) {
        return (r,q,cb) -> slug==null ? cb.conjunction() : cb.equal(r.get("category").get("slug"), slug);
    }
    public static Specification<Faq> keyword(@Nullable String kw) {
        if (kw==null || kw.isBlank()) return (r,q,cb)->cb.conjunction();
        String like = "%"+kw.trim()+"%";
        return (r,q,cb) -> cb.or(cb.like(r.get("question"), like), cb.like(r.get("answer"), like));
    }
}