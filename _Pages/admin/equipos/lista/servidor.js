"use server"

import db from "@/_DB/db"

export async function obtenerEquipos() {
  try {
    const [equipos] = await db.query(`
      SELECT 
        e.*,
        c.nombre as categoria_nombre
      FROM equipos e
      LEFT JOIN categorias_equipos c ON e.categoria_id = c.id
      WHERE e.activo = true
      ORDER BY e.destacado DESC, e.fecha_creacion DESC
    `)

    return equipos || []
  } catch (error) {
    console.error('Error al obtener equipos:', error)
    throw new Error('Error al obtener los equipos')
  }
}

export async function obtenerCategorias() {
  try {
    const [categorias] = await db.query(`
      SELECT id, nombre
      FROM categorias_equipos
      WHERE activo = true
      ORDER BY orden ASC, nombre ASC
    `)

    return categorias || []
  } catch (error) {
    console.error('Error al obtener categorias:', error)
    throw new Error('Error al obtener las categorías')
  }
}

export async function obtenerEstadisticas() {
  try {
    const [disponibles] = await db.query(`
      SELECT COUNT(*) as total
      FROM equipos
      WHERE estado = 'disponible' AND activo = true
    `)

    const [arrendados] = await db.query(`
      SELECT COUNT(*) as total
      FROM equipos
      WHERE estado = 'arrendado' AND activo = true
    `)

    const [mantenimiento] = await db.query(`
      SELECT COUNT(*) as total
      FROM equipos
      WHERE estado = 'mantenimiento' AND activo = true
    `)

    const [total] = await db.query(`
      SELECT COUNT(*) as total
      FROM equipos
      WHERE activo = true
    `)

    return {
      disponibles: disponibles[0].total,
      arrendados: arrendados[0].total,
      mantenimiento: mantenimiento[0].total,
      total: total[0].total
    }
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    return {
      disponibles: 0,
      arrendados: 0,
      mantenimiento: 0,
      total: 0
    }
  }
}

export async function eliminarEquipo(id) {
  try {
    const [enUso] = await db.query(`
      SELECT COUNT(*) as total
      FROM detalle_arriendos da
      INNER JOIN arriendos a ON da.arriendo_id = a.id
      WHERE da.equipo_id = ? 
      AND a.estado IN ('activo', 'aprobado')
    `, [id])

    if (enUso[0].total > 0) {
      throw new Error('No se puede eliminar. El equipo está asociado a arriendos activos')
    }

    await db.query('UPDATE equipos SET activo = false WHERE id = ?', [id])

    return { mensaje: 'Equipo eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar equipo:', error)
    throw error
  }
}

export async function cambiarEstado(id, nuevoEstado) {
  try {
    const estadosValidos = ['disponible', 'arrendado', 'mantenimiento', 'reparacion', 'baja']
    
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('Estado no válido')
    }

    await db.query('UPDATE equipos SET estado = ? WHERE id = ?', [nuevoEstado, id])

    return { mensaje: 'Estado actualizado correctamente' }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    throw error
  }
}