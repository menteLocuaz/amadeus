import React from "react";
import styled from "styled-components";
import { TIPO_META, type TipoDispositivo, type Dispositivo } from "../constants/dispositivos";

const FilterBar = styled.div`
    display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean; $color?: string }>`
    padding: 6px 14px; border-radius: 20px;
    border: 1px solid ${({ $active, $color, theme }) => $active ? ($color || theme.bg4) : theme.bg3 + '44'};
    background: ${({ $active, $color, theme }) => $active ? ($color || theme.bg4) + '18' : 'transparent'};
    color: ${({ $active, $color, theme }) => $active ? ($color || theme.bg4) : theme.textsecondary};
    font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.18s;
    &:hover { opacity: 0.8; }
`;

interface DeviceFilterBarProps {
    filterTipo: TipoDispositivo | "TODOS";
    onFilterChange: (tipo: TipoDispositivo | "TODOS") => void;
    dispositivos: Dispositivo[];
}

const DeviceFilterBar: React.FC<DeviceFilterBarProps> = ({ 
    filterTipo, 
    onFilterChange, 
    dispositivos 
}) => {
    return (
        <FilterBar>
            <FilterChip 
                $active={filterTipo === "TODOS"} 
                onClick={() => onFilterChange("TODOS")}
            >
                Todos ({dispositivos.length})
            </FilterChip>
            {(Object.keys(TIPO_META) as TipoDispositivo[]).map(tipo => (
                <FilterChip
                    key={tipo}
                    $active={filterTipo === tipo}
                    $color={TIPO_META[tipo].color}
                    onClick={() => onFilterChange(tipo)}
                >
                    {TIPO_META[tipo].label}s ({dispositivos.filter(d => d.tipo === tipo).length})
                </FilterChip>
            ))}
        </FilterBar>
    );
};

export default DeviceFilterBar;
