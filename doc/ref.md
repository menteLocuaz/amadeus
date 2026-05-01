# Referencia de API - Prunus Business API

Esta documentación técnica detalla los endpoints, esquemas de datos y protocolos de comunicación de la API de Prunus. Está diseñada para ser la fuente de verdad para el desarrollo del Frontend.

## Especificaciones Globales

- **Base URL:** `http://localhost:9090/api/v1`
- **Content-Type:** `application/json` (Requerido para todas las peticiones con cuerpo).
- **Autenticación:** Todos los endpoints marcados con 🔒 requieren el header `Authorization: Bearer <JWT_TOKEN>`.

### Formato de Respuesta Estándar

Todas las respuestas exitosas (200, 201) siguen esta estructura:
```json
{
  "status": "success",
  "message": "Descripción legible de la operación",
  "data": { ... }
}
```

Las respuestas de error (400, 401, 403, 404, 500) devuelven:
```json
{
  "status": "error",
  "message": "Detalle del error ocurrido"
}
```

---

## Sistema de Paginación (Keyset Pagination)

Para garantizar la estabilidad del sistema, los endpoints de listado (`GetAll`) implementan **paginación basada en cursor**. Es obligatorio para el frontend manejar estos parámetros al realizar scrolls infinitos o paginación.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `limit` | `int` | Número de registros a retornar (Default: 20, Max recomendado: 100). |
| `last_id` | `UUID` | ID del último registro de la página anterior (opcional). |
| `last_date` | `string` | Fecha (`created_at`) del último registro en formato RFC3339 (ej. `2026-04-14T09:00:00Z`). |

**Ejemplo de solicitud:**
`GET /api/v1/productos?limit=50&last_date=2026-04-14T08:30:00Z`

---

## 1. Acceso y Seguridad (`/auth`)

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/login` | POST | 🔓 | Inicio de sesión con `email` o `username` y `password`. |
| `/auth/me` | GET | 🔒 | Obtiene los datos del perfil del usuario actual. |
| `/auth/refresh-token`| POST | 🔒 | Renueva la validez del JWT actual. |
| `/auth/logout` | POST | 🔒 | Invalida la sesión actual (lado servidor/cache). |

---

## 2. Organización y Usuarios

### Usuarios (`/usuarios`) 🔒
Gestión de personal y accesos multi-sucursal.
- `GET /`: Listado paginado.
- `POST /administrar`: Creación/Actualización integral incluyendo `sucursales_acceso`.
- `GET /id`, `PUT /id`, `DELETE /id`: Operaciones estándar.

### Sucursales (`/sucursales`) 🔒
Gestión de puntos de venta físicos.
- `GET /`: Listado de sucursales vinculadas a la empresa.

### Roles (`/roles`) 🔒
Definición de perfiles (Administrador, Cajero, etc.).

---

## 3. Almacén e Inventario

### Productos (`/productos`) 🔒
Maestro de artículos de venta.
- `GET /`: Listado paginado. Soporta filtros por categoría.
- `GET /buscar/{codigo}`: Búsqueda rápida por SKU o Código de Barras.
- `POST /`: Al crear un producto, se genera automáticamente su registro en el almacén de la sucursal indicada.

### Inventario (`/inventario`) 🔒
Control físico y financiero de existencias.
- `GET /`: Estado actual de stock en todas las sucursales (paginado).
- `GET /sucursal/{id}`: Filtro rápido por sucursal.
- `POST /movimientos/masivo`: Registro de entradas/salidas/ajustes para múltiples ítems.
- `GET /movimientos/{id_producto}`: Historial detallado (Kardex) paginado.
- `GET /alertas`: Listado de productos por debajo del stock mínimo.

---

## 4. Entidades Externas

### Clientes (`/clientes`) 🔒
Cartera de clientes para facturación.
- `GET /`: Listado paginado (Ordenado por fecha de creación desc).

### Proveedores (`/proveedores`) 🔒
Gestión de suministros y compras.
- `GET /`: Listado paginado.

---

## 5. Operaciones Comerciales

### Órdenes de Pedido (`/ordenes`) 🔒
Órdenes pendientes de preparación o entrega.
- `GET /`: Listado paginado.
- `PUT /{id}/status`: Cambio de estado (Ej. Pendiente -> Preparando).

### Compras (`/compras`) 🔒
Abastecimiento de mercancía.
- `POST /`: Creación de orden de compra.
- `POST /recepcion`: Proceso crítico que incrementa stock, genera lotes y cierra la orden.

### Facturación (`/facturas`) 🔒
- `POST /completa`: Endpoint atómico. Registra la cabecera, todos los ítems y las formas de pago en una sola transacción de base de datos.
- `GET /`: Historial de ventas paginado.

---

## 6. Punto de Venta (POS) y Caja

### Sesión de Estación (`/pos`) 🔒
Control de aperturas y arqueos de caja por cajero.
- `POST /abrir`: Apertura con `fondo_base`.
- `POST /actualizar-valores`: Declaración de valores durante el turno (Arqueo ciego).
- `POST /desmontar`: Cierre de turno y cálculo de diferencias.

### Períodos (`/periodos`) 🔒
**IMPORTANTE:** Debe existir un período contable activo (`GET /periodos/activo`) para permitir cualquier operación de POS o Facturación.

---

## 7. Catálogos Auxiliares

### Estatus (`/estatus`) 🔒
- **`GET /catalogo`**: Devuelve todos los estados posibles agrupados por módulo. **Debe llamarse en la inicialización del frontend** para mapear IDs a nombres legibles (Activo, Inactivo, Pendiente, etc.).

### Medidas y Monedas
- `GET /medidas`: Unidades de medida (Kg, Unidades, etc.).
- `GET /monedas`: Monedas configuradas en el sistema.

---

## Guía de Flujos Típicos (Workflows)

### 1. Venta Rápida (Caja)
1. Verificar `/periodos/activo`.
2. Verificar sesión en `/pos/estado/{id}`.
3. Escanear productos vía `/productos/buscar/{codigo}`.
4. Enviar transacción completa a `/facturas/completa`.

### 2. Abastecimiento de Stock
1. Crear Proveedor si no existe (`/proveedores`).
2. Generar Orden de Compra (`/compras`).
3. Al recibir la mercancía, llamar a `/compras/recepcion` con las cantidades reales recibidas. Esto actualizará el `/inventario` automáticamente.
