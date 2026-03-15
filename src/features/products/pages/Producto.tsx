import { useEffect } from "react";
import styled from "styled-components";
import { useProductStore } from "../store/useProductStore";

export function Productos() {
  // Suscribirse al store de productos (Patrón Observer)
  const { products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    // Carga inicial de datos
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Container>
      <HeaderSection>
        <h1>Gestión de Productos</h1>
        <p>Visualización y control de inventario en tiempo real.</p>
      </HeaderSection>

      {isLoading && <StatusMessage>Cargando productos...</StatusMessage>}
      
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}

      {!isLoading && !error && (
        <ProductGrid>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id}>
                <div className="info">
                  <h3>{product.name}</h3>
                  <span className="category">{product.category}</span>
                </div>
                <div className="price">${product.price}</div>
              </ProductCard>
            ))
          ) : (
            <p>No se encontraron productos en el sistema.</p>
          )}
        </ProductGrid>
      )}
    </Container>
  );
}

// --- Estilos ---
const Container = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 30px;
  h1 { font-size: 2.5rem; margin: 0; color: ${({ theme }) => theme.text}; }
  p { color: ${({ theme }) => theme.textsecondary}; margin-top: 10px; }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    border-color: ${({ theme }) => theme.bg4};
  }

  .info {
    h3 { margin: 0; font-size: 1.1rem; }
    .category { font-size: 0.85rem; opacity: 0.7; color: ${({ theme }) => theme.bg4}; font-weight: 600; }
  }

  .price {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
`;

const ErrorMessage = styled(StatusMessage)`
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  border-radius: 8px;
`;
