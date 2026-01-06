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

export async function obtenerPrivacidad() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        clave,
        valor
      FROM configuracion_sistema
      WHERE clave IN ('privacidad_version', 'privacidad_fecha_vigencia', 'privacidad_activo', 'privacidad_contenido')
    `)

    const config = {}
    
    if (result && result.length > 0) {
      result.forEach(item => {
        config[item.clave] = item.valor
      })
    }

    return {
      contenido: config.privacidad_contenido || '',
      version: config.privacidad_version || '1.0',
      fecha_vigencia: config.privacidad_fecha_vigencia || new Date().toISOString().split('T')[0],
      activo: config.privacidad_activo === 'true' || config.privacidad_activo === true
    }
  } catch (error) {
    console.error('Error al obtener privacidad:', error)
    throw new Error('Error al obtener la privacidad: ' + error.message)
  }
}

export async function actualizarPrivacidad(datos) {
  try {
    await verificarSesion()

    if (!datos.contenido || !datos.contenido.trim()) {
      throw new Error('El contenido no puede estar vacío')
    }

    if (!datos.version || !datos.version.trim()) {
      throw new Error('La versión es requerida')
    }

    if (!datos.fecha_vigencia) {
      throw new Error('La fecha de vigencia es requerida')
    }

    const configs = [
      { clave: 'privacidad_contenido', valor: datos.contenido.trim(), tipo: 'texto', descripcion: 'Contenido de política de privacidad', grupo: 'legal' },
      { clave: 'privacidad_version', valor: datos.version.trim(), tipo: 'texto', descripcion: 'Versión de política de privacidad', grupo: 'legal' },
      { clave: 'privacidad_fecha_vigencia', valor: datos.fecha_vigencia, tipo: 'texto', descripcion: 'Fecha de vigencia de privacidad', grupo: 'legal' },
      { clave: 'privacidad_activo', valor: datos.activo ? 'true' : 'false', tipo: 'boolean', descripcion: 'Estado de política de privacidad', grupo: 'legal' }
    ]

    for (const config of configs) {
      const [existe] = await db.query(
        'SELECT id FROM configuracion_sistema WHERE clave = ?',
        [config.clave]
      )

      if (existe && existe.length > 0) {
        await db.query(`
          UPDATE configuracion_sistema 
          SET valor = ?, fecha_actualizacion = NOW()
          WHERE clave = ?
        `, [config.valor, config.clave])
      } else {
        await db.query(`
          INSERT INTO configuracion_sistema 
          (clave, valor, tipo, descripcion, grupo)
          VALUES (?, ?, ?, ?, ?)
        `, [config.clave, config.valor, config.tipo, config.descripcion, config.grupo])
      }
    }

    return { mensaje: 'Política de privacidad actualizada correctamente' }
  } catch (error) {
    console.error('Error al actualizar privacidad:', error)
    throw error
  }
}

export async function obtenerPrivacidadPublico() {
  try {
    const [result] = await db.query(`
      SELECT 
        clave,
        valor
      FROM configuracion_sistema
      WHERE clave IN ('privacidad_version', 'privacidad_fecha_vigencia', 'privacidad_activo', 'privacidad_contenido')
    `)

    if (!result || result.length === 0) {
      return null
    }

    const config = {}
    result.forEach(item => {
      config[item.clave] = item.valor
    })

    if (config.privacidad_activo !== 'true') {
      return null
    }

    return {
      contenido: config.privacidad_contenido || '',
      version: config.privacidad_version || '1.0',
      fecha_vigencia: config.privacidad_fecha_vigencia || new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Error al obtener privacidad publico:', error)
    return null
  }
}