"use server"

import db from "@/_DB/db"

export async function getHomeData() {
  try {
    const [empresaResult] = await db.query(`
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

    const [sobreNosotrosResult] = await db.query(`
      SELECT * FROM pagina_sobrenosotros 
      WHERE activo = true 
      LIMIT 1
    `)

    const [contactoResult] = await db.query(`
      SELECT * FROM pagina_contacto 
      WHERE activo = true 
      LIMIT 1
    `)

    const [certificacionesResult] = await db.query(`
      SELECT * FROM pagina_certificaciones 
      WHERE activo = true 
      LIMIT 1
    `)

    const [arriendoResult] = await db.query(`
      SELECT * FROM pagina_arriendoequipos 
      WHERE activo = true 
      LIMIT 1
    `)

    const [servicioResult] = await db.query(`
      SELECT * FROM pagina_serviciotecnico 
      WHERE activo = true 
      LIMIT 1
    `)

    const heroImages = []

    if (sobreNosotrosResult && sobreNosotrosResult.length > 0) {
      const sobreNosotros = sobreNosotrosResult[0]
      if (sobreNosotros.hero_imagen_url) {
        heroImages.push({
          titulo: sobreNosotros.hero_titulo || 'Sobre Nosotros',
          subtitulo: sobreNosotros.hero_subtitulo || '',
          imagen_url: sobreNosotros.hero_imagen_url
        })
      }
    }

    if (arriendoResult && arriendoResult.length > 0) {
      const arriendo = arriendoResult[0]
      if (arriendo.hero_imagen_url) {
        heroImages.push({
          titulo: arriendo.hero_titulo || 'Arriendo de Equipos',
          subtitulo: arriendo.hero_subtitulo || '',
          imagen_url: arriendo.hero_imagen_url
        })
      }
    }

    if (servicioResult && servicioResult.length > 0) {
      const servicio = servicioResult[0]
      if (servicio.hero_imagen_url) {
        heroImages.push({
          titulo: servicio.hero_titulo || 'Servicio Técnico',
          subtitulo: servicio.hero_subtitulo || '',
          imagen_url: servicio.hero_imagen_url
        })
      }
    }

    if (certificacionesResult && certificacionesResult.length > 0) {
      const certificaciones = certificacionesResult[0]
      if (certificaciones.hero_imagen_url) {
        heroImages.push({
          titulo: certificaciones.hero_titulo || 'Certificaciones',
          subtitulo: certificaciones.hero_subtitulo || '',
          imagen_url: certificaciones.hero_imagen_url
        })
      }
    }

    const [galeriaResult] = await db.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        url,
        alt_text,
        categoria
      FROM galeria 
      WHERE activo = true 
      AND categoria = 'certificaciones'
      ORDER BY orden ASC, id ASC
    `)

    const empresaInfo = empresaResult && empresaResult.length > 0 ? empresaResult[0] : {
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

    const sobreNosotros = sobreNosotrosResult && sobreNosotrosResult.length > 0 ? sobreNosotrosResult[0] : null

    const contacto = contactoResult && contactoResult.length > 0 ? contactoResult[0] : null

    const certificaciones = certificacionesResult && certificacionesResult.length > 0 ? certificacionesResult[0] : null

    const certificadores = galeriaResult && galeriaResult.length > 0 ? galeriaResult : []

    return {
      empresaInfo,
      sobreNosotros,
      contacto,
      certificaciones,
      certificadores,
      heroImages
    }
  } catch (error) {
    console.error('Error al obtener datos del home:', error)
    return {
      empresaInfo: {
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
      },
      sobreNosotros: null,
      contacto: null,
      certificaciones: null,
      certificadores: [],
      heroImages: []
    }
  }
}