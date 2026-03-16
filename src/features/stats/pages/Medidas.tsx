import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiSliders } from "react-icons/fi";
import { MedidaService, type Medida } from "../../products/services/MedidaService";
import { useAuthStore } from "../../auth/store/useAuthStore";

// --- Estilos ---
const PageContainer = styled.div`
  padding: 28px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const TitleSection = styled.div`
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    color: ${({ theme }) => theme.bg4};
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.texttertiary};
    margin-top: 5px;
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.bg4};
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(252, 163, 17, 0.2);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SearchBar = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 12px 18px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 25px;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.bg4}22;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    width: 100%;
    font-size: 1rem;
    &::placeholder { color: ${({ theme }) => theme.texttertiary}; opacity: 0.5; }
  }
  svg { color: ${({ theme }) => theme.bg4}; }
`;

const TableCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: ${({ theme }) => theme.bg2};
    padding: 18px;
    text-align: left;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.bg4};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  td {
    padding: 18px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
    color: ${({ theme }) => theme.text};
  }
`;

const ActionBtn = styled.button<{ $variant?: "edit" | "delete" }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: ${({ $variant, theme }) => ($variant === "delete" ? "#ff4d4d" : theme.bg4)};
  transition: all 0.2s;
  font-size: 1.2rem;
  &:hover {
    background: ${({ $variant }) => ($variant === "delete" ? "rgba(255, 77, 77, 0.1)" : "rgba(252, 163, 17, 0.1)")};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.bg};
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid ${({ theme }) => theme.bg3}33;
`;

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px;
  h2 { font-size: 1.5rem; margin: 0; color: ${({ theme }) => theme.text}; }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  label { display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 10px; color: ${({ theme }) => theme.bg4}; }
  input {
    width: 100%; padding: 14px; border: 1px solid ${({ theme }) => theme.bg3}33; border-radius: 12px;
    background: ${({ theme }) => theme.bg2}; color: ${({ theme }) => theme.text}; outline: none;
    &:focus { border-color: ${({ theme }) => theme.bg4}; }
  }
`;

const ModalFooter = styled.div`
  display: flex; gap: 15px; margin-top: 30px;
  button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
`;

// --- Componente Principal ---
const Medidas: React.FC = () => {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedida, setEditingMedida] = useState<Medida | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ nombre: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await MedidaService.getAll();
      // Normalizar datos: el ID real es 'id_unidad' según el JSON de la API
      const dataNormalizada = (res.data || []).map((m: any) => ({
        ...m,
        id_medida: m.id_unidad || m.id_medida || m.id
      }));
      setMedidas(dataNormalizada);
    } catch (error) {
      console.error("Error al cargar medidas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedidas = useMemo(() => 
    medidas.filter(m => m.nombre.toLowerCase().includes(search.toLowerCase())),
    [medidas, search]
  );

  const openModal = (medida?: Medida) => {
    if (medida) {
      setEditingMedida(medida);
      setFormData({ nombre: medida.nombre });
    } else {
      setEditingMedida(null);
      setFormData({ nombre: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedNombre = formData.nombre.trim();
    if (!trimmedNombre) return alert("El nombre es obligatorio");
    if (!user?.id_sucursal) return alert("Error: No se identificó la sucursal");

    setIsLoading(true);
    try {
      const payload = { 
        nombre: trimmedNombre,
        id_sucursal: user.id_sucursal.trim()
      };

      console.log("Enviando payload a la API:", payload);

      if (editingMedida) {
        // Usamos id_medida que ya normalizamos en loadData
        const idParaActualizar = editingMedida.id_medida?.toString().trim();
        if (!idParaActualizar) throw new Error("ID de medida no encontrado");
        
        console.log("Actualizando medida con ID:", idParaActualizar);
        await MedidaService.update(idParaActualizar, payload);
        alert("¡Medida actualizada con éxito!");
      } else {
        await MedidaService.create(payload);
        alert("¡Medida creada con éxito!");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error al guardar medida:", error);
      const apiMessage = error.response?.data?.message || error.message;
      alert(`Error al procesar la medida: ${apiMessage || 'Bad Request (400)'}. Verifique los campos.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      alert("No se pudo identificar el ID para eliminar.");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar esta medida?")) {
      setIsLoading(true);
      try {
        console.log("Eliminando medida con ID:", id);
        await MedidaService.delete(id);
        await loadData();
        alert("Medida eliminada");
      } catch (error) {
        console.error("Error al eliminar medida:", error);
        alert("Error al eliminar la medida");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleSection>
          <h1><FiSliders /> Medidas</h1>
          <p>Gestiona las unidades de medida para tus productos</p>
        </TitleSection>
        <AddButton onClick={() => openModal()} disabled={isLoading}>
          <FiPlus size={20} /> Nueva Medida
        </AddButton>
      </Header>

      <SearchBar>
        <FiSearch />
        <input 
          placeholder="Buscar medida..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isLoading}
        />
      </SearchBar>

      {isLoading && medidas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color="#FCA311" size={20} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedidas.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron medidas.
                  </td>
                </tr>
              ) : (
                filteredMedidas.map(medida => (
                  <tr key={medida.id_medida}>
                    <td style={{ fontWeight: 600 }}>{medida.nombre}</td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn onClick={() => openModal(medida)} title="Editar" disabled={isLoading}>
                        <FiEdit2 size={18} />
                      </ActionBtn>
                      <ActionBtn $variant="delete" onClick={() => handleDelete(medida.id_medida)} title="Eliminar" disabled={isLoading}>
                        <FiTrash2 size={18} />
                      </ActionBtn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableCard>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Overlay>
          <Modal>
            <ModalHeader>
              <h2>{editingMedida ? "Editar Medida" : "Nueva Medida"}</h2>
              <ActionBtn onClick={() => setIsModalOpen(false)}><FiX size={24} /></ActionBtn>
            </ModalHeader>

            <FormGroup>
              <label>Nombre</label>
              <input 
                placeholder="Ej: Metro, Kilo, Unidad..." 
                value={formData.nombre}
                onChange={e => setFormData({ nombre: e.target.value })}
                disabled={isLoading}
                required
              />
            </FormGroup>

            <ModalFooter>
              <button 
                style={{ background: "rgba(255,255,255,0.05)", color: "inherit" }}
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                style={{ background: "#FCA311", color: "#000" }}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : (editingMedida ? "Guardar Cambios" : "Crear Medida")}
              </button>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </PageContainer>
  );
};

export default Medidas;
