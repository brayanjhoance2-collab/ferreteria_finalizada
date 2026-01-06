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

export async function obtenerContactos(filtros = {}) {
  try {
    await verificarSesion()

    const {
      estado = '',
      tipo_consulta = '',
      buscar = '',
      pagina = 1,
      limite = 20
    } = filtros

    let whereConditions = []
    let params = []

    if (estado) {
      whereConditions.push('estado = ?')
      params.push(estado)
    }

    if (tipo_consulta) {
      whereConditions.push('tipo_consulta = ?')
      params.push(tipo_consulta)
    }

    if (buscar) {
      whereConditions.push('(nombre LIKE ? OR email LIKE ? OR asunto LIKE ?)')
      const busqueda = `%${buscar}%`
      params.push(busqueda, busqueda, busqueda)
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : ''

    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM formulario_contacto ${whereClause}`,
      params
    )

    const total = totalResult[0]?.total || 0
    const totalPaginas = Math.ceil(total / limite)
    const offset = (pagina - 1) * limite

    const [contactos] = await db.query(`
      SELECT 
        id,
        nombre,
        email,
        telefono,
        empresa,
        asunto,
        mensaje,
        tipo_consulta,
        origen,
        estado,
        prioridad,
        fecha_envio,
        fecha_primera_respuesta,
        fecha_cierre,
        asignado_a,
        respuesta
      FROM formulario_contacto
      ${whereClause}
      ORDER BY 
        CASE WHEN estado = 'nuevo' THEN 0 ELSE 1 END,
        fecha_envio DESC
      LIMIT ? OFFSET ?
    `, [...params, limite, offset])

    return {
      registros: contactos || [],
      total,
      totalPaginas,
      paginaActual: pagina
    }
  } catch (error) {
    console.error('Error al obtener contactos:', error)
    throw new Error('Error al obtener los contactos: ' + error.message)
  }
}

export async function obtenerContacto(id) {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        email,
        telefono,
        empresa,
        asunto,
        mensaje,
        tipo_consulta,
        origen,
        estado,
        prioridad,
        ip_address,
        user_agent,
        fecha_envio,
        fecha_primera_respuesta,
        fecha_cierre,
        asignado_a,
        respuesta,
        notas_internas
      FROM formulario_contacto
      WHERE id = ?
    `, [id])

    if (!result || result.length === 0) {
      throw new Error('Contacto no encontrado')
    }

    if (result[0].estado === 'nuevo') {
      await db.query(`
        UPDATE formulario_contacto 
        SET estado = 'en_revision'
        WHERE id = ?
      `, [id])
      result[0].estado = 'en_revision'
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener contacto:', error)
    throw error
  }
}

export async function actualizarContacto(id, datos) {
  try {
    await verificarSesion()

    const campos = []
    const valores = []

    if (datos.estado !== undefined) {
      campos.push('estado = ?')
      valores.push(datos.estado)
      
      if (datos.estado === 'cerrado' && !datos.fecha_cierre) {
        campos.push('fecha_cierre = NOW()')
      }
    }

    if (datos.prioridad !== undefined) {
      campos.push('prioridad = ?')
      valores.push(datos.prioridad)
    }

    if (datos.asignado_a !== undefined) {
      campos.push('asignado_a = ?')
      valores.push(datos.asignado_a)
    }

    if (datos.notas_internas !== undefined) {
      campos.push('notas_internas = ?')
      valores.push(datos.notas_internas)
    }

    if (campos.length === 0) {
      throw new Error('No hay datos para actualizar')
    }

    valores.push(id)

    await db.query(`
      UPDATE formulario_contacto 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores)

    return { mensaje: 'Contacto actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar contacto:', error)
    throw error
  }
}

export async function responderContacto(id, respuesta) {
  try {
    const usuario = await verificarSesion()

    if (!respuesta || !respuesta.trim()) {
      throw new Error('La respuesta no puede estar vacía')
    }

    const [contacto] = await db.query(
      'SELECT nombre, email, asunto FROM formulario_contacto WHERE id = ?',
      [id]
    )

    if (!contacto || contacto.length === 0) {
      throw new Error('Contacto no encontrado')
    }

    await db.query(`
      UPDATE formulario_contacto 
      SET 
        respuesta = ?,
        estado = 'respondido',
        fecha_primera_respuesta = NOW(),
        asignado_a = ?
      WHERE id = ?
    `, [respuesta.trim(), usuario.nombre_completo, id])

    return { mensaje: 'Respuesta enviada correctamente' }
  } catch (error) {
    console.error('Error al responder contacto:', error)
    throw error
  }
}

export async function eliminarContacto(id) {
  try {
    await verificarSesion()

    const [existe] = await db.query(
      'SELECT id FROM formulario_contacto WHERE id = ?',
      [id]
    )

    if (!existe || existe.length === 0) {
      throw new Error('Contacto no encontrado')
    }

    await db.query('DELETE FROM formulario_contacto WHERE id = ?', [id])

    return { mensaje: 'Contacto eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    throw error
  }
}

export async function crearContactoPublico(datos) {
  try {
    if (!datos.nombre || !datos.email || !datos.asunto || !datos.mensaje) {
      throw new Error('Todos los campos son requeridos')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datos.email)) {
      throw new Error('Email no válido')
    }

    await db.query(`
      INSERT INTO formulario_contacto 
      (nombre, email, telefono, empresa, asunto, mensaje, tipo_consulta, origen, estado, prioridad, ip_address, user_agent, fecha_envio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'nuevo', 'media', ?, ?, NOW())
    `, [
      datos.nombre,
      datos.email,
      datos.telefono || null,
      datos.empresa || null,
      datos.asunto,
      datos.mensaje,
      datos.tipo_consulta || 'general',
      datos.origen || 'web',
      datos.ip_address || null,
      datos.user_agent || null
    ])

    return { mensaje: 'Mensaje enviado correctamente' }
  } catch (error) {
    console.error('Error al crear contacto:', error)
    throw error
  }
}