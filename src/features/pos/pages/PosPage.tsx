import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiMinus, FiTrash2, FiSearch, FiCornerUpLeft, FiTag } from "react-icons/fi";
import { v } from "../../../core/styles/Variables";
import { useCart } from "../hooks/useCart";
import { ProductService, type Product } from "../../products/services/ProductService";
import {
  ProductGrid, ProductCard, ProductImage, Card,
  CartItemRow, QtyControls, Button, IconButton, Divider, Input, Tag
} from "../../../shared/components/UI/atoms";

/* ---------- Contenedor Principal (Grid 5x5) ---------- */
const ParentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: ${v.smSpacing};
  height: calc(100vh - 100px);
  padding: ${v.mdSpacing};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

/* div8: Barra Superior (Búsqueda y Categorías) */
const TopSection = styled.div`
  grid-column: span 4 / span 4;
  grid-column-start: 1;
  grid-row-start: 1;
  display: flex;
  align-items: center;
  gap: ${v.mdSpacing};
  background: ${({ theme }) => theme.bg2};
  padding: 0 ${v.mdSpacing};
  border-radius: ${v.borderRadius};
`;

/* div7: Grid de Productos */
const MainContent = styled.div`
  grid-column: span 4 / span 4;
  grid-row: span 4 / span 4;
  grid-column-start: 1;
  grid-row-start: 2;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => theme.barrascroll}; 
    border-radius: 10px; 
  }
`;

/* div6: Panel Lateral del Carrito */
const SidebarCart = styled.div`
  grid-row: span 5 / span 5;
  grid-column-start: 5;
  grid-row-start: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

/* Estilos adicionales para el buscador */
/* fontButton viene del theme (Light/Dark). Usamos fallback por seguridad */
const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.bg};
  padding: 8px 12px;
  border-radius: ${v.borderRadius};
  border: 1px solid ${({ theme }) => theme.bg3}33;

  input {
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    width: 100%;
    font-size: ${({ theme }) => theme.fontButton ?? "0.875em"};
  }
  svg { color: ${({ theme }) => theme.primary}; }
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
    <ParentGrid>
      {/* div8: TOP BAR */}
      <TopSection>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiTag color="#FCA311" size={20} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Ventas</h3>
        </div>
        <SearchBox>
          <FiSearch />
          <input 
            placeholder="Buscar por nombre o código..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </SearchBox>
      </TopSection>

      {/* div7: PRODUCT GRID */}
      <MainContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
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
      </MainContent>

      {/* div6: CART SIDEBAR */}
      <SidebarCart>
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: v.mdSpacing }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Orden Actual</div>
            <IconButton onClick={onClear} title="Limpiar Carrito">
              <FiCornerUpLeft />
            </IconButton>
          </div>
          
          <Divider />

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: v.mdSpacing }}>
            {cart.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Carrito vacío</div>
            ) : (
              cart.items.map((it) => {
                const pid = String(it.product.id_producto ?? (it.product as any).id);
                return (
                  <CartItemRow key={pid} style={{ marginBottom: '8px' }}>
                    <div className="meta">
                      <div className="name" style={{ fontSize: '0.9rem' }}>{it.product.nombre}</div>
                      <div className="muted" style={{ fontSize: '0.8rem' }}>
                        {it.product.moneda?.nombre} {it.product.precio_venta} x {it.qty}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>
                        {(Number(it.product.precio_venta) * it.qty).toFixed(2)}
                      </div>
                      <QtyControls style={{ marginTop: '4px' }}>
                        <button onClick={() => cart.changeQty(pid, it.qty - 1)}><FiMinus /></button>
                        <span>{it.qty}</span>
                        <button onClick={() => cart.changeQty(pid, it.qty + 1)}><FiPlus /></button>
                      </QtyControls>
                    </div>
                  </CartItemRow>
                );
              })
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.05)', padding: v.mdSpacing, borderRadius: v.borderRadius }}>
            <div style={{ marginBottom: v.smSpacing }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Nota de pedido</label>
              <Input 
                placeholder="Ej: Sin cebolla..." 
                value={cart.note} 
                onChange={(e) => cart.setNote(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Subtotal</span>
              <span>{cart.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: 0.7 }}>
              <span>Impuestos (19.0%)</span>
              <span>{cart.tax.toFixed(2)}</span>
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, margin: '10px 0' }}>
              <span>Total</span>
              <span style={{ color: '#FCA311' }}>{cart.total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button $variant="secondary" onClick={onClear} style={{ background: '#EF444422', color: '#EF4444' }}>
                Cancelar
              </Button>
              <Button $variant="primary" onClick={() => alert("Procesando...")}>
                Cobrar
              </Button>
            </div>
          </div>
        </Card>
      </SidebarCart>
    </ParentGrid>
  );
};

export default PosPage;