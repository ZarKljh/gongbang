package com.gobang.gobang.domain.faq.Controller;

import com.gobang.gobang.domain.faq.dto.*;
import com.gobang.gobang.domain.faq.service.FaqCategoryService;
import com.gobang.gobang.domain.faq.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin") @RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FaqAdminController {
    private final FaqService faqService;
    private final FaqCategoryService catService;

    // 카테고리
    @GetMapping("/faq/categories")
    public Page<FaqCategoryRes> catList(@PageableDefault(size=100, sort="orderNo") Pageable pageable) {
        return catService.listAdmin(pageable);
    }


    @PostMapping("/faq/categories")
    public FaqCategoryRes catCreate(@Valid @RequestBody FaqCategoryReq req){
        return catService.create(req);
    }


    @PatchMapping("/faq/categories/{id}")
    public FaqCategoryRes catUpdate(@PathVariable UUID id, @Valid @RequestBody FaqCategoryReq req) {
        return catService.update(id, req);
    }


    @PatchMapping("/faq/categories/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void catReorder(@Valid @RequestBody FaqCategoryReorderReq req){
        catService.reorder(req);
    }


    @DeleteMapping("/faq/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void catDelete(@PathVariable UUID id){
        catService.delete(id);
    }

    // FAQ
    @GetMapping("/faq")
    public Page<FaqRes> listAdmin(@RequestParam(required=false) UUID categoryId,
                                  @RequestParam(required=false, name="q") String query,
                                  @PageableDefault(size=50, sort="createdAt", direction= Sort.Direction.DESC) Pageable pageable) {
        return faqService.listAdmin(categoryId, query, pageable);
    }


    @PostMapping("/faq")
    public FaqRes create(@Valid @RequestBody FaqCreateReq req){
        return faqService.create(req);
    }


    @PatchMapping("/faq/{id}")
    public FaqRes update(@PathVariable UUID id, @Valid @RequestBody FaqUpdateReq req){
        return faqService.update(id, req);
    }



    @PatchMapping("/faq/{id}/publish")
    public FaqRes publish(@PathVariable UUID id, @RequestParam boolean value){
        return faqService.publish(id, value);
    }


    @DeleteMapping("/faq/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id){
        faqService.delete(id);
    }
}

