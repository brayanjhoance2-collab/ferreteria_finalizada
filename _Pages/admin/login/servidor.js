"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function iniciarSesion(username, password) {
  try {
    if (!username || !password) {
      return {
        success: false,
        message: 'Usuario y contraseña son requeridos'
      }
    }

    const [result] = await db.query(`
      SELECT 
        id,
        username,
        email,
        password_hash,
        nombre_completo,
        rol,
        activo,
        bloqueado_hasta
      FROM usuarios 
      WHERE (username = ? OR email = ?) AND activo = true
      LIMIT 1
    `, [username, username])

    if (!result || result.length === 0) {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      }
    }

    const usuario = result[0]

    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return {
        success: false,
        message: 'Usuario temporalmente bloqueado. Intente más tarde.'
      }
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash)

    if (!passwordValido) {
      await db.query(`
        UPDATE usuarios 
        SET intentos_fallidos = intentos_fallidos + 1,
            bloqueado_hasta = CASE 
              WHEN intentos_fallidos + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
              ELSE bloqueado_hasta
            END
        WHERE id = ?
      `, [usuario.id])

      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      }
    }

    await db.query(`
      UPDATE usuarios 
      SET intentos_fallidos = 0,
          bloqueado_hasta = NULL,
          ultimo_acceso = NOW()
      WHERE id = ?
    `, [usuario.id])

    const sessionToken = generarToken()
    const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.query(`
      INSERT INTO sesiones_usuarios (usuario_id, token, fecha_expiracion, activa)
      VALUES (?, ?, ?, true)
    `, [usuario.id, sessionToken, expiracion])

    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiracion,
      path: '/'
    })

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        rol: usuario.rol
      }
    }

  } catch (error) {
    console.error('Error en inicio de sesión:', error)
    return {
      success: false,
      message: 'Error al iniciar sesión. Intente nuevamente.'
    }
  }
}

export async function cerrarSesion() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (sessionToken) {
      await db.query(`
        UPDATE sesiones_usuarios 
        SET activa = false 
        WHERE token = ?
      `, [sessionToken])
    }

    cookieStore.delete('session_token')

    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return {
      success: false,
      message: 'Error al cerrar sesión'
    }
  }
}

export async function verificarSesion() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return {
        valida: false,
        usuario: null
      }
    }

    const [result] = await db.query(`
      SELECT 
        s.id,
        s.usuario_id,
        s.fecha_expiracion,
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
      cookieStore.delete('session_token')
      return {
        valida: false,
        usuario: null
      }
    }

    const sesion = result[0]

    if (new Date(sesion.fecha_expiracion) < new Date()) {
      await db.query(`
        UPDATE sesiones_usuarios 
        SET activa = false 
        WHERE token = ?
      `, [sessionToken])

      cookieStore.delete('session_token')
      return {
        valida: false,
        usuario: null
      }
    }

    return {
      valida: true,
      usuario: {
        id: sesion.usuario_id,
        username: sesion.username,
        email: sesion.email,
        nombre_completo: sesion.nombre_completo,
        rol: sesion.rol
      }
    }

  } catch (error) {
    console.error('Error al verificar sesión:', error)
    return {
      valida: false,
      usuario: null
    }
  }
}

function generarToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}