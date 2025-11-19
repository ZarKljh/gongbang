package com.gobang.gobang.domain.metrics.interceptor;

import com.gobang.gobang.domain.metrics.entity.VisitorLog;
import com.gobang.gobang.domain.metrics.repository.VisitorLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class VisitorLogInterceptor implements HandlerInterceptor {

    private final VisitorLogRepository visitorLogRepository;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String path = request.getRequestURI();
        String method = request.getMethod();

        boolean isVisitEndpoint =
                path.equals("/api/v1/category");

        if (!isVisitEndpoint) {
            return true;
        }


        if (path.startsWith("/api/v1/admin")) {
            return true;
        }
        if (path.startsWith("/actuator")) {
            return true;
        }

        if (path.startsWith("/css") || path.startsWith("/js") || path.startsWith("/images")) {
            return true;
        }

        if (!"GET".equalsIgnoreCase(method)) {
            return true;
        }


        VisitorLog log = VisitorLog.builder()
                .path(path)
                .userId(null) // 로그인 기능 연결 후 주입 예정
                .referrer(request.getHeader("Referer"))
                .build();

        visitorLogRepository.save(log);

        return true;
    }
}
