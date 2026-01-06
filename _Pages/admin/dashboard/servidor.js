"use server"

import db from "@/_DB/db"

export async function obtenerEstadisticas() {
  try {
    const [arriendosActivos] = await db.query(`
      SELECT COUNT(*) as total 
      FROM arriendos 
      WHERE estado = 'activo'
    `)

    const [arriendosNuevosMes] = await db.query(`
      SELECT COUNT(*) as total 
      FROM arriendos 
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
    `)

    const [equiposDisponibles] = await db.query(`
      SELECT COUNT(*) as total 
      FROM equipos 
      WHERE estado = 'disponible' AND activo = true
    `)

    const [equiposTotales] = await db.query(`
      SELECT COUNT(*) as total 
      FROM equipos 
      WHERE activo = true
    `)

    const [equiposArrendados] = await db.query(`
      SELECT COUNT(*) as total 
      FROM equipos 
      WHERE estado = 'arrendado' AND activo = true
    `)

    const [equiposMantenimiento] = await db.query(`
      SELECT COUNT(*) as total 
      FROM equipos 
      WHERE estado = 'mantenimiento' AND activo = true
    `)

    const [clientesActivos] = await db.query(`
      SELECT COUNT(*) as total 
      FROM clientes 
      WHERE activo = true
    `)

    const [clientesNuevosMes] = await db.query(`
      SELECT COUNT(*) as total 
      FROM clientes 
      WHERE MONTH(fecha_registro) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_registro) = YEAR(CURRENT_DATE())
    `)

    const [ingresosMes] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM arriendos 
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
      AND estado IN ('activo', 'finalizado')
    `)

    const [ingresosMesAnterior] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM arriendos 
      WHERE MONTH(fecha_creacion) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND YEAR(fecha_creacion) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND estado IN ('activo', 'finalizado')
    `)

    const [pagosPendientes] = await db.query(`
      SELECT COUNT(*) as total 
      FROM pagos_arriendos 
      WHERE estado = 'pendiente'
    `)

    const [arriendosPorVencer] = await db.query(`
      SELECT COUNT(*) as total 
      FROM arriendos 
      WHERE estado = 'activo'
      AND DATEDIFF(fecha_fin_estimada, CURRENT_DATE()) <= 7
      AND DATEDIFF(fecha_fin_estimada, CURRENT_DATE()) >= 0
    `)

    const ingresoActual = parseFloat(ingresosMes[0].total || 0)
    const ingresoAnterior = parseFloat(ingresosMesAnterior[0].total || 0)
    const porcentajeCambio = ingresoAnterior > 0 
      ? Math.round(((ingresoActual - ingresoAnterior) / ingresoAnterior) * 100)
      : 0

    return {
      arriendos_activos: arriendosActivos[0].total,
      arriendos_nuevos_mes: arriendosNuevosMes[0].total,
      equipos_disponibles: equiposDisponibles[0].total,
      equipos_totales: equiposTotales[0].total,
      equipos_arrendados: equiposArrendados[0].total,
      equipos_mantenimiento: equiposMantenimiento[0].total,
      clientes_activos: clientesActivos[0].total,
      clientes_nuevos_mes: clientesNuevosMes[0].total,
      ingresos_mes: ingresoActual,
      porcentaje_cambio: porcentajeCambio,
      pagos_pendientes: pagosPendientes[0].total,
      arriendos_por_vencer: arriendosPorVencer[0].total
    }

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return {
      arriendos_activos: 0,
      arriendos_nuevos_mes: 0,
      equipos_disponibles: 0,
      equipos_totales: 0,
      equipos_arrendados: 0,
      equipos_mantenimiento: 0,
      clientes_activos: 0,
      clientes_nuevos_mes: 0,
      ingresos_mes: 0,
      porcentaje_cambio: 0,
      pagos_pendientes: 0,
      arriendos_por_vencer: 0
    }
  }
}

export async function obtenerActividadReciente() {
  try {
    const [result] = await db.query(`
      SELECT 
        tabla,
        accion,
        fecha,
        CASE 
          WHEN tabla = 'arriendos' AND accion = 'INSERT' THEN 'Nuevo arriendo registrado'
          WHEN tabla = 'arriendos' AND accion = 'UPDATE' THEN 'Arriendo actualizado'
          WHEN tabla = 'clientes' AND accion = 'INSERT' THEN 'Nuevo cliente registrado'
          WHEN tabla = 'clientes' AND accion = 'UPDATE' THEN 'Cliente actualizado'
          WHEN tabla = 'equipos' AND accion = 'INSERT' THEN 'Nuevo equipo agregado'
          WHEN tabla = 'equipos' AND accion = 'UPDATE' THEN 'Equipo actualizado'
          WHEN tabla = 'pagos_arriendos' AND accion = 'INSERT' THEN 'Pago registrado'
          WHEN tabla = 'ordenes_servicio' AND accion = 'INSERT' THEN 'Nueva orden de servicio'
          ELSE CONCAT(tabla, ' - ', accion)
        END as descripcion
      FROM auditoria
      ORDER BY fecha DESC
      LIMIT 10
    `)

    return result || []

  } catch (error) {
    console.error('Error al obtener actividad reciente:', error)
    return []
  }
}