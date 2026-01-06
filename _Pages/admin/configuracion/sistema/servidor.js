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

export async function obtenerConfiguraciones() {
  try {
    await verificarSesion()

    const [configuraciones] = await db.query(`
      SELECT 
        id,
        clave,
        valor,
        tipo,
        descripcion,
        grupo,
        fecha_actualizacion
      FROM configuracion_sistema
      ORDER BY grupo ASC, clave ASC
    `)

    return configuraciones || []
  } catch (error) {
    console.error('Error al obtener configuraciones:', error)
    throw new Error('Error al obtener las configuraciones: ' + error.message)
  }
}

export async function obtenerGrupos() {
  try {
    await verificarSesion()

    const [grupos] = await db.query(`
      SELECT DISTINCT grupo 
      FROM configuracion_sistema 
      WHERE grupo IS NOT NULL AND grupo != ''
      ORDER BY grupo ASC
    `)

    return grupos.map(g => g.grupo)
  } catch (error) {
    console.error('Error al obtener grupos:', error)
    throw new Error('Error al obtener los grupos: ' + error.message)
  }
}

export async function crearConfiguracion(datos) {
  try {
    const usuario = await verificarSesion()

    const clave = datos.clave.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_')

    const [existe] = await db.query(
      'SELECT id FROM configuracion_sistema WHERE clave = ?',
      [clave]
    )

    if (existe && existe.length > 0) {
      throw new Error('Ya existe una configuración con esa clave')
    }

    let valorFinal = datos.valor.trim()
    
    if (datos.tipo === 'json') {
      try {
        JSON.parse(valorFinal)
      } catch (e) {
        throw new Error('El valor JSON no es válido')
      }
    }

    if (datos.tipo === 'numero') {
      if (isNaN(valorFinal)) {
        throw new Error('El valor debe ser un número válido')
      }
    }

    if (datos.tipo === 'boolean') {
      if (valorFinal !== 'true' && valorFinal !== 'false') {
        throw new Error('El valor debe ser true o false')
      }
    }

    await db.query(`
      INSERT INTO configuracion_sistema 
      (clave, valor, tipo, descripcion, grupo)
      VALUES (?, ?, ?, ?, ?)
    `, [
      clave,
      valorFinal,
      datos.tipo,
      datos.descripcion || null,
      datos.grupo || null
    ])

    return { mensaje: 'Configuración creada correctamente' }
  } catch (error) {
    console.error('Error al crear configuracion:', error)
    throw error
  }
}

export async function actualizarConfiguracion(id, datos) {
  try {
    await verificarSesion()

    const [existe] = await db.query(
      'SELECT id FROM configuracion_sistema WHERE id = ?',
      [id]
    )

    if (!existe || existe.length === 0) {
      throw new Error('Configuración no encontrada')
    }

    let valorFinal = datos.valor.trim()
    
    if (datos.tipo === 'json') {
      try {
        JSON.parse(valorFinal)
      } catch (e) {
        throw new Error('El valor JSON no es válido')
      }
    }

    if (datos.tipo === 'numero') {
      if (isNaN(valorFinal)) {
        throw new Error('El valor debe ser un número válido')
      }
    }

    if (datos.tipo === 'boolean') {
      if (valorFinal !== 'true' && valorFinal !== 'false') {
        throw new Error('El valor debe ser true o false')
      }
    }

    await db.query(`
      UPDATE configuracion_sistema 
      SET 
        valor = ?,
        tipo = ?,
        descripcion = ?,
        grupo = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      valorFinal,
      datos.tipo,
      datos.descripcion || null,
      datos.grupo || null,
      id
    ])

    return { mensaje: 'Configuración actualizada correctamente' }
  } catch (error) {
    console.error('Error al actualizar configuracion:', error)
    throw error
  }
}

export async function eliminarConfiguracion(id) {
  try {
    await verificarSesion()

    const [existe] = await db.query(
      'SELECT clave FROM configuracion_sistema WHERE id = ?',
      [id]
    )

    if (!existe || existe.length === 0) {
      throw new Error('Configuración no encontrada')
    }

    await db.query('DELETE FROM configuracion_sistema WHERE id = ?', [id])

    return { mensaje: 'Configuración eliminada correctamente' }
  } catch (error) {
    console.error('Error al eliminar configuracion:', error)
    throw error
  }
}

export async function obtenerConfiguracionPorClave(clave) {
  try {
    await verificarSesion()

    const [config] = await db.query(
      'SELECT * FROM configuracion_sistema WHERE clave = ? LIMIT 1',
      [clave]
    )

    if (!config || config.length === 0) {
      return null
    }

    return config[0]
  } catch (error) {
    console.error('Error al obtener configuracion:', error)
    throw new Error('Error al obtener la configuración')
  }
}