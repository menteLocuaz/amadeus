import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid ${({ theme }) => theme.bg3}33;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.bg3}; border-radius: 10px; }
`;
