# Lógica de Flujo: Compras -> Inventario -> Caja POS

Este documento describe el flujo lógico que el Backend debe implementar para gestionar correctamente el inventario, conectando las compras, las ventas en el punto de venta (POS) y el reporte Kardex. 

Basado en el esquema de base de datos actual.

---

## 1. El Proceso de Compra (Entrada de Mercancía)

Cuando un usuario aprueba y recibe una "Orden de Compra" en el sistema:

El flujo transaccional en el Backend debe ser el siguiente:
1. **Paso A:** Insertar un registro en la tabla `MOVIMIENTOS_INVENTARIO` indicando que es de tipo `ENTRADA`. Se debe referenciar la orden de compra o la factura del proveedor (`id_orden_pedido` o `referencia`), y estipular la cantidad entrante.
2. **Paso B:** Sumar la cantidad recibida a la tabla `INVENTARIO` (Aumentando el valor de la columna `stock_actual` para el producto y sucursal correspondiente).

*(Todo esto debe ocurrir dentro de una única transacción en la base de datos).*

---

## 2. El Proceso de Venta POS (Salida de Mercancía)

Cuando la aplicación POS registra un cobro exitoso:

1. **Paso A:** Insertar los datos principales de la venta en la tabla `FACTURA` y sus artículos correspondientes en `DETALLE_FACTURA`.
2. **Paso B:** Insertar en la tabla `MOVIMIENTOS_INVENTARIO` registros de tipo `SALIDA` por cada artículo vendido. Cada registro debe asociar el ID de la factura resultante y la cantidad que salió del inventario.
3. **Paso C:** Simultáneamente, el servidor actualiza la tabla `INVENTARIO` y *resta* esa misma cantidad de la columna `stock_actual` para ese producto en esa sucursal.

---

## 3. El Reporte Kardex (Visualización e Historial)

El Kardex es la representación visual de la tabla `MOVIMIENTOS_INVENTARIO`.
*   Su función no es calcular el stock desde cero cada vez, sino mostrar la historia.
*   **Entradas** se muestran sumando (+).
*   **Salidas** se muestran restando (-).
*   **Ajustes** reemplazan o corrigen el valor.
*   El saldo final (stock disponible actual) se calcula leyendo este historial cronológico, el cual debe coincidir perfectamente con la columna `stock_actual` de la tabla `INVENTARIO`.

---

## Sugerencias de Arquitectura y Mejores Prácticas

Para garantizar que el sistema sea robusto, escalable y sin fallas contables, se recomienda aplicar estas reglas en el Backend:

### 1. Protección de Ajustes Manuales (Mermas / Daños)
Se debe implementar un módulo exclusivo de "Ajustes de Inventario". Nunca se debe permitir a un usuario editar el número `stock_actual` directamente escribiendo sobre él en la tabla de productos de forma libre.
*   Si el sistema marca 10 unidades, pero físicamente hay 8, el empleado debe forzar la creación de un nuevo `MOVIMIENTOS_INVENTARIO` de tipo `AJUSTE` justificando la pérdida (merma, daño, robo). 
*   De esta forma, la auditoría permanece intacta en el Kardex y siempre hay un responsable de por qué se esfumó el stock.

### 2. Transacciones Automáticas (ACID) Obligatorias
Al manejar bases de datos relacionales, todo movimiento que afecte más de una tabla debe usar "Transacciones" (`BEGIN` ... `COMMIT`).
*   **Riesgo:** Imagina que ocurre una Venta, el backend guarda la `Factura` pero ocurre un error en el servidor o red justo al restar el producto en `INVENTARIO`. El sistema presentaría datos contables descuadrados.
*   **Regla de Oro:** *"O se guarda la factura Y se registra la salida Y se resta el inventario, todo junto al 100%, o la transacción entera falla sin cambiar absolutamente nada"* (`ROLLBACK`).

### 3. Ventas en Negativo Controladas (El Mundo Real)
En negocios físicos es común vender un producto que no ha sido ingresado como 'Compra' al sistema todavía (Ej. acaba de llegar el camión y el cliente ya lo tiene en la mano). 
*   Prohibir que el `stock_actual` caiga debajo de `0` a nivel estricto de base de datos puede colapsar la fila de clientes en la caja.
*   **Solución:** Se decide a nivel de negocio si el POS permite vender sin stock. Si se permite, el sistema debe crear un "Stock Virtual Negativo" (el saldo baja a -1) y generar una Alerta Administrativa. De este modo no se frena la venta, pero la administración sabe que debe regularizar esa entrada pendiente en el sistema lo antes posible.
