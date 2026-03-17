import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiSave, FiX, FiUsers } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    FormGroup, ModalOverlay, ModalContent
} from "../../../shared/components/UI";
import { Button, Divider } from "../../../shared/components/UI/atoms";

// Services
import {
    ProveedorService,
    type Proveedor,
    type ProveedorCreateRequest
} from "../services/ProveedorService";
import { EstatusService, type Estatus } from "../../auth/services/EstatusService";
import { SucursalService, type Sucursal } from "../services/SucursalService";
import { EmpresaService, type Empresa } from "../services/EmpresaService";

/* -------------------- Styled Extra -------------------- */
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    margin: 4px 0 0 0;
    opacity: 0.6;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bg2};
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  width: 300px;

  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    outline: none;
    width: 100%;
    font-size: 0.9rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
  }
`;

const GridForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

/* -------------------- Validations -------------------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function validateProveedor(payload: Partial<ProveedorCreateRequest>) {
    const errors: Record<string, string> = {};

    const nombre = (payload.nombre || "").trim();
    if (!nombre) errors.nombre = "Nombre es requerido";
    else if (nombre.length < 3) errors.nombre = "Nombre mínimo 3 caracteres";

    const ruc = (payload.ruc || "").trim();
    if (!ruc) errors.ruc = "RUC es requerido";

    const email = (payload.email || "").trim();
    if (email && !emailRegex.test(email)) errors.email = "Email inválido";

    if (!payload.id_status) errors.id_status = "Selecciona estado";
    if (!payload.id_sucursal) errors.id_sucursal = "Selecciona sucursal";
    if (!payload.id_empresa) errors.id_empresa = "Selecciona empresa";

    return errors;
}

/* -------------------- Component -------------------- */
const Proveedores: React.FC = () => {
    const [items, setItems] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Proveedor | null>(null);
    const [form, setForm] = useState<Partial<ProveedorCreateRequest>>({
        nombre: "",
        ruc: "",
        telefono: "",
        direccion: "",
        email: "",
        id_status: "",
        id_sucursal: "",
        id_empresa: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [statuses, setStatuses] = useState<Estatus[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [resProv, resStat, resSuc, resEmp] = await Promise.all([
                ProveedorService.getAll(),
                EstatusService.getByModulo(2), // Supongamos que modulo 2 es proveedores
                SucursalService.getAll(),
                EmpresaService.getAll(),
            ]);
            setItems(resProv.data || []);
            setStatuses(resStat || []);
            setSucursales(resSuc || []);
            setEmpresas(resEmp || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (p) =>
                (p.nombre || "").toLowerCase().includes(q) ||
                (p.ruc || "").toLowerCase().includes(q) ||
                (p.email || "").toLowerCase().includes(q)
        );
    }, [items, query]);

    const openCreate = () => {
        setEditing(null);
        setForm({
            nombre: "",
            ruc: "",
            telefono: "",
            direccion: "",
            email: "",
            id_status: statuses[0]?.id_status || "",
            id_sucursal: sucursales[0]?.id || "",
            id_empresa: empresas[0]?.id || "",
        });
        setErrors({});
        setOpen(true);
    };

    const openEdit = (p: Proveedor) => {
        setEditing(p);
        setForm({
            nombre: p.nombre,
            ruc: p.ruc,
            telefono: p.telefono || "",
            direccion: p.direccion || "",
            email: p.email || "",
            id_status: p.id_status,
            id_sucursal: p.id_sucursal,
            id_empresa: p.id_empresa,
        });
        setErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditing(null);
        setForm({});
        setErrors({});
    };

    const handleSave = async () => {
        const val = validateProveedor(form);
        setErrors(val);
        if (Object.keys(val).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await ProveedorService.update(editing.id, form as any);
            } else {
                await ProveedorService.create(form as any);
            }
            await loadAll(); // Recargar datos frescos
            handleClose();
        } catch (err) {
            console.error(err);
            alert("Error guardando proveedor");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar proveedor?")) return;
        setDeletingId(id);
        try {
            await ProveedorService.delete(id);
            setItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error eliminando proveedor");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <PageContainer>
            <Header>
                <HeaderTitle>
                    <h1><FiUsers color="#FCA311" /> Proveedores</h1>
                    <p>Administración y contacto de proveedores</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch opacity={0.5} />
                        <input
                            placeholder="Nombre, RUC o email..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </SearchBox>
                    <Button onClick={openCreate}>
                        <FiPlus /> Nuevo Proveedor
                    </Button>
                </Toolbar>
            </Header>

            <TableCard>
                {loading ? (
                    <div style={{ padding: 100, display: "flex", justifyContent: "center" }}>
                        <ClimbingBoxLoader color="#FCA311" />
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>RUC</th>
                                <th>Contacto</th>
                                <th>Sucursal / Empresa</th>
                                <th>Estado</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                                            <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>{p.email || "Sin email"}</div>
                                        </td>
                                        <td><Badge>{p.ruc}</Badge></td>
                                        <td>
                                            <div>{p.telefono || "-"}</div>
                                            <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{p.direccion || "Sin dirección"}</div>
                                        </td>
                                        <td>
                                            <div>{p.sucursal?.nombre || "N/A"}</div>
                                            <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{p.empresa?.nombre || "N/A"}</div>
                                        </td>
                                        <td>
                                            <Badge $color={p.status?.nombre === 'Activo' ? '#22C55E' : '#EF4444'}>
                                                {p.status?.nombre || p.id_status}
                                            </Badge>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <ActionBtn onClick={() => openEdit(p)} title="Editar">
                                                    <FiEdit />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $variant="delete"
                                                    onClick={() => handleDelete(p.id)}
                                                    title="Eliminar"
                                                    disabled={deletingId === p.id}
                                                >
                                                    {deletingId === p.id ? (
                                                        <ClimbingBoxLoader color="#EF4444" size={5} />
                                                    ) : (
                                                        <FiTrash2 />
                                                    )}
                                                </ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </TableCard>

            {/* Modal */}
            {open && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            <h2>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
                            <ActionBtn $variant="close" onClick={handleClose}><FiX /></ActionBtn>
                        </ModalHeader>

                        <GridForm>
                            <FormGroup style={{ gridColumn: "1 / 3" }}>
                                <label>Nombre del Proveedor</label>
                                <input
                                    value={form.nombre ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, nombre: e.target.value }))}
                                    placeholder="Ej: Distribuciones ACME"
                                />
                                {errors.nombre && <small style={{ color: "#EF4444" }}>{errors.nombre}</small>}
                            </FormGroup>

                            <FormGroup>
                                <label>RUC / Documento</label>
                                <input
                                    value={form.ruc ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, ruc: e.target.value }))}
                                    placeholder="203040..."
                                />
                                {errors.ruc && <small style={{ color: "#EF4444" }}>{errors.ruc}</small>}
                            </FormGroup>

                            <FormGroup>
                                <label>Teléfono</label>
                                <input
                                    value={form.telefono ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, telefono: e.target.value }))}
                                    placeholder="999..."
                                />
                            </FormGroup>

                            <FormGroup style={{ gridColumn: "1 / 3" }}>
                                <label>Dirección Fiscal</label>
                                <input
                                    value={form.direccion ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, direccion: e.target.value }))}
                                    placeholder="Av. Principal 123..."
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Email de Contacto</label>
                                <input
                                    type="email"
                                    value={form.email ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                                    placeholder="proveedor@empresa.com"
                                />
                                {errors.email && <small style={{ color: "#EF4444" }}>{errors.email}</small>}
                            </FormGroup>

                            <FormGroup>
                                <label>Estado</label>
                                <select
                                    value={form.id_status ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, id_status: e.target.value }))}
                                >
                                    <option value="">Seleccione Estado</option>
                                    {statuses.map(st => (
                                        <option key={st.id_status} value={st.id_status}>{st.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_status && <small style={{ color: "#EF4444" }}>{errors.id_status}</small>}
                            </FormGroup>

                            <FormGroup>
                                <label>Sucursal</label>
                                <select
                                    value={form.id_sucursal ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, id_sucursal: e.target.value }))}
                                >
                                    <option value="">Seleccione Sucursal</option>
                                    {sucursales.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_sucursal && <small style={{ color: "#EF4444" }}>{errors.id_sucursal}</small>}
                            </FormGroup>

                            <FormGroup>
                                <label>Empresa</label>
                                <select
                                    value={form.id_empresa ?? ""}
                                    onChange={(e) => setForm(s => ({ ...s, id_empresa: e.target.value }))}
                                >
                                    <option value="">Seleccione Empresa</option>
                                    {empresas.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_empresa && <small style={{ color: "#EF4444" }}>{errors.id_empresa}</small>}
                            </FormGroup>
                        </GridForm>

                        <Divider />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                            <Button $variant="secondary" onClick={handleClose}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <ClimbingBoxLoader color="#000" size={8} />
                                ) : (
                                    <><FiSave /> {editing ? "Actualizar" : "Guardar Proveedor"}</>
                                )}
                            </Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Proveedores;