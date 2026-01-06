"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

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

export async function obtenerPaginaContacto() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        hero_titulo,
        hero_subtitulo,
        hero_imagen_url,
        info_titulo,
        info_descripcion,
        ubicacion_texto,
        mapa_url,
        cta_titulo,
        cta_descripcion,
        facebook_url,
        instagram_url,
        linkedin_url,
        whatsapp_url,
        activo,
        fecha_actualizacion
      FROM pagina_contacto
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      throw new Error('No se encontro la configuracion de la pagina de contacto')
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener pagina contacto:', error)
    throw error
  }
}

export async function actualizarPaginaContacto(datos) {
  try {
    await verificarSesion()

    const [paginaActual] = await db.query(
      'SELECT id FROM pagina_contacto WHERE activo = true LIMIT 1'
    )

    if (!paginaActual || paginaActual.length === 0) {
      throw new Error('No se encontro la configuracion de la pagina')
    }

    await db.query(`
      UPDATE pagina_contacto 
      SET 
        hero_titulo = ?,
        hero_subtitulo = ?,
        info_titulo = ?,
        info_descripcion = ?,
        ubicacion_texto = ?,
        mapa_url = ?,
        cta_titulo = ?,
        cta_descripcion = ?,
        facebook_url = ?,
        instagram_url = ?,
        linkedin_url = ?,
        whatsapp_url = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      datos.hero_titulo?.trim() || null,
      datos.hero_subtitulo?.trim() || null,
      datos.info_titulo?.trim() || null,
      datos.info_descripcion?.trim() || null,
      datos.ubicacion_texto?.trim() || null,
      datos.mapa_url?.trim() || null,
      datos.cta_titulo?.trim() || null,
      datos.cta_descripcion?.trim() || null,
      datos.facebook_url?.trim() || null,
      datos.instagram_url?.trim() || null,
      datos.linkedin_url?.trim() || null,
      datos.whatsapp_url?.trim() || null,
      paginaActual[0].id
    ])

    return { mensaje: 'Pagina actualizada correctamente' }
  } catch (error) {
    console.error('Error al actualizar pagina contacto:', error)
    throw error
  }
}

export async function subirImagenHero(formData) {
  try {
    await verificarSesion()
    const fs = require('fs').promises
    const path = require('path')

    const file = formData.get('imagen')
    if (!file) {
      throw new Error('No se proporciono un archivo')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo no puede superar los 5MB')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen')
    }

    const extension = file.name.split('.').pop()
    const fileName = `contacto-hero-${Date.now()}.${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'paginas')
    const filePath = path.join(uploadDir, fileName)

    await fs.mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const imagenUrl = `/uploads/paginas/${fileName}`

    const [paginaActual] = await db.query(
      'SELECT id, hero_imagen_url FROM pagina_contacto WHERE activo = true LIMIT 1'
    )

    if (!paginaActual || paginaActual.length === 0) {
      throw new Error('No se encontro la configuracion de la pagina')
    }

    if (paginaActual[0].hero_imagen_url) {
      const oldImagePath = path.join(process.cwd(), 'public', paginaActual[0].hero_imagen_url)
      try {
        await fs.unlink(oldImagePath)
      } catch (err) {
        console.error('Error al eliminar imagen anterior:', err)
      }
    }

    await db.query(
      'UPDATE pagina_contacto SET hero_imagen_url = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [imagenUrl, paginaActual[0].id]
    )

    return { mensaje: 'Imagen actualizada correctamente', imagenUrl }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    throw error
  }
}