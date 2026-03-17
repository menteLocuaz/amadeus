import { FiPlus, FiEdit, FiTrash2, FiDownload, FiShoppingBag, FiSearch } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    ModalOverlay, ModalContent,
    PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";
import { Button } from "../../../shared/components/UI/atoms";

// Hooks & Components
import { useCompras } from "../hooks/useCompras";
import { OrderForm, ReceiveForm } from "../components/CompraModal";
import { formatDate } from "../../../utils/dateUtils";

const Compras = () => {
    const {
        orders,
        products,
        suppliers,
        isLoading,
        isDeletingId,
        query,
        setQuery,
        openOrderModal,
        editingOrder,
        openReceiveModal,
        receivingOrder,
        loadData,
        handleDelete,
        handleReceive,
        openCreateOrder,
        openEditOrder,
        closeOrderModal,
        closeReceiveModal
    } = useCompras();

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShoppingBag color="#FCA311" /> Compras / Abastecimiento</h1>
                    <p>Registra la entrada de mercancia desde proveedores</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar por codigo o proveedor..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </SearchBox>
                    <Button onClick={openCreateOrder}>
                        <FiPlus /> Nueva Orden
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", justifyContent: "center" }}>
                        <ClimbingBoxLoader color="#FCA311" />
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Proveedor</th>
                                <th>Emision</th>
                                <th>Llegada Est.</th>
                                <th>Items</th>
                                <th>Estado</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No hay ordenes registradas
                                    </td>
                                </tr>
                            ) : (
                                orders.map(o => (
                                    <tr key={o.id}>
                                        <td><strong>{o.codigo_orden}</strong></td>
                                        <td>{o.proveedor?.nombre || "N/A"}</td>
                                        <td>{formatDate(o.fecha_emision)}</td>
                                        <td>{formatDate(o.fecha_llegada_estimada)}</td>
                                        <td>{o.items.length}</td>
                                        <td>
                                            <Badge $color={o.status === 'RECEIVED' ? '#22C55E' : o.status === 'PARTIAL' ? '#FCA311' : '#64748B'}>
                                                {o.status}
                                            </Badge>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <ActionBtn onClick={() => openEditOrder(o)} title="Editar">
                                                    <FiEdit />
                                                </ActionBtn>
                                                <ActionBtn onClick={() => handleReceive(o)} title="Recibir Mercancia" disabled={o.status === 'RECEIVED'}>
                                                    <FiDownload />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $variant="delete"
                                                    onClick={() => handleDelete(o.id)}
                                                    disabled={isDeletingId === o.id}
                                                >
                                                    {isDeletingId === o.id ? <ClimbingBoxLoader size={5} color="#EF4444" /> : <FiTrash2 />}
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

            {/* Modals */}
            {openOrderModal && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: 1000 }}>
                        <OrderForm
                            suppliers={suppliers}
                            products={products}
                            initial={editingOrder}
                            onCancel={closeOrderModal}
                            onSaved={() => { closeOrderModal(); loadData(); }}
                        />
                    </ModalContent>
                </ModalOverlay>
            )}

            {openReceiveModal && receivingOrder && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: 800 }}>
                        <ReceiveForm
                            order={receivingOrder}
                            onCancel={closeReceiveModal}
                            onSaved={() => { closeReceiveModal(); loadData(); }}
                        />
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Compras;