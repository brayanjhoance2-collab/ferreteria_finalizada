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

export async function obtenerTerminos() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        clave,
        valor
      FROM configuracion_sistema
      WHERE clave IN ('terminos_version', 'terminos_fecha_vigencia', 'terminos_activo', 'terminos_contenido')
    `)

    const config = {}
    
    if (result && result.length > 0) {
      result.forEach(item => {
        config[item.clave] = item.valor
      })
    }

    return {
      contenido: config.terminos_contenido || '',
      version: config.terminos_version || '1.0',
      fecha_vigencia: config.terminos_fecha_vigencia || new Date().toISOString().split('T')[0],
      activo: config.terminos_activo === 'true' || config.terminos_activo === true
    }
  } catch (error) {
    console.error('Error al obtener terminos:', error)
    throw new Error('Error al obtener los términos: ' + error.message)
  }
}

export async function actualizarTerminos(datos) {
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
      { clave: 'terminos_contenido', valor: datos.contenido.trim(), tipo: 'texto', descripcion: 'Contenido de términos y condiciones', grupo: 'legal' },
      { clave: 'terminos_version', valor: datos.version.trim(), tipo: 'texto', descripcion: 'Versión de términos y condiciones', grupo: 'legal' },
      { clave: 'terminos_fecha_vigencia', valor: datos.fecha_vigencia, tipo: 'texto', descripcion: 'Fecha de vigencia de términos', grupo: 'legal' },
      { clave: 'terminos_activo', valor: datos.activo ? 'true' : 'false', tipo: 'boolean', descripcion: 'Estado de términos y condiciones', grupo: 'legal' }
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

    return { mensaje: 'Términos y condiciones actualizados correctamente' }
  } catch (error) {
    console.error('Error al actualizar terminos:', error)
    throw error
  }
}

export async function obtenerTerminosPublico() {
  try {
    const [result] = await db.query(`
      SELECT 
        clave,
        valor as contenido
      FROM configuracion_sistema
      WHERE clave IN ('terminos_version', 'terminos_fecha_vigencia', 'terminos_activo', 'terminos_contenido')
    `)

    if (!result || result.length === 0) {
      return null
    }

    const config = result.reduce((acc, item) => {
      acc[item.clave] = item.valor
      return acc
    }, {})

    if (config.terminos_activo !== 'true') {
      return null
    }

    return {
      contenido: config.terminos_contenido || '',
      version: config.terminos_version || '1.0',
      fecha_vigencia: config.terminos_fecha_vigencia || new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Error al obtener terminos publico:', error)
    return null
  }
}