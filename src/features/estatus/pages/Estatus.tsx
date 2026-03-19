import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClimbingBoxLoader, BeatLoader } from "react-spinners";
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiX,
    FiCheckCircle, FiAlertCircle, FiLayers,
    FiTag, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox,
    TableCard, Table, ActionBtn, Badge, FormGroup,
    ModalOverlay, ModalContent, ModalHeader
} from "../../../shared/components/UI";
import {
    EstatusService,
    type EstatusResponse,
    type EstatusMasterCatalog,
    type CreateEstatusDTO,
} from "../services/EstatusService";

/* ═══════════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════════ */
const schema = yup.object({
    std_descripcion: yup.string().required("La descripción es requerida").min(2),
    stp_tipo_estado: yup.string().required("El tipo de estado es requerido"),
    mdl_id:          yup.number().typeError("Selecciona un módulo").required("El módulo es requerido").min(1),
});
type EstatusForm = yup.InferType<typeof schema>;

/* Módulos conocidos para el selector (puede expandirse) */
const MODULOS: { id: number; nombre: string }[] = [
    { id: 1,  nombre: "Ventas"      },
    { id: 2,  nombre: "Compras"     },
    { id: 3,  nombre: "Inventario"  },
    { id: 4,  nombre: "Caja / POS"  },
    { id: 5,  nombre: "Facturación" },
    { id: 6,  nombre: "Clientes"    },
    { id: 7,  nombre: "Proveedores" },
    { id: 8,  nombre: "Usuarios"    },
];

/* Paleta de colores por tipo de estado */
const TIPO_COLOR: Record<string, string> = {
    ACTIVO:    "#10b981",
    INACTIVO:  "#ef4444",
    PENDIENTE: "#f59e0b",
    PROCESO:   "#3b82f6",
    CANCELADO: "#8b5cf6",
    CERRADO:   "#6b7280",
};
const getColor = (tipo: string) => TIPO_COLOR[tipo.toUpperCase()] ?? "#FCA311";

/* ═══════════════════════════════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════════════════════════════ */
const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
`;

const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ $color }) => $color}33;
    border-left: 4px solid ${({ $color }) => $color};
    border-radius: 14px;
    padding: 16px 20px;
    h3 { margin: 0; font-size: 1.8rem; font-weight: 900; color: ${({ $color }) => $color}; }
    p  { margin: 4px 0 0; font-size: 0.78rem; opacity: 0.6; }
`;

const GroupCard = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
`;

const GroupHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: ${({ theme }) => theme.bg2};
    cursor: pointer;
    user-select: none;
    &:hover { opacity: 0.9; }
`;

const GroupLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 800;
    font-size: 1rem;
    color: ${({ theme }) => theme.text};
    span.count {
        font-size: 0.75rem;
        background: ${({ theme }) => theme.bg4}22;
        color: ${({ theme }) => theme.bg4};
        padding: 2px 10px;
        border-radius: 20px;
        font-weight: 700;
    }
`;

const TipoBadge = styled.span<{ $color: string }>`
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 800;
    background: ${({ $color }) => $color}18;
    color: ${({ $color }) => $color};
    text-transform: uppercase;
    letter-spacing: 0.4px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

const SubmitBtn = styled.button`
    width: 100%; padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 12px; transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px ${({ theme }) => theme.bg4}44; }
`;

const ErrorText = styled.span`
    color: #ff4d4d; font-size: 0.75rem; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
`;

const ApiError = styled.div`
    margin-bottom: 16px; padding: 12px 16px; border-radius: 12px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; font-size: 0.88rem;
    display: flex; align-items: center; gap: 8px;
`;

const LoaderWrap = styled.div`
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 400px; gap: 20px;
    p { font-weight: 600; opacity: 0.7; }
`;

const EmptyState = styled.div`
    text-align: center; padding: 60px 20px; opacity: 0.45;
    svg { font-size: 3rem; margin-bottom: 12px; display: block; margin-inline: auto; }
    p { font-size: 1rem; }
`;

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTE: Grupo colapsable
═══════════════════════════════════════════════════════════ */
interface GroupProps {
    modulo:      string;
    items:       EstatusResponse[];
    onEdit:      (item: EstatusResponse) => void;
    onDelete:    (id: string) => void;
    deletingId:  string | null;
}

const ModuleGroup: React.FC<GroupProps> = ({ modulo, items, onEdit, onDelete, deletingId }) => {
    const [open, setOpen] = useState(true);
    return (
        <GroupCard>
            <GroupHeader onClick={() => setOpen(v => !v)}>
                <GroupLabel>
                    <FiLayers />
                    {modulo}
                    <span className="count">{items.length} estados</span>
                </GroupLabel>
                {open ? <FiChevronUp /> : <FiChevronDown />}
            </GroupHeader>

            {open && (
                <TableCard style={{ borderRadius: 0, boxShadow: "none", border: "none" }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Tipo / Estado</th>
                                <th>Módulo ID</th>
                                <th>Creado</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id_status}>
                                    <td style={{ fontWeight: 600 }}>{item.std_descripcion}</td>
                                    <td>
                                        <TipoBadge $color={getColor(item.stp_tipo_estado)}>
                                            {item.stp_tipo_estado}
                                        </TipoBadge>
                                    </td>
                                    <td>
                                        <Badge>{item.mdl_id}</Badge>
                                    </td>
                                    <td style={{ fontSize: "0.82rem", opacity: 0.6 }}>
                                        {item.created_at.slice(0, 10)}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <ActionBtn $variant="edit" onClick={() => onEdit(item)} disabled={!!deletingId} title="Editar">
                                            <FiEdit2 />
                                        </ActionBtn>
                                        <ActionBtn $variant="delete" onClick={() => onDelete(item.id_status)} disabled={!!deletingId} title="Eliminar">
                                            {deletingId === item.id_status
                                                ? <BeatLoader size={5} color="#ff4d4d" />
                                                : <FiTrash2 />
                                            }
                                        </ActionBtn>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableCard>
            )}
        </GroupCard>
    );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
const Estatus: React.FC = () => {
    const [isLoading,    setIsLoading]    = useState(true);
    const [isSaving,     setIsSaving]     = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [apiError,     setApiError]     = useState<string | null>(null);

    const [catalog,     setCatalog]     = useState<EstatusMasterCatalog>({});
    const [allItems,    setAllItems]    = useState<EstatusResponse[]>([]);
    const [searchTerm,  setSearchTerm]  = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EstatusResponse | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EstatusForm>({
        resolver: yupResolver(schema),
    });

    /* ── Carga inicial ── */
    const fetchData = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            // Usamos el catálogo agrupado + lista plana para búsquedas
            const [flat, grouped] = await Promise.all([
                EstatusService.getAll(),
                EstatusService.getCatalog(),
            ]);
            setAllItems(flat);
            setCatalog(grouped);
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al cargar los estatus.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /* ── Modal ── */
    const handleOpenModal = (item?: EstatusResponse) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            setValue("std_descripcion", item.std_descripcion);
            setValue("stp_tipo_estado", item.stp_tipo_estado);
            setValue("mdl_id",          item.mdl_id);
        } else {
            setEditingItem(null);
            reset({ std_descripcion: "", stp_tipo_estado: "", mdl_id: undefined });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); setApiError(null); };

    /* ── Guardar ── */
    const onSubmit = async (data: EstatusForm) => {
        setIsSaving(true);
        setApiError(null);
        const dto: CreateEstatusDTO = {
            std_descripcion: data.std_descripcion,
            stp_tipo_estado: data.stp_tipo_estado.toUpperCase(),
            mdl_id:          Number(data.mdl_id),
        };
        try {
            if (editingItem) {
                await EstatusService.update(editingItem.id_status, dto);
            } else {
                await EstatusService.create(dto);
            }
            handleCloseModal();
            await fetchData(); // recarga el catálogo agrupado
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al guardar el estatus.");
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Eliminar ── */
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar este estatus definitivamente?")) return;
        setIsDeletingId(id);
        try {
            await EstatusService.delete(id);
            await fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? "Error al eliminar.");
        } finally {
            setIsDeletingId(null);
        }
    };

    /* ── Filtrado por búsqueda ── */
    const filteredCatalog = useMemo(() => {
        if (!searchTerm.trim()) return catalog;
        const q = searchTerm.toLowerCase();
        const result: EstatusMasterCatalog = {};
        Object.entries(catalog).forEach(([mdlIdStr, group]) => {
            const filtered = group.items.filter(i =>
                i.std_descripcion.toLowerCase().includes(q) ||
                i.stp_tipo_estado.toLowerCase().includes(q)
            );
            if (filtered.length > 0) {
                result[Number(mdlIdStr)] = { ...group, items: filtered };
            }
        });
        return result;
    }, [catalog, searchTerm]);

    /* ── Stats por tipo ── */
    const tipoStats = useMemo(() => {
        const map: Record<string, number> = {};
        allItems.forEach(i => {
            const t = i.stp_tipo_estado.toUpperCase();
            map[t] = (map[t] ?? 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [allItems]);

    /* ═══════════ RENDER ═══════════ */
    if (isLoading) {
        return (
            <PageContainer>
                <LoaderWrap>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p>Cargando catálogo de estatus...</p>
                </LoaderWrap>
            </PageContainer>
        );
    }

    const groups = Object.entries(filteredCatalog);

    return (
        <PageContainer>
            {/* ── HEADER ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiTag /> Estatus</h1>
                    <p>Catálogo de estados del sistema por módulo</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar descripción o tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn
                        type="button"
                        style={{ width: "auto", padding: "12px 20px", margin: 0 }}
                        onClick={() => handleOpenModal()}
                        disabled={!!isDeletingId}
                    >
                        <FiPlus /> Nuevo Estatus
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            {/* ── API ERROR ── */}
            {apiError && !isModalOpen && (
                <ApiError><FiAlertCircle /> {apiError}</ApiError>
            )}

            {/* ── STATS POR TIPO ── */}
            {tipoStats.length > 0 && (
                <StatsRow>
                    {tipoStats.map(([tipo, count]) => (
                        <StatCard key={tipo} $color={getColor(tipo)}>
                            <h3>{count}</h3>
                            <p>{tipo}</p>
                        </StatCard>
                    ))}
                </StatsRow>
            )}

            {/* ── GRUPOS POR MÓDULO ── */}
            {groups.length === 0 ? (
                <EmptyState>
                    <FiTag />
                    <p>No hay estatus registrados{searchTerm ? " con ese criterio" : ""}.</p>
                </EmptyState>
            ) : groups.map(([mdlIdStr, group]) => (
                <ModuleGroup
                    key={mdlIdStr}
                    modulo={group.modulo || `Módulo ${mdlIdStr}`}
                    items={group.items}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    deletingId={isDeletingId}
                />
            ))}

            {/* ── MODAL FORMULARIO ── */}
            {isModalOpen && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: 560 }}>
                        <ModalHeader>
                            <h2>{editingItem ? "Editar Estatus" : "Nuevo Estatus"}</h2>
                            <ActionBtn $variant="close" onClick={handleCloseModal} disabled={isSaving}>
                                <FiX />
                            </ActionBtn>
                        </ModalHeader>

                        {apiError && (
                            <ApiError><FiAlertCircle /> {apiError}</ApiError>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <label>Descripción del Estado</label>
                                <input
                                    {...register("std_descripcion")}
                                    placeholder="Ej: Orden Confirmada"
                                    disabled={isSaving}
                                />
                                {errors.std_descripcion && (
                                    <ErrorText><FiAlertCircle /> {errors.std_descripcion.message}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGrid>
                                <FormGroup>
                                    <label>Tipo de Estado</label>
                                    <select {...register("stp_tipo_estado")} disabled={isSaving}>
                                        <option value="">Seleccionar tipo...</option>
                                        <option value="ACTIVO">✅ ACTIVO</option>
                                        <option value="INACTIVO">🔴 INACTIVO</option>
                                        <option value="PENDIENTE">🟡 PENDIENTE</option>
                                        <option value="PROCESO">🔵 EN PROCESO</option>
                                        <option value="CANCELADO">🟣 CANCELADO</option>
                                        <option value="CERRADO">⚫ CERRADO</option>
                                    </select>
                                    {errors.stp_tipo_estado && (
                                        <ErrorText><FiAlertCircle /> {errors.stp_tipo_estado.message}</ErrorText>
                                    )}
                                </FormGroup>

                                <FormGroup>
                                    <label>Módulo del Sistema</label>
                                    <select {...register("mdl_id")} disabled={isSaving}>
                                        <option value="">Seleccionar módulo...</option>
                                        {MODULOS.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.mdl_id && (
                                        <ErrorText><FiAlertCircle /> {errors.mdl_id.message}</ErrorText>
                                    )}
                                </FormGroup>
                            </FormGrid>

                            <div style={{
                                background: "rgba(252,163,17,0.06)",
                                border: "1px solid rgba(252,163,17,0.2)",
                                borderRadius: 12, padding: "10px 14px",
                                fontSize: "0.82rem", marginBottom: 8, opacity: 0.85,
                            }}>
                                💡 El <strong>Tipo de Estado</strong> define el comportamiento visual y lógico del estado
                                en toda la plataforma. Usa <strong>ACTIVO</strong> para estados operativos.
                            </div>

                            <SubmitBtn type="submit" disabled={isSaving}>
                                {isSaving
                                    ? <BeatLoader color="#000" size={8} />
                                    : <><FiCheckCircle /> {editingItem ? "Guardar Cambios" : "Crear Estatus"}</>
                                }
                            </SubmitBtn>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Estatus;
