# DER - Sistema de Gestión de Paneles Solares

Este proyecto define una base de datos relacional en **SQLite** para la gestión de clientes, proyectos, inventario, facturación y simulaciones en una empresa de instalación de paneles solares.  

---

## Entidades

**Usuarios**  
- id_usuario (PK)  
- username (único)  
- password_hash  
- rol (admin, empleado, cliente)  
Gestiona el acceso y los permisos dentro del sistema.  

**Clientes**  
- id_cliente (PK, FK → Usuarios)  
- nombre  
- documento (único)  
- direccion  
- telefono  
- email (único)  
Representa a las personas o empresas que contratan proyectos.  

**Empleados**  
- id_empleado (PK, FK → Usuarios)  
- nombre  
- especialidad  
- telefono  
Registra a los empleados de la empresa y sus especialidades.  

**Proveedores**  
- id_proveedor (PK)  
- nombre  
- contacto  
- telefono  
- email (único)  
Gestiona la información de los proveedores de productos.  

**Inventario**  
- id_producto (PK)  
- nombre  
- tipo (panel, inversor, estructura, otro)  
- stock_actual  
- stock_minimo  
- id_proveedor (FK → Proveedores)  
Administra el stock de materiales y su relación con proveedores.  

**MovimientosInventario**  
- id_movimiento (PK)  
- id_producto (FK → Inventario)  
- fecha  
- tipo_movimiento (entrada, salida)  
- cantidad  
Registra entradas y salidas de productos del inventario.  

**Proyectos**  
- id_proyecto (PK)  
- id_cliente (FK → Clientes)  
- ubicacion  
- tipo_panel  
- cantidad_paneles  
- estado (planificacion, en_proceso, completado)  
- fecha_inicio  
- fecha_fin  
Cada cliente puede tener múltiples proyectos.  

**Simulaciones**  
- id_simulacion (PK)  
- id_proyecto (FK → Proyectos)  
- rendimiento_estimado  
- ahorro_estimado  
Permite analizar el rendimiento energético y el ahorro esperado.  

**Facturas**  
- id_factura (PK)  
- id_cliente (FK → Clientes)  
- id_proyecto (FK → Proyectos)  
- fecha  
- monto_total  
Asocia proyectos y clientes a su facturación.  

**DetalleFactura**  
- id_detalle (PK)  
- id_factura (FK → Facturas)  
- id_producto (FK → Inventario)  
- cantidad  
- precio_unitario  
Desglosa los productos incluidos en cada factura.  

**Pagos**  
- id_pago (PK)  
- id_factura (FK → Facturas)  
- fecha_pago  
- monto  
Controla los pagos realizados por los clientes sobre las facturas.  

**EmpleadoProyecto**  
- id_empleado (FK → Empleados)  
- id_proyecto (FK → Proyectos)  
Tabla intermedia para la relación N:M entre empleados y proyectos.  

---

## Relaciones

- Usuarios 1:1 Clientes → Un usuario puede ser un cliente.  
- Usuarios 1:1 Empleados → Un usuario puede ser un empleado.  
- Clientes 1:N Proyectos → Un cliente puede tener varios proyectos.  
- Proyectos 1:N Simulaciones → Un proyecto puede tener varias simulaciones.  
- Proveedores 1:N Inventario → Un proveedor puede suministrar varios productos.  
- Inventario 1:N MovimientosInventario → Cada producto genera múltiples movimientos de entrada/salida.  
- Clientes 1:N Facturas → Un cliente puede tener varias facturas.  
- Proyectos 1:N Facturas → Un proyecto puede estar vinculado a más de una factura.  
- Facturas 1:N DetalleFactura → Una factura puede incluir varios productos.  
- Inventario 1:N DetalleFactura → Un producto puede aparecer en múltiples facturas.  
- Facturas 1:N Pagos → Una factura puede pagarse en varias cuotas.  
- Empleados N:M Proyectos → Un empleado puede trabajar en varios proyectos y un proyecto puede tener varios empleados.  

## Vista HistorialCliente

Se incluye una vista llamada **HistorialCliente** que combina información de clientes, proyectos y facturas.  
Esto permite consultar en una sola tabla los datos del cliente, sus proyectos y la facturación asociada.  

Campos que devuelve:  
- id_cliente, cliente_nombre, documento, email  
- id_proyecto, ubicacion, tipo_panel, estado  
- id_factura, fecha_factura, monto_total  
