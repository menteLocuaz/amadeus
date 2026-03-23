import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiSearch, FiTag } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import { ProductService, type Product } from "../../products/services/ProductService";
import {
  ProductGrid, ProductCard, ProductImage
} from "../../../shared/components/UI";
import CartSidebar from "../components/CartSidebar";

const PosContainer = styled.div`
  display: flex;
  height: calc(100vh - 40px); /* Adjusts for App.tsx padding */
  gap: 24px;
  padding: 0 28px;
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
  padding: 28px 0;
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
  height: 100%;
`;

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const cart = useCart();

  // Load products
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter products based on debounced query
  useEffect(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) { setFiltered(products); return; }
    setFiltered(products.filter(p => 
      (p.nombre || "").toLowerCase().includes(q) || 
      String(p.id_producto || p.id).includes(q)
    ));
  }, [debouncedQuery, products]);

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
                <ProductCard key={p.id_producto || p.id} onClick={() => cart.add(p)}>
                  <ProductImage src={p.imagen || "https://placehold.co/100"} alt={p.nombre} />
                  <div className="name">{p.nombre}</div>
                  <div className="price">
                    {p.moneda?.nombre ?? "$"} - {(p.precio_venta ?? 0).toFixed(2)}
                  </div>
                </ProductCard>
              ))}
            </ProductGrid>
          )}
        </ContentScroll>
      </LeftSide>

      <RightSide>
        <CartSidebar cart={cart} onClear={onClear} />
      </RightSide>
    </PosContainer>
  );
};

export default PosPage;