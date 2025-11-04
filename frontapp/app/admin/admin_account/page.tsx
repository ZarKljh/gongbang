"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/admin/components/Sidebar";
import MonthlyVisitorsSection from "@/app/admin/components/MonthlyVisitorsSection";
import {
  getMonthlyVisitors,
  calcKPI,
  type MonthlyVisitorPoint,
} from "@/app/utils/metrics";
import styles from "@/app/admin/styles/MySection.module.css";

export default function AdminDashboard() {
  const [data, setData] = useState<MonthlyVisitorPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getMonthlyVisitors();
        setData(rows);
      } catch (e: any) {
        setError(e.message || "데이터 불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpi = calcKPI(data, new Date().getFullYear());

  return (
    <div className={styles.dashboardLayout}>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <main className={styles.mainArea}>
        {/* 차트 + KPI */}
        <section className={styles.chartArea}>
          <div className={styles.chartLeft}>
            <MonthlyVisitorsSection year={new Date().getFullYear()} />
          </div>

          <div className={styles.chartRight}>
            <div className={styles.kpiBox}>
              <div className={styles.kpiItem}>
                <span>이번 달</span>
                <span className={styles.kpiItemDesign}></span>
                <strong>{kpi.thisMonth.toLocaleString()}</strong>
              </div>
              <div className={styles.kpiItem}>
                <span>저번 달</span>
                <span className={styles.kpiItemDesign}></span>
                <strong>{kpi.prevMonth.toLocaleString()}</strong>
              </div>
              <div
                className={`${styles.kpiItem} ${
                  kpi.momPct >= 0 ? styles.up : styles.down
                }`}
              >
                <span>전월 대비</span>
                <span className={styles.kpiItemDesign}></span>
                <strong>
                  {kpi.momPct >= 0 ? "+" : ""}
                  {kpi.momPct.toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 빠른 액세스 */}
        <section className={styles.bottomDashboard}>
          <div className={styles.bottomTitle}>빠른 액세스</div>
          <div className={styles.bottomGrid}>
            <button className={`${styles.circleCard} ${styles.cardShop}`}>
              입점 신청
            </button>
            <button className={`${styles.circleCard} ${styles.cardReport}`}>
              신고 관리
            </button>
            <button className={`${styles.circleCard} ${styles.cardInquiry}`}>
              문의 신청
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
