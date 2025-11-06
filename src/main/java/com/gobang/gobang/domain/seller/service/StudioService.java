package com.gobang.gobang.domain.seller.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.seller.repository.ProductOfStudioRepository;
import com.gobang.gobang.domain.seller.dto.StudioAddRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudioService {

    private final StudioRepository studioRepository;
    private final ProductOfStudioRepository productRepository;

    public Page<ProductDto> getProductListByStudioId(Long studioId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByStudioId(studioId, pageable);
        return productPage.map(ProductDto::fromEntity);
    }

    public void createStudio(Studio newStudio) {
        System.out.println("공방정보가 서비스로 넘어왔습니다");
        studioRepository.save(newStudio);
        System.out.println("공방이 리포지토리에 들어갔습니다");
    }

    public Studio getStudioBySiteUser(SiteUser siteUser) {
        Optional<Studio> os = studioRepository.findBySiteUser(siteUser);
        if (os.isPresent()) {
            return os.get();
        } else {
            return null;
        }
    }

    public Studio getStudioById(Long id) {
        Optional<Studio> os = studioRepository.findByStudioId(id);
        if (os.isPresent()) {
            return os.get();
        } else {
            return null;
        }
    }

    public Studio AddStudio(SiteUser seller, @Valid StudioAddRequest studioAddRequest) {


        Studio newStudio = Studio.builder()
                .siteUser(seller)
                .categoryId(Long.parseLong(studioAddRequest.getCategoryId()))
                .studioName(studioAddRequest.getStudioName())
                .studioDescription(studioAddRequest.getStudioDescription())
                .studioMobile(studioAddRequest.getStudioMobile())
                .studioOfficeTell(studioAddRequest.getStudioOfficeTell())
                .studioFax(studioAddRequest.getStudioFax())
                .studioEmail(studioAddRequest.getStudioEmail())
                .studioBusinessNumber(studioAddRequest.getStudioBusinessNumber())
                .build();

        studioRepository.save(newStudio);
        System.out.println("공방이 저장되었습니다");
        return newStudio;
        //return RsData.of("S-2", "신규공방이 등록되었습니다", newStudio);
    }
}