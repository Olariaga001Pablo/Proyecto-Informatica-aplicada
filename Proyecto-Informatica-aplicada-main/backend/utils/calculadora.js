// backend/utils/calculadora.js

/**
 * Constantes de referencia para la potencia de los paneles y los inversores.
 */
export const TIPOS_PANEL = {
    PANEL_450W: 450,
    PANEL_550W: 550,
};

export const TIPOS_INVERSOR = {
    INVERSOR_1KW: { potencia: 1000 },
    INVERSOR_3KW: { potencia: 3000 },
    INVERSOR_5KW: { potencia: 5000 },
};

/**
 * Función Auxiliar: Calcula la potencia total de paneles.
 * @param {number} cantidadPaneles
 * @param {number} potenciaPanel
 * @returns {number} - Potencia total en Watts.
 */
const calcularPotenciaTotalPaneles = (cantidadPaneles, potenciaPanel) => {
    return cantidadPaneles * potenciaPanel;
};

/**
 * Función Clave: Determina el tipo y la cantidad de inversores necesarios.
 * Busca el inversor más pequeño y más cercano que pueda cubrir la potencia total del sistema.
 * * @param {number} potenciaTotalWatts - Potencia total generada por los paneles (en Watts).
 * @returns {{cantidad: number, tipo: string}} - Cantidad y tipo de inversor(es).
 */
const seleccionarInversores = (potenciaTotalWatts) => {
    if (potenciaTotalWatts <= 0) {
        return { cantidad: 0, tipo: 'N/A' };
    }

    // 1. Convertir a un array y ordenar de menor a mayor potencia (1kW, 3kW, 5kW)
    const tiposOrdenados = Object.entries(TIPOS_INVERSOR)
        .map(([nombre, datos]) => ({ nombre, ...datos }))
        .sort((a, b) => a.potencia - b.potencia);

    // 2. Buscar el inversor individual más pequeño que cubra la potencia total
    for (const inversor of tiposOrdenados) {
        if (inversor.potencia >= potenciaTotalWatts) {
            // Se encontró el inversor que lo cubre: se necesita 1 unidad.
            return { cantidad: 1, tipo: inversor.nombre };
        }
    }

    // 3. Si la potencia es mayor al inversor más grande (5KW), se calcula la cantidad de inversores de 5KW.
    const inversorMasGrande = tiposOrdenados[tiposOrdenados.length - 1];
    if (potenciaTotalWatts > inversorMasGrande.potencia) {
        const cantidad = Math.ceil(potenciaTotalWatts / inversorMasGrande.potencia);
        return { cantidad: cantidad, tipo: inversorMasGrande.nombre };
    }
    
    // Si no se cumplió ninguna condición (lo cual es raro si potenciaTotalWatts > 0), retornamos el más grande.
    return { cantidad: 1, tipo: inversorMasGrande.nombre };
};

/**
 * Calcula la cantidad de paneles y el inversor requerido.
 * NOTA: Para el cálculo de paneles, el 'consumo_kwh' se usa como POTENCIA DE DEMANDA TOTAL en Watts, 
 * lo que permite aplicar el redondeo directo (ej: 2500 / 450 = 5.55 -> 6 paneles).
 * * @param {number} potencia_demanda_watts - Potencia de demanda total en Watts (ej: 2500).
 * @param {number} potencia_panel_watts - Potencia nominal del panel (ej: 450 o 550).
 * @returns {{paneles: number, potenciaTotal: number, inversor: object}}
 */
export const calcularPanelesYSistema = (potencia_demanda_watts, potencia_panel_watts) => {
    
    if (potencia_demanda_watts <= 0 || potencia_panel_watts <= 0) {
        return {
            paneles: 0,
            potenciaTotal: 0,
            inversor: { cantidad: 0, tipo: 'N/A' },
        };
    }
    
    // 1. CÁLCULO DE PANELES (aplicando Math.round() para el redondeo al más cercano)
    const cantidad_exacta = potencia_demanda_watts / potencia_panel_watts;
    const paneles_requeridos = Math.round(cantidad_exacta);
    const cantidad_paneles = paneles_requeridos > 0 ? paneles_requeridos : 1;
    
    // 2. CÁLCULO DE POTENCIA TOTAL DEL SISTEMA
    const potencia_total_watts = calcularPotenciaTotalPaneles(cantidad_paneles, potencia_panel_watts);

    // 3. SELECCIÓN DE INVERSOR
    const datosInversor = seleccionarInversores(potencia_total_watts);
    
    return {
        paneles: cantidad_paneles,
        potenciaTotal: potencia_total_watts,
        inversor: datosInversor,
    };
};