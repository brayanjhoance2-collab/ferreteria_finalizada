"use server"

import db from "@/_DB/db"

export async function obtenerCliente(id) {
  try {
    const [cliente] = await db.query(
      'SELECT * FROM clientes WHERE id = ? AND activo = true',
      [id]
    )

    if (!cliente || cliente.length === 0) {
      throw new Error('Cliente no encontrado')
    }

    return cliente[0]
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    throw error
  }
}

export async function obtenerArriendosCliente(clienteId) {
  try {
    const [arriendos] = await db.query(`
      SELECT 
        id,
        numero_contrato,
        fecha_inicio,
        fecha_fin_estimada,
        estado,
        total
      FROM arriendos
      WHERE cliente_id = ?
      ORDER BY fecha_creacion DESC
    `, [clienteId])

    return arriendos || []
  } catch (error) {
    console.error('Error al obtener arriendos:', error)
    return []
  }
}