"use server"

import db from "@/_DB/db"

export async function crearCliente(datos) {
  try {
    const [existe] = await db.query(
      'SELECT id FROM clientes WHERE rut = ?',
      [datos.rut]
    )

    if (existe && existe.length > 0) {
      throw new Error('Ya existe un cliente con ese RUT')
    }

    const [result] = await db.query(`
      INSERT INTO clientes (
        tipo_cliente, rut, nombre, razon_social, giro,
        direccion, ciudad, region, pais,
        telefono, telefono_alternativo, email,
        contacto_nombre, contacto_cargo, contacto_telefono, contacto_email,
        credito_aprobado, limite_credito, descuento_porcentaje,
        activo, notas, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      datos.tipo_cliente,
      datos.rut,
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
      true,
      datos.notas || null
    ])

    return { id: result.insertId, mensaje: 'Cliente creado correctamente' }
  } catch (error) {
    console.error('Error al crear cliente:', error)
    throw error
  }
}