"use server"

import db from "@/_DB/db"
import { writeFile } from 'fs/promises'
import path from 'path'

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

export async function subirImagen(formData) {
  try {
    const imagen = formData.get('imagen')
    
    if (!imagen) {
      throw new Error('No se proporcionó ninguna imagen')
    }

    const bytes = await imagen.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const nombreOriginal = imagen.name.replace(/\s+/g, '_')
    const extension = path.extname(nombreOriginal)
    const nombreArchivo = `categoria_${timestamp}${extension}`

    const rutaPublic = path.join(process.cwd(), 'public', 'uploads', 'categorias')
    const rutaCompleta = path.join(rutaPublic, nombreArchivo)

    const fs = require('fs')
    if (!fs.existsSync(rutaPublic)) {
      fs.mkdirSync(rutaPublic, { recursive: true })
    }

    await writeFile(rutaCompleta, buffer)

    const url = `/uploads/categorias/${nombreArchivo}`

    return { url, mensaje: 'Imagen subida correctamente' }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    throw new Error('Error al subir la imagen')
  }
}

export async function obtenerCategorias() {
  try {
    const [categorias] = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as total_equipos
      FROM categorias_equipos c
      LEFT JOIN equipos e ON e.categoria_id = c.id AND e.activo = true
      GROUP BY c.id
      ORDER BY c.orden ASC, c.nombre ASC
    `)

    return categorias || []
  } catch (error) {
    console.error('Error al obtener categorias:', error)
    throw new Error('Error al obtener las categorías')
  }
}

export async function crearCategoria(datos) {
  try {
    const slug = generarSlug(datos.nombre)

    const [existe] = await db.query(
      'SELECT id FROM categorias_equipos WHERE slug = ?',
      [slug]
    )

    if (existe && existe.length > 0) {
      throw new Error('Ya existe una categoría con ese nombre')
    }

    const [maxOrden] = await db.query(
      'SELECT COALESCE(MAX(orden), 0) + 1 as siguiente_orden FROM categorias_equipos'
    )

    const orden = maxOrden[0].siguiente_orden

    const [result] = await db.query(`
      INSERT INTO categorias_equipos 
      (nombre, slug, descripcion, tipo_tendido, imagen_url, orden, activo, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      datos.nombre,
      slug,
      datos.descripcion || null,
      datos.tipo_tendido,
      datos.imagen_url || null,
      orden,
      datos.activo
    ])

    return { id: result.insertId, mensaje: 'Categoría creada correctamente' }
  } catch (error) {
    console.error('Error al crear categoria:', error)
    throw error
  }
}

export async function actualizarCategoria(id, datos) {
  try {
    const slug = generarSlug(datos.nombre)

    const [existe] = await db.query(
      'SELECT id FROM categorias_equipos WHERE slug = ? AND id != ?',
      [slug, id]
    )

    if (existe && existe.length > 0) {
      throw new Error('Ya existe otra categoría con ese nombre')
    }

    await db.query(`
      UPDATE categorias_equipos 
      SET 
        nombre = ?,
        slug = ?,
        descripcion = ?,
        tipo_tendido = ?,
        imagen_url = ?,
        activo = ?
      WHERE id = ?
    `, [
      datos.nombre,
      slug,
      datos.descripcion || null,
      datos.tipo_tendido,
      datos.imagen_url || null,
      datos.activo,
      id
    ])

    return { mensaje: 'Categoría actualizada correctamente' }
  } catch (error) {
    console.error('Error al actualizar categoria:', error)
    throw error
  }
}

export async function eliminarCategoria(id) {
  try {
    const [equipos] = await db.query(
      'SELECT COUNT(*) as total FROM equipos WHERE categoria_id = ? AND activo = true',
      [id]
    )

    if (equipos[0].total > 0) {
      throw new Error(`No se puede eliminar. Hay ${equipos[0].total} equipos asociados a esta categoría`)
    }

    await db.query('DELETE FROM categorias_equipos WHERE id = ?', [id])

    const [todasCategorias] = await db.query(
      'SELECT id FROM categorias_equipos ORDER BY orden ASC'
    )

    for (let i = 0; i < todasCategorias.length; i++) {
      await db.query(
        'UPDATE categorias_equipos SET orden = ? WHERE id = ?',
        [i, todasCategorias[i].id]
      )
    }

    return { mensaje: 'Categoría eliminada correctamente' }
  } catch (error) {
    console.error('Error al eliminar categoria:', error)
    throw error
  }
}

export async function cambiarOrden(id, direccion) {
  try {
    const [categoriaActual] = await db.query(
      'SELECT id, orden FROM categorias_equipos WHERE id = ?',
      [id]
    )

    if (!categoriaActual || categoriaActual.length === 0) {
      throw new Error('Categoría no encontrada')
    }

    const ordenActual = categoriaActual[0].orden

    if (direccion === 'subir') {
      const [categoriaAnterior] = await db.query(
        'SELECT id, orden FROM categorias_equipos WHERE orden < ? ORDER BY orden DESC LIMIT 1',
        [ordenActual]
      )

      if (categoriaAnterior && categoriaAnterior.length > 0) {
        const ordenAnterior = categoriaAnterior[0].orden
        const idAnterior = categoriaAnterior[0].id

        await db.query('UPDATE categorias_equipos SET orden = ? WHERE id = ?', [ordenAnterior, id])
        await db.query('UPDATE categorias_equipos SET orden = ? WHERE id = ?', [ordenActual, idAnterior])
      }
    } else if (direccion === 'bajar') {
      const [categoriaSiguiente] = await db.query(
        'SELECT id, orden FROM categorias_equipos WHERE orden > ? ORDER BY orden ASC LIMIT 1',
        [ordenActual]
      )

      if (categoriaSiguiente && categoriaSiguiente.length > 0) {
        const ordenSiguiente = categoriaSiguiente[0].orden
        const idSiguiente = categoriaSiguiente[0].id

        await db.query('UPDATE categorias_equipos SET orden = ? WHERE id = ?', [ordenSiguiente, id])
        await db.query('UPDATE categorias_equipos SET orden = ? WHERE id = ?', [ordenActual, idSiguiente])
      }
    }

    return { mensaje: 'Orden actualizado correctamente' }
  } catch (error) {
    console.error('Error al cambiar orden:', error)
    throw error
  }
}