
DO $$
BEGIN
  -- visitor_log 비어 있으면에만 삽입
  IF NOT EXISTS (SELECT 1 FROM public.visitor_log LIMIT 1) THEN
    -- 최근 365일 동안 랜덤 분포 3,000건
    INSERT INTO public.visitor_log(id, visited_at, path, user_id, referrer)
    SELECT
      gen_random_uuid(),
      date_trunc('day', now() - (random()*365 || ' days')::interval)
        + (random()*86400 || ' seconds')::interval,
      (ARRAY['/','/home','/search','/items/123','/items/456','/cart','/checkout','/faq'])[
        (floor(random()*8)+1)::int
      ],
      NULL::uuid,
      (ARRAY[NULL,'https://google.com','https://naver.com','https://instagram.com','https://kakao.com'])[
        (floor(random()*5)+1)::int
      ]
    FROM generate_series(1, 3000);

    -- 최근 7일 가중치(조금 더 촘촘) 800건
    INSERT INTO public.visitor_log(id, visited_at, path, user_id, referrer)
    SELECT
      gen_random_uuid(),
      now() - (random()*7 || ' days')::interval,
      (ARRAY['/','/home','/search','/items/789','/items/321','/cart','/checkout','/faq'])[
        (floor(random()*8)+1)::int
      ],
      NULL::uuid,
      (ARRAY[NULL,'https://google.com','https://naver.com'])[
        (floor(random()*3)+1)::int
      ]
    FROM generate_series(1, 800);
  END IF;
END
$$ LANGUAGE plpgsql;