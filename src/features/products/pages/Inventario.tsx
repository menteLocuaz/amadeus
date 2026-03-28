import React, { useEffect, useMemo } from "react";
import { FiSearch, FiBox, FiAlertTriangle, FiRefreshCw, FiLayers } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { useInventario } from "../hooks/useInventario";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { 
  PageContainer, TableCard, Table, Badge, Thumbnail 
} from "../../../shared/components/UI";
import styled from "styled-components";

const Inventario: React.FC = () => {
  const { 
    products, isLoading: isProdLoading, search, setSearch, 
    filterStockBajo, setFilterStockBajo, refresh 
  } = useInventario();

  const { sucursales, fetchCatalogs, isLoading: isCatalogLoading } = useCatalogStore();

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const sucursalMap = useMemo(() => {
    const map: Record<string, string> = {};
    sucursales.forEach((s: any) => {
      map[s.id_sucursal || s.id] = s.nombre_sucursal || s.nombre;
    });
    return map;
  }, [sucursales]);

  const isLoading = isProdLoading || isCatalogLoading;

  return (
    <PageContainer>
      <Header>
        <div>
          <Title><FiLayers /> Catálogo de Inventario</Title>
          <Subtitle>Consulta de existencias, precios y estados de almacén</Subtitle>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <RefreshBtn onClick={refresh} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? "spin" : ""} />
          </RefreshBtn>
        </div>
      </Header>

      <FiltersBar>
        <SearchWrapper>
          <FiSearch />
          <input 
            placeholder="Buscar por nombre o código..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </SearchWrapper>

        <StockFilter 
          $active={filterStockBajo} 
          onClick={() => setFilterStockBajo(!filterStockBajo)}
        >
          <FiAlertTriangle /> Stock Bajo
        </StockFilter>
      </FiltersBar>

      {isLoading ? (
        <LoaderContainer>
          <ClimbingBoxLoader color="#FCA311" size={20} />
          <p>Sincronizando existencias...</p>
        </LoaderContainer>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Sucursal</th>
                <th>Precio Venta</th>
                <th>Existencias</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "50px", opacity: 0.5 }}>
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id_producto}>
                    <td>
                      <ProductInfo>
                        <Thumbnail src={p.imagen || "https://placehold.co/50x50?text=No+Img"} />
                        <div>
                          <div className="name">{p.nombre}</div>
                          <div className="sku">ID: {p.id_producto}</div>
                        </div>
                      </ProductInfo>
                    </td>
                    <td>{p.categoria?.nombre || "General"}</td>
                    <td>
                      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        {sucursalMap[p.id_sucursal] || "N/A"}
                      </span>
                    </td>
                    <td className="price">
                      {p.moneda?.nombre} {p.precio_venta?.toFixed(2)}
                    </td>
                    <td>
                      <StockBadge $low={p.stock <= 5}>
                        <FiBox /> {p.stock} {p.unidad?.nombre}
                      </StockBadge>
                    </td>
                    <td>
                      <Badge $color={p.stock > 0 ? "#22C55E22" : "#EF444422"}>
                        {p.stock > 0 ? "Disponible" : "Agotado"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableCard>
      )}
    </PageContainer>
  );
};

export default Inventario;

/* Estilos Locales */

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Subtitle = styled.p`
  color: #9CA3AF;
  margin: 5px 0 0 0;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  background: ${({ theme }) => theme.bg || "#1a1a1a"};
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg { color: #FCA311; }
  input {
    background: transparent;
    border: none;
    color: inherit;
    outline: none;
    width: 100%;
  }
`;

const StockFilter = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? "#EF4444" : "rgba(255,255,255,0.05)")};
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  border: none;
  padding: 0 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
`;

const RefreshBtn = styled.button`
  background: rgba(255,255,255,0.05);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  .name { font-weight: 700; }
  .sku { font-size: 0.75rem; opacity: 0.5; }
`;

const StockBadge = styled.div<{ $low: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${({ $low }) => ($low ? "#EF444422" : "rgba(255,255,255,0.05)")};
  color: ${({ $low }) => ($low ? "#EF4444" : "inherit")};
  font-weight: 700;
`;

const LoaderContainer = styled.div`
  padding: 100px;
  text-align: center;
  color: #FCA311;
  p { margin-top: 20px; font-weight: 600; }
`;