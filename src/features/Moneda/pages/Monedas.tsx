import React, { useMemo } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiDollarSign, FiActivity, FiGlobe } from "react-icons/fi";
import { useMonedaPage } from "../hooks/useMonedaPage";
import { MonedaTable } from "../components/MonedaTable";
import { MonedaModal } from "../components/MonedaModal";

/* ------------------------------ Styled UI ------------------------------- */
const PageContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
  padding-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const TitleArea = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: ${({ theme }) => theme.text};
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'Space Grotesk', sans-serif;

    svg {
      color: ${({ theme }) => theme.primary};
      font-size: 2rem;
    }
  }
  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.texttertiary};
    max-width: 600px;
    line-height: 1.6;
    font-weight: 500;
  }
`;

const ActionArea = styled.div`
  display: flex;
  gap: 16px;
`;

const MintButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  background: ${({ theme }) => theme.primary};
  color: #000;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 24px ${({ theme }) => theme.primary}33;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.05);
    box-shadow: 0 12px 32px ${({ theme }) => theme.primary}44;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const StatItem = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.04);
  }

  .label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${({ theme }) => theme.texttertiary};
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg { color: ${({ theme }) => theme.primary}; }
  }

  .value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text};
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 440px;

  svg {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primary};
    font-size: 1.2rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 52px;
    background: ${({ theme }) => theme.bg2}22;
    border: 1px solid ${({ theme }) => theme.bg3}15;
    border-radius: 12px;
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      background: ${({ theme }) => theme.bg};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}11;
    }

    &::placeholder {
      color: ${({ theme }) => theme.texttertiary}88;
    }
  }
`;

const LedgerCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
`;

const LoadingState = styled.div`
  padding: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  color: ${({ theme }) => theme.primary};

  p {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

/* ------------------------------- Component ------------------------------- */
const Monedas: React.FC = () => {
  const {
    filteredMonedas, sucursales, sucursalMap,
    search, setSearch,
    isLoading, isSaving, isDeletingId,
    isModalOpen, editingMoneda,
    formData, setFormData,
    openModal, closeModal,
    handleSave, handleDelete,
  } = useMonedaPage();

  const isBusy = isSaving || isDeletingId !== null || isLoading;

  const stats = useMemo(() => [
    { label: "Divisas Activas", value: filteredMonedas.length, icon: FiDollarSign },
    { label: "Nodos de Red", value: sucursales.length, icon: FiGlobe },
    { label: "Estado Tesorería", value: "Sincronizado", icon: FiActivity },
  ], [filteredMonedas.length, sucursales.length]);

  return (
    <PageContainer>
      <Header>
        <TitleArea>
          <h1><FiDollarSign /> Libro de Monedas</h1>
          <p>
            Configure las divisas operativas, asigne nodos de tesorería y 
            gestione los parámetros de valor de su organización.
          </p>
        </TitleArea>
        <ActionArea>
          <MintButton onClick={() => openModal()} disabled={isBusy}>
            <FiPlus size={20} />
            Nueva Divisa
          </MintButton>
        </ActionArea>
      </Header>

      <StatsStrip>
        {stats.map(stat => (
          <StatItem key={stat.label}>
            <div className="label">
              <stat.icon size={14} />
              {stat.label}
            </div>
            <div className="value">{stat.value}</div>
          </StatItem>
        ))}
      </StatsStrip>

      <Toolbar>
        <SearchBox>
          <FiSearch />
          <input
            placeholder="Buscar por nombre, símbolo o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isBusy}
          />
        </SearchBox>
      </Toolbar>

      <LedgerCard>
        {isLoading && filteredMonedas.length === 0 ? (
          <LoadingState>
            <ClimbingBoxLoader color="currentColor" size={20} />
            <p>Sincronizando Tesorería...</p>
          </LoadingState>
        ) : (
          <MonedaTable
            monedas={filteredMonedas}
            sucursalMap={sucursalMap}
            isDeletingId={isDeletingId}
            isSaving={isSaving}
            onEdit={openModal}
            onDelete={handleDelete}
          />
        )}
      </LedgerCard>

      {isModalOpen && (
        <MonedaModal
          editingMoneda={editingMoneda}
          formData={formData}
          sucursales={sucursales}
          isSaving={isSaving}
          isDeletingId={isDeletingId}
          onChange={setFormData}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </PageContainer>
  );
};

export default Monedas;
