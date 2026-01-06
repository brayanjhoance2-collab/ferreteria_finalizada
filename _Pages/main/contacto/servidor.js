"use server"

import db from "@/_DB/db"

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
        descripcion
      FROM empresa_info 
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        id: 1,
        nombre: 'Ferreteria RyM',
        telefono: '+51 1 234 5678',
        email: 'contacto@ferreteriarym.pe',
        horario_lun_jue: '08:00 - 18:00',
        horario_vie: '08:00 - 18:00',
        horario_sab: '08:00 - 14:00',
        descripcion: 'Soluciones integrales en arriendo de equipos'
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener informacion de la empresa:', error)
    return {
      id: 1,
      nombre: 'Ferreteria RyM',
      telefono: '+51 1 234 5678',
      email: 'contacto@ferreteriarym.pe',
      horario_lun_jue: '08:00 - 18:00',
      horario_vie: '08:00 - 18:00',
      horario_sab: '08:00 - 14:00',
      descripcion: 'Soluciones integrales en arriendo de equipos'
    }
  }
}

export async function getPaginaContacto() {
  try {
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
        whatsapp_url
      FROM pagina_contacto
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        hero_titulo: 'Contactanos',
        hero_subtitulo: 'Estamos aqui para ayudarte con tus proyectos. Escribenos y te responderemos a la brevedad',
        hero_imagen_url: '/contacto-hero.jpg',
        info_titulo: 'Hablemos',
        info_descripcion: 'Nuestro equipo esta disponible para atender tus consultas y brindarte la mejor solucion para tus necesidades de equipos y servicios.',
        ubicacion_texto: 'Lima, Peru',
        mapa_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62410.22785085749!2d-77.06418999999999!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5e5b0c5e1%3A0x474f991d5d3f1b0a!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1234567890',
        cta_titulo: 'Prefieres llamarnos directamente?',
        cta_descripcion: 'Nuestro equipo esta disponible de lunes a sabado para atender tus consultas',
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        whatsapp_url: ''
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener pagina contacto:', error)
    return {
      hero_titulo: 'Contactanos',
      hero_subtitulo: 'Estamos aqui para ayudarte con tus proyectos. Escribenos y te responderemos a la brevedad',
      hero_imagen_url: '/contacto-hero.jpg',
      info_titulo: 'Hablemos',
      info_descripcion: 'Nuestro equipo esta disponible para atender tus consultas y brindarte la mejor solucion para tus necesidades de equipos y servicios.',
      ubicacion_texto: 'Lima, Peru',
      mapa_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62410.22785085749!2d-77.06418999999999!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5e5b0c5e1%3A0x474f991d5d3f1b0a!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1234567890',
      cta_titulo: 'Prefieres llamarnos directamente?',
      cta_descripcion: 'Nuestro equipo esta disponible de lunes a sabado para atender tus consultas',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      whatsapp_url: ''
    }
  }
}

export async function enviarFormularioContacto(datos) {
  try {
    const query = `
      INSERT INTO formulario_contacto (
        nombre,
        email,
        telefono,
        empresa,
        asunto,
        mensaje,
        tipo_consulta,
        origen,
        estado,
        prioridad,
        fecha_envio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'web', 'nuevo', 'media', NOW())
    `

    const valores = [
      datos.nombre,
      datos.email,
      datos.telefono || null,
      datos.empresa || null,
      datos.asunto,
      datos.mensaje,
      datos.tipo_consulta || 'general'
    ]

    const [result] = await db.query(query, valores)

    if (result && result.affectedRows > 0) {
      return {
        success: true,
        mensaje: 'Formulario enviado correctamente'
      }
    }

    return {
      success: false,
      mensaje: 'Error al enviar el formulario'
    }
  } catch (error) {
    console.error('Error al guardar formulario de contacto:', error)
    return {
      success: false,
      mensaje: 'Error al procesar la solicitud'
    }
  }
}