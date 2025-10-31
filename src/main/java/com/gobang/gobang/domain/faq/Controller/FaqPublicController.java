package com.gobang.gobang.domain.faq.Controller;


import com.gobang.gobang.domain.faq.dto.FaqCategoryRes;

import com.gobang.gobang.domain.faq.dto.FaqRes;
import com.gobang.gobang.domain.faq.service.FaqCategoryService;
import com.gobang.gobang.domain.faq.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1") @RequiredArgsConstructor
public class FaqPublicController {
    private final FaqService faqService;
    private final FaqCategoryService catService;

    @GetMapping("/faq/categories")
    public List<FaqCategoryRes> categories() { return catService.listPublic(); }

    @GetMapping("/faq")
    public Page<FaqRes> list(
            @RequestParam(required=false) UUID categoryId,
            @RequestParam(required=false) String slug,
            @RequestParam(required=false, name="q") String query,
            @PageableDefault(size=100) Pageable pageable) {
        return faqService.listPublic(categoryId, slug, query, pageable);
    }
}

