import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AuthService, type RolItem, type SucursalItem } from "../services/AuthService";
import { EstatusService } from "../services/EstatusService";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface EstatusItem {
  id: string;
  descripcion: string;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [estatusList, setEstatusList] = useState<EstatusItem[]>([]);
  
  const [formData, setFormData] = useState({
    nombre_rol: "",
    id_sucursal: "",
    id_status: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log("Cargando datos iniciales...");
      const [resRoles, resSucursales, resCatalogo] = await Promise.all([
        AuthService.getRoles(),
        AuthService.getSucursales(),
        EstatusService.getCatalogo()
      ]);
      
      console.log("Respuesta Sucursales:", resSucursales);
      
      setRoles(resRoles.data || []);
      setSucursales(resSucursales.data || []);
      
      // El catálogo maestro agrupa por módulo ID (Módulo 3 = Usuario/Roles)
      if (resCatalogo.status === 'success' && resCatalogo.data["3"]) {
        setEstatusList(resCatalogo.data["3"].items || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthService.createRol(formData);
      setFormData({ nombre_rol: "", id_sucursal: "", id_status: "" });
      loadInitialData();
      alert("Rol creado correctamente");
    } catch (error) {
      alert("Error al crear el rol");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este rol?")) {
      await AuthService.deleteRol(id);
      loadInitialData();
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>Gestión de Roles</h1>
        <p>Define los perfiles de acceso y asígnalos a sucursales con su estado correspondiente.</p>
      </Header>

      <FormSection onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nombre del Rol</label>
          <input 
            value={formData.nombre_rol} 
            onChange={e => setFormData({...formData, nombre_rol: e.target.value})}
            placeholder="Ej: Administrador, Vendedor..."
            required 
          />
        </div>

        <div className="input-group">
          <label>Sucursal</label>
          <select 
            value={formData.id_sucursal} 
            onChange={e => setFormData({...formData, id_sucursal: e.target.value})}
            required
          >
            <option value="">Seleccione Sucursal</option>
            {sucursales.map(s => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre_sucursal}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Estado (Estatus)</label>
          <select 
            value={formData.id_status} 
            onChange={e => setFormData({...formData, id_status: e.target.value})}
            required
          >
            <option value="">Seleccione Estado</option>
            {estatusList.map(est => (
              <option key={est.id} value={est.id}>
                {est.descripcion}
              </option>
            ))}
          </select>
        </div>

        <SubmitBtn type="submit" disabled={isLoading}>
          <FiPlus /> {isLoading ? "Guardando..." : "Crear Rol"}
        </SubmitBtn>
      </FormSection>

      <ListSection>
        <table>
          <thead>
            <tr>
              <th>Nombre del Rol</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(rol => {
              // Buscar el nombre de la sucursal por su ID en la lista local
              const sucursal = sucursales.find(s => s.id_sucursal === rol.id_sucursal);
              // Buscar el nombre del estado
              const estatus = estatusList.find(e => e.id === rol.id_status);
              return (
                <tr key={rol.id_rol}>
                  <td>{rol.nombre_rol}</td>
                  <td>{sucursal ? sucursal.nombre_sucursal : "N/A"}</td>
                  <td>{estatus ? estatus.descripcion : "N/A"}</td>
                  <td className="actions">
                    <button onClick={() => handleDelete(rol.id_rol)}><FiTrash2 /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ListSection>
    </PageContainer>
  );
};

// --- Estilos ---
const PageContainer = styled.div`
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  h1 { font-size: 2.2rem; color: ${({ theme }) => theme.bg4}; margin-bottom: 10px; }
  p { color: ${({ theme }) => theme.texttertiary}; }
`;

const FormSection = styled.form`
  background: ${({ theme }) => theme.bg};
  padding: 30px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 40px;

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-weight: 700; font-size: 0.9rem; color: ${({ theme }) => theme.bg4}; }
    input, select {
      background: ${({ theme }) => theme.bg2};
      border: 1px solid ${({ theme }) => theme.bg3}33;
      padding: 12px;
      border-radius: 10px;
      color: ${({ theme }) => theme.text};
      &:focus { border-color: ${({ theme }) => theme.bg4}; outline: none; }
    }
  }
`;

const SubmitBtn = styled.button`
  background: ${({ theme }) => theme.bg4};
  color: #000;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { opacity: 0.9; transform: translateY(-2px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ListSection = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  table {
    width: 100%;
    border-collapse: collapse;
    th { background: ${({ theme }) => theme.bg2}; padding: 15px; text-align: left; }
    td { padding: 15px; border-bottom: 1px solid ${({ theme }) => theme.bg3}11; }
    .actions {
      display: flex;
      gap: 10px;
      button { background: transparent; border: none; color: #ff4d4d; cursor: pointer; font-size: 1.2rem; }
    }
  }
`;

export default RolesPage;
