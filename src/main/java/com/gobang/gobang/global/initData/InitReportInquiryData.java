package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.model.ReportReason;
import com.gobang.gobang.domain.report.model.ReportStatus;
import com.gobang.gobang.domain.report.model.ReportTargetType;
import com.gobang.gobang.domain.report.repository.ReportRepository;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component("initReportInquiryData")
@Profile({"dev"})
@RequiredArgsConstructor
public class InitReportInquiryData implements CommandLineRunner {

    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final SiteUserRepository siteUserRepository;

    @Override
    public void run(String... args) {
        seedInquiries();
        seedReports();
    }

    private void seedInquiries() {
        if (inquiryRepository.count() > 0) return;

        Optional<SiteUser> admin = siteUserRepository.findByUserName("admin");
        Optional<SiteUser> user1 = siteUserRepository.findByUserName("user1");

        Inquiry i1 = Inquiry.builder()
                .email("user1@example.com")
                .title("[계정] 비밀번호 재설정이 안돼요")
                .content("재설정 메일이 도착하지 않습니다.")
                .type(InquiryType.ACCOUNT)
                .answered(false)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Inquiry i2 = Inquiry.builder()
                .email("user2@example.com")
                .title("[결제] 결제가 두 번 청구된 것 같아요")
                .content("카드 내역에 동일 금액이 2건 등록되어 있습니다.")
                .type(InquiryType.PAYMENT)
                .answered(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Inquiry i3 = Inquiry.builder()
                .email("seller1@example.com")
                .title("[기능요청] 주문내역에 엑셀다운로드 기능 추가 요청")
                .content("월 마감용 집계에 필요합니다.")
                .type(InquiryType.FEATURE)
                .answered(false)
                .createdAt(LocalDateTime.now().minusHours(10))
                .build();

        Inquiry i4 = Inquiry.builder()
                .email("user3@example.com")
                .title("[버그] 이미지 업로드 실패")
                .content("10MB 이하 JPEG인데도 실패합니다.")
                .type(InquiryType.BUG)
                .answered(false)
                .createdAt(LocalDateTime.now().minusHours(6))
                .build();

        Inquiry i5 = Inquiry.builder()
                .email("biz@example.com")
                .title("[제휴] 단체구매/입점 제휴 문의")
                .content("견적 및 납기 관련 회신 부탁드립니다.")
                .type(InquiryType.BUSINESS)
                .answered(false)
                .createdAt(LocalDateTime.now().minusHours(3))
                .build();

        Inquiry i6 = Inquiry.builder()
                .email("user4@example.com")
                .title("[기타] 현금영수증 발급 문의")
                .content("주문 상세에서 발급이 안 보입니다.")
                .type(InquiryType.OTHER)
                .answered(false)
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();


        admin.ifPresent(i1::setWriter);
        user1.ifPresent(i2::setWriter);
        user1.ifPresent(i3::setWriter);
        user1.ifPresent(i4::setWriter);
        admin.ifPresent(i5::setWriter);
        user1.ifPresent(i6::setWriter);

        inquiryRepository.saveAll(List.of(i1, i2, i3, i4, i5, i6));
    }

    private void seedReports() {
        if (reportRepository.count() > 0) return;

        Report r1 = Report.builder()
                .reporterEmail("user1@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("101")
                .reason(ReportReason.SPAM)
                .description("동일 내용 반복 게시")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Report r2 = Report.builder()
                .reporterEmail("user2@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("555")
                .reason(ReportReason.ABUSE)
                .description("비방/욕설 존재")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r3 = Report.builder()
                .reporterEmail("seller1@example.com")
                .targetType(ReportTargetType.PRODUCT)
                .targetId("321")
                .reason(ReportReason.COPYRIGHT)
                .description("상품 이미지 무단 도용 의심")
                .status(ReportStatus.RESOLVED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(12))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r4 = Report.builder()
                .reporterEmail("user3@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("102")
                .reason(ReportReason.OTHER)
                .description("기타 사유로 검토 요청")
                .status(ReportStatus.REJECTED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(8))
                .createdAt(LocalDateTime.now().minusHours(20))
                .build();


        Report r5 = Report.builder()
                .reporterEmail("user1@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("101")
                .reason(ReportReason.SPAM)
                .description("동일 내용 반복 게시")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Report r6 = Report.builder()
                .reporterEmail("user2@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("555")
                .reason(ReportReason.ABUSE)
                .description("비방/욕설 존재")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r7 = Report.builder()
                .reporterEmail("seller1@example.com")
                .targetType(ReportTargetType.PRODUCT)
                .targetId("321")
                .reason(ReportReason.COPYRIGHT)
                .description("상품 이미지 무단 도용 의심")
                .status(ReportStatus.RESOLVED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(12))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r8 = Report.builder()
                .reporterEmail("user3@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("102")
                .reason(ReportReason.OTHER)
                .description("기타 사유로 검토 요청")
                .status(ReportStatus.REJECTED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(8))
                .createdAt(LocalDateTime.now().minusHours(20))
                .build();




        Report r9 = Report.builder()
                .reporterEmail("user1@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("101")
                .reason(ReportReason.SPAM)
                .description("동일 내용 반복 게시")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Report r10 = Report.builder()
                .reporterEmail("user2@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("555")
                .reason(ReportReason.ABUSE)
                .description("비방/욕설 존재")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r11 = Report.builder()
                .reporterEmail("seller1@example.com")
                .targetType(ReportTargetType.PRODUCT)
                .targetId("321")
                .reason(ReportReason.COPYRIGHT)
                .description("상품 이미지 무단 도용 의심")
                .status(ReportStatus.RESOLVED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(12))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r12 = Report.builder()
                .reporterEmail("user3@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("102")
                .reason(ReportReason.OTHER)
                .description("기타 사유로 검토 요청")
                .status(ReportStatus.REJECTED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(8))
                .createdAt(LocalDateTime.now().minusHours(20))
                .build();




        Report r13 = Report.builder()
                .reporterEmail("user1@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("101")
                .reason(ReportReason.SPAM)
                .description("동일 내용 반복 게시")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Report r14 = Report.builder()
                .reporterEmail("user2@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("555")
                .reason(ReportReason.ABUSE)
                .description("비방/욕설 존재")
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r15 = Report.builder()
                .reporterEmail("seller1@example.com")
                .targetType(ReportTargetType.PRODUCT)
                .targetId("321")
                .reason(ReportReason.COPYRIGHT)
                .description("상품 이미지 무단 도용 의심")
                .status(ReportStatus.RESOLVED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(12))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Report r16 = Report.builder()
                .reporterEmail("user3@example.com")
                .targetType(ReportTargetType.COMMENT)
                .targetId("102")
                .reason(ReportReason.OTHER)
                .description("기타 사유로 검토 요청")
                .status(ReportStatus.REJECTED)
                .handledByAdminId(1L)
                .handledAt(LocalDateTime.now().minusHours(8))
                .createdAt(LocalDateTime.now().minusHours(20))
                .build();

        reportRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16));
    }
}
