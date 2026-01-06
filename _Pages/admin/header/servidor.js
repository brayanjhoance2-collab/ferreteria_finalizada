"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

export async function obtenerUsuarioSesion() {
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
        u.activo,
        u.avatar_url
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
        rol: sesion.rol,
        avatar_url: sesion.avatar_url
      }
    }

  } catch (error) {
    console.error('Error al obtener usuario sesión:', error)
    return {
      valida: false,
      usuario: null
    }
  }
}

export async function obtenerEmpresaInfo() {
  try {
    const [result] = await db.query(`
      SELECT 
        id,
        nombre,
        logo_url,
        telefono,
        email
      FROM empresa_info 
      WHERE activo = true
      LIMIT 1
    `)

    if (!result || result.length === 0) {
      return {
        id: 1,
        nombre: 'Ferretería RyM',
        logo_url: null,
        telefono: '+51 1 234 5678',
        email: 'contacto@ferreteriarym.pe'
      }
    }

    return result[0]
  } catch (error) {
    console.error('Error al obtener info empresa:', error)
    return {
      id: 1,
      nombre: 'Ferretería RyM',
      logo_url: null,
      telefono: '+51 1 234 5678',
      email: 'contacto@ferreteriarym.pe'
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