# DER - Sistema de Gestión de Paneles Solares

Este proyecto define una base de datos relacional para la gestión de clientes, proyectos, inventario, facturación y simulaciones en una empresa de instalación de paneles solares.  	

---

## Entidades

**Usuarios**  
- id_usuario (PK)  
- nombre_usuario  
- password_hash  
- rol (admin, empleado, cliente)  
Gestiona el acceso y los permisos dentro del sistema.  

**Clientes**  
- id_cliente (PK)  
- nombre  
- dni_ruc (único)  
- direccion  
- telefono  
- email (único)  
Representa a las personas o empresas que contratan proyectos.  

**Proyectos**  
- id_proyecto (PK)  
- id_cliente (FK) → Clientes  
- ubicacion  
- tipo_panel  
- cantidad_paneles  
- estado (planificacion, en_proceso, completado)  
- fecha_inicio  
- fecha_fin  
Cada cliente puede tener múltiples proyectos.  

**Inventario**  
- id_producto (PK)  
- nombre_producto  
- tipo_producto (panel, inversor, estructura)  
- cantidad_disponible  
- stock_minimo  
Administra el stock de materiales.  

**MovimientosInventario**  
- id_movimiento (PK)  
- id_producto (FK) → Inventario  
- tipo_movimiento (entrada, salida)  
- cantidad  
- fecha  
Registra entradas y salidas del inventario.  

**Facturas**  
- id_factura (PK)  
- id_cliente (FK) → Clientes  
- id_proyecto (FK) → Proyectos  
- fecha  
- monto_total  
Asocia proyectos y clientes a su facturación.  

**Pagos**  
- id_pago (PK)  
- id_factura (FK) → Facturas  
- fecha_pago  
- monto  
Controla los pagos realizados por los clientes.  

**Simulaciones**  
- id_simulacion (PK)  
- id_proyecto (FK) → Proyectos  
- rendimiento_estimado  
- ahorro_estimado  
- fecha  
Permite analizar rendimiento energético y ahorro.  

---

## Relaciones

- Clientes 1:N Proyectos → Un cliente puede tener varios proyectos.  
- Inventario 1:N MovimientosInventario → Cada producto genera múltiples movimientos de entrada y salida.  
- Clientes 1:N Facturas → Un cliente puede tener varias facturas.  
- Proyectos 1:N Facturas → Un proyecto puede estar vinculado a más de una factura.  
- Facturas 1:N Pagos → Una factura puede pagarse en varias cuotas.  
- Proyectos 1:N Simulaciones → Cada proyecto puede tener varias simulaciones asociadas.  

---

## Vista HistorialCliente

Se incluye una vista llamada **HistorialCliente** que combina información de clientes, facturas y proyectos.  
Sirve para consultar en una sola tabla los datos del cliente, sus proyectos y facturación asociada.  