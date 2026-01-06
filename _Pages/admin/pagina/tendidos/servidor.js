"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

async function verificarSesion() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value
  
  if (!sessionToken) {
    throw new Error('No hay sesion activa')
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
    throw new Error('Sesion no valida')
  }
  
  return result[0]
}

export async function getPaginaArriendoEquipos() {
  try {
    await verificarSesion()

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
    throw error
  }
}

export async function updatePaginaArriendoEquipos(data) {
  try {
    await verificarSesion()

    const [existing] = await db.query('SELECT id FROM pagina_arriendoequipos WHERE activo = true LIMIT 1')

    if (existing && existing.length > 0) {
      await db.query(`
        UPDATE pagina_arriendoequipos SET
          hero_titulo = ?,
          hero_subtitulo = ?,
          hero_imagen_url = ?,
          tipo1_icono = ?,
          tipo1_titulo = ?,
          tipo1_desc = ?,
          tipo2_icono = ?,
          tipo2_titulo = ?,
          tipo2_desc = ?,
          catalogo_titulo = ?,
          catalogo_descripcion = ?,
          video_url = ?,
          video_poster_url = ?,
          caracteristica1_titulo = ?,
          caracteristica1_desc = ?,
          caracteristica2_titulo = ?,
          caracteristica2_desc = ?,
          caracteristica3_titulo = ?,
          caracteristica3_desc = ?,
          caracteristica4_titulo = ?,
          caracteristica4_desc = ?,
          ventaja1_titulo = ?,
          ventaja1_desc = ?,
          ventaja2_titulo = ?,
          ventaja2_desc = ?,
          ventaja3_titulo = ?,
          ventaja3_desc = ?,
          ventaja4_titulo = ?,
          ventaja4_desc = ?,
          fecha_actualizacion = NOW()
        WHERE id = ?
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.tipo1_icono?.trim() || null,
        data.tipo1_titulo?.trim() || null,
        data.tipo1_desc?.trim() || null,
        data.tipo2_icono?.trim() || null,
        data.tipo2_titulo?.trim() || null,
        data.tipo2_desc?.trim() || null,
        data.catalogo_titulo?.trim() || null,
        data.catalogo_descripcion?.trim() || null,
        data.video_url || null,
        data.video_poster_url || null,
        data.caracteristica1_titulo?.trim() || null,
        data.caracteristica1_desc?.trim() || null,
        data.caracteristica2_titulo?.trim() || null,
        data.caracteristica2_desc?.trim() || null,
        data.caracteristica3_titulo?.trim() || null,
        data.caracteristica3_desc?.trim() || null,
        data.caracteristica4_titulo?.trim() || null,
        data.caracteristica4_desc?.trim() || null,
        data.ventaja1_titulo?.trim() || null,
        data.ventaja1_desc?.trim() || null,
        data.ventaja2_titulo?.trim() || null,
        data.ventaja2_desc?.trim() || null,
        data.ventaja3_titulo?.trim() || null,
        data.ventaja3_desc?.trim() || null,
        data.ventaja4_titulo?.trim() || null,
        data.ventaja4_desc?.trim() || null,
        existing[0].id
      ])
    } else {
      await db.query(`
        INSERT INTO pagina_arriendoequipos (
          hero_titulo, hero_subtitulo, hero_imagen_url,
          tipo1_icono, tipo1_titulo, tipo1_desc,
          tipo2_icono, tipo2_titulo, tipo2_desc,
          catalogo_titulo, catalogo_descripcion,
          video_url, video_poster_url,
          caracteristica1_titulo, caracteristica1_desc,
          caracteristica2_titulo, caracteristica2_desc,
          caracteristica3_titulo, caracteristica3_desc,
          caracteristica4_titulo, caracteristica4_desc,
          ventaja1_titulo, ventaja1_desc,
          ventaja2_titulo, ventaja2_desc,
          ventaja3_titulo, ventaja3_desc,
          ventaja4_titulo, ventaja4_desc
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.tipo1_icono?.trim() || null,
        data.tipo1_titulo?.trim() || null,
        data.tipo1_desc?.trim() || null,
        data.tipo2_icono?.trim() || null,
        data.tipo2_titulo?.trim() || null,
        data.tipo2_desc?.trim() || null,
        data.catalogo_titulo?.trim() || null,
        data.catalogo_descripcion?.trim() || null,
        data.video_url || null,
        data.video_poster_url || null,
        data.caracteristica1_titulo?.trim() || null,
        data.caracteristica1_desc?.trim() || null,
        data.caracteristica2_titulo?.trim() || null,
        data.caracteristica2_desc?.trim() || null,
        data.caracteristica3_titulo?.trim() || null,
        data.caracteristica3_desc?.trim() || null,
        data.caracteristica4_titulo?.trim() || null,
        data.caracteristica4_desc?.trim() || null,
        data.ventaja1_titulo?.trim() || null,
        data.ventaja1_desc?.trim() || null,
        data.ventaja2_titulo?.trim() || null,
        data.ventaja2_desc?.trim() || null,
        data.ventaja3_titulo?.trim() || null,
        data.ventaja3_desc?.trim() || null,
        data.ventaja4_titulo?.trim() || null,
        data.ventaja4_desc?.trim() || null
      ])
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar página arriendo equipos:', error)
    return { success: false, message: error.message }
  }
}

export async function uploadImagenPagina(formData) {
  try {
    await verificarSesion()

    const imagen = formData.get('imagen')
    const campo = formData.get('campo')

    if (!imagen) {
      return { success: false, message: 'No se proporcionó ninguna imagen' }
    }

    if (imagen.size > 5 * 1024 * 1024) {
      return { success: false, message: 'La imagen no puede superar 5MB' }
    }

    if (!imagen.type.startsWith('image/')) {
      return { success: false, message: 'Solo se permiten archivos de imagen' }
    }

    const bytes = await imagen.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'paginas')
    await mkdir(uploadsDir, { recursive: true })

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = imagen.name.split('.').pop()
    const filename = `${campo}-${uniqueSuffix}.${extension}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/paginas/${filename}`

    return { success: true, url }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return { success: false, message: error.message }
  }
}

export async function getGaleriaImagenes() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        url,
        alt_text,
        categoria,
        destacado,
        fecha_subida
      FROM galeria 
      WHERE activo = true 
        AND tipo_contenido = 'imagen'
      ORDER BY fecha_subida DESC
    `)

    return result || []
  } catch (error) {
    console.error('Error al obtener galería:', error)
    return []
  }
}

export async function uploadImagenGaleria(formData) {
  try {
    await verificarSesion()

    const imagen = formData.get('imagen')
    const titulo = formData.get('titulo')
    const descripcion = formData.get('descripcion')
    const altText = formData.get('alt_text')
    const categoria = formData.get('categoria')

    if (!imagen) {
      return { success: false, message: 'No se proporcionó ninguna imagen' }
    }

    if (imagen.size > 5 * 1024 * 1024) {
      return { success: false, message: 'La imagen no puede superar 5MB' }
    }

    if (!imagen.type.startsWith('image/')) {
      return { success: false, message: 'Solo se permiten archivos de imagen' }
    }

    const bytes = await imagen.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'galeria')
    await mkdir(uploadsDir, { recursive: true })

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = imagen.name.split('.').pop()
    const filename = `galeria-${uniqueSuffix}.${extension}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/galeria/${filename}`

    await db.query(`
      INSERT INTO galeria (
        titulo, descripcion, url, alt_text, categoria, tipo_contenido, activo
      ) VALUES (?, ?, ?, ?, ?, 'imagen', true)
    `, [
      titulo || null,
      descripcion || null,
      url,
      altText || titulo || null,
      categoria || 'equipos'
    ])

    return { success: true, url }
  } catch (error) {
    console.error('Error al subir imagen a galería:', error)
    return { success: false, message: error.message }
  }
}

export async function deleteImagenGaleria(id) {
  try {
    await verificarSesion()

    const [result] = await db.query('SELECT url FROM galeria WHERE id = ?', [id])
    
    if (result && result.length > 0) {
      const imagenUrl = result[0].url
      const filepath = path.join(process.cwd(), 'public', imagenUrl)
      
      try {
        await unlink(filepath)
      } catch (error) {
        console.error('Error al eliminar archivo físico:', error)
      }
    }

    await db.query('DELETE FROM galeria WHERE id = ?', [id])

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    return { success: false, message: error.message }
  }
}