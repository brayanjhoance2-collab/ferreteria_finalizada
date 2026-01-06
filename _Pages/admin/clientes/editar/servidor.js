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

export async function actualizarCliente(id, datos) {
  try {
    await db.query(`
      UPDATE clientes 
      SET 
        tipo_cliente = ?,
        nombre = ?,
        razon_social = ?,
        giro = ?,
        direccion = ?,
        ciudad = ?,
        region = ?,
        pais = ?,
        telefono = ?,
        telefono_alternativo = ?,
        email = ?,
        contacto_nombre = ?,
        contacto_cargo = ?,
        contacto_telefono = ?,
        contacto_email = ?,
        credito_aprobado = ?,
        limite_credito = ?,
        descuento_porcentaje = ?,
        notas = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      datos.tipo_cliente,
      datos.nombre,
      datos.razon_social || null,
      datos.giro || null,
      datos.direccion || null,
      datos.ciudad || null,
      datos.region || null,
      datos.pais || 'Perú',
      datos.telefono || null,
      datos.telefono_alternativo || null,
      datos.email,
      datos.contacto_nombre || null,
      datos.contacto_cargo || null,
      datos.contacto_telefono || null,
      datos.contacto_email || null,
      datos.credito_aprobado,
      datos.limite_credito || 0,
      datos.descuento_porcentaje || 0,
      datos.notas || null,
      id
    ])

    return { mensaje: 'Cliente actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    throw error
  }
}