import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUsers, FiRefreshCw, FiPhone, FiMail } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// Hooks & Services
import { useClientes } from "../hooks/useClientes";
import { ClienteModal } from "../components/ClienteModal";
import { type Cliente } from "../services/ClienteService";

// UI Components
import {
  PageContainer, TableCard, Table, ActionBtn, Badge,
  PageHeader, HeaderTitle, Toolbar, SearchBox, Button
} from "../../../shared/components/UI";
import { selectStatusMap, useCatalogStore } from "../../../shared/store/useCatalogStore";

const columnHelper = createColumnHelper<Cliente>();

const Clientes: React.FC = () => {
  const theme = useTheme();
  const statusMap = useCatalogStore(selectStatusMap);
  
  // 1. Data Fetching
  const { 
    clientes, clienteStatuses, isLoading, isMutating, 
    refresh, createCliente, updateCliente, deleteCliente 
  } = useClientes();

  // 2. UI State
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // 3. Handlers
  const handleEdit = (c: Cliente) => {
    setEditingCliente(c);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Cliente) => {
    try {
      if (editingCliente?.id_cliente) {
        await updateCliente({ id: editingCliente.id_cliente, payload: data });
      } else {
        await createCliente(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving cliente:", error);
    }
  };

  // 4. Columns
  const columns = useMemo(() => [
    columnHelper.accessor("nombre_completo", {
      header: "Cliente",
      cell: info => (
        <strong style={{ color: theme.text }}>{info.getValue()}</strong>
      )
    }),
    columnHelper.display({
      id: "documento",
      header: "Documento",
      cell: info => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{info.row.original.documento}</span>
          <small style={{ opacity: 0.5, fontSize: '0.75rem' }}>{info.row.original.tipo_documento}</small>
        </div>
      )
    }),
    columnHelper.accessor("email", {
      header: "Contacto",
      cell: info => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <FiMail size={12} color={theme.primary} /> {info.getValue()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <FiPhone size={12} color={theme.primary} /> {info.row.original.telefono}
          </div>
        </div>
      )
    }),
    columnHelper.accessor("id_status", {
      header: "Estado",
      cell: info => {
        const name = statusMap[info.getValue()] || "ACTIVO";
        const isInactive = name.toUpperCase().includes("INACTIVO") || name.toUpperCase().includes("CANCELADO");
        return (
          <Badge $color={isInactive ? `${theme.danger}22` : `${theme.success}22`} style={{ color: isInactive ? theme.danger : theme.success }}>
            {name}
          </Badge>
        );
      }
    }),
    columnHelper.display({
      id: "acciones",
      header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
      cell: info => (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <ActionBtn onClick={() => handleEdit(info.row.original)} title="Editar">
            <FiEdit2 />
          </ActionBtn>
          <ActionBtn 
            $variant="delete" 
            onClick={() => deleteCliente(info.row.original.id_cliente!)} 
            title="Eliminar"
          >
            <FiTrash2 />
          </ActionBtn>
        </div>
      )
    })
  ], [theme, statusMap]);

  // 5. Table Instance
  const table = useReactTable({
    data: clientes,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>
          <h1><FiUsers color={theme.primary} /> Cartera de Clientes</h1>
          <p>Gestión centralizada de clientes y cuentas</p>
        </HeaderTitle>
        <Toolbar>
          <SearchBox>
            <FiSearch />
            <input
              placeholder="Buscar cliente..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </SearchBox>
          <ActionBtn onClick={() => refresh()} title="Actualizar">
            <FiRefreshCw />
          </ActionBtn>
          <Button onClick={handleCreate}>
            <FiPlus /> Nuevo Cliente
          </Button>
        </Toolbar>
      </PageHeader>

      <TableCard>
        {isLoading ? (
          <div style={{ padding: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <ClimbingBoxLoader color={theme.primary} />
            <p style={{ opacity: 0.5 }}>Sincronizando clientes...</p>
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
                      No se encontraron clientes registrados.
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
            
            <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(150,150,150,0.1)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button $variant="ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  Anterior
                </Button>
                <Button $variant="ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Siguiente
                </Button>
              </div>
              <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
            </div>
          </>
        )}
      </TableCard>

      <ClienteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCliente={editingCliente}
        statuses={clienteStatuses}
        isSaving={isMutating}
      />
    </PageContainer>
  );
};

export default Clientes;
