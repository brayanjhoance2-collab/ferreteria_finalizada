"use server"

import db from "@/_DB/db"

export async function obtenerArriendos() {
  try {
    const [arriendos] = await db.query(`
      SELECT 
        a.*,
        c.nombre as cliente_nombre,
        c.rut as cliente_rut,
        (SELECT COUNT(*) FROM detalle_arriendos WHERE arriendo_id = a.id) as total_equipos
      FROM arriendos a
      INNER JOIN clientes c ON a.cliente_id = c.id
      ORDER BY a.fecha_creacion DESC
    `)

    return arriendos || []
  } catch (error) {
    console.error('Error al obtener arriendos:', error)
    throw new Error('Error al obtener los arriendos')
  }
}

export async function obtenerEstadisticas() {
  try {
    const [activos] = await db.query(`
      SELECT COUNT(*) as total
      FROM arriendos
      WHERE estado = 'activo'
    `)

    const [pendientes] = await db.query(`
      SELECT COUNT(*) as total
      FROM arriendos
      WHERE estado IN ('borrador', 'cotizacion', 'aprobado')
    `)

    const [finalizados] = await db.query(`
      SELECT COUNT(*) as total
      FROM arriendos
      WHERE estado = 'finalizado'
    `)

    const [ingresos] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM arriendos
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
      AND estado IN ('activo', 'finalizado')
    `)

    return {
      activos: activos[0].total,
      pendientes: pendientes[0].total,
      finalizados: finalizados[0].total,
      ingresos_mes: parseFloat(ingresos[0].total)
    }
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    return {
      activos: 0,
      pendientes: 0,
      finalizados: 0,
      ingresos_mes: 0
    }
  }
}

export async function cambiarEstado(id, nuevoEstado) {
  try {
    const estadosValidos = ['borrador', 'cotizacion', 'aprobado', 'activo', 'finalizado', 'cancelado']
    
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('Estado no válido')
    }

    const [arriendo] = await db.query('SELECT estado FROM arriendos WHERE id = ?', [id])
    
    if (!arriendo || arriendo.length === 0) {
      throw new Error('Arriendo no encontrado')
    }

    await db.query('UPDATE arriendos SET estado = ? WHERE id = ?', [nuevoEstado, id])

    if (nuevoEstado === 'activo') {
      const [detalles] = await db.query(
        'SELECT equipo_id FROM detalle_arriendos WHERE arriendo_id = ?',
        [id]
      )

      for (const detalle of detalles) {
        await db.query(
          'UPDATE equipos SET estado = ? WHERE id = ?',
          ['arrendado', detalle.equipo_id]
        )
      }
    }

    if (nuevoEstado === 'finalizado' || nuevoEstado === 'cancelado') {
      const [detalles] = await db.query(
        'SELECT equipo_id FROM detalle_arriendos WHERE arriendo_id = ?',
        [id]
      )

      for (const detalle of detalles) {
        await db.query(
          'UPDATE equipos SET estado = ? WHERE id = ?',
          ['disponible', detalle.equipo_id]
        )
      }
    }

    return { mensaje: 'Estado actualizado correctamente' }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    throw error
  }
}

export async function eliminarArriendo(id) {
  try {
    const [arriendo] = await db.query(
      'SELECT estado FROM arriendos WHERE id = ?',
      [id]
    )

    if (!arriendo || arriendo.length === 0) {
      throw new Error('Arriendo no encontrado')
    }

    if (arriendo[0].estado === 'activo') {
      throw new Error('No se puede eliminar un arriendo activo')
    }

    const [detalles] = await db.query(
      'SELECT equipo_id FROM detalle_arriendos WHERE arriendo_id = ?',
      [id]
    )

    for (const detalle of detalles) {
      await db.query(
        'UPDATE equipos SET estado = ? WHERE id = ?',
        ['disponible', detalle.equipo_id]
      )
    }

    await db.query('DELETE FROM detalle_arriendos WHERE arriendo_id = ?', [id])
    await db.query('DELETE FROM pagos_arriendos WHERE arriendo_id = ?', [id])
    await db.query('DELETE FROM arriendos WHERE id = ?', [id])

    return { mensaje: 'Arriendo eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar arriendo:', error)
    throw error
  }
}