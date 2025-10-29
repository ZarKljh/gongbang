package com.gobang.gobang.domain.product.theme.service;

import com.gobang.gobang.domain.product.dto.ThemeDto;
import com.gobang.gobang.domain.product.entity.Theme;
import com.gobang.gobang.domain.product.theme.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThemeService {
    private final ThemeRepository themeRepository;

    public List<ThemeDto> getThemeList(int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<Theme> themes = themeRepository.findActiveThemes(PageRequest.of(0, limit));
        return themes.stream()
                .map(t -> ThemeDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();
    }


    public void InitTheme(String code, String name, String description, int order) {

        if (themeRepository.existsByCode(code)) {
            Theme t = themeRepository.findByCode(code).get();
            t.setName(name);
            t.setActive(true);
            t.setDisplayOrder(order);
            // JPA 변경감지로 update (save() 생략 가능하지만, 일관 위해 save 호출해도 OK)
            themeRepository.save(t);
        } else {
            themeRepository.save(
                    Theme.builder()
                            .code(code)
                            .name(name)
                            .active(true)
                            .displayOrder(order)
                            .build()
            );
        }

    }
}
