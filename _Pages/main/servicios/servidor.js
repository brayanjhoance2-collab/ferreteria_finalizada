"use server"

import db from "@/_DB/db"

export async function getPaginaServicioTecnico() {
  try {
    const [result] = await db.query(`
      SELECT * FROM pagina_serviciotecnico 
      WHERE activo = true 
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener página servicio técnico:', error)
    return null
  }
}

export async function getTiposServicio() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        slug,
        descripcion,
        descripcion_corta,
        icono,
        tiempo_estimado_horas,
        precio_base,
        orden
      FROM tipos_servicio 
      WHERE activo = true
      ORDER BY orden ASC
    `)

    if (!result || result.length === 0) {
      return []
    }

    return result
  } catch (error) {
    console.error('Error al obtener tipos de servicio:', error)
    return []
  }
}

export async function getGaleriaServicios() {
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
        AND categoria IN ('taller', 'proyectos', 'instalaciones')
      ORDER BY fecha_subida DESC
      LIMIT 12
    `)

    return result || []
  } catch (error) {
    console.error('Error al obtener galería de servicios:', error)
    return []
  }
}