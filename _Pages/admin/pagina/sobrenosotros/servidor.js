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

export async function getEmpresaInfo() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        telefono,
        email,
        horario_lun_jue,
        horario_vie,
        horario_sab,
        descripcion,
        historia,
        fecha_fundacion,
        anios_experiencia,
        activo
      FROM empresa_info 
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        id: 1,
        nombre: 'Ferretería RyM',
        telefono: '+51 1 234 5678',
        email: 'contacto@ferreteriarym.pe',
        horario_lun_jue: '08:00 - 18:00',
        horario_vie: '08:00 - 18:00',
        horario_sab: '08:00 - 14:00',
        descripcion: 'En Ferretería RyM, ofrecemos una amplia gama de equipos y herramientas en venta y arriendo.',
        historia: 'Desde el año 2000, Ferretería RyM ha sido un referente en Lima.',
        fecha_fundacion: 2000,
        anios_experiencia: 24,
        activo: true
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener información de la empresa:', error)
    return {
      id: 1,
      nombre: 'Ferretería RyM',
      telefono: '+51 1 234 5678',
      email: 'contacto@ferreteriarym.pe',
      horario_lun_jue: '08:00 - 18:00',
      horario_vie: '08:00 - 18:00',
      horario_sab: '08:00 - 14:00',
      descripcion: 'En Ferretería RyM, ofrecemos una amplia gama de equipos y herramientas en venta y arriendo.',
      historia: 'Desde el año 2000, Ferretería RyM ha sido un referente en Lima.',
      fecha_fundacion: 2000,
      anios_experiencia: 24,
      activo: true
    }
  }
}

export async function getValoresEmpresa() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        orden
      FROM valores_empresa 
      WHERE activo = true
      ORDER BY orden ASC
    `)

    if (!result || result.length === 0) {
      return []
    }

    return result
  } catch (error) {
    console.error('Error al obtener valores de la empresa:', error)
    return []
  }
}

export async function getPaginaSobreNosotros() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT * FROM pagina_sobrenosotros 
      WHERE activo = true 
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener página sobre nosotros:', error)
    throw error
  }
}

export async function updatePaginaSobreNosotros(data) {
  try {
    await verificarSesion()

    const [existing] = await db.query('SELECT id FROM pagina_sobrenosotros WHERE activo = true LIMIT 1')

    if (existing && existing.length > 0) {
      await db.query(`
        UPDATE pagina_sobrenosotros SET
          hero_titulo = ?,
          hero_subtitulo = ?,
          hero_imagen_url = ?,
          intro_titulo = ?,
          intro_descripcion = ?,
          intro_imagen_url = ?,
          stat1_numero = ?,
          stat1_label = ?,
          stat2_numero = ?,
          stat2_label = ?,
          stat3_numero = ?,
          stat3_label = ?,
          historia_titulo = ?,
          historia_descripcion = ?,
          timeline1_year = ?,
          timeline1_desc = ?,
          timeline2_year = ?,
          timeline2_desc = ?,
          timeline3_year = ?,
          timeline3_desc = ?,
          timeline4_year = ?,
          timeline4_desc = ?,
          mision_titulo = ?,
          mision_texto = ?,
          vision_titulo = ?,
          vision_texto = ?,
          dif1_titulo = ?,
          dif1_descripcion = ?,
          dif2_titulo = ?,
          dif2_descripcion = ?,
          dif3_titulo = ?,
          dif3_descripcion = ?,
          dif4_titulo = ?,
          dif4_descripcion = ?,
          cert_titulo = ?,
          cert_descripcion = ?,
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
        data.stat1_numero?.trim() || null,
        data.stat1_label?.trim() || null,
        data.stat2_numero?.trim() || null,
        data.stat2_label?.trim() || null,
        data.stat3_numero?.trim() || null,
        data.stat3_label?.trim() || null,
        data.historia_titulo?.trim() || null,
        data.historia_descripcion?.trim() || null,
        data.timeline1_year?.trim() || null,
        data.timeline1_desc?.trim() || null,
        data.timeline2_year?.trim() || null,
        data.timeline2_desc?.trim() || null,
        data.timeline3_year?.trim() || null,
        data.timeline3_desc?.trim() || null,
        data.timeline4_year?.trim() || null,
        data.timeline4_desc?.trim() || null,
        data.mision_titulo?.trim() || null,
        data.mision_texto?.trim() || null,
        data.vision_titulo?.trim() || null,
        data.vision_texto?.trim() || null,
        data.dif1_titulo?.trim() || null,
        data.dif1_descripcion?.trim() || null,
        data.dif2_titulo?.trim() || null,
        data.dif2_descripcion?.trim() || null,
        data.dif3_titulo?.trim() || null,
        data.dif3_descripcion?.trim() || null,
        data.dif4_titulo?.trim() || null,
        data.dif4_descripcion?.trim() || null,
        data.cert_titulo?.trim() || null,
        data.cert_descripcion?.trim() || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null,
        existing[0].id
      ])
    } else {
      await db.query(`
        INSERT INTO pagina_sobrenosotros (
          hero_titulo, hero_subtitulo, hero_imagen_url,
          intro_titulo, intro_descripcion, intro_imagen_url,
          stat1_numero, stat1_label, stat2_numero, stat2_label,
          stat3_numero, stat3_label,
          historia_titulo, historia_descripcion,
          timeline1_year, timeline1_desc, timeline2_year, timeline2_desc,
          timeline3_year, timeline3_desc, timeline4_year, timeline4_desc,
          mision_titulo, mision_texto, vision_titulo, vision_texto,
          dif1_titulo, dif1_descripcion, dif2_titulo, dif2_descripcion,
          dif3_titulo, dif3_descripcion, dif4_titulo, dif4_descripcion,
          cert_titulo, cert_descripcion,
          cta_titulo, cta_descripcion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.hero_titulo?.trim() || null,
        data.hero_subtitulo?.trim() || null,
        data.hero_imagen_url || null,
        data.intro_titulo?.trim() || null,
        data.intro_descripcion?.trim() || null,
        data.intro_imagen_url || null,
        data.stat1_numero?.trim() || null,
        data.stat1_label?.trim() || null,
        data.stat2_numero?.trim() || null,
        data.stat2_label?.trim() || null,
        data.stat3_numero?.trim() || null,
        data.stat3_label?.trim() || null,
        data.historia_titulo?.trim() || null,
        data.historia_descripcion?.trim() || null,
        data.timeline1_year?.trim() || null,
        data.timeline1_desc?.trim() || null,
        data.timeline2_year?.trim() || null,
        data.timeline2_desc?.trim() || null,
        data.timeline3_year?.trim() || null,
        data.timeline3_desc?.trim() || null,
        data.timeline4_year?.trim() || null,
        data.timeline4_desc?.trim() || null,
        data.mision_titulo?.trim() || null,
        data.mision_texto?.trim() || null,
        data.vision_titulo?.trim() || null,
        data.vision_texto?.trim() || null,
        data.dif1_titulo?.trim() || null,
        data.dif1_descripcion?.trim() || null,
        data.dif2_titulo?.trim() || null,
        data.dif2_descripcion?.trim() || null,
        data.dif3_titulo?.trim() || null,
        data.dif3_descripcion?.trim() || null,
        data.dif4_titulo?.trim() || null,
        data.dif4_descripcion?.trim() || null,
        data.cert_titulo?.trim() || null,
        data.cert_descripcion?.trim() || null,
        data.cta_titulo?.trim() || null,
        data.cta_descripcion?.trim() || null
      ])
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar página sobre nosotros:', error)
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