import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUsers } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";
import { Button } from "../../../shared/components/UI/atoms";

// Custom Hook & Components
import { useProveedores } from "../hooks/useProveedores";
import { ProveedorModal } from "../components/ProveedorModal";
import { type ProveedorCreateRequest } from "../services/ProveedorService";

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

/* -------------------- Main Page -------------------- */
const Proveedores = () => {
    const {
        items, loading, saving, deletingId,
        query, setQuery,
        open, editing, form, setForm, errors,
        statuses, sucursales, empresas,
        openCreate, openEdit, handleClose, handleSave, handleDelete,
        getStatusName, getStatusLabel
    } = useProveedores();

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiUsers color="#FCA311" /> Proveedores</h1>
                    <p>Administración y contacto de proveedores</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
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
            </PageHeader>

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
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            ) : (
                                items.map((p) => (
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
                                            <Badge $color={getStatusLabel(p).toLowerCase().includes('activ') ? '#22C55E' : '#EF4444'}>
                                                {getStatusLabel(p)}
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

            <ProveedorModal
                open={open}
                editing={editing}
                form={form}
                setForm={setForm}
                errors={errors}
                statuses={statuses}
                sucursales={sucursales}
                empresas={empresas}
                saving={saving}
                onClose={handleClose}
                onSave={() => handleSave(validateProveedor)}
                getStatusName={getStatusName}
            />
        </PageContainer>
    );
};

export default Proveedores;