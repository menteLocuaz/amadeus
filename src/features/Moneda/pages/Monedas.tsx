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
  border-bottom: 1px solid ${({ theme }) => theme.bg3}44;
  padding-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const TitleArea = styled.div`
  h1 {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.text};
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      color: ${({ theme }) => theme.bg4};
      font-size: 1.8rem;
    }
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.texttertiary};
    max-width: 500px;
    line-height: 1.5;
  }
`;

const ActionArea = styled.div`
  display: flex;
  gap: 12px;
`;

const MintButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.bg};
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
    box-shadow: 0 8px 16px ${({ theme }) => theme.bg4}33;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatItem = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.bg2}44;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.texttertiary};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .value {
    font-family: "JetBrains Mono", monospace;
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text};
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.bg4};
    font-size: 1.1rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    background: ${({ theme }) => theme.bg2};
    border: 1px solid ${({ theme }) => theme.bg3}66;
    border-radius: 10px;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.bg4};
      background: ${({ theme }) => theme.bg};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.bg4}15;
    }

    &::placeholder {
      color: ${({ theme }) => theme.texttertiary}88;
    }
  }
`;

const LedgerCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
`;

const LoadingState = styled.div`
  padding: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  color: ${({ theme }) => theme.bg4};

  p {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }
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
