import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ProductGrid } from "../components/ProductGrid";
import { CartSidebar } from "../components/CartSidebar";
import { useProductStore } from "../../products/store/useProductStore";

export const PosPage: React.FC = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const [activeCategory, setActiveCategory] = useState("TODOS");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Obtener categorías únicas
  const categories = ["TODOS", ...new Set(products.map(p => p.category))];

  // Filtrado de productos
  const filteredProducts = activeCategory === "TODOS" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <PosContainer>
      <MainContent>
        <Header>
          <h1>Punto de Venta (Caja)</h1>
          <div className="categories">
            {categories.map(cat => (
              <CategoryBtn 
                key={cat} 
                $active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </CategoryBtn>
            ))}
          </div>
        </Header>
        
        <ProductArea>
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </ProductArea>
      </MainContent>

      <CartSidebar />
    </PosContainer>
  );
};

// --- Estilos ---
const PosContainer = styled.div`
  display: flex;
  height: calc(100vh - 40px); // Ajuste según padding de App.tsx
  background: ${({ theme }) => theme.bgtotal};
  gap: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.bg3}33;
`;

const Header = styled.header`
  padding: 25px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}22;

  h1 { 
    font-size: 1.8rem; 
    font-weight: 800; 
    color: ${({ theme }) => theme.bg4};
    margin-bottom: 20px;
  }

  .categories {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const CategoryBtn = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.bg4 : theme.bg3 + "44")};
  background: ${({ $active, theme }) => ($active ? theme.bg4 : "transparent")};
  color: ${({ $active, theme }) => ($active ? "#000" : theme.text)};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.bg4};
    background: ${({ $active, theme }) => ($active ? theme.bg4 : theme.bg3 + "22")};
  }
`;

const ProductArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

export default PosPage;
