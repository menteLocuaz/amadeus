import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
    FiShoppingCart, FiBriefcase, FiArrowRight,
    FiCheck, FiZap, FiBarChart2, FiUsers,
    FiPackage, FiCreditCard, FiTrendingUp
} from "react-icons/fi";
import { ROUTES } from "../../core/constants/routes";

/* ═══════════════════════════════════════════════════════════
   ANIMACIONES
═══════════════════════════════════════════════════════════ */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ═══════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════ */
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
  overflow: hidden;
`;

// Orbes decorativos que usan los colores acento del tema
const OrbTop = styled.div`
  position: absolute;
  top: -180px; left: -180px;
  width: 480px; height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, ${({ theme }) => theme.bg4}22 0%, transparent 70%);
  pointer-events: none;
`;

const OrbBottom = styled.div`
  position: absolute;
  bottom: -180px; right: -180px;
  width: 420px; height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
  pointer-events: none;
`;

/* ═══════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════ */
const Container = styled.div`
  width: 100%;
  max-width: 880px;
  text-align: center;
  z-index: 10;
  animation: ${fadeUp} 0.5s ease-out both;
`;

const TopBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}55;
  padding: 6px 18px;
  border-radius: 30px;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.bg4};
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  margin: 0 0 14px;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textsecondary};
  font-size: 1rem;
  max-width: 480px;
  margin: 0 auto 52px;
  line-height: 1.6;
`;

/* ═══════════════════════════════════════════════════════════
   CARDS
═══════════════════════════════════════════════════════════ */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
`;

interface CardProps { $active: boolean; $accent: string; $glow: string; }

const Card = styled.div<CardProps>`
  background: ${({ theme, $active, $accent }) => $active ? `${$accent}11` : theme.bg2};
  border: 2px solid ${({ $active, $accent, theme }) => $active ? $accent : theme.bg3 + '44'};
  border-radius: 24px;
  padding: 32px 28px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  ${({ $active, $glow }) => $active && `
    box-shadow: 0 20px 40px ${$glow};
    transform: translateY(-8px);
  `}

  /* Shimmer superior activo */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: ${({ $active, $accent }) => $active ? `linear-gradient(90deg, transparent, ${$accent}, transparent)` : 'transparent'};
    transition: background 0.3s;
  }

  &:hover:not([data-active='true']) {
    background: ${({ theme }) => theme.bg3}22;
    border-color: ${({ theme }) => theme.bg3}88;
    transform: translateY(-4px);
  }
`;

interface IconWrapProps { $gradient: string; $active: boolean; $glow: string; }

const IconWrap = styled.div<IconWrapProps>`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: ${({ $gradient, $active, theme }) => $active ? $gradient : theme.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 24px;
  color: ${({ $active, theme }) => $active ? '#fff' : theme.textsecondary};
  transition: all 0.3s;
  ${({ $active, $glow }) => $active && `box-shadow: 0 10px 20px ${$glow};`}
`;

const MiniChip = styled.div<{ $gradient: string }>`
  position: absolute;
  top: 24px;
  right: 24px;
  background: ${({ $gradient }) => $gradient};
  color: #fff;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  h2 { font-size: 1.45rem; font-weight: 800; margin: 0; color: ${({ theme }) => theme.text}; }
  span { font-size: 0.8rem; color: ${({ theme }) => theme.textsecondary}; font-weight: 600; }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.textsecondary};
  font-size: 0.88rem;
  margin: 0 0 20px;
  line-height: 1.55;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface FeatureItemProps { $active: boolean; $accent: string; }

const FeatureItem = styled.div<FeatureItemProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: ${({ $active, theme }) => $active ? theme.text : theme.textsecondary};
  svg { 
    color: ${({ $active, $accent, theme }) => $active ? $accent : theme.bg4 + '44'}; 
    flex-shrink: 0;
  }
`;

const SelectLabel = styled.div<{ $active: boolean; $accent: string }>`
  margin-top: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ $active, $accent, theme }) => $active ? $accent : theme.textsecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: ${({ $active }) => $active ? 1 : 0.5};
  transition: all 0.3s;
`;

/* ═══════════════════════════════════════════════════════════
   BOTÓN CONTINUAR
═══════════════════════════════════════════════════════════ */
const ContinueWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  animation: ${slideIn} 0.35s ease-out both;
`;

const ContinueBtn = styled.button<{ $gradient: string; $glow: string }>`
  padding: 16px 52px;
  border-radius: 18px;
  border: none;
  background: ${({ $gradient }) => $gradient};
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 28px ${({ $glow }) => $glow};
  transition: transform 0.25s ease, filter 0.25s ease;

  &:hover { transform: translateY(-4px); filter: brightness(1.08); }
  &:active { transform: translateY(-1px); }
`;

const Footer = styled.footer`
  margin-top: 48px;
  color: ${({ theme }) => theme.textsecondary};
  font-size: 0.78rem;
  opacity: 0.5;
`;

/* ═══════════════════════════════════════════════════════════
   DATOS
═══════════════════════════════════════════════════════════ */
const SYSTEMS = [
    {
        id: "caja",
        name: "Caja",
        tagline: "Punto de Venta",
        description: "Apertura de turno, cobros en mostrador y control de efectivo en tiempo real.",
        gradient: "linear-gradient(135deg, #f97316, #ef4444)",
        glowColor: "rgba(249,115,22,0.28)",
        accentColor: "#f97316",
        Icon: FiShoppingCart,
        features: [
            { Icon: FiCreditCard, text: "Cobros y facturación" },
            { Icon: FiZap, text: "Apertura y cierre de caja" },
            { Icon: FiPackage, text: "Salidas de inventario" },
        ],
        badge: "POS",
        route: ROUTES.POS_APERTURA,
    },
    {
        id: "orion",
        name: "Orion",
        tagline: "ERP Empresarial",
        description: "Gestión integral de catálogos, compras, proveedores, reportes y personal.",
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        glowColor: "rgba(99,102,241,0.28)",
        accentColor: "#6366f1",
        Icon: FiBriefcase,
        features: [
            { Icon: FiBarChart2, text: "Dashboards y reportes" },
            { Icon: FiUsers, text: "Gestión administrativa" },
            { Icon: FiTrendingUp, text: "Control de compras" },
        ],
        badge: "ERP",
        route: ROUTES.HOME,
    },
] as const;

/* ═══════════════════════════════════════════════════════════
   COMPONENTE
═══════════════════════════════════════════════════════════ */
const MecanicaSele: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);
    const navigate = useNavigate();
    const system = SYSTEMS.find(s => s.id === selected);

    return (
        <PageWrapper>
            <OrbTop />
            <OrbBottom />

            <Container>
                <TopBadge>✦ Selección de Plataforma</TopBadge>
                <Title>¿Con qué sistema<br />trabajaremos hoy?</Title>
                <Subtitle>
                    Elige el entorno de trabajo según tus tareas. Puedes cambiar en cualquier momento.
                </Subtitle>

                <CardsGrid>
                    {SYSTEMS.map(sys => {
                        const isActive = selected === sys.id;
                        return (
                            <Card
                                key={sys.id}
                                $active={isActive}
                                $accent={sys.accentColor}
                                $glow={sys.glowColor}
                                data-active={isActive}
                                onClick={() => setSelected(sys.id)}
                            >
                                {isActive
                                    ? null
                                    : <MiniChip $gradient={sys.gradient}>{sys.badge}</MiniChip>
                                }

                                <IconWrap $gradient={sys.gradient} $active={isActive} $glow={sys.glowColor}>
                                    <sys.Icon />
                                </IconWrap>

                                <CardTitle>
                                    <h2>{sys.name}</h2>
                                    <span>{sys.tagline}</span>
                                </CardTitle>

                                <Description>{sys.description}</Description>

                                <FeaturesList>
                                    {sys.features.map(f => (
                                        <FeatureItem key={f.text} $active={isActive} $accent={sys.accentColor}>
                                            <f.Icon /> {f.text}
                                        </FeatureItem>
                                    ))}
                                </FeaturesList>

                                <SelectLabel $active={isActive} $accent={sys.accentColor}>
                                    {isActive ? <><FiCheck /> Seleccionado</> : <>Seleccionar <FiArrowRight /></>}
                                </SelectLabel>
                            </Card>
                        );
                    })}
                </CardsGrid>

                {selected && system && (
                    <ContinueWrapper>
                        <ContinueBtn
                            $gradient={system.gradient}
                            $glow={system.glowColor}
                            onClick={() => navigate(system.route)}
                        >
                            Ingresar a {system.name} <FiArrowRight />
                        </ContinueBtn>
                    </ContinueWrapper>
                )}
            </Container>

            <Footer>© 2026 Groot Ecosystem · Orion ERP &amp; POS</Footer>
        </PageWrapper>
    );
};

export default MecanicaSele;