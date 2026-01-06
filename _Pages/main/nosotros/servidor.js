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
        descripcion: 'En Ferretería RyM, ofrecemos una amplia gama de equipos y herramientas en venta y arriendo, diseñados para satisfacer las necesidades de proyectos de construcción, mantenimiento y obras en general.',
        historia: 'Desde el año 2000, Ferretería RyM ha sido un referente en Lima, brindando soluciones integrales en herramientas, equipos y materiales de construcción. Nuestra trayectoria está marcada por el compromiso con la excelencia y la satisfacción de nuestros clientes.',
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
      descripcion: 'En Ferretería RyM, ofrecemos una amplia gama de equipos y herramientas en venta y arriendo, diseñados para satisfacer las necesidades de proyectos de construcción, mantenimiento y obras en general.',
      historia: 'Desde el año 2000, Ferretería RyM ha sido un referente en Lima, brindando soluciones integrales en herramientas, equipos y materiales de construcción. Nuestra trayectoria está marcada por el compromiso con la excelencia y la satisfacción de nuestros clientes.',
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
      return [
        {
          id: 1,
          nombre: 'Calidad',
          descripcion: 'Ofrecemos productos y servicios de la más alta calidad para nuestros clientes.',
          orden: 1
        },
        {
          id: 2,
          nombre: 'Confianza',
          descripcion: 'Construimos relaciones duraderas basadas en la confianza y transparencia.',
          orden: 2
        },
        {
          id: 3,
          nombre: 'Servicio',
          descripcion: 'Brindamos atención personalizada y asesoría especializada.',
          orden: 3
        },
        {
          id: 4,
          nombre: 'Experiencia',
          descripcion: 'Más de 20 años respaldando proyectos en Lima y todo el Perú.',
          orden: 4
        },
        {
          id: 5,
          nombre: 'Innovación',
          descripcion: 'Incorporamos constantemente nuevas tecnologías y equipos al mercado peruano.',
          orden: 5
        },
        {
          id: 6,
          nombre: 'Compromiso',
          descripcion: 'Comprometidos con el éxito de cada proyecto de nuestros clientes.',
          orden: 6
        }
      ]
    }

    return result
  } catch (error) {
    console.error('Error al obtener valores de la empresa:', error)
    return [
      {
        id: 1,
        nombre: 'Calidad',
        descripcion: 'Ofrecemos productos y servicios de la más alta calidad para nuestros clientes.',
        orden: 1
      },
      {
        id: 2,
        nombre: 'Confianza',
        descripcion: 'Construimos relaciones duraderas basadas en la confianza y transparencia.',
        orden: 2
      },
      {
        id: 3,
        nombre: 'Servicio',
        descripcion: 'Brindamos atención personalizada y asesoría especializada.',
        orden: 3
      },
      {
        id: 4,
        nombre: 'Experiencia',
        descripcion: 'Más de 20 años respaldando proyectos en Lima y todo el Perú.',
        orden: 4
      },
      {
        id: 5,
        nombre: 'Innovación',
        descripcion: 'Incorporamos constantemente nuevas tecnologías y equipos al mercado peruano.',
        orden: 5
      },
      {
        id: 6,
        nombre: 'Compromiso',
        descripcion: 'Comprometidos con el éxito de cada proyecto de nuestros clientes.',
        orden: 6
      }
    ]
  }
}

export async function getPaginaSobreNosotros() {
  try {
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
    return null
  }
}