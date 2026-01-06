"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
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

export async function getPaginaServicioTecnico() {
  try {
    await verificarSesion()

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
    throw error
  }
}

export async function updatePaginaServicioTecnico(data) {
  try {
    await verificarSesion()

    const [existing] = await db.query('SELECT id FROM pagina_serviciotecnico WHERE activo = true LIMIT 1')

    if (existing && existing.length > 0) {
      await db.query(`
        UPDATE pagina_serviciotecnico SET
          hero_titulo = ?,
          hero_subtitulo = ?,
          hero_imagen_url = ?,
          intro_titulo = ?,
          intro_descripcion = ?,
          servicio1_icono = ?,
          servicio1_titulo = ?,
          servicio1_desc = ?,
          servicio2_icono = ?,
          servicio2_titulo = ?,
          servicio2_desc = ?,
          servicio3_icono = ?,
          servicio3_titulo = ?,
          servicio3_desc = ?,
          servicio4_icono = ?,
          servicio4_titulo = ?,
          servicio4_desc = ?,
          destacado1_icono = ?,
          destacado1_titulo = ?,
          destacado1_desc = ?,
          destacado1_feature1 = ?,
          destacado1_feature2 = ?,
          destacado1_feature3 = ?,
          destacado1_feature4 = ?,
          destacado2_icono = ?,
          destacado2_titulo = ?,
          destacado2_desc = ?,
          destacado2_feature1 = ?,
          destacado2_feature2 = ?,
          destacado2_feature3 = ?,
          destacado2_feature4 = ?,
          beneficio1_icono = ?,
          beneficio1_titulo = ?,
          beneficio1_desc = ?,
          beneficio2_icono = ?,
          beneficio2_titulo = ?,
          beneficio2_desc = ?,
          beneficio3_icono = ?,
          beneficio3_titulo = ?,
          beneficio3_desc = ?,
          beneficio4_icono = ?,
          beneficio4_titulo = ?,
          beneficio4_desc = ?,
          beneficio5_icono = ?,
          beneficio5_titulo = ?,
          beneficio5_desc = ?,
          beneficio6_icono = ?,
          beneficio6_titulo = ?,
          beneficio6_desc = ?,
          proceso_titulo = ?,
          paso1_titulo = ?,
          paso1_desc = ?,
          paso2_titulo = ?,
          paso2_desc = ?,
          paso3_titulo = ?,
          paso3_desc = ?,
          paso4_titulo = ?,
          paso4_desc = ?,
          paso5_titulo = ?,
          paso5_desc = ?,
          paso6_titulo = ?,
          paso6_desc = ?,
          cta_titulo = ?,
          cta_descripcion = ?,
          cta_nota = ?,
          fecha_actualizacion = NOW()
        WHERE id = ?
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.intro_titulo?.trim() || null,
        data.intro_descripcion?.trim() || null,
        data.servicio1_icono?.trim() || null,
        data.servicio1_titulo?.trim() || null,
        data.servicio1_desc?.trim() || null,
        data.servicio2_icono?.trim() || null,
        data.servicio2_titulo?.trim() || null,
        data.servicio2_desc?.trim() || null,
        data.servicio3_icono?.trim() || null,
        data.servicio3_titulo?.trim() || null,
        data.servicio3_desc?.trim() || null,
        data.servicio4_icono?.trim() || null,
        data.servicio4_titulo?.trim() || null,
        data.servicio4_desc?.trim() || null,
        data.destacado1_icono?.trim() || null,
        data.destacado1_titulo?.trim() || null,
        data.destacado1_desc?.trim() || null,
        data.destacado1_feature1?.trim() || null,
        data.destacado1_feature2?.trim() || null,
        data.destacado1_feature3?.trim() || null,
        data.destacado1_feature4?.trim() || null,
        data.destacado2_icono?.trim() || null,
        data.destacado2_titulo?.trim() || null,
        data.destacado2_desc?.trim() || null,
        data.destacado2_feature1?.trim() || null,
        data.destacado2_feature2?.trim() || null,
        data.destacado2_feature3?.trim() || null,
        data.destacado2_feature4?.trim() || null,
        data.beneficio1_icono?.trim() || null,
        data.beneficio1_titulo?.trim() || null,
        data.beneficio1_desc?.trim() || null,
        data.beneficio2_icono?.trim() || null,
        data.beneficio2_titulo?.trim() || null,
        data.beneficio2_desc?.trim() || null,
        data.beneficio3_icono?.trim() || null,
        data.beneficio3_titulo?.trim() || null,
        data.beneficio3_desc?.trim() || null,
        data.beneficio4_icono?.trim() || null,
        data.beneficio4_titulo?.trim() || null,
        data.beneficio4_desc?.trim() || null,
        data.beneficio5_icono?.trim() || null,
        data.beneficio5_titulo?.trim() || null,
        data.beneficio5_desc?.trim() || null,
        data.beneficio6_icono?.trim() || null,
        data.beneficio6_titulo?.trim() || null,
        data.beneficio6_desc?.trim() || null,
        data.proceso_titulo?.trim() || null,
        data.paso1_titulo?.trim() || null,
        data.paso1_desc?.trim() || null,
        data.paso2_titulo?.trim() || null,
        data.paso2_desc?.trim() || null,
        data.paso3_titulo?.trim() || null,
        data.paso3_desc?.trim() || null,
        data.paso4_titulo?.trim() || null,
        data.paso4_desc?.trim() || null,
        data.paso5_titulo?.trim() || null,
        data.paso5_desc?.trim() || null,
        data.paso6_titulo?.trim() || null,
        data.paso6_desc?.trim() || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null,
        data.cta_nota?.trim() || null,
        existing[0].id
      ])
    } else {
      await db.query(`
        INSERT INTO pagina_serviciotecnico (
          hero_titulo, hero_subtitulo, hero_imagen_url,
          intro_titulo, intro_descripcion,
          servicio1_icono, servicio1_titulo, servicio1_desc,
          servicio2_icono, servicio2_titulo, servicio2_desc,
          servicio3_icono, servicio3_titulo, servicio3_desc,
          servicio4_icono, servicio4_titulo, servicio4_desc,
          destacado1_icono, destacado1_titulo, destacado1_desc,
          destacado1_feature1, destacado1_feature2, destacado1_feature3, destacado1_feature4,
          destacado2_icono, destacado2_titulo, destacado2_desc,
          destacado2_feature1, destacado2_feature2, destacado2_feature3, destacado2_feature4,
          beneficio1_icono, beneficio1_titulo, beneficio1_desc,
          beneficio2_icono, beneficio2_titulo, beneficio2_desc,
          beneficio3_icono, beneficio3_titulo, beneficio3_desc,
          beneficio4_icono, beneficio4_titulo, beneficio4_desc,
          beneficio5_icono, beneficio5_titulo, beneficio5_desc,
          beneficio6_icono, beneficio6_titulo, beneficio6_desc,
          proceso_titulo,
          paso1_titulo, paso1_desc,
          paso2_titulo, paso2_desc,
          paso3_titulo, paso3_desc,
          paso4_titulo, paso4_desc,
          paso5_titulo, paso5_desc,
          paso6_titulo, paso6_desc,
          cta_titulo, cta_descripcion, cta_nota
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.intro_titulo?.trim() || null,
        data.intro_descripcion?.trim() || null,
        data.servicio1_icono?.trim() || null,
        data.servicio1_titulo?.trim() || null,
        data.servicio1_desc?.trim() || null,
        data.servicio2_icono?.trim() || null,
        data.servicio2_titulo?.trim() || null,
        data.servicio2_desc?.trim() || null,
        data.servicio3_icono?.trim() || null,
        data.servicio3_titulo?.trim() || null,
        data.servicio3_desc?.trim() || null,
        data.servicio4_icono?.trim() || null,
        data.servicio4_titulo?.trim() || null,
        data.servicio4_desc?.trim() || null,
        data.destacado1_icono?.trim() || null,
        data.destacado1_titulo?.trim() || null,
        data.destacado1_desc?.trim() || null,
        data.destacado1_feature1?.trim() || null,
        data.destacado1_feature2?.trim() || null,
        data.destacado1_feature3?.trim() || null,
        data.destacado1_feature4?.trim() || null,
        data.destacado2_icono?.trim() || null,
        data.destacado2_titulo?.trim() || null,
        data.destacado2_desc?.trim() || null,
        data.destacado2_feature1?.trim() || null,
        data.destacado2_feature2?.trim() || null,
        data.destacado2_feature3?.trim() || null,
        data.destacado2_feature4?.trim() || null,
        data.beneficio1_icono?.trim() || null,
        data.beneficio1_titulo?.trim() || null,
        data.beneficio1_desc?.trim() || null,
        data.beneficio2_icono?.trim() || null,
        data.beneficio2_titulo?.trim() || null,
        data.beneficio2_desc?.trim() || null,
        data.beneficio3_icono?.trim() || null,
        data.beneficio3_titulo?.trim() || null,
        data.beneficio3_desc?.trim() || null,
        data.beneficio4_icono?.trim() || null,
        data.beneficio4_titulo?.trim() || null,
        data.beneficio4_desc?.trim() || null,
        data.beneficio5_icono?.trim() || null,
        data.beneficio5_titulo?.trim() || null,
        data.beneficio5_desc?.trim() || null,
        data.beneficio6_icono?.trim() || null,
        data.beneficio6_titulo?.trim() || null,
        data.beneficio6_desc?.trim() || null,
        data.proceso_titulo?.trim() || null,
        data.paso1_titulo?.trim() || null,
        data.paso1_desc?.trim() || null,
        data.paso2_titulo?.trim() || null,
        data.paso2_desc?.trim() || null,
        data.paso3_titulo?.trim() || null,
        data.paso3_desc?.trim() || null,
        data.paso4_titulo?.trim() || null,
        data.paso4_desc?.trim() || null,
        data.paso5_titulo?.trim() || null,
        data.paso5_desc?.trim() || null,
        data.paso6_titulo?.trim() || null,
        data.paso6_desc?.trim() || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null,
        data.cta_nota?.trim() || null
      ])
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar página servicio técnico:', error)
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