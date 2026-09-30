import styled from "@emotion/styled";
import { Loader2 } from "lucide-react";
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
`;
export const FormField = styled.label<{
  $wide?: boolean;
}>`
  grid-column: ${({ $wide }) => ($wide ? "span 2" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 6px;
  & > span,
  legend {
    color: #56635c;
    font-size: 9px;
    font-weight: 750;
  }
  & > span small {
    color: #a0a5a2;
    font-weight: 400;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-height: 40px;
    padding: 0 11px;
    border: 1px solid #dcdad2;
    border-radius: 8px;
    outline: 0;
    color: var(--ink);
    background: white;
    font-size: 11px;
    transition:
      border 0.15s,
      box-shadow 0.15s;
    &:focus {
      border-color: #91aa9c;
      box-shadow: 0 0 0 3px rgba(49, 95, 77, 0.07);
    }
  }
  textarea {
    resize: vertical;
    padding-top: 10px;
    line-height: 1.4;
  }
  @media (max-width: 700px) {
    grid-column: auto;
  }
`;
export const Spinner = styled(Loader2)`
  animation: modal-spin 0.9s linear infinite;
  @keyframes modal-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
export const ChoiceField = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  legend {
    margin-bottom: 7px;
    color: #56635c;
    font-size: 9px;
    font-weight: 750;
    small {
      margin-left: 5px;
      color: #a0a5a2;
      font-weight: 400;
    }
  }
`;
export const ChoiceList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
export const ChoiceButton = styled.button<{
  $selected: boolean;
  $winner?: boolean;
}>`
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px ${({ $winner }) => ($winner ? "10px" : "9px 9px 4px 5px")};
  border: 1px solid
    ${({ $selected }) => ($selected ? "#9fb8aa" : "var(--line)")};
  border-radius: 20px;
  color: ${({ $selected }) => ($selected ? "var(--forest)" : "inherit")};
  background: ${({ $selected }) =>
    $selected ? "var(--forest-soft)" : "white"};
  font-size: 9px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  cursor: pointer;
  & > svg:last-child {
    display: ${({ $selected }) => ($selected ? "block" : "none")};
  }
`;
export const ResultChoice = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
`;
export const ResultButton = styled.button<{
  $selected: boolean;
  $won: boolean;
}>`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid
    ${({ $selected, $won }) =>
      $selected ? ($won ? "#90ad9d" : "#d7aa9e") : "var(--line)"};
  border-radius: 9px;
  color: ${({ $selected, $won }) =>
    $selected ? ($won ? "var(--forest)" : "#a35341") : "inherit"};
  background: ${({ $selected, $won }) =>
    $selected ? ($won ? "var(--forest-soft)" : "#f6e7e2") : "white"};
  font-size: 10px;
  cursor: pointer;
`;
export const SwitchField = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  & > input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  & > span {
    width: 31px;
    height: 18px;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 10px;
    color: white;
    background: #c8cbc8;
    transition: 0.15s;
  }
  & > span svg {
    width: 14px;
    height: 14px;
    padding: 2px;
    border-radius: 50%;
    color: transparent;
    background: white;
    transition: 0.15s;
  }
  & > input:checked + span {
    justify-content: flex-end;
    background: var(--forest);
  }
  & > input:checked + span svg {
    color: var(--forest);
  }
  div {
    display: flex;
    flex-direction: column;
  }
  b {
    font-size: 10px;
  }
  small {
    margin-top: 2px;
    color: var(--muted);
    font-size: 8px;
  }
`;
