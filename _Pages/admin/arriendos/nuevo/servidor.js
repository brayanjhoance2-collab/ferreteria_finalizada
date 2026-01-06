"use server"

import db from "@/_DB/db"

export async function generarNumeroContrato() {
  try {
    const anioActual = new Date().getFullYear()
    const mesActual = String(new Date().getMonth() + 1).padStart(2, '0')
    const prefijo = `ARR-${anioActual}${mesActual}-`
    
    const [resultado] = await db.query(`
      SELECT numero_contrato 
      FROM arriendos 
      WHERE numero_contrato LIKE ?
      ORDER BY numero_contrato DESC 
      LIMIT 1
    `, [`${prefijo}%`])

    let nuevoNumero = 1

    if (resultado && resultado.length > 0) {
      const ultimoNumero = resultado[0].numero_contrato
      const partes = ultimoNumero.split('-')
      const numero = parseInt(partes[partes.length - 1])
      if (!isNaN(numero)) {
        nuevoNumero = numero + 1
      }
    }

    const numeroFormateado = String(nuevoNumero).padStart(4, '0')
    const numeroGenerado = `${prefijo}${numeroFormateado}`

    const [existe] = await db.query('SELECT id FROM arriendos WHERE numero_contrato = ?', [numeroGenerado])
    
    if (existe && existe.length > 0) {
      nuevoNumero++
      const nuevoNumeroFormateado = String(nuevoNumero).padStart(4, '0')
      return { numero: `${prefijo}${nuevoNumeroFormateado}` }
    }

    return { numero: numeroGenerado }
  } catch (error) {
    console.error('Error al generar número:', error)
    throw new Error('Error al generar número de contrato')
  }
}

export async function obtenerClientes() {
  try {
    const [clientes] = await db.query(`
      SELECT id, nombre, rut, tipo_cliente
      FROM clientes
      WHERE activo = true
      ORDER BY nombre ASC
    `)

    return clientes || []
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    throw new Error('Error al obtener los clientes')
  }
}

export async function obtenerEquipos() {
  try {
    const [equipos] = await db.query(`
      SELECT 
        e.id, e.codigo, e.nombre, e.estado,
        e.precio_dia, e.precio_semana, e.precio_mes
      FROM equipos e
      WHERE e.activo = true
      ORDER BY e.nombre ASC
    `)

    return equipos || []
  } catch (error) {
    console.error('Error al obtener equipos:', error)
    throw new Error('Error al obtener los equipos')
  }
}

export async function crearArriendo(datos) {
  try {
    const [result] = await db.query(`
      INSERT INTO arriendos (
        numero_contrato, cliente_id, fecha_inicio, fecha_fin_estimada,
        dias_totales, tipo_arriendo, modalidad, estado,
        lugar_entrega, direccion_entrega, lugar_devolucion,
        requiere_transporte, costo_transporte,
        requiere_operador, costo_operador,
        garantia_deposito, subtotal, descuento_porcentaje, descuento_monto,
        iva, total, observaciones, condiciones_especiales,
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      datos.numero_contrato,
      datos.cliente_id,
      datos.fecha_inicio,
      datos.fecha_fin_estimada,
      datos.dias_totales,
      datos.tipo_arriendo,
      datos.modalidad,
      'borrador',
      datos.lugar_entrega || null,
      datos.direccion_entrega || null,
      datos.lugar_devolucion || null,
      datos.requiere_transporte,
      datos.costo_transporte || 0,
      datos.requiere_operador,
      datos.costo_operador || 0,
      datos.garantia_deposito || 0,
      datos.subtotal,
      datos.descuento_porcentaje || 0,
      datos.descuento_monto || 0,
      datos.iva,
      datos.total,
      datos.observaciones || null,
      datos.condiciones_especiales || null
    ])

    const arriendoId = result.insertId

    for (const equipo of datos.equipos) {
      await db.query(`
        INSERT INTO detalle_arriendos (
          arriendo_id, equipo_id, cantidad, precio_unitario,
          unidad_tiempo, cantidad_tiempo, subtotal, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
      `, [
        arriendoId,
        equipo.equipo_id,
        equipo.cantidad,
        equipo.precio_unitario,
        equipo.unidad_tiempo,
        equipo.cantidad_tiempo,
        equipo.subtotal
      ])
    }

    return { id: arriendoId, mensaje: 'Arriendo creado correctamente' }
  } catch (error) {
    console.error('Error al crear arriendo:', error)
    throw error
  }
}