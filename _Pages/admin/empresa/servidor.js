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

export async function obtenerEmpresa() {
  try {
    await verificarSesion()

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
        logo_url,
        activo,
        fecha_creacion,
        fecha_actualizacion
      FROM empresa_info
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      const [insertResult] = await db.query(`
        INSERT INTO empresa_info (nombre, telefono, email)
        VALUES ('Ferreteria RyM', '+51 1 234 5678', 'contacto@ferreteriarym.pe')
      `)

      const [newResult] = await db.query(`
        SELECT * FROM empresa_info WHERE id = ?
      `, [insertResult.insertId])

      return newResult[0]
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener empresa:', error)
    throw error
  }
}

export async function actualizarEmpresa(datos) {
  try {
    await verificarSesion()

    if (!datos.nombre || !datos.nombre.trim()) {
      throw new Error('El nombre de la empresa es requerido')
    }

    if (!datos.email || !datos.email.trim()) {
      throw new Error('El email es requerido')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datos.email)) {
      throw new Error('Email no valido')
    }

    const [empresaActual] = await db.query(
      'SELECT id FROM empresa_info WHERE activo = true LIMIT 1'
    )

    if (!empresaActual || empresaActual.length === 0) {
      throw new Error('No se encontro la informacion de la empresa')
    }

    await db.query(`
      UPDATE empresa_info 
      SET 
        nombre = ?,
        telefono = ?,
        email = ?,
        horario_lun_jue = ?,
        horario_vie = ?,
        horario_sab = ?,
        descripcion = ?,
        historia = ?,
        fecha_fundacion = ?,
        anios_experiencia = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      datos.nombre.trim(),
      datos.telefono?.trim() || null,
      datos.email.trim(),
      datos.horario_lun_jue?.trim() || null,
      datos.horario_vie?.trim() || null,
      datos.horario_sab?.trim() || null,
      datos.descripcion?.trim() || null,
      datos.historia?.trim() || null,
      datos.fecha_fundacion || null,
      datos.anios_experiencia || null,
      empresaActual[0].id
    ])

    return { mensaje: 'Informacion actualizada correctamente' }
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    throw error
  }
}

export async function subirLogo(formData) {
  try {
    await verificarSesion()
    const fs = require('fs').promises
    const path = require('path')

    const file = formData.get('logo')
    if (!file) {
      throw new Error('No se proporciono un archivo')
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('El archivo no puede superar los 2MB')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen')
    }

    const extension = file.name.split('.').pop()
    const fileName = `logo-empresa-${Date.now()}.${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    const filePath = path.join(uploadDir, fileName)

    await fs.mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const logoUrl = `/uploads/logos/${fileName}`

    const [empresaActual] = await db.query(
      'SELECT id, logo_url FROM empresa_info WHERE activo = true LIMIT 1'
    )

    if (!empresaActual || empresaActual.length === 0) {
      throw new Error('No se encontro la informacion de la empresa')
    }

    if (empresaActual[0].logo_url) {
      const oldLogoPath = path.join(process.cwd(), 'public', empresaActual[0].logo_url)
      try {
        await fs.unlink(oldLogoPath)
      } catch (err) {
        console.error('Error al eliminar logo anterior:', err)
      }
    }

    await db.query(
      'UPDATE empresa_info SET logo_url = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [logoUrl, empresaActual[0].id]
    )

    return { mensaje: 'Logo actualizado correctamente', logoUrl }
  } catch (error) {
    console.error('Error al subir logo:', error)
    throw error
  }
}

export async function obtenerValores() {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        orden,
        activo
      FROM valores_empresa
      WHERE activo = true
      ORDER BY orden ASC, id ASC
    `)

    return result || []
  } catch (error) {
    console.error('Error al obtener valores:', error)
    throw error
  }
}

export async function crearValor(datos) {
  try {
    await verificarSesion()

    if (!datos.nombre || !datos.nombre.trim()) {
      throw new Error('El nombre del valor es requerido')
    }

    if (!datos.descripcion || !datos.descripcion.trim()) {
      throw new Error('La descripcion es requerida')
    }

    const [maxOrden] = await db.query(
      'SELECT MAX(orden) as max_orden FROM valores_empresa'
    )

    const nuevoOrden = (maxOrden[0]?.max_orden || 0) + 1

    await db.query(`
      INSERT INTO valores_empresa (nombre, descripcion, orden, activo)
      VALUES (?, ?, ?, true)
    `, [datos.nombre.trim(), datos.descripcion.trim(), nuevoOrden])

    return { mensaje: 'Valor creado correctamente' }
  } catch (error) {
    console.error('Error al crear valor:', error)
    throw error
  }
}

export async function actualizarValor(id, datos) {
  try {
    await verificarSesion()

    if (!datos.nombre || !datos.nombre.trim()) {
      throw new Error('El nombre del valor es requerido')
    }

    if (!datos.descripcion || !datos.descripcion.trim()) {
      throw new Error('La descripcion es requerida')
    }

    const [existe] = await db.query(
      'SELECT id FROM valores_empresa WHERE id = ?',
      [id]
    )

    if (!existe || existe.length === 0) {
      throw new Error('Valor no encontrado')
    }

    await db.query(`
      UPDATE valores_empresa 
      SET 
        nombre = ?,
        descripcion = ?
      WHERE id = ?
    `, [datos.nombre.trim(), datos.descripcion.trim(), id])

    return { mensaje: 'Valor actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar valor:', error)
    throw error
  }
}

export async function eliminarValor(id) {
  try {
    await verificarSesion()

    const [existe] = await db.query(
      'SELECT id FROM valores_empresa WHERE id = ?',
      [id]
    )

    if (!existe || existe.length === 0) {
      throw new Error('Valor no encontrado')
    }

    await db.query('DELETE FROM valores_empresa WHERE id = ?', [id])

    return { mensaje: 'Valor eliminado correctamente' }
  } catch (error) {
    console.error('Error al eliminar valor:', error)
    throw error
  }
}

export async function reordenarValores(ordenIds) {
  try {
    await verificarSesion()

    if (!Array.isArray(ordenIds) || ordenIds.length === 0) {
      throw new Error('Orden de valores invalido')
    }

    for (let i = 0; i < ordenIds.length; i++) {
      await db.query(
        'UPDATE valores_empresa SET orden = ? WHERE id = ?',
        [i + 1, ordenIds[i]]
      )
    }

    return { mensaje: 'Valores reordenados correctamente' }
  } catch (error) {
    console.error('Error al reordenar valores:', error)
    throw error
  }
}