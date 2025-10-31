import Link from "next/link";

export default function SignupSelector() {
  return (
    <div>
      <h3>회원가입유형을 선택해주세요</h3>
      <Link href="/auth/signup/user">일반사용자 회원가입</Link>
      <Link href="/auth/signup/seller">공방사업자 회원가입</Link>
    </div>
  );
}
