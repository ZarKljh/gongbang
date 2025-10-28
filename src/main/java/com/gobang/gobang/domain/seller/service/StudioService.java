package com.gobang.gobang.domain.seller.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudioService {

    private final StudioRepository studioRepository;

    public void createStudio(Studio newStudio) {
        System.out.println("공방정보가 서비스로 넘어왔습니다");
        studioRepository.save(newStudio);
        System.out.println("공방이 리포지토리에 들어갔습니다");
    }

    public Studio getStudioBySiteUser(SiteUser siteUser) {
        Optional<Studio> os = studioRepository.findBySiteUser(siteUser);
        if ( os.isPresent() ) {
            return os.get();
        } else {
            return null;
        }
    }
    public Studio getStudioById(Long id) {
        Optional<Studio> os = studioRepository.findById(id);
        if(os.isPresent()){
            return os.get();
        } else {
            return null;
        }
    }
}
