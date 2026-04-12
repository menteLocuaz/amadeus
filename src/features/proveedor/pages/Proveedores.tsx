import React, { useState, useMemo } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUsers, FiRefreshCw } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import Swal from "sweetalert2";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, HeaderTitle, Toolbar, SearchBox, Button
} from "../../../shared/components/UI";

// Hooks & Components
import {
    useProveedoresData,
    useCreateProveedor,
    useUpdateProveedor,
    useDeleteProveedor
} from "../hooks/useProveedoresQuery";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { ProveedorModal } from "../components/ProveedorModal";
import { validateProveedor } from "../validations";
import { type Proveedor } from "../services/ProveedorService";

const columnHelper = createColumnHelper<Proveedor>();

const Proveedores: React.FC = () => {
    // 1. Data Fetching
    const { data: items = [], isLoading, isFetching, refetch } = useProveedoresData();
    const { statusList: statuses, fetchCatalogs } = useCatalogStore();

    React.useEffect(() => { fetchCatalogs(); }, [fetchCatalogs]);

    // 2. Mutations
    const createMutation = useCreateProveedor();
    const updateMutation = useUpdateProveedor();
    const deleteMutation = useDeleteProveedor();

    // 3. Local UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Proveedor | null>(null);
    const [form, setForm] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 4. Helpers
    // DESPUÉS — cubre las variantes más comunes de APIs en español/inglés
    const getStatusName = (st: any) =>
        st?.nombre
        || st?.std_descripcion
        || st?.descripcion
        || st?.name
        || st?.label
        || "";

    const getStatusLabel = (p: Proveedor) => {
        // Primero intenta desde el objeto embebido
        const fromObject = getStatusName(p.status);
        if (fromObject) return fromObject;

        // Fallback: buscar en la lista de statuses cargados
        if (statuses.length > 0) {
            const found = statuses.find(
                (s: any) => String(s.id_status) === String(p.id_status)
            );
            const fromList = getStatusName(found);
            if (fromList) return fromList;
        }

        // Último recurso: no mostrar el ID crudo, mostrar algo legible
        return p.id_status ? `Estado ${p.id_status}` : "Sin estado";
    };

    const openCreate = () => {
        setEditing(null);
        const activeStatus = statuses.find((s: any) => getStatusName(s).toLowerCase().includes("activ"));
        setForm({
            razon_social: "",
            nit_rut: "",
            contacto_nombre: "",
            telefono: "",
            direccion: "",
            email: "",
            id_status: activeStatus?.id_status || statuses[0]?.id_status || "",
        });
        setErrors({});
        setOpen(true);
    };

    const openEdit = (p: Proveedor) => {
        setEditing(p);
        setForm({
            razon_social: p.razon_social,
            nit_rut: p.nit_rut,
            contacto_nombre: p.contacto_nombre || "",
            telefono: p.telefono || "",
            direccion: p.direccion || "",
            email: p.email || "",
            id_status: p.id_status,
        });
        setErrors({});
        setOpen(true);
    };

    const handleSave = async () => {
        const val = validateProveedor(form);
        setErrors(val);
        if (Object.keys(val).length > 0) return;

        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id_proveedor, payload: form });
            } else {
                await createMutation.mutateAsync(form);
            }
            setOpen(false);
        } catch (err) {
            // Error handled in mutation hook
        }
    };

    const confirmDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Eliminar proveedor?',
            text: "Esta accion no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#FCA311',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteMutation.mutateAsync(id);
        }
    };

    // 5. TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor("razon_social", {
            header: "Proveedor",
            cell: info => (
                <div>
                    <div style={{ fontWeight: 700 }}>{info.getValue()}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>{info.row.original.email || "Sin email"}</div>
                </div>
            )
        }),
        columnHelper.accessor("nit_rut", {
            header: "NIT / RUT",
            cell: info => <Badge>{info.getValue()}</Badge>
        }),
        columnHelper.display({
            id: "contacto",
            header: "Contacto",
            cell: info => (
                <div style={{ fontSize: "0.9rem" }}>
                    <div>{info.row.original.contacto_nombre || "-"}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{info.row.original.telefono || "Sin teléfono"}</div>
                </div>
            )
        }),
        columnHelper.display({
            id: "estado",
            header: "Estado",
            cell: info => {
                const label = getStatusLabel(info.row.original);
                const lower = label.toLowerCase();
                const color = lower.includes("activ")
                    ? "#22C55E"
                    : lower.includes("inactiv") || lower.includes("bloq")
                        ? "#EF4444"
                        : "#888780";
                return <Badge $color={color}>{label}</Badge>;
            }
        }),
        columnHelper.display({
            id: "acciones",
            header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
            cell: info => (
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <ActionBtn onClick={() => openEdit(info.row.original)} title="Editar">
                        <FiEdit />
                    </ActionBtn>
                    <ActionBtn
                        $variant="delete"
                        onClick={() => confirmDelete(info.row.original.id_proveedor)}
                        title="Eliminar"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === info.row.original.id_proveedor ? (
                            <ClimbingBoxLoader color="#EF4444" size={5} />
                        ) : (
                            <FiTrash2 />
                        )}
                    </ActionBtn>
                </div>
            )
        })
    ], [statuses]);

    const table = useReactTable({
        data: items,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 }
        }
    });

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiUsers color="#FCA311" /> Proveedores</h1>
                    <p>Administracion y contacto de proveedores</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Nombre, RUC o email..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={() => refetch()} title="Actualizar">
                        <FiRefreshCw className={isFetching ? "spin" : ""} />
                    </ActionBtn>
                    <Button onClick={openCreate}>
                        <FiPlus /> Nuevo Proveedor
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p style={{ opacity: 0.5 }}>Cargando proveedores...</p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
                                            No se encontraron proveedores
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    Siguiente
                                </Button>
                            </div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                                Pagina {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                        </div>
                    </>
                )}
            </TableCard>

            <ProveedorModal
                open={open}
                editing={editing}
                form={form}
                setForm={setForm}
                errors={errors}
                statuses={statuses}
                saving={createMutation.isPending || updateMutation.isPending}
                onClose={() => setOpen(false)}
                onSave={handleSave}
                getStatusName={getStatusName}
            />
        </PageContainer>
    );
};

export default Proveedores;