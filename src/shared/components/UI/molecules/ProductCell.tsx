import styled from "styled-components";
import { FiImage, FiPackage } from "react-icons/fi";

/**
 * Common Product Cell components for Tables
 */

export const ProductCellContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const ProductImg = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    background: ${({ theme }) => theme.bgCard || "#eee"};
`;

export const ProductImgPlaceholder = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(150, 150, 150, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.texttertiary};
    font-size: 1.2rem;
`;

export const ProductName = styled.div`
    font-weight: 700;
    color: ${({ theme }) => theme.text};
`;

export const ProductSku = styled.div`
    font-weight: 600;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary}15;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 4px;
    letter-spacing: 0.05em;
    opacity: 0.9;
    font-family: 'JetBrains Mono', 'Space Mono', monospace;
`;

export const PriceText = styled.div`
    color: ${({ theme }) => theme.success};
    font-weight: 700;
    text-align: right;
`;

/**
 * Functional Component for a standard Product Cell
 */
export const ProductCodigo = styled.div`
    font-size: 0.7rem;
    font-weight: 500;
    color: ${({ theme }) => theme.texttertiary};
    font-family: 'JetBrains Mono', 'Space Mono', monospace;
    margin-top: 2px;
    opacity: 0.7;
    letter-spacing: 0.04em;
`;

export const ProductCell = ({
    nombre,
    sku,
    imagen,
    codigo,
    placeholderIcon: Icon = FiImage
}: {
    nombre: string;
    sku: string | number;
    imagen?: string;
    codigo?: string;
    placeholderIcon?: React.ElementType;
}) => (
    <ProductCellContainer>
        {imagen ? (
            <ProductImg src={imagen} alt={nombre} />
        ) : (
            <ProductImgPlaceholder><Icon /></ProductImgPlaceholder>
        )}
        <div>
            <ProductName>{nombre}</ProductName>
            {sku && <ProductSku>{sku}</ProductSku>}
            {codigo && <ProductCodigo>{codigo}</ProductCodigo>}
        </div>
    </ProductCellContainer>
);
