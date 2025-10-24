import React from "react";
import { StudioInfo } from "../types";

interface Props {
  studioInfo: StudioInfo;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
}

export default function StudioForm({ studioInfo, onChange, onSubmit }: Props) {
  return (
    <div>
      <h4>매장 정보 입력</h4>

      <label>카테고리</label>
      <input
        type="text"
        name="categoryId"
        value={studioInfo.categoryId}
        onChange={onChange}
      />

      <label>매장 이름</label>
      <input
        type="text"
        name="studioName"
        value={studioInfo.studioName}
        onChange={onChange}
      />

      <label>설명</label>
      <input
        type="text"
        name="studioDescription"
        value={studioInfo.studioDescription}
        onChange={onChange}
      />

      <label>전화번호</label>
      <input
        type="text"
        name="studioMobile"
        value={studioInfo.studioMobile}
        onChange={onChange}
      />

      <label>사무실 전화</label>
      <input
        type="text"
        name="studioOfficeTell"
        value={studioInfo.studioOfficeTell}
        onChange={onChange}
      />

      <label>팩스</label>
      <input
        type="text"
        name="studioFax"
        value={studioInfo.studioFax}
        onChange={onChange}
      />

      <label>이메일</label>
      <input
        type="email"
        name="studioEmail"
        value={studioInfo.studioEmail}
        onChange={onChange}
      />

      <label>사업자 번호</label>
      <input
        type="text"
        name="studioBusinessNumber"
        value={studioInfo.studioBusinessNumber}
        onChange={onChange}
      />

      <label>우편번호</label>
      <input
        type="text"
        name="studioAddPostNumber"
        value={studioInfo.studioAddPostNumber}
        onChange={onChange}
      />

      <label>주소(기본)</label>
      <input
        type="text"
        name="studioAddMain"
        value={studioInfo.studioAddMain}
        onChange={onChange}
      />

      <label>주소(상세)</label>
      <input
        type="text"
        name="studioAddDetail"
        value={studioInfo.studioAddDetail}
        onChange={onChange}
      />

      <label>대표 주소</label>
      <input
        type="text"
        name="address"
        value={studioInfo.address}
        onChange={onChange}
      />

      <button type="button" onClick={onSubmit}>
        회원가입 완료
      </button>
    </div>
  );
}
