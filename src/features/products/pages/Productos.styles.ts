import styled, { keyframes } from "styled-components";
import { HeaderTitle } from "../../../shared/components/UI";

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StaggeredRow = styled.tr<{ $index?: number }>`
  animation: ${fadeInUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.05}s;
  opacity: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}08 !important;
    transform: scale(1.002) translateX(4px);
    box-shadow: -4px 0 0 ${({ theme }) => theme.primary};
  }
`;

export const BoldHeader = styled(HeaderTitle)`
  h1 {
    font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    background: linear-gradient(135deg, ${({ theme }) => theme.text}, ${({ theme }) => theme.primary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-weight: 500;
    opacity: 0.7;
    margin-top: 8px;
    font-size: 1.05rem;
  }
`;
