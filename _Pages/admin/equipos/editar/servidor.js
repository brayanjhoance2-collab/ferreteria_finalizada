"use server"

import db from "@/_DB/db"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/uploads'

function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function obtenerCategorias() {
  try {
    const [categorias] = await db.query(`
      SELECT id, nombre
      FROM categorias_equipos
      WHERE activo = true
      ORDER BY orden ASC, nombre ASC
    `)

    return categorias || []
  } catch (error) {
    console.error('Error al obtener categorias:', error)
    throw new Error('Error al obtener las categorías')
  }
}

export async function obtenerEquipo(id) {
  try {
    const [equipo] = await db.query(
      'SELECT * FROM equipos WHERE id = ? AND activo = true',
      [id]
    )

    if (!equipo || equipo.length === 0) {
      throw new Error('Equipo no encontrado')
    }

    const [imagenes] = await db.query(
      'SELECT * FROM imagenes_equipos WHERE equipo_id = ? ORDER BY orden ASC',
      [id]
    )

    const [especificaciones] = await db.query(
      'SELECT * FROM especificaciones_equipos WHERE equipo_id = ? ORDER BY orden ASC',
      [id]
    )

    return {
      ...equipo[0],
      imagenes: imagenes || [],
      especificaciones: especificaciones || []
    }
  } catch (error) {
    console.error('Error al obtener equipo:', error)
    throw error
  }
}

export async function subirImagen(formData) {
  try {
    const imagen = formData.get('imagen')
    const tipo = formData.get('tipo')
    
    if (!imagen) {
      throw new Error('No se proporcionó ninguna imagen')
    }

    const bytes = await imagen.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const nombreOriginal = imagen.name.replace(/\s+/g, '_')
    const extension = nombreOriginal.split('.').pop()
    const nombreArchivo = `equipo_${tipo}_${timestamp}.${extension}`

    const rutaPublic = join(UPLOADS_DIR, 'equipos')
    const rutaCompleta = join(rutaPublic, nombreArchivo)

    try {
      await mkdir(rutaPublic, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }

    await writeFile(rutaCompleta, buffer)

    const url = `/uploads/equipos/${nombreArchivo}`

    return { url, mensaje: 'Imagen subida correctamente' }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    throw new Error('Error al subir la imagen')
  }
}

export async function actualizarEquipo(id, datos) {
  try {
    const slug = generarSlug(datos.nombre)
    const caracteristicasJSON = JSON.stringify(datos.caracteristicas)

    await db.query(`
      UPDATE equipos 
      SET 
        categoria_id = ?,
        nombre = ?,
        slug = ?,
        tipo = ?,
        marca = ?,
        modelo = ?,
        capacidad = ?,
        descripcion_corta = ?,
        descripcion_completa = ?,
        tecnologia = ?,
        caracteristicas = ?,
        estado = ?,
        stock = ?,
        precio_dia = ?,
        precio_semana = ?,
        precio_mes = ?,
        precio_compra = ?,
        fecha_adquisicion = ?,
        garantia_meses = ?,
        peso_kg = ?,
        dimensiones = ?,
        imagen_principal = ?,
        activo = ?,
        destacado = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      datos.categoria_id,
      datos.nombre,
      slug,
      datos.tipo || null,
      datos.marca || null,
      datos.modelo || null,
      datos.capacidad || null,
      datos.descripcion_corta || null,
      datos.descripcion_completa || null,
      datos.tecnologia || null,
      caracteristicasJSON,
      datos.estado,
      datos.stock || 1,
      datos.precio_dia || null,
      datos.precio_semana || null,
      datos.precio_mes || null,
      datos.precio_compra || null,
      datos.fecha_adquisicion || null,
      datos.garantia_meses || null,
      datos.peso_kg || null,
      datos.dimensiones || null,
      datos.imagen_principal || null,
      datos.activo,
      datos.destacado,
      id
    ])

    await db.query('DELETE FROM imagenes_equipos WHERE equipo_id = ?', [id])
    await db.query('DELETE FROM especificaciones_equipos WHERE equipo_id = ?', [id])

    if (datos.imagenes && datos.imagenes.length > 0) {
      for (let i = 0; i < datos.imagenes.length; i++) {
        const img = datos.imagenes[i]
        await db.query(`
          INSERT INTO imagenes_equipos (equipo_id, url, alt_text, orden, es_principal, fecha_subida)
          VALUES (?, ?, ?, ?, false, NOW())
        `, [id, img.url, img.alt_text || '', i])
      }
    }

    if (datos.especificaciones && datos.especificaciones.length > 0) {
      for (const espec of datos.especificaciones) {
        await db.query(`
          INSERT INTO especificaciones_equipos (equipo_id, nombre, valor, unidad, orden)
          VALUES (?, ?, ?, ?, ?)
        `, [id, espec.nombre, espec.valor, espec.unidad || null, espec.orden])
      }
    }

    return { mensaje: 'Equipo actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar equipo:', error)
    throw error
  }
}