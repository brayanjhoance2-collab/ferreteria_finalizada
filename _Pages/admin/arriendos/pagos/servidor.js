"use server"

import db from "@/_DB/db"

export async function generarNumeroPago() {
  try {
    const anioActual = new Date().getFullYear()
    const mesActual = String(new Date().getMonth() + 1).padStart(2, '0')
    const prefijo = `PAG-${anioActual}${mesActual}-`
    
    const [resultado] = await db.query(`
      SELECT numero_pago 
      FROM pagos_arriendos 
      WHERE numero_pago LIKE ?
      ORDER BY numero_pago DESC 
      LIMIT 1
    `, [`${prefijo}%`])

    let nuevoNumero = 1

    if (resultado && resultado.length > 0) {
      const ultimoNumero = resultado[0].numero_pago
      const partes = ultimoNumero.split('-')
      const numero = parseInt(partes[partes.length - 1])
      if (!isNaN(numero)) {
        nuevoNumero = numero + 1
      }
    }

    const numeroFormateado = String(nuevoNumero).padStart(4, '0')
    return `${prefijo}${numeroFormateado}`
  } catch (error) {
    console.error('Error al generar número:', error)
    throw new Error('Error al generar número de pago')
  }
}

export async function obtenerPagos() {
  try {
    const [pagos] = await db.query(`
      SELECT 
        p.*,
        a.numero_contrato,
        c.nombre as cliente_nombre
      FROM pagos_arriendos p
      INNER JOIN arriendos a ON p.arriendo_id = a.id
      INNER JOIN clientes c ON a.cliente_id = c.id
      ORDER BY p.fecha_creacion DESC
    `)

    return pagos || []
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    throw new Error('Error al obtener los pagos')
  }
}

export async function obtenerArriendos() {
  try {
    const [arriendos] = await db.query(`
      SELECT 
        a.id,
        a.numero_contrato,
        c.nombre as cliente_nombre
      FROM arriendos a
      INNER JOIN clientes c ON a.cliente_id = c.id
      WHERE a.estado IN ('aprobado', 'activo')
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
    const [confirmados] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(monto), 0) as monto_total
      FROM pagos_arriendos
      WHERE estado = 'confirmado'
    `)

    const [pendientes] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(monto), 0) as monto_total
      FROM pagos_arriendos
      WHERE estado = 'pendiente'
    `)

    const [totalMes] = await db.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pagos_arriendos
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
      AND estado IN ('recibido', 'confirmado')
    `)

    const [totalGeneral] = await db.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pagos_arriendos
      WHERE estado IN ('recibido', 'confirmado')
    `)

    return {
      confirmados: confirmados[0].total,
      total_confirmados: parseFloat(confirmados[0].monto_total),
      pendientes: pendientes[0].total,
      total_pendientes: parseFloat(pendientes[0].monto_total),
      total_mes: parseFloat(totalMes[0].total),
      total_general: parseFloat(totalGeneral[0].total)
    }
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    return {
      confirmados: 0,
      total_confirmados: 0,
      pendientes: 0,
      total_pendientes: 0,
      total_mes: 0,
      total_general: 0
    }
  }
}

export async function registrarPago(datos) {
  try {
    const numeroPago = await generarNumeroPago()

    const [result] = await db.query(`
      INSERT INTO pagos_arriendos (
        arriendo_id, numero_pago, tipo_pago, monto, metodo_pago,
        estado, fecha_programada, fecha_pago, numero_documento,
        banco, observaciones, fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      datos.arriendo_id,
      numeroPago,
      datos.tipo_pago,
      datos.monto,
      datos.metodo_pago,
      datos.fecha_pago ? 'recibido' : 'pendiente',
      datos.fecha_programada || null,
      datos.fecha_pago ? `${datos.fecha_pago} ${new Date().toTimeString().split(' ')[0]}` : null,
      datos.numero_documento || null,
      datos.banco || null,
      datos.observaciones || null
    ])

    return { id: result.insertId, mensaje: 'Pago registrado correctamente' }
  } catch (error) {
    console.error('Error al registrar pago:', error)
    throw error
  }
}

export async function actualizarPago(id, datos) {
  try {
    let nuevoEstado = datos.fecha_pago ? 'recibido' : 'pendiente'

    await db.query(`
      UPDATE pagos_arriendos 
      SET 
        tipo_pago = ?,
        monto = ?,
        metodo_pago = ?,
        estado = ?,
        fecha_programada = ?,
        fecha_pago = ?,
        numero_documento = ?,
        banco = ?,
        observaciones = ?
      WHERE id = ?
    `, [
      datos.tipo_pago,
      datos.monto,
      datos.metodo_pago,
      nuevoEstado,
      datos.fecha_programada || null,
      datos.fecha_pago ? `${datos.fecha_pago} ${new Date().toTimeString().split(' ')[0]}` : null,
      datos.numero_documento || null,
      datos.banco || null,
      datos.observaciones || null,
      id
    ])

    return { mensaje: 'Pago actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar pago:', error)
    throw error
  }
}

export async function eliminarPago(id) {
  try {
    const [pago] = await db.query(
      'SELECT estado FROM pagos_arriendos WHERE id = ?',
      [id]
    )

    if (!pago || pago.length === 0) {
      throw new Error('Pago no encontrado')
    }

    if (pago[0].estado === 'confirmado') {
      throw new Error('No se puede eliminar un pago confirmado')
    }

    await db.query('DELETE FROM pagos_arriendos WHERE id = ?', [id])

    return { mensaje: 'Pago eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar pago:', error)
    throw error
  }
}