"use client"

import { useState, useEffect } from 'react'
import styles from './privacidad.module.css'
import { obtenerPrivacidad, actualizarPrivacidad } from './servidor'

export default function Privacidad() {
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [privacidad, setPrivacidad] = useState({
    contenido: '',
    version: '',
    fecha_vigencia: '',
    activo: true
  })
  const [privacidadEditada, setPrivacidadEditada] = useState({
    contenido: '',
    version: '',
    fecha_vigencia: '',
    activo: true
  })

  useEffect(() => {
    cargarPrivacidad()
  }, [])

  const cargarPrivacidad = async () => {
    try {
      setLoading(true)
      const data = await obtenerPrivacidad()
      console.log('Privacidad cargada:', data)
      if (data) {
        setPrivacidad(data)
        setPrivacidadEditada(data)
      }
    } catch (error) {
      console.error('Error cargando privacidad:', error)
      mostrarMensaje('Error al cargar política de privacidad', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!privacidadEditada.contenido.trim()) {
      mostrarMensaje('El contenido no puede estar vacío', 'error')
      return
    }

    if (!privacidadEditada.version.trim()) {
      mostrarMensaje('La versión es requerida', 'error')
      return
    }

    if (!privacidadEditada.fecha_vigencia) {
      mostrarMensaje('La fecha de vigencia es requerida', 'error')
      return
    }

    try {
      setProcesando(true)
      await actualizarPrivacidad(privacidadEditada)
      mostrarMensaje('Política de privacidad actualizada correctamente', 'success')
      await cargarPrivacidad()
      setModoEdicion(false)
    } catch (error) {
      console.error('Error al guardar:', error)
      mostrarMensaje(error.message || 'Error al guardar política de privacidad', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCancelar = () => {
    setPrivacidadEditada(privacidad)
    setModoEdicion(false)
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando política de privacidad...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Política de Privacidad</h1>
          <p className={styles.subtitle}>Gestiona la política de privacidad y protección de datos</p>
        </div>
        {!modoEdicion ? (
          <button 
            className={styles.btnPrimary}
            onClick={() => setModoEdicion(true)}
            disabled={procesando}
          >
            <ion-icon name="create-outline"></ion-icon>
            Editar Política
          </button>
        ) : (
          <div className={styles.headerActions}>
            <button 
              className={styles.btnSecondary}
              onClick={handleCancelar}
              disabled={procesando}
            >
              <ion-icon name="close-outline"></ion-icon>
              Cancelar
            </button>
            <button 
              className={styles.btnSuccess}
              onClick={handleGuardar}
              disabled={procesando}
            >
              <ion-icon name="save-outline"></ion-icon>
              {procesando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
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
        <div className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>
                <ion-icon name="bookmark-outline"></ion-icon>
                Versión Actual
              </label>
              {modoEdicion ? (
                <input
                  type="text"
                  value={privacidadEditada.version}
                  onChange={(e) => setPrivacidadEditada({...privacidadEditada, version: e.target.value})}
                  placeholder="Ej: 1.0, 2.3, etc"
                  className={styles.input}
                />
              ) : (
                <span className={styles.version}>{privacidad.version || 'Sin versión'}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <ion-icon name="calendar-outline"></ion-icon>
                Fecha de Vigencia
              </label>
              {modoEdicion ? (
                <input
                  type="date"
                  value={privacidadEditada.fecha_vigencia}
                  onChange={(e) => setPrivacidadEditada({...privacidadEditada, fecha_vigencia: e.target.value})}
                  className={styles.input}
                />
              ) : (
                <span className={styles.fecha}>{formatearFecha(privacidad.fecha_vigencia)}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <ion-icon name="toggle-outline"></ion-icon>
                Estado
              </label>
              {modoEdicion ? (
                <select
                  value={privacidadEditada.activo ? 'true' : 'false'}
                  onChange={(e) => setPrivacidadEditada({...privacidadEditada, activo: e.target.value === 'true'})}
                  className={styles.select}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              ) : (
                <span className={`${styles.estadoBadge} ${privacidad.activo ? styles.estadoActivo : styles.estadoInactivo}`}>
                  <ion-icon name={privacidad.activo ? 'checkmark-circle' : 'close-circle'}></ion-icon>
                  {privacidad.activo ? 'Activo' : 'Inactivo'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <h2>
              <ion-icon name="shield-checkmark-outline"></ion-icon>
              Contenido de Política de Privacidad
            </h2>
            {!modoEdicion && (
              <span className={styles.caracteresInfo}>
                {privacidad.contenido?.length || 0} caracteres
              </span>
            )}
          </div>

          <div className={styles.documentBody}>
            {modoEdicion ? (
              <div className={styles.editorContainer}>
                <textarea
                  value={privacidadEditada.contenido}
                  onChange={(e) => setPrivacidadEditada({...privacidadEditada, contenido: e.target.value})}
                  placeholder="Escribe aquí la política de privacidad..."
                  className={styles.editor}
                />
                <div className={styles.editorInfo}>
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <span>Puedes usar texto plano. Los saltos de línea se respetarán.</span>
                  <span className={styles.contador}>{privacidadEditada.contenido.length} caracteres</span>
                </div>
              </div>
            ) : (
              <div className={styles.preview}>
                {privacidad.contenido ? (
                  <div className={styles.previewContent}>
                    {privacidad.contenido.split('\n').map((parrafo, index) => (
                      parrafo.trim() ? (
                        <p key={index}>{parrafo}</p>
                      ) : (
                        <br key={index} />
                      )
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyPreview}>
                    <ion-icon name="shield-outline"></ion-icon>
                    <p>No hay política de privacidad configurada</p>
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => setModoEdicion(true)}
                    >
                      <ion-icon name="add-circle-outline"></ion-icon>
                      Agregar Política
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!modoEdicion && privacidad.contenido && (
          <div className={styles.actionsCard}>
            <h3>
              <ion-icon name="share-outline"></ion-icon>
              Acciones
            </h3>
            <div className={styles.actionsGrid}>
              <button 
                className={styles.actionBtn}
                onClick={() => {
                  const texto = `POLÍTICA DE PRIVACIDAD\nVersión ${privacidad.version}\nVigencia desde: ${formatearFecha(privacidad.fecha_vigencia)}\n\n${privacidad.contenido}`
                  navigator.clipboard.writeText(texto)
                  mostrarMensaje('Política copiada al portapapeles', 'success')
                }}
              >
                <ion-icon name="copy-outline"></ion-icon>
                <span>Copiar al Portapapeles</span>
              </button>

              <button 
                className={styles.actionBtn}
                onClick={() => {
                  const blob = new Blob([privacidad.contenido], { type: 'text/plain' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `politica-privacidad-v${privacidad.version}.txt`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                  mostrarMensaje('Política descargada correctamente', 'success')
                }}
              >
                <ion-icon name="download-outline"></ion-icon>
                <span>Descargar TXT</span>
              </button>

              <button 
                className={styles.actionBtn}
                onClick={() => window.print()}
              >
                <ion-icon name="print-outline"></ion-icon>
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}