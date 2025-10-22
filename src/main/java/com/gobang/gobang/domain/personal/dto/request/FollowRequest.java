package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import lombok.*;

@Data
public class FollowRequest {

    private SiteUser siteUser;
    private Studio studio;
}