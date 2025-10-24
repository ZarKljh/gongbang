import React from "react";
import { StudioInfo } from "../types";
import { CATEGORY_OPTIONS } from "../component/studioCategoryList";

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
      <div>
        <label>공방카테고리</label>
        <select
          name="categoryId"
          value={studioInfo.categoryId}
          onChange={onChange}
        >
          <option value="" disabled>
            공방 카테고리를 선택해주세요
          </option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.id} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>사업자 번호</label>
        <input
          type="text"
          name="studioBusinessNumber"
          value={studioInfo.studioBusinessNumber}
          onChange={onChange}
          placeholder="사업자번호를 적어주세요"
        />
      </div>
      <div>
        <label>공방이름</label>
        <input
          type="text"
          name="studioName"
          value={studioInfo.studioName}
          onChange={onChange}
          placeholder="공방의 이름을 적어주세요"
        />
      </div>
      <div>
        <label>설명</label>
        <input
          type="text"
          name="studioDescription"
          value={studioInfo.studioDescription}
          onChange={onChange}
          placeholder="공방을 소개해주세요"
        />
      </div>
      <div>
        <label>전화번호</label>
        <input
          type="text"
          name="studioMobile"
          value={studioInfo.studioMobile}
          onChange={onChange}
          placeholder="공방대표전화번호를 적어주세요"
        />
      </div>
      <div>
        <label>사무실 전화</label>
        <input
          type="text"
          name="studioOfficeTell"
          value={studioInfo.studioOfficeTell}
          onChange={onChange}
          placeholder="공방사무실 전화번호를 적어주세요"
        />
      </div>
      <div>
        <label>팩스</label>
        <input
          type="text"
          name="studioFax"
          value={studioInfo.studioFax}
          onChange={onChange}
          placeholder="공방FAX번호를 적어주세요"
        />
      </div>
      <div>
        <label>이메일</label>
        <input
          type="email"
          name="studioEmail"
          value={studioInfo.studioEmail}
          onChange={onChange}
          placeholder="공방의 대표 이메일을 적어주세요"
        />
      </div>
      <div>
        <label>우편번호</label>
        <input
          type="text"
          name="studioAddPostNumber"
          value={studioInfo.studioAddPostNumber}
          onChange={onChange}
          placeholder="공방소재지의 우편번호를 적어주세요"
        />
      </div>
      <div>
        <label>기본주소</label>
        <input
          type="text"
          name="studioAddMain"
          value={studioInfo.studioAddMain}
          onChange={onChange}
          placeholder="공방소재지의 기본주소를 입력해주세요"
        />
      </div>
      <div>
        <label>상세주소</label>
        <input
          type="text"
          name="studioAddDetail"
          value={studioInfo.studioAddDetail}
          onChange={onChange}
          placeholder="공방소재재의 상세주소를 적어주세요"
        />
      </div>
      <button type="button" onClick={onSubmit}>
        회원가입 완료
      </button>
    </div>
  );
}
