import { FiPlus, FiTrash2, FiShoppingBag, FiSearch, FiPackage } from "react-icons/fi";
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
import { OrderForm } from "../components/CompraModal";

const Compras = () => {
    const {
        items,
        products,
        suppliers,
        isLoading,
        isDeletingId,
        query,
        setQuery,
        openModal,
        openCreate,
        closeModal,
        handleCreate,
        handleDelete
    } = useCompras();

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShoppingBag color="#FCA311" /> Abastecimiento de Inventario</h1>
                    <p>Registra la entrada de productos directamente al stock</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar producto o ID..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </SearchBox>
                    <Button onClick={openCreate}>
                        <FiPlus /> Registrar Entrada
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
                                <th>Producto</th>
                                <th>ID Producto</th>
                                <th style={{ textAlign: "right" }}>Stock Actual</th>
                                <th style={{ textAlign: "right" }}>Precio Compra</th>
                                <th style={{ textAlign: "right" }}>Precio Venta</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No hay registros de inventario
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <FiPackage opacity={0.5} />
                                                <strong>{item.nombre || item.producto?.nombre || "Producto"}</strong>
                                            </div>
                                        </td>
                                        <td><code style={{ fontSize: '0.8rem' }}>{item.id_producto}</code></td>
                                        <td style={{ textAlign: "right" }}>
                                            <Badge $color={item.stock_actual > 10 ? '#22C55E' : '#EF4444'}>
                                                {item.stock_actual}
                                            </Badge>
                                        </td>
                                        <td style={{ textAlign: "right" }}>${item.precio_compra}</td>
                                        <td style={{ textAlign: "right" }}>${item.precio_venta}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <ActionBtn
                                                    $variant="delete"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeletingId === item.id}
                                                >
                                                    {isDeletingId === item.id ? <ClimbingBoxLoader size={5} color="#EF4444" /> : <FiTrash2 />}
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
            {openModal && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: 1000 }}>
                        <OrderForm
                            suppliers={suppliers}
                            products={products}
                            onCancel={closeModal}
                            onSaved={async (data) => { 
                                await handleCreate(data); 
                                closeModal(); 
                            }}
                        />
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Compras;