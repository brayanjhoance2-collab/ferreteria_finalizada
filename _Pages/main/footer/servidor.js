"use server"

import db from "@/_DB/db"

export async function getEmpresaInfo() {
  try {
    const [result] = await db.query(`
      SELECT 
        nombre,
        telefono,
        email,
        horario_lun_jue,
        horario_vie,
        horario_sab,
        descripcion,
        logo_url
      FROM empresa_info 
      WHERE activo = true 
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        nombre: 'Ferretería RyM',
        telefono: '+51 1 234 5678',
        email: 'contacto@ferreteriarym.pe',
        horario_lun_jue: '08:00 - 18:00',
        horario_vie: '08:00 - 18:00',
        horario_sab: '08:00 - 14:00',
        descripcion: 'Soluciones integrales en arriendo de equipos para tendidos eléctricos. Más de 20 años de experiencia respaldando proyectos en todo el Perú.',
        logo_url: null
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener información de empresa:', error)
    return {
      nombre: 'Ferretería RyM',
      telefono: '+51 1 234 5678',
      email: 'contacto@ferreteriarym.pe',
      horario_lun_jue: '08:00 - 18:00',
      horario_vie: '08:00 - 18:00',
      horario_sab: '08:00 - 14:00',
      descripcion: 'Soluciones integrales en arriendo de equipos para tendidos eléctricos. Más de 20 años de experiencia respaldando proyectos en todo el Perú.',
      logo_url: null
    }
  }
}