"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './contacto.module.css'
import { obtenerPaginaContacto, actualizarPaginaContacto, subirImagenHero } from './servidor'

export default function AdminContacto() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [formData, setFormData] = useState({
    hero_titulo: '',
    hero_subtitulo: '',
    hero_imagen_url: '',
    info_titulo: '',
    info_descripcion: '',
    ubicacion_texto: '',
    mapa_url: '',
    cta_titulo: '',
    cta_descripcion: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    whatsapp_url: ''
  })
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await obtenerPaginaContacto()
      setFormData({
        hero_titulo: data.hero_titulo || '',
        hero_subtitulo: data.hero_subtitulo || '',
        hero_imagen_url: data.hero_imagen_url || '',
        info_titulo: data.info_titulo || '',
        info_descripcion: data.info_descripcion || '',
        ubicacion_texto: data.ubicacion_texto || '',
        mapa_url: data.mapa_url || '',
        cta_titulo: data.cta_titulo || '',
        cta_descripcion: data.cta_descripcion || '',
        facebook_url: data.facebook_url || '',
        instagram_url: data.instagram_url || '',
        linkedin_url: data.linkedin_url || '',
        whatsapp_url: data.whatsapp_url || ''
      })
    } catch (error) {
      console.error('Error al cargar datos:', error)
      mostrarMensaje('Error al cargar informacion de la pagina', 'error')
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

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen no puede superar los 5MB', 'error')
        return
      }
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Solo se permiten archivos de imagen', 'error')
        return
      }
      setImagenFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleActualizar = async (e) => {
    e.preventDefault()

    try {
      setProcesando(true)
      await actualizarPaginaContacto(formData)
      mostrarMensaje('Pagina actualizada correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al actualizar:', error)
      mostrarMensaje(error.message || 'Error al actualizar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleSubirImagen = async () => {
    if (!imagenFile) {
      mostrarMensaje('Selecciona una imagen primero', 'error')
      return
    }

    try {
      setProcesando(true)
      const formDataImagen = new FormData()
      formDataImagen.append('imagen', imagenFile)
      
      await subirImagenHero(formDataImagen)
      mostrarMensaje('Imagen actualizada correctamente', 'success')
      setImagenFile(null)
      setImagenPreview(null)
      await cargarDatos()
    } catch (error) {
      console.error('Error al subir imagen:', error)
      mostrarMensaje(error.message || 'Error al subir imagen', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando pagina de contacto...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Pagina de Contacto</h1>
          <p className={styles.subtitle}>Edita el contenido que se muestra en la pagina de contacto del sitio web</p>
        </div>
        <a 
          href="/contacto" 
          target="_blank"
          className={styles.btnPreview}
        >
          <ion-icon name="eye-outline"></ion-icon>
          Ver Pagina
        </a>
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
        <form onSubmit={handleActualizar} className={styles.form}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ion-icon name="image-outline"></ion-icon>
                <h2>Seccion Hero</h2>
              </div>
              <p className={styles.sectionDesc}>Imagen y textos principales de la pagina</p>
            </div>

            <div className={styles.imagenContainer}>
              <div className={styles.imagenPreview}>
                {imagenPreview || formData.hero_imagen_url ? (
                  <img 
                    src={imagenPreview || formData.hero_imagen_url} 
                    alt="Hero"
                    className={styles.imagen}
                  />
                ) : (
                  <div className={styles.imagenPlaceholder}>
                    <ion-icon name="image-outline"></ion-icon>
                    <p>Sin imagen</p>
                  </div>
                )}
              </div>
              <div className={styles.imagenActions}>
                <input
                  type="file"
                  id="imagen-upload"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className={styles.fileInput}
                />
                <label htmlFor="imagen-upload" className={styles.btnUpload}>
                  <ion-icon name="cloud-upload-outline"></ion-icon>
                  Seleccionar imagen
                </label>
                {imagenFile && (
                  <button 
                    type="button"
                    className={styles.btnSaveImagen}
                    onClick={handleSubirImagen}
                    disabled={procesando}
                  >
                    <ion-icon name="checkmark-outline"></ion-icon>
                    Guardar imagen
                  </button>
                )}
                <small className={styles.hint}>Tamaño recomendado: 1920x600px (Max 5MB)</small>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="hero_titulo">
                  <ion-icon name="text-outline"></ion-icon>
                  Titulo Principal
                </label>
                <input
                  type="text"
                  id="hero_titulo"
                  name="hero_titulo"
                  value={formData.hero_titulo}
                  onChange={handleInputChange}
                  placeholder="Contactanos (dejar vacio para ocultar)"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="hero_subtitulo">
                  <ion-icon name="reader-outline"></ion-icon>
                  Subtitulo
                </label>
                <textarea
                  id="hero_subtitulo"
                  name="hero_subtitulo"
                  value={formData.hero_subtitulo}
                  onChange={handleInputChange}
                  placeholder="Descripcion breve..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ion-icon name="information-circle-outline"></ion-icon>
                <h2>Informacion de Contacto</h2>
              </div>
              <p className={styles.sectionDesc}>Textos de la seccion de informacion</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="info_titulo">
                  <ion-icon name="text-outline"></ion-icon>
                  Titulo Seccion Info
                </label>
                <input
                  type="text"
                  id="info_titulo"
                  name="info_titulo"
                  value={formData.info_titulo}
                  onChange={handleInputChange}
                  placeholder="Hablemos"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="info_descripcion">
                  <ion-icon name="reader-outline"></ion-icon>
                  Descripcion
                </label>
                <textarea
                  id="info_descripcion"
                  name="info_descripcion"
                  value={formData.info_descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripcion de la seccion..."
                  rows="4"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ubicacion_texto">
                  <ion-icon name="location-outline"></ion-icon>
                  Ubicacion
                </label>
                <input
                  type="text"
                  id="ubicacion_texto"
                  name="ubicacion_texto"
                  value={formData.ubicacion_texto}
                  onChange={handleInputChange}
                  placeholder="Lima, Peru"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ion-icon name="map-outline"></ion-icon>
                <h2>Mapa de Ubicacion</h2>
              </div>
              <p className={styles.sectionDesc}>URL del mapa de Google Maps embebido</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="mapa_url">
                <ion-icon name="link-outline"></ion-icon>
                URL del Mapa Embebido
              </label>
              <textarea
                id="mapa_url"
                name="mapa_url"
                value={formData.mapa_url}
                onChange={handleInputChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows="3"
              />
              <small className={styles.hint}>
                Ve a Google Maps, busca tu ubicacion, haz clic en Compartir, luego en Insertar un mapa y copia el URL del src
              </small>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ion-icon name="megaphone-outline"></ion-icon>
                <h2>Seccion CTA Final</h2>
              </div>
              <p className={styles.sectionDesc}>Llamado a la accion al final de la pagina</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="cta_titulo">
                  <ion-icon name="text-outline"></ion-icon>
                  Titulo CTA
                </label>
                <input
                  type="text"
                  id="cta_titulo"
                  name="cta_titulo"
                  value={formData.cta_titulo}
                  onChange={handleInputChange}
                  placeholder="Prefieres llamarnos directamente?"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cta_descripcion">
                  <ion-icon name="reader-outline"></ion-icon>
                  Descripcion CTA
                </label>
                <textarea
                  id="cta_descripcion"
                  name="cta_descripcion"
                  value={formData.cta_descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripcion del CTA..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ion-icon name="share-social-outline"></ion-icon>
                <h2>Redes Sociales</h2>
              </div>
              <p className={styles.sectionDesc}>URLs de tus redes sociales</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="facebook_url">
                  <ion-icon name="logo-facebook"></ion-icon>
                  Facebook
                </label>
                <input
                  type="url"
                  id="facebook_url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/tuempresa"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="instagram_url">
                  <ion-icon name="logo-instagram"></ion-icon>
                  Instagram
                </label>
                <input
                  type="url"
                  id="instagram_url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/tuempresa"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="linkedin_url">
                  <ion-icon name="logo-linkedin"></ion-icon>
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/company/tuempresa"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="whatsapp_url">
                  <ion-icon name="logo-whatsapp"></ion-icon>
                  WhatsApp
                </label>
                <input
                  type="url"
                  id="whatsapp_url"
                  name="whatsapp_url"
                  value={formData.whatsapp_url}
                  onChange={handleInputChange}
                  placeholder="https://wa.me/51999999999"
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={cargarDatos}
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
    </div>
  )
}