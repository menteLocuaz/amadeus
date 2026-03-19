import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClimbingBoxLoader, BeatLoader } from "react-spinners";
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiX,
    FiCheckCircle, FiAlertCircle, FiMonitor,
    FiMapPin, FiActivity, FiGlobe
} from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox,
    TableCard, Table, ActionBtn, Badge, FormGroup,
    ModalOverlay, ModalContent, ModalHeader
} from "../../../shared/components/UI";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { EstacionService, type EstacionAPI } from "../services/EstacionService";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN
═══════════════════════════════════════════════════════════ */
const schema = yup.object({
    codigo:      yup.string().required("El código (ej: POS-01) es requerido"),
    nombre:      yup.string().required("El nombre es requerido").min(3),
    ip:          yup.string()
                    .required("La dirección IP es requerida")
                    .matches(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato inválido (ej: 192.168.1.10)"),
    id_sucursal: yup.string().required("Selecciona una sucursal"),
    id_status:   yup.string().required("Selecciona un estatus operativo"),
});

export interface EstacionForm {
    codigo: string;
    nombre: string;
    ip: string;
    id_sucursal: string;
    id_status: string;
}

/* ═══════════════════════════════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════════════════════════════ */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.bg};
  border-radius: 16px; padding: 24px;
  display: flex; align-items: center; gap: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}44;
  position: relative; overflow: hidden;
  &::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 4px;
    background: ${({ $color }) => $color}; opacity: 0.6;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 54px; height: 54px; border-radius: 14px;
  background: ${({ $color }) => $color}15; color: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
`;

const StatContent = styled.div`
  h3 { margin: 0; font-size: 1.8rem; font-weight: 800; line-height: 1; }
  p { margin: 4px 0 0; font-size: 0.82rem; opacity: 0.6; font-weight: 600; }
`;

const IPChip = styled.code`
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    background: ${({ theme }) => theme.bg2};
    padding: 4px 10px; border-radius: 8px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
`;

const SubmitBtn = styled.button`
    width: 100%;
    padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; margin-top: 15px;
    transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
const Estacion: React.FC = () => {
    const { sucursales, statusList, fetchCatalogs } = useCatalogStore();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [estaciones, setEstaciones] = useState<EstacionAPI[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EstacionAPI | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EstacionForm>({
        resolver: yupResolver(schema),
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            await fetchCatalogs();
            const list = await EstacionService.getAll();
            setEstaciones(list);
        } catch {
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item?: EstacionAPI) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            setValue("codigo",      item.codigo);
            setValue("nombre",      item.nombre);
            setValue("ip",          item.ip);
            setValue("id_sucursal", item.id_sucursal);
            setValue("id_status",   item.id_status);
        } else {
            setEditingItem(null);
            reset({ codigo: "", nombre: "", ip: "", id_sucursal: "", id_status: "" });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data: EstacionForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (editingItem) {
                const updated = await EstacionService.update(editingItem.id_estacion, data);
                setEstaciones(prev => prev.map(e => e.id_estacion === editingItem.id_estacion ? { ...e, ...updated } : e));
            } else {
                const created = await EstacionService.create(data);
                setEstaciones(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setApiError(error.response?.data?.message || "Error al procesar la operación.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Dar de baja esta estación? Se realizará un Soft Delete.")) return;
        try {
            await EstacionService.delete(id);
            setEstaciones(prev => prev.filter(e => e.id_estacion !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    const filtered = estaciones.filter(e => 
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeStatusList = useMemo(() => 
        statusList.filter(s => s.stp_tipo_estado === "ACTIVO" || s.stp_tipo_estado === "INACTIVO"), 
        [statusList]
    );

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Conectando con estaciones POS...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiMonitor /> Estaciones POS</h1>
                    <p>Configura las terminales físicas y vincula sucursal y estatus</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input 
                            placeholder="Buscar por código o nombre..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn 
                        style={{ width: 'auto', margin: 0, padding: '12px 24px' }}
                        onClick={() => handleOpenModal()}
                    >
                        <FiPlus /> Nueva Estación
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            <StatsGrid>
                <StatCard $color="#FCA311">
                    <StatIcon $color="#FCA311"><FiMonitor /></StatIcon>
                    <StatContent>
                        <h3>{estaciones.length}</h3>
                        <p>Total Terminales</p>
                    </StatContent>
                </StatCard>
                <StatCard $color="#3B82F6">
                    <StatIcon $color="#3B82F6"><FiMapPin /></StatIcon>
                    <StatContent>
                        <h3>{new Set(estaciones.map(e => e.id_sucursal)).size}</h3>
                        <p>Sucursales Cubiertas</p>
                    </StatContent>
                </StatCard>
                <StatCard $color="#10B981">
                    <StatIcon $color="#10B981"><FiActivity /></StatIcon>
                    <StatContent>
                        <h3>{estaciones.filter(e => !e.deleted_at).length}</h3>
                        <p>Estaciones Activas</p>
                    </StatContent>
                </StatCard>
            </StatsGrid>

            <TableCard>
                <Table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre de Estación</th>
                            <th>Dirección IP</th>
                            <th>Sucursal</th>
                            <th>Estado</th>
                            <th style={{ textAlign: "right" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(e => (
                            <tr key={e.id_estacion}>
                                <td><Badge $variant="outline">{e.codigo}</Badge></td>
                                <td style={{ fontWeight: 800 }}>{e.nombre}</td>
                                <td><IPChip>{e.ip}</IPChip></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiMapPin size={12} opacity={0.5} />
                                        {sucursales.find(s => (s.id || s.id_sucursal) === e.id_sucursal)?.nombre || "N/A"}
                                    </div>
                                </td>
                                <td>
                                    <Badge style={{ 
                                        background: !e.deleted_at ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                        color: !e.deleted_at ? '#10B981' : '#EF4444'
                                    }}>
                                        {!e.deleted_at ? "ACTIVO" : "ELIMINADO"}
                                    </Badge>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <ActionBtn $variant="edit" onClick={() => handleOpenModal(e)}><FiEdit2 /></ActionBtn>
                                    <ActionBtn $variant="delete" onClick={() => handleDelete(e.id_estacion)}><FiTrash2 /></ActionBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableCard>

            {isModalOpen && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: 550 }}>
                        <ModalHeader>
                            <h2>{editingItem ? "Editar Terminal" : "Registrar Terminal POS"}</h2>
                            <ActionBtn $variant="close" onClick={() => setIsModalOpen(false)}><FiX /></ActionBtn>
                        </ModalHeader>

                        {apiError && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10, color: '#EF4444', marginBottom: 15, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiAlertCircle /> {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 15 }}>
                                <FormGroup>
                                    <label>Código</label>
                                    <input {...register("codigo")} placeholder="POS-01" />
                                    {errors.codigo && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.codigo.message}</p>}
                                </FormGroup>
                                <FormGroup>
                                    <label>Nombre Comercial / Ubicación</label>
                                    <input {...register("nombre")} placeholder="Caja Principal Pasillo A" />
                                    {errors.nombre && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
                                </FormGroup>
                            </div>

                            <FormGroup>
                                <label>Dirección IP Fija</label>
                                <div style={{ position: 'relative' }}>
                                    <FiGlobe style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                    <input {...register("ip")} placeholder="192.168.1.10" style={{ paddingLeft: 35 }} />
                                </div>
                                {errors.ip && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.ip.message}</p>}
                            </FormGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <FormGroup>
                                    <label>Sucursal</label>
                                    <select {...register("id_sucursal")}>
                                        <option value="">Seleccione...</option>
                                        {sucursales.map(s => (
                                            <option key={s.id || s.id_sucursal} value={s.id || s.id_sucursal}>{s.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.id_sucursal && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_sucursal.message}</p>}
                                </FormGroup>
                                <FormGroup>
                                    <label>Estatus Inicial</label>
                                    <select {...register("id_status")}>
                                        <option value="">Seleccione...</option>
                                        {activeStatusList.map(s => (
                                            <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>
                                        ))}
                                    </select>
                                    {errors.id_status && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_status.message}</p>}
                                </FormGroup>
                            </div>

                            <SubmitBtn type="submit" disabled={isSaving}>
                                {isSaving ? <BeatLoader size={8} color="#000" /> : <><FiCheckCircle /> {editingItem ? "Actualizar Estación" : "Crear Estación"}</>}
                            </SubmitBtn>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Estacion;
