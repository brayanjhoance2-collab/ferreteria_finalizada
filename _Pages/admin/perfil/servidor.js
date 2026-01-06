"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/uploads'

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

export async function obtenerPerfil() {
  try {
    const sesion = await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        username,
        email,
        nombre_completo,
        rol,
        cliente_id,
        avatar_url,
        telefono,
        activo,
        email_verificado,
        fecha_verificacion_email,
        ultimo_acceso,
        fecha_creacion,
        fecha_actualizacion
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `, [sesion.usuario_id])

    if (!result || result.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    throw error
  }
}

export async function actualizarPerfil(datos) {
  try {
    const sesion = await verificarSesion()

    if (!datos.nombre_completo || !datos.nombre_completo.trim()) {
      throw new Error('El nombre completo es requerido')
    }

    if (!datos.email || !datos.email.trim()) {
      throw new Error('El email es requerido')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datos.email)) {
      throw new Error('Email no valido')
    }

    const [emailExistente] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [datos.email, sesion.usuario_id]
    )

    if (emailExistente && emailExistente.length > 0) {
      throw new Error('El email ya esta en uso por otro usuario')
    }

    await db.query(`
      UPDATE usuarios 
      SET 
        nombre_completo = ?,
        email = ?,
        telefono = ?,
        fecha_actualizacion = NOW()
      WHERE id = ?
    `, [
      datos.nombre_completo.trim(),
      datos.email.trim(),
      datos.telefono?.trim() || null,
      sesion.usuario_id
    ])

    return { mensaje: 'Perfil actualizado correctamente' }
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    throw error
  }
}

export async function cambiarPassword(passwordActual, passwordNueva) {
  try {
    const sesion = await verificarSesion()

    if (!passwordActual || !passwordActual.trim()) {
      throw new Error('La contrasena actual es requerida')
    }

    if (!passwordNueva || !passwordNueva.trim()) {
      throw new Error('La nueva contrasena es requerida')
    }

    if (passwordNueva.length < 8) {
      throw new Error('La nueva contrasena debe tener al menos 8 caracteres')
    }

    const [usuario] = await db.query(
      'SELECT id, password_hash FROM usuarios WHERE id = ?',
      [sesion.usuario_id]
    )

    if (!usuario || usuario.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    const passwordValida = await bcrypt.compare(passwordActual, usuario[0].password_hash)

    if (!passwordValida) {
      throw new Error('La contrasena actual es incorrecta')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordNueva, salt)

    await db.query(
      'UPDATE usuarios SET password_hash = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [passwordHash, sesion.usuario_id]
    )

    return { mensaje: 'Contrasena actualizada correctamente' }
  } catch (error) {
    console.error('Error al cambiar contrasena:', error)
    throw error
  }
}

export async function subirAvatar(formData) {
  try {
    const sesion = await verificarSesion()

    const file = formData.get('avatar')
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
    const fileName = `avatar-${sesion.usuario_id}-${Date.now()}.${extension}`
    
    const uploadDir = join(UPLOADS_DIR, 'avatars')
    const filePath = join(uploadDir, fileName)

    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const avatarUrl = `/uploads/avatars/${fileName}`

    const [usuarioActual] = await db.query(
      'SELECT avatar_url FROM usuarios WHERE id = ?',
      [sesion.usuario_id]
    )

    if (usuarioActual && usuarioActual.length > 0 && usuarioActual[0].avatar_url) {
      const oldFileName = usuarioActual[0].avatar_url.split('/').pop()
      const oldAvatarPath = join(UPLOADS_DIR, 'avatars', oldFileName)
      try {
        await unlink(oldAvatarPath)
      } catch (err) {
        console.error('Error al eliminar avatar anterior:', err)
      }
    }

    await db.query(
      'UPDATE usuarios SET avatar_url = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [avatarUrl, sesion.usuario_id]
    )

    return { mensaje: 'Avatar actualizado correctamente', avatarUrl }
  } catch (error) {
    console.error('Error al subir avatar:', error)
    throw error
  }
}

export async function obtenerDatosUsuario(usuarioId) {
  try {
    await verificarSesion()

    const [result] = await db.query(`
      SELECT 
        id,
        username,
        email,
        nombre_completo,
        rol,
        avatar_url,
        telefono,
        activo,
        fecha_creacion
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `, [usuarioId])

    if (!result || result.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener datos usuario:', error)
    throw error
  }
}