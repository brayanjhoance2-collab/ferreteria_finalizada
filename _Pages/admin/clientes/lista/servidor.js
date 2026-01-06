"use server"

import db from "@/_DB/db"

export async function obtenerClientes() {
  try {
    const [clientes] = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT a.id) as total_arriendos
      FROM clientes c
      LEFT JOIN arriendos a ON c.id = a.cliente_id
      WHERE c.activo = true
      GROUP BY c.id
      ORDER BY c.fecha_registro DESC
    `)

    return clientes || []
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    throw new Error('Error al obtener los clientes')
  }
}

export async function obtenerEstadisticas() {
  try {
    const [total] = await db.query(`
      SELECT COUNT(*) as total
      FROM clientes
      WHERE activo = true
    `)

    const [personas] = await db.query(`
      SELECT COUNT(*) as total
      FROM clientes
      WHERE tipo_cliente = 'persona' AND activo = true
    `)

    const [empresas] = await db.query(`
      SELECT COUNT(*) as total
      FROM clientes
      WHERE tipo_cliente = 'empresa' AND activo = true
    `)

    const [conCredito] = await db.query(`
      SELECT COUNT(*) as total
      FROM clientes
      WHERE credito_aprobado = true AND activo = true
    `)

    return {
      total: total[0].total,
      personas: personas[0].total,
      empresas: empresas[0].total,
      con_credito: conCredito[0].total
    }
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    return {
      total: 0,
      personas: 0,
      empresas: 0,
      con_credito: 0
    }
  }
}

export async function eliminarCliente(id) {
  try {
    const [arriendos] = await db.query(`
      SELECT COUNT(*) as total
      FROM arriendos
      WHERE cliente_id = ?
      AND estado IN ('aprobado', 'activo')
    `, [id])

    if (arriendos[0].total > 0) {
      throw new Error(`No se puede eliminar. El cliente tiene ${arriendos[0].total} arriendos activos`)
    }

    await db.query('UPDATE clientes SET activo = false WHERE id = ?', [id])

    return { mensaje: 'Cliente eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    throw error
  }
}