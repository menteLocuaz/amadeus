import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  width: 100%;
  max-width: 800px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  border: 1px solid ${({ theme }) => theme.bg3}15;
  position: relative;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => theme.primary}44; 
    border-radius: 10px; 
  }
`;
