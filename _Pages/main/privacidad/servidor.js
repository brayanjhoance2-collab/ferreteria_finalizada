"use server"

import db from "@/_DB/db"

export async function getPoliticaPrivacidad() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        version,
        contenido,
        fecha_vigencia,
        activo,
        fecha_creacion,
        fecha_actualizacion
      FROM politica_privacidad 
      WHERE activo = true
      ORDER BY fecha_vigencia DESC
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        id: 1,
        version: '1.0',
        contenido: 'Política de privacidad',
        fecha_vigencia: new Date(),
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener política de privacidad:', error)
    return {
      id: 1,
      version: '1.0',
      contenido: 'Política de privacidad',
      fecha_vigencia: new Date(),
      activo: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    }
  }
}