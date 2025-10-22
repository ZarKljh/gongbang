package com.gobang.gobang.domain.product.theme.Service;

import com.gobang.gobang.domain.product.dto.ThemeDto;
import com.gobang.gobang.domain.product.entity.Theme;
import com.gobang.gobang.domain.product.theme.Repository.ThemeRepository;
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


    public Theme InitTheme(String code, String name, String description, int order) {
        Theme theme = Theme.builder()
                .code(code)
                .name(name)
                .description(description)
                .displayOrder(order)
                .active(true)
                .build();

        return themeRepository.save(theme);
    }
}
