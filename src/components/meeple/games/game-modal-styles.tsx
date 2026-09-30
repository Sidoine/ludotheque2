import styled from "@emotion/styled";
export const BggHelper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 13px;
  border-radius: 11px;
  background: #edf2ee;
  b {
    font-size: 10px;
  }
  small {
    margin: 2px 0 6px;
    color: var(--muted);
    font-size: 8px;
  }
`;
export const BggLinkRow = styled.div`
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr) auto;
  align-items: end;
  gap: 10px;
  & > span {
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    align-self: center;
    border-radius: 9px;
    color: var(--forest);
    background: white;
  }
  label {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  input {
    min-width: 0;
    height: 35px;
    padding: 0 10px;
    border: 1px solid #d5ddd7;
    border-radius: 7px;
    outline: 0;
    background: white;
    font-size: 9px;
  }
  @media (max-width: 700px) {
    grid-template-columns: 32px 1fr;
    & > button {
      grid-column: 1 / -1;
    }
  }
`;
export const BggSearchHelper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 13px;
  & > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  small {
    color: var(--muted);
    font-size: 8px;
  }
`;
export const BggResults = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 5px;
  width: 100%;
  max-height: 190px;
  overflow-y: auto;
  padding: 0 13px;
`;
export const BggResult = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: var(--ink);
  background: white;
  text-align: left;
  cursor: pointer;
  &:hover {
    border-color: var(--forest);
    background: var(--forest-soft);
  }
  span {
    min-width: 0;
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  small {
    flex: 0 0 auto;
    color: var(--muted);
    font-size: 9px;
  }
`;
export const CoverUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  small {
    color: var(--muted);
    font-size: 11px;
  }
`;
export const CoverUploadButton = styled.label`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #dcdad2;
  border-radius: 8px;
  color: var(--forest);
  background: #eef3ed;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    border-color: var(--forest);
    background: #e3eee5;
  }
`;
export const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;
export const CoverPreview = styled.img`
  display: block;
  width: 78px;
  height: 96px;
  margin-top: 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(24, 39, 30, 0.12);
`;
export const InputWithSuffix = styled.div`
  position: relative;
  i {
    position: absolute;
    top: 12px;
    right: 10px;
    color: var(--muted);
    font-size: 9px;
    font-style: normal;
  }
  input {
    padding-right: 36px;
  }
`;
