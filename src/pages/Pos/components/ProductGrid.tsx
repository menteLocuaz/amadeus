import React from "react";
import styled from "styled-components";
import { Product } from "../../../services/ProductService";
import { usePosStore } from "../../../store/usePosStore";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  const addToCart = usePosStore((state) => state.addToCart);

  if (isLoading) return <LoadingMessage>Cargando catálogo...</LoadingMessage>;

  return (
    <GridContainer>
      {products.map((product) => (
        <ProductCard key={product.id} onClick={() => addToCart(product)}>
          <div className="image-placeholder">🍽️</div>
          <div className="details">
            <span className="name">{product.name}</span>
            <span className="price">${product.price.toFixed(2)}</span>
          </div>
          <div className="category">{product.category}</div>
        </ProductCard>
      ))}
    </GridContainer>
  );
};

// --- Estilos ---
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
  overflow-y: auto;
  padding: 10px;
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }

  .image-placeholder {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .name {
      font-weight: 600;
      font-size: 0.9rem;
      color: ${({ theme }) => theme.text};
    }

    .price {
      color: ${({ theme }) => theme.bg4};
      font-weight: 700;
      font-size: 1.1rem;
    }
  }

  .category {
    font-size: 0.75rem;
    opacity: 0.6;
    margin-top: 8px;
    text-transform: uppercase;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textsecondary};
`;
