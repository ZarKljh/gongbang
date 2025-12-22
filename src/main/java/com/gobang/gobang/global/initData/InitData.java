package com.gobang.gobang.global.initData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component("appInitData")
@RequiredArgsConstructor
public class InitData implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("===== InitData 실행 시작 =====");

        initFaq();
        // initVisitorLog();  // 방문 로그 더미 데이터 세팅 제거 (선택지 1)

        log.info("===== InitData 실행 끝 =====");
    }

    private void initFaq() {
        log.info("[FAQ] 초기 데이터 세팅 시작");

        // 1) uuid 관련 extension (이미 있으면 그냥 넘어감)
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";");
        } catch (Exception e) {
            log.warn("[FAQ] EXTENSION 생성 중 에러 (무시해도 될 수 있음): {}", e.getMessage());
        }

        // 2) faq_category upsert
        String faqCategorySql = """
                WITH incoming(slug, name, order_no, is_active) AS (
                  VALUES
                    ('account',  '회원 / 계정',               1, true),
                    ('payment',  '결제 / 환불',               2, true),
                    ('service',  '콘텐츠 이용 / 서비스 이용',  3, true),
                    ('bug',      '오류 / 버그 신고',           4, true),
                    ('business', '비즈니스 / 제휴 문의',       5, true),
                    ('other',    '기타 문의',                  6, true)
                )
                INSERT INTO faq_category (id, slug, name, order_no, is_active, created_at, updated_at)
                SELECT gen_random_uuid(), i.slug, i.name, i.order_no, i.is_active, now(), now()
                FROM incoming i
                ON CONFLICT (slug) DO UPDATE
                  SET name       = EXCLUDED.name,
                      order_no   = EXCLUDED.order_no,
                      is_active  = EXCLUDED.is_active,
                      updated_at = now();
                """;

        // 3) faq unique index
        String faqIndexSql = """
                CREATE UNIQUE INDEX IF NOT EXISTS uq_faq_cat_question
                  ON faq(category_id, question);
                """;

        // 4) faq 데이터 insert (이미 있으면 skip)
        String faqDataSql = """
                INSERT INTO faq (id, category_id, question, answer, order_no, in_published, created_at, updated_at)
                SELECT
                  gen_random_uuid(),
                  c.id,
                  v.q, v.a, v.ord,
                  TRUE,
                  NOW(), NOW()
                FROM (
                  VALUES
                    ('account','회원가입은 어떻게 하나요?','상단 “회원가입” 버튼에서 이메일/비밀번호 또는 간편가입으로 진행하세요.',1),
                    ('account','비밀번호를 잊어버렸어요.','로그인 화면의 “비밀번호 찾기”에서 재설정 링크를 받으세요.',2),

                    ('payment','어떤 결제 수단을 지원하나요?','카드/계좌이체/카카오페이/네이버페이를 지원합니다.',1),
                    ('payment','환불은 얼마나 걸리나요?','카드사·결제수단에 따라 보통 3~5영업일 소요됩니다.',2),

                    ('service','주문 제작은 어떻게 요청하나요?','상품 상세의 “주문 제작 문의”에서 요청사항을 남겨주세요.',1),
                    ('service','품절 상품은 재입고 되나요?','입고 알림 신청 시 재입고 시점에 알림을 드립니다.',2),

                    ('bug','결제 페이지에서 오류가 떠요.','브라우저 캐시 삭제 후 재시도, 지속 시 1:1 문의로 제보 부탁드립니다.',1),
                    ('bug','이미지 업로드가 안돼요.','최대 10MB, JPG/PNG를 지원합니다. 네트워크 상태도 확인해 주세요.',2),

                    ('business','입점(판매자 등록)은 어떻게 하나요?','“입점 문의”를 작성하시면 내부 검토 후 연락드립니다.',1),
                    ('business','단체 구매 가능한가요?','수량/납기/견적 정보를 보내주시면 담당자가 안내드립니다.',2),

                    ('other','영수증 발급 가능한가요?','주문 상세에서 현금영수증/세금계산서 발급이 가능합니다.',1),
                    ('other','고객센터 운영시간이 어떻게 되나요?','평일 10:00~18:00 운영, 주말/공휴일 휴무입니다.',2)
                ) AS v(slug, q, a, ord)
                JOIN faq_category c ON c.slug = v.slug
                WHERE NOT EXISTS (
                  SELECT 1 FROM faq f
                  WHERE f.category_id = c.id AND f.question = v.q
                );
                """;

        try {
            jdbcTemplate.execute(faqCategorySql);
            jdbcTemplate.execute(faqIndexSql);
            jdbcTemplate.execute(faqDataSql);

            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM faq", Integer.class);
            log.info("[FAQ] faq 현재 row 수 = {}", count);
        } catch (Exception e) {
            log.error("[FAQ] 초기 데이터 세팅 중 에러: {}", e.getMessage(), e);
        }

        log.info("[FAQ] 초기 데이터 세팅 끝");
    }
}
