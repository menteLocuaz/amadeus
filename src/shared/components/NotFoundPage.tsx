import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ROUTES } from "../../core/constants/routes";

const NotFoundPage: React.FC = () => {
    return (
        <Container>
            <ErrorCode>404</ErrorCode>
            <MessageSection>
                <h2>Oops! Página No Encontrada</h2>
                <p>La sección que buscas ha sido movida o no existe en el sistema.</p>
            </MessageSection>
            <BackButton to={ROUTES.HOME}>
                Volver al Panel Principal
            </BackButton>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  padding: 40px;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  margin: 0;
  color: ${({ theme }) => theme.bg4}; // Dorado característico
  opacity: 0.2;
`;

const MessageSection = styled.div`
  margin-top: -40px;
  h2 { font-size: 2rem; margin-bottom: 15px; color: ${({ theme }) => theme.text}; }
  p { font-size: 1.1rem; color: ${({ theme }) => theme.texttertiary}; margin-bottom: 40px; }
`;

const BackButton = styled(Link)`
  padding: 15px 30px;
  background: ${({ theme }) => theme.bg4};
  color: #000;
  text-decoration: none;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(252, 163, 17, 0.3);
  }
`;

export default NotFoundPage;
