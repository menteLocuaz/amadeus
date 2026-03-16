import React, { useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage, FiPackage } from "react-icons/fi";
import { useProducts } from "../hooks/useProducts";
import { ProductModal } from "../components/ProductModal";
import { type Product } from "../services/ProductService";

import {
  PageContainer, TableCard, Table, ActionBtn, Badge, Thumbnail
} from "../../../shared/components/UI";

const Productos: React.FC = () => {
  const { 
    products, categories, units, currencies, estatusList, 
    search, setSearch, isLoading, isDeletingId, user, refresh, deleteProduct 
  } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
            <FiPackage /> Productos
          </h1>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "var(--bg)", padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
            <FiSearch color="#FCA311" />
            <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent" }} />
          </div>
          <button onClick={handleCreate} style={{ background: "#FCA311", color: "#000", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
            <FiPlus /> Nuevo
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 100, display: "flex", justifyContent: "center" }}><ClimbingBoxLoader color="#FCA311" /></div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id_producto}>
                  <td>
                    <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                      {p.imagen ? <Thumbnail src={p.imagen} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}><FiImage /></div>}
                      <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: "#22C55E", fontWeight: 700 }}>{p.moneda?.nombre} {p.precio_venta}</td>
                  <td><Badge>{p.stock} {p.unidad?.nombre}</Badge></td>
                  <td>{p.categoria?.nombre}</td>
                  <td style={{ textAlign: "right" }}>
                    <ActionBtn onClick={() => handleEdit(p)}><FiEdit2 /></ActionBtn>
                    <ActionBtn $variant="delete" onClick={() => deleteProduct(p.id_producto!)}>
                      {isDeletingId === p.id_producto ? <ClimbingBoxLoader size={10} color="#ff4d4d" /> : <FiTrash2 />}
                    </ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>
      )}

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        units={units}
        currencies={currencies}
        estatusList={estatusList}
        userIdSucursal={user?.id_sucursal}
        onSuccess={refresh}
      />
    </PageContainer>
  );
};

export default Productos;