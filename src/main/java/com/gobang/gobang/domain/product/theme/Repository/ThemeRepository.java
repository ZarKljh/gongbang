package com.gobang.gobang.domain.product.theme.Repository;

import com.gobang.gobang.domain.product.entity.Theme;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ThemeRepository extends JpaRepository<Theme, Long> {
    @Query("""
        select t
        from Theme t
        where t.active = true
        order by t.displayOrder asc, t.id desc
    """)
    List<Theme> findActiveThemes(Pageable pageable);
}
