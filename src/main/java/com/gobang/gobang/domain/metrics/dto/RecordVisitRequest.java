package com.gobang.gobang.domain.metrics.dto;

import java.util.UUID;

public record RecordVisitRequest(
        String path,
        String referrer,
        UUID userId,
        String visitorId
) {}
