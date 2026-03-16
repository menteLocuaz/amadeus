import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiMinus, FiTrash2, FiSearch, FiCornerUpLeft, FiTag } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import { ProductService, type Product } from "../../products/services/ProductService";
import {
  ProductGrid, ProductCard, ProductImage, Card,
  CartItemRow, QtyControls, Button, IconButton, Divider, Input
} from "../../../shared/components/UI/atoms";

const PosContainer = styled.div`
  display: flex;
  height: calc(100vh - 40px);
  gap: 24px;
  padding: 28px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
`;

const LeftSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
`;

const ContentScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => theme.bg3}; 
    border-radius: 10px; 
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  width: 320px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);

  input {
    border: none;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    width: 100%;
    font-size: 0.95rem;
  }
`;

const RightSide = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const cart = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ProductService.getAll();
        const list = (res.data || []).map((p: any) => ({
          ...p,
          id_producto: p.id_producto || p.id,
        }));
        setProducts(list);
        setFiltered(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered(products); return; }
    setFiltered(products.filter(p => 
      (p.nombre || "").toLowerCase().includes(q) || 
      String(p.id_producto || p.id).includes(q)
    ));
  }, [query, products]);

  const onClear = () => {
    if (cart.items.length > 0 && window.confirm("¿Limpiar carrito?")) cart.clear();
  };

  return (
    <PosContainer>
      <LeftSide>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
              <FiTag color="#FCA311" /> Ventas
            </h1>
            <p style={{ margin: "4px 0 0 0", opacity: 0.6, fontSize: "0.95rem" }}>
              Punto de venta y facturación
            </p>
          </div>
          <SearchBox>
            <FiSearch color="#FCA311" size={20} />
            <input 
              placeholder="Buscar producto o código..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </SearchBox>
        </div>

        <ContentScroll>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>
              <ClimbingBoxLoader color="#FCA311" />
            </div>
          ) : (
            <ProductGrid>
              {filtered.map((p) => (
                <ProductCard key={p.id_producto} onClick={() => cart.add(p)}>
                  <ProductImage src={p.imagen || "https://placehold.co/100"} alt={p.nombre} />
                  <div className="name">{p.nombre}</div>
                  <div className="price">
                    {p.moneda?.nombre ?? "$"} {(p.precio_venta ?? 0).toFixed(2)}
                  </div>
                </ProductCard>
              ))}
            </ProductGrid>
          )}
        </ContentScroll>
      </LeftSide>

      <RightSide>
        <Card style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Orden Actual</h2>
            <IconButton onClick={onClear} title="Limpiar Carrito">
              <FiCornerUpLeft />
            </IconButton>
          </div>
          
          <Divider />

          <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, margin: "10px 0" }}>
            {cart.items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", opacity: 0.5, fontWeight: 600 }}>Carrito vacío</div>
            ) : (
              cart.items.map((it) => {
                const pid = String(it.product.id_producto ?? (it.product as any).id);
                return (
                  <CartItemRow key={pid} style={{ marginBottom: 12 }}>
                    <div className="meta">
                      <div className="name">{it.product.nombre}</div>
                      <div className="muted">
                        {it.product.moneda?.nombre ?? "$"} {(it.product.precio_venta ?? 0)} x {it.qty}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, marginBottom: 8 }}>
                        {(Number(it.product.precio_venta ?? 0) * it.qty).toFixed(2)}
                      </div>
                      <QtyControls>
                        <IconButton 
                          onClick={() => cart.changeQty(pid, it.qty - 1)} 
                          style={{ width: 28, height: 28, minWidth: 28 }}
                        >
                           {it.qty === 1 ? <FiTrash2 size={13} color="#ff4d4d" /> : <FiMinus size={13} />}
                        </IconButton>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, width: 24, textAlign: "center" }}>
                          {it.qty}
                        </span>
                        <IconButton 
                          onClick={() => cart.changeQty(pid, it.qty + 1)} 
                          style={{ width: 28, height: 28, minWidth: 28 }}
                        >
                           <FiPlus size={13} />
                        </IconButton>
                      </QtyControls>
                    </div>
                  </CartItemRow>
                );
              })
            )}
          </div>

          <div style={{ background: "rgba(0,0,0,0.03)", padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: 8 }}>
                Nota de pedido
              </label>
              <Input 
                placeholder="Ej: Sin cebolla..." 
                value={cart.note} 
                onChange={(e) => cart.setNote(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.95rem" }}>
              <span style={{ opacity: 0.7, fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{cart.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: "0.95rem" }}>
              <span style={{ opacity: 0.7, fontWeight: 600 }}>Impuestos (19.0%)</span>
              <span style={{ fontWeight: 700 }}>{cart.tax.toFixed(2)}</span>
            </div>
            
            <Divider />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.4rem", fontWeight: 900, margin: "16px 0 24px 0" }}>
              <span>Total</span>
              <span style={{ color: "#FCA311" }}>${cart.total.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button $variant="secondary" onClick={onClear} style={{ color: "#EF4444", flex: 1, padding: "14px 0" }}>
                Cancelar
              </Button>
              <Button $variant="primary" onClick={() => alert("Procesando...")} style={{ flex: 1, padding: "14px 0", fontSize: "1.05rem" }}>
                Cobrar
              </Button>
            </div>
          </div>
        </Card>
      </RightSide>
    </PosContainer>
  );
};

export default PosPage;