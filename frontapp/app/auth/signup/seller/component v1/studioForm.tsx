// auth/signup/seller/components/StudioForm.tsx
import React from "react";

interface Props {
  studioInfo: {
    storeName: string;
    businessNumber: string;
    address: string;
  };
  setStudioInfo: (info: any) => void;
  onSubmit: () => void;
}

export default function StudioForm({
  studioInfo,
  setStudioInfo,
  onSubmit,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudioInfo({ ...studioInfo, [name]: value });
  };

  return (
    <div>
      <h4>매장 정보 입력</h4>
      <label>매장이름</label>
      <input
        type="text"
        name="storeName"
        value={studioInfo.storeName}
        onChange={handleChange}
      />
      <label>사업자등록번호</label>
      <input
        type="text"
        name="businessNumber"
        value={studioInfo.businessNumber}
        onChange={handleChange}
      />
      <label>매장 주소</label>
      <input
        type="text"
        name="address"
        value={studioInfo.address}
        onChange={handleChange}
      />
      <button type="button" onClick={onSubmit}>
        회원가입 완료
      </button>
    </div>
  );
}
