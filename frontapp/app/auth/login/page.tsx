import Link from "next/link";

export default function LoginSelector() {
  return (
    <div>
      <h3>로그인유형을 선택해주세요</h3>
      <Link href="/auth/login/user">일반사용자 로그인</Link>
      <Link href="/auth/login/seller">공방사업자 로그인</Link>
    </div>
  );
}
