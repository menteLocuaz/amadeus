import React from "react";
import { FiSearch, FiRefreshCcw } from "react-icons/fi";
import { FilterToolbar, SearchBox, FilterSelects, StyledSelect, ActionBtn } from "../styles/UserStyles";

interface UserFiltersProps {
  filters: any;
  setFilters: (f: any) => void;
  resetFilters: () => void;
  roles: any[];
  sucursales: any[];
}

const UserFilters: React.FC<UserFiltersProps> = ({ 
  filters, setFilters, resetFilters, roles, sucursales 
}) => {
  return (
    <FilterToolbar>
      <SearchBox>
        <FiSearch />
        <input 
          placeholder="Filtrar por nombre, correo, usuario..." 
          value={filters.search} 
          onChange={e => setFilters({ search: e.target.value })}
        />
      </SearchBox>
      <FilterSelects>
        <StyledSelect 
          value={filters.id_rol || ""} 
          onChange={e => setFilters({ id_rol: e.target.value || null })}
        >
          <option value="">Todos los Roles</option>
          {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
        </StyledSelect>
        <StyledSelect 
          value={filters.id_sucursal || ""} 
          onChange={e => setFilters({ id_sucursal: e.target.value || null })}
        >
          <option value="">Todas las Sucursales</option>
          {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>)}
        </StyledSelect>
        <ActionBtn onClick={resetFilters} title="Limpiar Filtros"><FiRefreshCcw /></ActionBtn>
      </FilterSelects>
    </FilterToolbar>
  );
};

export default UserFilters;
