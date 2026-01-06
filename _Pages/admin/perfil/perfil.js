"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './perfil.module.css'
import { obtenerPerfil, actualizarPerfil, cambiarPassword, subirAvatar } from './servidor'

export default function MiPerfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [tabActiva, setTabActiva] = useState('informacion')
  const [usuario, setUsuario] = useState(null)
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    username: '',
    telefono: '',
    avatar_url: ''
  })
  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmar: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    try {
      setLoading(true)
      const data = await obtenerPerfil()
      setUsuario(data)
      setFormData({
        nombre_completo: data.nombre_completo || '',
        email: data.email || '',
        username: data.username || '',
        telefono: data.telefono || '',
        avatar_url: data.avatar_url || ''
      })
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      mostrarMensaje('Error al cargar perfil de usuario', 'error')
      if (error.message === 'No hay sesion activa' || error.message === 'Sesion no valida') {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        mostrarMensaje('La imagen no puede superar los 2MB', 'error')
        return
      }
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Solo se permiten archivos de imagen', 'error')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleActualizarPerfil = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre_completo.trim()) {
      mostrarMensaje('El nombre completo es requerido', 'error')
      return
    }

    if (!formData.email.trim()) {
      mostrarMensaje('El email es requerido', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      mostrarMensaje('Email no valido', 'error')
      return
    }

    try {
      setProcesando(true)
      await actualizarPerfil(formData)
      mostrarMensaje('Perfil actualizado correctamente', 'success')
      await cargarPerfil()
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      mostrarMensaje(error.message || 'Error al actualizar perfil', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()

    if (!passwordData.password_actual || !passwordData.password_nueva || !passwordData.password_confirmar) {
      mostrarMensaje('Todos los campos son requeridos', 'error')
      return
    }

    if (passwordData.password_nueva.length < 8) {
      mostrarMensaje('La nueva contrasena debe tener al menos 8 caracteres', 'error')
      return
    }

    if (passwordData.password_nueva !== passwordData.password_confirmar) {
      mostrarMensaje('Las contrasenas no coinciden', 'error')
      return
    }

    try {
      setProcesando(true)
      await cambiarPassword(passwordData.password_actual, passwordData.password_nueva)
      mostrarMensaje('Contrasena actualizada correctamente', 'success')
      setPasswordData({
        password_actual: '',
        password_nueva: '',
        password_confirmar: ''
      })
    } catch (error) {
      console.error('Error al cambiar contrasena:', error)
      mostrarMensaje(error.message || 'Error al cambiar contrasena', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleSubirAvatar = async () => {
    if (!avatarFile) {
      mostrarMensaje('Selecciona una imagen primero', 'error')
      return
    }

    try {
      setProcesando(true)
      const formDataAvatar = new FormData()
      formDataAvatar.append('avatar', avatarFile)
      
      await subirAvatar(formDataAvatar)
      mostrarMensaje('Avatar actualizado correctamente', 'success')
      setAvatarFile(null)
      setAvatarPreview(null)
      await cargarPerfil()
    } catch (error) {
      console.error('Error al subir avatar:', error)
      mostrarMensaje(error.message || 'Error al subir avatar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando perfil...</span>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>No se pudo cargar el perfil de usuario</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Perfil</h1>
          <p className={styles.subtitle}>Administra tu informacion personal y configuracion de cuenta</p>
        </div>
      </div>

      {mensaje && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          <ion-icon name={mensaje.tipo === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}></ion-icon>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {avatarPreview || usuario.avatar_url ? (
                <img 
                  src={avatarPreview || usuario.avatar_url} 
                  alt={usuario.nombre_completo}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <ion-icon name="person"></ion-icon>
                </div>
              )}
            </div>
            <div className={styles.avatarInfo}>
              <h3>{usuario.nombre_completo}</h3>
              <p>{usuario.email}</p>
              <span className={styles.rolBadge}>{usuario.rol}</span>
            </div>
            <div className={styles.avatarActions}>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.fileInput}
              />
              <label htmlFor="avatar-upload" className={styles.btnUpload}>
                <ion-icon name="camera-outline"></ion-icon>
                Cambiar foto
              </label>
              {avatarFile && (
                <button 
                  className={styles.btnSaveAvatar}
                  onClick={handleSubirAvatar}
                  disabled={procesando}
                >
                  <ion-icon name="checkmark-outline"></ion-icon>
                  Guardar foto
                </button>
              )}
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tabActiva === 'informacion' ? styles.tabActive : ''}`}
              onClick={() => setTabActiva('informacion')}
            >
              <ion-icon name="person-outline"></ion-icon>
              Informacion Personal
            </button>
            <button
              className={`${styles.tab} ${tabActiva === 'seguridad' ? styles.tabActive : ''}`}
              onClick={() => setTabActiva('seguridad')}
            >
              <ion-icon name="lock-closed-outline"></ion-icon>
              Seguridad
            </button>
            <button
              className={`${styles.tab} ${tabActiva === 'actividad' ? styles.tabActive : ''}`}
              onClick={() => setTabActiva('actividad')}
            >
              <ion-icon name="time-outline"></ion-icon>
              Actividad
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          {tabActiva === 'informacion' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Informacion Personal</h2>
                <p>Actualiza tu informacion de perfil</p>
              </div>

              <form onSubmit={handleActualizarPerfil} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre_completo">
                      <ion-icon name="person-outline"></ion-icon>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu nombre completo"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="username">
                      <ion-icon name="at-outline"></ion-icon>
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nombre de usuario"
                      required
                      disabled
                    />
                    <small>El nombre de usuario no se puede cambiar</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      <ion-icon name="mail-outline"></ion-icon>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">
                      <ion-icon name="call-outline"></ion-icon>
                      Telefono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={cargarPerfil}
                    disabled={procesando}
                  >
                    <ion-icon name="refresh-outline"></ion-icon>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={procesando}
                  >
                    <ion-icon name="save-outline"></ion-icon>
                    {procesando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tabActiva === 'seguridad' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Seguridad de la Cuenta</h2>
                <p>Cambia tu contrasena para mantener tu cuenta segura</p>
              </div>

              <form onSubmit={handleCambiarPassword} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="password_actual">
                    <ion-icon name="key-outline"></ion-icon>
                    Contrasena Actual
                  </label>
                  <input
                    type="password"
                    id="password_actual"
                    name="password_actual"
                    value={passwordData.password_actual}
                    onChange={handlePasswordChange}
                    placeholder="Ingresa tu contrasena actual"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password_nueva">
                    <ion-icon name="lock-closed-outline"></ion-icon>
                    Nueva Contrasena
                  </label>
                  <input
                    type="password"
                    id="password_nueva"
                    name="password_nueva"
                    value={passwordData.password_nueva}
                    onChange={handlePasswordChange}
                    placeholder="Minimo 8 caracteres"
                    required
                    minLength="8"
                  />
                  <small>La contrasena debe tener al menos 8 caracteres</small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password_confirmar">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    Confirmar Nueva Contrasena
                  </label>
                  <input
                    type="password"
                    id="password_confirmar"
                    name="password_confirmar"
                    value={passwordData.password_confirmar}
                    onChange={handlePasswordChange}
                    placeholder="Repite la nueva contrasena"
                    required
                    minLength="8"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setPasswordData({
                      password_actual: '',
                      password_nueva: '',
                      password_confirmar: ''
                    })}
                    disabled={procesando}
                  >
                    <ion-icon name="close-outline"></ion-icon>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={procesando}
                  >
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    {procesando ? 'Actualizando...' : 'Cambiar Contrasena'}
                  </button>
                </div>
              </form>

              <div className={styles.securityInfo}>
                <div className={styles.infoCard}>
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <div>
                    <h4>Consejos de seguridad</h4>
                    <ul>
                      <li>Usa una contrasena unica para esta cuenta</li>
                      <li>Combina letras mayusculas, minusculas, numeros y simbolos</li>
                      <li>No compartas tu contrasena con nadie</li>
                      <li>Cambia tu contrasena periodicamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'actividad' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Actividad de la Cuenta</h2>
                <p>Informacion sobre tu actividad reciente</p>
              </div>

              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ion-icon name="calendar-outline"></ion-icon>
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>Cuenta creada</h4>
                    <p>{formatearFecha(usuario.fecha_creacion)}</p>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ion-icon name="time-outline"></ion-icon>
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>Ultimo acceso</h4>
                    <p>{formatearFecha(usuario.ultimo_acceso)}</p>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ion-icon name="pencil-outline"></ion-icon>
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>Ultima actualizacion</h4>
                    <p>{formatearFecha(usuario.fecha_actualizacion)}</p>
                  </div>
                </div>

                {usuario.email_verificado && (
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                    </div>
                    <div className={styles.activityInfo}>
                      <h4>Email verificado</h4>
                      <p>{formatearFecha(usuario.fecha_verificacion_email)}</p>
                    </div>
                  </div>
                )}

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>Estado de la cuenta</h4>
                    <p>
                      {usuario.activo ? (
                        <span className={styles.estadoActivo}>Activa</span>
                      ) : (
                        <span className={styles.estadoInactivo}>Inactiva</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}