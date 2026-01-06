"use server"

import db from "@/_DB/db"

export async function getPaginaCertificaciones() {
  try {
    const [result] = await db.query(`
      SELECT * FROM pagina_certificaciones 
      WHERE activo = true 
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener página certificaciones:', error)
    return null
  }
}

export async function getProgramasCertificacion() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        codigo,
        nombre,
        slug,
        descripcion,
        descripcion_corta,
        tipo,
        nivel,
        duracion_horas,
        duracion_dias,
        costo,
        imagen_url,
        destacado
      FROM programas_certificacion 
      WHERE activo = true
      ORDER BY destacado DESC, orden ASC
    `)

    if (!result || result.length === 0) {
      return []
    }

    return result
  } catch (error) {
    console.error('Error al obtener programas:', error)
    return []
  }
}