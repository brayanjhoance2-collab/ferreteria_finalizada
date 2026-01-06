"use client"

import { useState, useEffect } from 'react'
import styles from './terminos.module.css'
import { obtenerTerminos, actualizarTerminos } from './servidor'

export default function Terminos() {
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [terminos, setTerminos] = useState({
    contenido: '',
    version: '',
    fecha_vigencia: '',
    activo: true
  })
  const [terminosEditados, setTerminosEditados] = useState({
    contenido: '',
    version: '',
    fecha_vigencia: '',
    activo: true
  })

  useEffect(() => {
    cargarTerminos()
  }, [])

  const cargarTerminos = async () => {
    try {
      setLoading(true)
      const data = await obtenerTerminos()
      console.log('Terminos cargados:', data)
      if (data) {
        setTerminos(data)
        setTerminosEditados(data)
      }
    } catch (error) {
      console.error('Error cargando terminos:', error)
      mostrarMensaje('Error al cargar términos y condiciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!terminosEditados.contenido.trim()) {
      mostrarMensaje('El contenido no puede estar vacío', 'error')
      return
    }

    if (!terminosEditados.version.trim()) {
      mostrarMensaje('La versión es requerida', 'error')
      return
    }

    if (!terminosEditados.fecha_vigencia) {
      mostrarMensaje('La fecha de vigencia es requerida', 'error')
      return
    }

    try {
      setProcesando(true)
      await actualizarTerminos(terminosEditados)
      mostrarMensaje('Términos y condiciones actualizados correctamente', 'success')
      await cargarTerminos()
      setModoEdicion(false)
    } catch (error) {
      console.error('Error al guardar:', error)
      mostrarMensaje(error.message || 'Error al guardar términos y condiciones', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCancelar = () => {
    setTerminosEditados(terminos)
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
          <span>Cargando términos y condiciones...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Términos y Condiciones</h1>
          <p className={styles.subtitle}>Gestiona los términos y condiciones del servicio</p>
        </div>
        {!modoEdicion ? (
          <button 
            className={styles.btnPrimary}
            onClick={() => setModoEdicion(true)}
            disabled={procesando}
          >
            <ion-icon name="create-outline"></ion-icon>
            Editar Términos
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
                  value={terminosEditados.version}
                  onChange={(e) => setTerminosEditados({...terminosEditados, version: e.target.value})}
                  placeholder="Ej: 1.0, 2.3, etc"
                  className={styles.input}
                />
              ) : (
                <span className={styles.version}>{terminos.version || 'Sin versión'}</span>
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
                  value={terminosEditados.fecha_vigencia}
                  onChange={(e) => setTerminosEditados({...terminosEditados, fecha_vigencia: e.target.value})}
                  className={styles.input}
                />
              ) : (
                <span className={styles.fecha}>{formatearFecha(terminos.fecha_vigencia)}</span>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <ion-icon name="toggle-outline"></ion-icon>
                Estado
              </label>
              {modoEdicion ? (
                <select
                  value={terminosEditados.activo ? 'true' : 'false'}
                  onChange={(e) => setTerminosEditados({...terminosEditados, activo: e.target.value === 'true'})}
                  className={styles.select}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              ) : (
                <span className={`${styles.estadoBadge} ${terminos.activo ? styles.estadoActivo : styles.estadoInactivo}`}>
                  <ion-icon name={terminos.activo ? 'checkmark-circle' : 'close-circle'}></ion-icon>
                  {terminos.activo ? 'Activo' : 'Inactivo'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <h2>
              <ion-icon name="document-text-outline"></ion-icon>
              Contenido de Términos y Condiciones
            </h2>
            {!modoEdicion && (
              <span className={styles.caracteresInfo}>
                {terminos.contenido?.length || 0} caracteres
              </span>
            )}
          </div>

          <div className={styles.documentBody}>
            {modoEdicion ? (
              <div className={styles.editorContainer}>
                <textarea
                  value={terminosEditados.contenido}
                  onChange={(e) => setTerminosEditados({...terminosEditados, contenido: e.target.value})}
                  placeholder="Escribe aquí los términos y condiciones..."
                  className={styles.editor}
                />
                <div className={styles.editorInfo}>
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <span>Puedes usar texto plano. Los saltos de línea se respetarán.</span>
                  <span className={styles.contador}>{terminosEditados.contenido.length} caracteres</span>
                </div>
              </div>
            ) : (
              <div className={styles.preview}>
                {terminos.contenido ? (
                  <div className={styles.previewContent}>
                    {terminos.contenido.split('\n').map((parrafo, index) => (
                      parrafo.trim() ? (
                        <p key={index}>{parrafo}</p>
                      ) : (
                        <br key={index} />
                      )
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyPreview}>
                    <ion-icon name="document-outline"></ion-icon>
                    <p>No hay términos y condiciones configurados</p>
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => setModoEdicion(true)}
                    >
                      <ion-icon name="add-circle-outline"></ion-icon>
                      Agregar Términos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!modoEdicion && terminos.contenido && (
          <div className={styles.actionsCard}>
            <h3>
              <ion-icon name="share-outline"></ion-icon>
              Acciones
            </h3>
            <div className={styles.actionsGrid}>
              <button 
                className={styles.actionBtn}
                onClick={() => {
                  const texto = `TÉRMINOS Y CONDICIONES\nVersión ${terminos.version}\nVigencia desde: ${formatearFecha(terminos.fecha_vigencia)}\n\n${terminos.contenido}`
                  navigator.clipboard.writeText(texto)
                  mostrarMensaje('Términos copiados al portapapeles', 'success')
                }}
              >
                <ion-icon name="copy-outline"></ion-icon>
                <span>Copiar al Portapapeles</span>
              </button>

              <button 
                className={styles.actionBtn}
                onClick={() => {
                  const blob = new Blob([terminos.contenido], { type: 'text/plain' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `terminos-condiciones-v${terminos.version}.txt`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                  mostrarMensaje('Términos descargados correctamente', 'success')
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