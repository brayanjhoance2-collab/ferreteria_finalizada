"use server"

import db from "@/_DB/db"
import bcrypt from 'bcryptjs'

export async function crearSuperAdminInicial() {
  try {
    const [superAdminRows] = await db.query(
      `SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE rol = 'admin' AND activo = true`
    )

    const superAdminExistente = superAdminRows[0]

    if (superAdminExistente.total > 0) {
      return {
        success: true,
        creado: false,
        mensaje: 'Ya existe un administrador en el sistema'
      }
    }

    const [usuarioRows] = await db.query(
      `SELECT id, rol FROM usuarios WHERE email = ?`,
      ['prueba@gmail.com']
    )

    let usuarioId

    if (usuarioRows.length > 0) {
      usuarioId = usuarioRows[0].id

      const contrasenaHash = await bcrypt.hash('123456', 12)

      await db.query(
        `UPDATE usuarios 
        SET 
          username = ?,
          nombre_completo = ?,
          password_hash = ?,
          rol = ?,
          activo = ?,
          email_verificado = ?,
          intentos_fallidos = ?,
          fecha_actualizacion = NOW()
        WHERE id = ?`,
        ['admin', 'Administrador', contrasenaHash, 'admin', true, true, 0, usuarioId]
      )
    } else {
      const contrasenaHash = await bcrypt.hash('123456', 12)

      const [resultadoUsuario] = await db.query(
        `INSERT INTO usuarios (
          username,
          email,
          password_hash,
          nombre_completo,
          rol,
          activo,
          email_verificado,
          intentos_fallidos,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'admin',
          'prueba@gmail.com',
          contrasenaHash,
          'Administrador',
          'admin',
          true,
          true,
          0
        ]
      )

      usuarioId = resultadoUsuario.insertId
    }

    return {
      success: true,
      creado: true,
      mensaje: 'Administrador creado exitosamente',
      datos: {
        username: 'admin',
        email: 'prueba@gmail.com',
        rol: 'admin',
        password: '123456'
      }
    }

  } catch (error) {
    console.error('Error al crear administrador inicial:', error)

    return {
      success: false,
      creado: false,
      mensaje: 'Error al crear administrador inicial: ' + error.message
    }
  }
}

export async function verificarEstadoSuperAdmin() {
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        username,
        email,
        nombre_completo,
        rol,
        activo,
        fecha_creacion,
        fecha_actualizacion
      FROM usuarios 
      WHERE email = ? AND rol = ?`,
      ['prueba@gmail.com', 'admin']
    )

    return {
      success: true,
      existe: rows.length > 0,
      datos: rows.length > 0 ? rows[0] : null
    }

  } catch (error) {
    console.error('Error al verificar administrador:', error)
    return {
      success: false,
      existe: false,
      error: error.message
    }
  }
}