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

export async function generarCodigoUnico() {
  try {
    const anioActual = new Date().getFullYear()
    const prefijo = `EQ-${anioActual}-`
    
    const [resultado] = await db.query(`
      SELECT codigo 
      FROM equipos 
      WHERE codigo LIKE ?
      ORDER BY codigo DESC 
      LIMIT 1
    `, [`${prefijo}%`])

    let nuevoNumero = 1

    if (resultado && resultado.length > 0) {
      const ultimoCodigo = resultado[0].codigo
      const partes = ultimoCodigo.split('-')
      const ultimoNumero = parseInt(partes[partes.length - 1])
      if (!isNaN(ultimoNumero)) {
        nuevoNumero = ultimoNumero + 1
      }
    }

    const numeroFormateado = String(nuevoNumero).padStart(4, '0')
    const codigoGenerado = `${prefijo}${numeroFormateado}`

    const [existe] = await db.query('SELECT id FROM equipos WHERE codigo = ?', [codigoGenerado])
    
    if (existe && existe.length > 0) {
      nuevoNumero++
      const nuevoCodigoFormateado = String(nuevoNumero).padStart(4, '0')
      return { codigo: `${prefijo}${nuevoCodigoFormateado}` }
    }

    return { codigo: codigoGenerado }
  } catch (error) {
    console.error('Error al generar código:', error)
    throw new Error('Error al generar código único')
  }
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
    const extension = path.extname(nombreOriginal)
    const nombreArchivo = `equipo_${tipo}_${timestamp}${extension}`

    const rutaPublic = path.join(process.cwd(), 'public', 'uploads', 'equipos')
    const rutaCompleta = path.join(rutaPublic, nombreArchivo)

    const fs = require('fs')
    if (!fs.existsSync(rutaPublic)) {
      fs.mkdirSync(rutaPublic, { recursive: true })
    }

    await writeFile(rutaCompleta, buffer)

    const url = `/uploads/equipos/${nombreArchivo}`

    return { url, mensaje: 'Imagen subida correctamente' }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    throw new Error('Error al subir la imagen')
  }
}

export async function crearEquipo(datos) {
  try {
    const slug = generarSlug(datos.nombre)

    const caracteristicasJSON = JSON.stringify(datos.caracteristicas)

    const [result] = await db.query(`
      INSERT INTO equipos (
        categoria_id, codigo, nombre, slug, tipo, marca, modelo, capacidad,
        descripcion_corta, descripcion_completa, tecnologia, caracteristicas,
        estado, stock, precio_dia, precio_semana, precio_mes, precio_compra,
        fecha_adquisicion, garantia_meses, peso_kg, dimensiones, imagen_principal,
        activo, destacado, fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      datos.categoria_id,
      datos.codigo,
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
      datos.destacado
    ])

    const equipoId = result.insertId

    if (datos.imagenes && datos.imagenes.length > 0) {
      for (let i = 0; i < datos.imagenes.length; i++) {
        const img = datos.imagenes[i]
        await db.query(`
          INSERT INTO imagenes_equipos (equipo_id, url, alt_text, orden, es_principal, fecha_subida)
          VALUES (?, ?, ?, ?, false, NOW())
        `, [equipoId, img.url, img.alt_text || '', i])
      }
    }

    if (datos.especificaciones && datos.especificaciones.length > 0) {
      for (const espec of datos.especificaciones) {
        await db.query(`
          INSERT INTO especificaciones_equipos (equipo_id, nombre, valor, unidad, orden)
          VALUES (?, ?, ?, ?, ?)
        `, [equipoId, espec.nombre, espec.valor, espec.unidad || null, espec.orden])
      }
    }

    return { id: equipoId, mensaje: 'Equipo creado correctamente' }
  } catch (error) {
    console.error('Error al crear equipo:', error)
    throw error
  }
}