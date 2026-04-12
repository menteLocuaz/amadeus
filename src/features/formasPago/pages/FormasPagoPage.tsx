import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "styled-components";
import styled from "styled-components";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { ClimbingBoxLoader } from "react-spinners";

import { useFormasPago } from "../hooks/useFormasPago";
import { FormasPagoModal } from "../components/FormasPagoModal";
import { type FormaPago, type FormaPagoPayload } from "../services/FormasPagoService";
import { useCatalogStore, selectStatusMap } from "../../../shared/store/useCatalogStore";

import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  Badge,
  PageHeader,
  HeaderTitle,
  Toolbar,
  SearchBox,
  Button,
} from "../../../shared/components/UI";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<FormaPago>();

// ─── Component ────────────────────────────────────────────────────────────────

const FormasPagoPage: React.FC = () => {
  const theme = useTheme();
  const statusMap = useCatalogStore(selectStatusMap);
  const { statusList, isInitialized, fetchCatalogs } = useCatalogStore();

  useEffect(() => {
    if (!isInitialized) fetchCatalogs();
  }, [isInitialized, fetchCatalogs]);

  const {
    formasPago,
    isLoading,
    isError,
    isMutating,
    refresh,
    createFormaPago,
    updateFormaPago,
    deleteFormaPago,
  } = useFormasPago();

  // UI state
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FormaPago | null>(null);

  // Estatus generales: todos los disponibles en el catálogo
  const statuses = useMemo(() => statusList, [statusList]);

  // Handlers
  const handleCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleEdit = (forma: FormaPago) => {
    setEditing(forma);
    setIsModalOpen(true);
  };

  const handleSave = async (data: FormaPagoPayload) => {
    try {
      if (editing) {
        await updateFormaPago({ id: editing.id_forma_pago, payload: data });
      } else {
        await createFormaPago(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar forma de pago:", error);
    }
  };

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Nombre",
        cell: (info) => (
          <DescCell>
            <strong>{info.getValue()}</strong>
          </DescCell>
        ),
      }),
      columnHelper.accessor("requiere_ref", {
        header: "Requiere Ref.",
        cell: (info) => {
          const val = info.getValue();
          return (
            <Badge
              $color={val ? `${theme.primary}22` : `${theme.bg3}22`}
              style={{ color: val ? theme.primary : theme.texttertiary }}
            >
              {val ? "Sí" : "No"}
            </Badge>
          );
        },
        size: 110,
      }),
      columnHelper.accessor("id_status", {
        header: "Estado",
        cell: (info) => {
          const name = statusMap[info.getValue()] ?? "—";
          const isInactive =
            name.toUpperCase().includes("INACTIVO") ||
            name.toUpperCase().includes("CANCELADO");
          return (
            <Badge
              $color={isInactive ? `${theme.danger}22` : `${theme.success}22`}
              style={{ color: isInactive ? theme.danger : theme.success }}
            >
              {name}
            </Badge>
          );
        },
        size: 120,
      }),
      columnHelper.accessor("id_forma_pago", {
        header: "ID",
        cell: (info) => (
          <IdCell title={info.getValue()}>{info.getValue().slice(0, 8)}…</IdCell>
        ),
        size: 110,
      }),
      columnHelper.display({
        id: "acciones",
        header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
        cell: (info) => (
          <ActionsCell>
            <ActionBtn onClick={() => handleEdit(info.row.original)} title="Editar">
              <FiEdit2 />
            </ActionBtn>
            <ActionBtn
              $variant="delete"
              onClick={() => deleteFormaPago(info.row.original.id_forma_pago)}
              title="Eliminar"
            >
              <FiTrash2 />
            </ActionBtn>
          </ActionsCell>
        ),
        size: 100,
      }),
    ],
    [theme, statusMap]
  );

  const table = useReactTable({
    data: formasPago,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <PageContainer>
      {/* ── Header ── */}
      <PageHeader>
        <HeaderTitle>
          <h1>
            <MdPayment color={theme.primary} /> Formas de Pago
          </h1>
          <p>Gestión de métodos de cobro: efectivo, tarjeta, transferencia y más.</p>
        </HeaderTitle>
        <Toolbar>
          <SearchBox>
            <FiSearch />
            <input
              placeholder="Buscar por código o descripción…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </SearchBox>
          <ActionBtn onClick={() => refresh()} title="Actualizar lista">
            <FiRefreshCw />
          </ActionBtn>
          <Button onClick={handleCreate}>
            <FiPlus /> Nueva Forma de Pago
          </Button>
        </Toolbar>
      </PageHeader>

      {/* ── Table ── */}
      <TableCard>
        {isLoading ? (
          <LoadingState>
            <ClimbingBoxLoader color={theme.primary} size={12} />
            <p>Cargando formas de pago…</p>
          </LoadingState>
        ) : isError ? (
          <ErrorState>
            <ErrorBubble>!</ErrorBubble>
            <p>No se pudo conectar con el servidor.</p>
            <Button $variant="ghost" onClick={() => refresh()}>
              Reintentar
            </Button>
          </ErrorState>
        ) : (
          <Table>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} style={{ width: h.column.columnDef.size }}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: 60, opacity: 0.45 }}>
                    {globalFilter
                      ? `Sin resultados para "${globalFilter}"`
                      : "No hay formas de pago registradas. Crea la primera."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        {/* Footer count */}
        {!isLoading && !isError && (
          <TableFooter>
            <FooterNote>
              Los IDs de cada forma de pago se usan al registrar facturas en{" "}
              <code>/api/v1/facturas/completa</code>.
            </FooterNote>
            <CountBadge>
              {table.getFilteredRowModel().rows.length} de {formasPago.length}
            </CountBadge>
          </TableFooter>
        )}
      </TableCard>

      {/* ── Modal ── */}
      <FormasPagoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editing={editing}
        statuses={statuses}
        isSaving={isMutating}
      />
    </PageContainer>
  );
};

// ─── Styled ───────────────────────────────────────────────────────────────────

const DescCell = styled.div`
  strong {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.textprimary};
  }
`;

const IdCell = styled.span`
  font-size: 0.72rem;
  font-family: "SF Mono", "Fira Code", monospace;
  color: ${({ theme }) => theme.texttertiary};
  letter-spacing: 0.02em;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  p {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.texttertiary};
    margin: 0;
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 24px;
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.danger};
    margin: 0;
  }
`;

const ErrorBubble = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
`;

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid rgba(150, 150, 150, 0.1);
`;

const FooterNote = styled.p`
  font-size: 0.73rem;
  color: ${({ theme }) => theme.texttertiary};
  margin: 0;
  opacity: 0.7;

  code {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 0.7rem;
    background: rgba(150, 150, 150, 0.1);
    padding: 1px 5px;
    border-radius: 4px;
  }
`;

const CountBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${({ theme }) => theme.texttertiary};
  background: rgba(150, 150, 150, 0.08);
  border: 1px solid rgba(150, 150, 150, 0.12);
  border-radius: 20px;
  padding: 3px 10px;
  white-space: nowrap;
`;

export default FormasPagoPage;
