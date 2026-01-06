"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

async function verificarSesion() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value
  
  if (!sessionToken) {
    throw new Error('No hay sesión activa')
  }
  
  const [result] = await db.query(`
    SELECT 
      s.usuario_id,
      u.username,
      u.email,
      u.nombre_completo,
      u.rol,
      u.activo
    FROM sesiones_usuarios s
    INNER JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.token = ? AND s.activa = true AND u.activo = true
    LIMIT 1
  `, [sessionToken])
  
  if (!result || result.length === 0) {
    throw new Error('Sesión no válida')
  }
  
  return result[0]
}

export async function obtenerTablas() {
  try {
    await verificarSesion()

    const [tablas] = await db.query(`
      SELECT DISTINCT tabla 
      FROM auditoria 
      WHERE tabla IS NOT NULL 
      ORDER BY tabla ASC
    `)

    return tablas.map(t => t.tabla)
  } catch (error) {
    console.error('Error al obtener tablas:', error)
    throw new Error('Error al obtener las tablas: ' + error.message)
  }
}

export async function obtenerUsuarios() {
  try {
    await verificarSesion()

    const [usuarios] = await db.query(`
      SELECT 
        u.id,
        u.nombre_completo,
        u.email,
        COUNT(a.id) as total_acciones
      FROM usuarios u
      LEFT JOIN auditoria a ON a.usuario_id = u.id
      WHERE u.activo = true
      GROUP BY u.id, u.nombre_completo, u.email
      ORDER BY u.nombre_completo ASC
    `)

    return usuarios || []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw new Error('Error al obtener los usuarios: ' + error.message)
  }
}

export async function obtenerAuditorias(filtros = {}) {
  try {
    await verificarSesion()

    const {
      tabla = '',
      accion = '',
      usuario_id = '',
      fecha_desde = '',
      fecha_hasta = '',
      buscar = '',
      pagina = 1,
      limite = 50
    } = filtros

    let whereConditions = []
    let params = []

    if (tabla) {
      whereConditions.push('a.tabla = ?')
      params.push(tabla)
    }

    if (accion) {
      whereConditions.push('a.accion = ?')
      params.push(accion)
    }

    if (usuario_id) {
      whereConditions.push('a.usuario_id = ?')
      params.push(parseInt(usuario_id))
    }

    if (fecha_desde) {
      whereConditions.push('DATE(a.fecha) >= ?')
      params.push(fecha_desde)
    }

    if (fecha_hasta) {
      whereConditions.push('DATE(a.fecha) <= ?')
      params.push(fecha_hasta)
    }

    if (buscar) {
      whereConditions.push('a.registro_id = ?')
      params.push(parseInt(buscar))
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : ''

    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM auditoria a ${whereClause}`,
      params
    )

    const total = totalResult[0]?.total || 0
    const totalPaginas = Math.ceil(total / limite)
    const offset = (pagina - 1) * limite

    const [auditorias] = await db.query(`
      SELECT 
        a.id,
        a.tabla,
        a.registro_id,
        a.accion,
        a.datos_anteriores,
        a.datos_nuevos,
        a.usuario_id,
        a.ip_address,
        a.fecha,
        u.nombre_completo as usuario_nombre,
        u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuarios u ON u.id = a.usuario_id
      ${whereClause}
      ORDER BY a.fecha DESC, a.id DESC
      LIMIT ? OFFSET ?
    `, [...params, limite, offset])

    const registros = (auditorias || []).map(registro => {
      let datosAnteriores = null
      let datosNuevos = null

      try {
        if (registro.datos_anteriores) {
          if (typeof registro.datos_anteriores === 'string') {
            datosAnteriores = JSON.parse(registro.datos_anteriores)
          } else {
            datosAnteriores = registro.datos_anteriores
          }
        }
      } catch (e) {
        console.error('Error parseando datos_anteriores:', e)
      }

      try {
        if (registro.datos_nuevos) {
          if (typeof registro.datos_nuevos === 'string') {
            datosNuevos = JSON.parse(registro.datos_nuevos)
          } else {
            datosNuevos = registro.datos_nuevos
          }
        }
      } catch (e) {
        console.error('Error parseando datos_nuevos:', e)
      }

      return {
        id: registro.id,
        tabla: registro.tabla,
        registro_id: registro.registro_id,
        accion: registro.accion,
        datos_anteriores: datosAnteriores,
        datos_nuevos: datosNuevos,
        usuario_id: registro.usuario_id,
        usuario_nombre: registro.usuario_nombre,
        usuario_email: registro.usuario_email,
        ip_address: registro.ip_address,
        fecha: registro.fecha
      }
    })

    return {
      registros,
      total,
      totalPaginas,
      paginaActual: pagina
    }
  } catch (error) {
    console.error('Error al obtener auditorias:', error)
    throw new Error('Error al obtener las auditorías: ' + error.message)
  }
}

export async function exportarAuditorias(filtros = {}) {
  try {
    await verificarSesion()

    const XLSX = require('xlsx')

    const {
      tabla = '',
      accion = '',
      usuario_id = '',
      fecha_desde = '',
      fecha_hasta = '',
      buscar = ''
    } = filtros

    let whereConditions = []
    let params = []

    if (tabla) {
      whereConditions.push('a.tabla = ?')
      params.push(tabla)
    }

    if (accion) {
      whereConditions.push('a.accion = ?')
      params.push(accion)
    }

    if (usuario_id) {
      whereConditions.push('a.usuario_id = ?')
      params.push(parseInt(usuario_id))
    }

    if (fecha_desde) {
      whereConditions.push('DATE(a.fecha) >= ?')
      params.push(fecha_desde)
    }

    if (fecha_hasta) {
      whereConditions.push('DATE(a.fecha) <= ?')
      params.push(fecha_hasta)
    }

    if (buscar) {
      whereConditions.push('a.registro_id = ?')
      params.push(parseInt(buscar))
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : ''

    const [auditorias] = await db.query(`
      SELECT 
        a.id,
        a.tabla,
        a.registro_id,
        a.accion,
        a.datos_anteriores,
        a.datos_nuevos,
        a.usuario_id,
        u.nombre_completo as usuario_nombre,
        u.email as usuario_email,
        a.ip_address,
        a.fecha
      FROM auditoria a
      LEFT JOIN usuarios u ON u.id = a.usuario_id
      ${whereClause}
      ORDER BY a.fecha DESC, a.id DESC
      LIMIT 10000
    `, params)

    if (!auditorias || auditorias.length === 0) {
      throw new Error('No hay datos para exportar')
    }

    const datos = auditorias.map(registro => {
      let datosAnteriores = ''
      let datosNuevos = ''

      try {
        if (registro.datos_anteriores) {
          const datos = typeof registro.datos_anteriores === 'string' 
            ? JSON.parse(registro.datos_anteriores) 
            : registro.datos_anteriores
          datosAnteriores = JSON.stringify(datos, null, 2)
        }
      } catch (e) {
        datosAnteriores = ''
      }

      try {
        if (registro.datos_nuevos) {
          const datos = typeof registro.datos_nuevos === 'string' 
            ? JSON.parse(registro.datos_nuevos) 
            : registro.datos_nuevos
          datosNuevos = JSON.stringify(datos, null, 2)
        }
      } catch (e) {
        datosNuevos = ''
      }

      return {
        'ID': registro.id,
        'Fecha y Hora': registro.fecha ? new Date(registro.fecha).toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) : '',
        'Tabla': registro.tabla || '',
        'Registro ID': registro.registro_id || '',
        'Accion': registro.accion || '',
        'Usuario': registro.usuario_nombre || 'Sistema',
        'Email': registro.usuario_email || '',
        'IP': registro.ip_address || '',
        'Datos Anteriores': datosAnteriores,
        'Datos Nuevos': datosNuevos
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(datos)
    
    const colWidths = [
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 40 },
      { wch: 40 }
    ]
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria')

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const base64 = excelBuffer.toString('base64')

    return {
      excel: base64,
      total: auditorias.length,
      mensaje: 'Auditoría exportada correctamente'
    }
  } catch (error) {
    console.error('Error al exportar auditorias:', error)
    throw error
  }
}

export async function registrarAuditoria(tabla, registroId, accion, datosAnteriores, datosNuevos) {
  try {
    const usuario = await verificarSesion()

    await db.query(`
      INSERT INTO auditoria 
      (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, fecha)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      tabla,
      registroId,
      accion,
      datosAnteriores ? JSON.stringify(datosAnteriores) : null,
      datosNuevos ? JSON.stringify(datosNuevos) : null,
      usuario.usuario_id
    ])

    return { mensaje: 'Auditoría registrada correctamente' }
  } catch (error) {
    console.error('Error al registrar auditoria:', error)
    throw new Error('Error al registrar la auditoría')
  }
}

export async function obtenerEstadisticasAuditoria(dias = 30) {
  try {
    await verificarSesion()

    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(CASE WHEN accion = 'INSERT' THEN 1 ELSE 0 END) as total_inserts,
        SUM(CASE WHEN accion = 'UPDATE' THEN 1 ELSE 0 END) as total_updates,
        SUM(CASE WHEN accion = 'DELETE' THEN 1 ELSE 0 END) as total_deletes,
        COUNT(DISTINCT tabla) as total_tablas,
        COUNT(DISTINCT usuario_id) as total_usuarios
      FROM auditoria
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [dias])

    const [porTabla] = await db.query(`
      SELECT 
        tabla,
        COUNT(*) as cantidad,
        COUNT(DISTINCT DATE(fecha)) as dias_activos
      FROM auditoria
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY tabla
      ORDER BY cantidad DESC
      LIMIT 10
    `, [dias])

    const [porUsuario] = await db.query(`
      SELECT 
        u.nombre_completo,
        u.email,
        COUNT(a.id) as cantidad,
        MAX(a.fecha) as ultima_accion
      FROM auditoria a
      LEFT JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.id, u.nombre_completo, u.email
      ORDER BY cantidad DESC
      LIMIT 10
    `, [dias])

    return {
      general: estadisticas[0] || {},
      porTabla: porTabla || [],
      porUsuario: porUsuario || []
    }
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    throw new Error('Error al obtener las estadísticas')
  }
}