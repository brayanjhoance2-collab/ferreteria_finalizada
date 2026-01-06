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

export async function updatePaginaCertificaciones(data) {
  try {
    await verificarSesion()

    const [existing] = await db.query('SELECT id FROM pagina_certificaciones WHERE activo = true LIMIT 1')

    if (existing && existing.length > 0) {
      await db.query(`
        UPDATE pagina_certificaciones SET
          hero_titulo = ?,
          hero_subtitulo = ?,
          hero_imagen_url = ?,
          intro_titulo = ?,
          intro_descripcion = ?,
          intro_imagen_url = ?,
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
          proceso_titulo = ?,
          paso1_numero = ?,
          paso1_titulo = ?,
          paso1_desc = ?,
          paso2_numero = ?,
          paso2_titulo = ?,
          paso2_desc = ?,
          paso3_numero = ?,
          paso3_titulo = ?,
          paso3_desc = ?,
          paso4_numero = ?,
          paso4_titulo = ?,
          paso4_desc = ?,
          requisitos_titulo = ?,
          requisitos_descripcion = ?,
          req1_texto = ?,
          req2_texto = ?,
          req3_texto = ?,
          req4_texto = ?,
          req5_texto = ?,
          req6_texto = ?,
          testimonio1_nombre = ?,
          testimonio1_cargo = ?,
          testimonio1_empresa = ?,
          testimonio1_texto = ?,
          testimonio1_imagen_url = ?,
          testimonio2_nombre = ?,
          testimonio2_cargo = ?,
          testimonio2_empresa = ?,
          testimonio2_texto = ?,
          testimonio2_imagen_url = ?,
          testimonio3_nombre = ?,
          testimonio3_cargo = ?,
          testimonio3_empresa = ?,
          testimonio3_texto = ?,
          testimonio3_imagen_url = ?,
          certificadores_titulo = ?,
          certificadores_descripcion = ?,
          cert_logo1_url = ?,
          cert_logo2_url = ?,
          cert_logo3_url = ?,
          cert_logo4_url = ?,
          cta_titulo = ?,
          cta_descripcion = ?,
          fecha_actualizacion = NOW()
        WHERE id = ?
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.intro_titulo?.trim() || null,
        data.intro_descripcion?.trim() || null,
        data.intro_imagen_url || null,
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
        data.proceso_titulo?.trim() || null,
        data.paso1_numero?.trim() || null,
        data.paso1_titulo?.trim() || null,
        data.paso1_desc?.trim() || null,
        data.paso2_numero?.trim() || null,
        data.paso2_titulo?.trim() || null,
        data.paso2_desc?.trim() || null,
        data.paso3_numero?.trim() || null,
        data.paso3_titulo?.trim() || null,
        data.paso3_desc?.trim() || null,
        data.paso4_numero?.trim() || null,
        data.paso4_titulo?.trim() || null,
        data.paso4_desc?.trim() || null,
        data.requisitos_titulo?.trim() || null,
        data.requisitos_descripcion?.trim() || null,
        data.req1_texto?.trim() || null,
        data.req2_texto?.trim() || null,
        data.req3_texto?.trim() || null,
        data.req4_texto?.trim() || null,
        data.req5_texto?.trim() || null,
        data.req6_texto?.trim() || null,
        data.testimonio1_nombre?.trim() || null,
        data.testimonio1_cargo?.trim() || null,
        data.testimonio1_empresa?.trim() || null,
        data.testimonio1_texto?.trim() || null,
        data.testimonio1_imagen_url || null,
        data.testimonio2_nombre?.trim() || null,
        data.testimonio2_cargo?.trim() || null,
        data.testimonio2_empresa?.trim() || null,
        data.testimonio2_texto?.trim() || null,
        data.testimonio2_imagen_url || null,
        data.testimonio3_nombre?.trim() || null,
        data.testimonio3_cargo?.trim() || null,
        data.testimonio3_empresa?.trim() || null,
        data.testimonio3_texto?.trim() || null,
        data.testimonio3_imagen_url || null,
        data.certificadores_titulo?.trim() || null,
        data.certificadores_descripcion?.trim() || null,
        data.cert_logo1_url || null,
        data.cert_logo2_url || null,
        data.cert_logo3_url || null,
        data.cert_logo4_url || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null,
        existing[0].id
      ])
    } else {
      await db.query(`
        INSERT INTO pagina_certificaciones (
          hero_titulo, hero_subtitulo, hero_imagen_url,
          intro_titulo, intro_descripcion, intro_imagen_url,
          beneficio1_icono, beneficio1_titulo, beneficio1_desc,
          beneficio2_icono, beneficio2_titulo, beneficio2_desc,
          beneficio3_icono, beneficio3_titulo, beneficio3_desc,
          beneficio4_icono, beneficio4_titulo, beneficio4_desc,
          proceso_titulo,
          paso1_numero, paso1_titulo, paso1_desc,
          paso2_numero, paso2_titulo, paso2_desc,
          paso3_numero, paso3_titulo, paso3_desc,
          paso4_numero, paso4_titulo, paso4_desc,
          requisitos_titulo, requisitos_descripcion,
          req1_texto, req2_texto, req3_texto, req4_texto, req5_texto, req6_texto,
          testimonio1_nombre, testimonio1_cargo, testimonio1_empresa, testimonio1_texto, testimonio1_imagen_url,
          testimonio2_nombre, testimonio2_cargo, testimonio2_empresa, testimonio2_texto, testimonio2_imagen_url,
          testimonio3_nombre, testimonio3_cargo, testimonio3_empresa, testimonio3_texto, testimonio3_imagen_url,
          certificadores_titulo, certificadores_descripcion,
          cert_logo1_url, cert_logo2_url, cert_logo3_url, cert_logo4_url,
          cta_titulo, cta_descripcion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.intro_titulo?.trim() || null,
        data.intro_descripcion?.trim() || null,
        data.intro_imagen_url || null,
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
        data.proceso_titulo?.trim() || null,
        data.paso1_numero?.trim() || null,
        data.paso1_titulo?.trim() || null,
        data.paso1_desc?.trim() || null,
        data.paso2_numero?.trim() || null,
        data.paso2_titulo?.trim() || null,
        data.paso2_desc?.trim() || null,
        data.paso3_numero?.trim() || null,
        data.paso3_titulo?.trim() || null,
        data.paso3_desc?.trim() || null,
        data.paso4_numero?.trim() || null,
        data.paso4_titulo?.trim() || null,
        data.paso4_desc?.trim() || null,
        data.requisitos_titulo?.trim() || null,
        data.requisitos_descripcion?.trim() || null,
        data.req1_texto?.trim() || null,
        data.req2_texto?.trim() || null,
        data.req3_texto?.trim() || null,
        data.req4_texto?.trim() || null,
        data.req5_texto?.trim() || null,
        data.req6_texto?.trim() || null,
        data.testimonio1_nombre?.trim() || null,
        data.testimonio1_cargo?.trim() || null,
        data.testimonio1_empresa?.trim() || null,
        data.testimonio1_texto?.trim() || null,
        data.testimonio1_imagen_url || null,
        data.testimonio2_nombre?.trim() || null,
        data.testimonio2_cargo?.trim() || null,
        data.testimonio2_empresa?.trim() || null,
        data.testimonio2_texto?.trim() || null,
        data.testimonio2_imagen_url || null,
        data.testimonio3_nombre?.trim() || null,
        data.testimonio3_cargo?.trim() || null,
        data.testimonio3_empresa?.trim() || null,
        data.testimonio3_texto?.trim() || null,
        data.testimonio3_imagen_url || null,
        data.certificadores_titulo?.trim() || null,
        data.certificadores_descripcion?.trim() || null,
        data.cert_logo1_url || null,
        data.cert_logo2_url || null,
        data.cert_logo3_url || null,
        data.cert_logo4_url || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null
      ])
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar página certificaciones:', error)
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