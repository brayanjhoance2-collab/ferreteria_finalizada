"use server"

import db from "@/_DB/db"

export async function getPaginaArriendoEquipos() {
  try {
    const [result] = await db.query(`
      SELECT * FROM pagina_arriendoequipos 
      WHERE activo = true 
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener página arriendo equipos:', error)
    return null
  }
}

export async function getCatalogos() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        archivo_url,
        tipo_archivo
      FROM catalogos 
      WHERE activo = true 
        AND destacado = true
      ORDER BY fecha_actualizacion DESC
      LIMIT 3
    `)

    return result || []
  } catch (error) {
    console.error('Error al obtener catálogos:', error)
    return []
  }
}

export async function getGaleriaTendidos() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        url,
        alt_text,
        categoria,
        fecha_subida
      FROM galeria 
      WHERE activo = true 
        AND tipo_contenido = 'imagen'
      ORDER BY fecha_subida DESC
    `)

    return result || []
  } catch (error) {
    console.error('Error al obtener galería de tendidos:', error)
    return []
  }
}