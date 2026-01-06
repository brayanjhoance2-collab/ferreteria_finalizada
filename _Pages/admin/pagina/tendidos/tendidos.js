"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './tendidos.module.css'
import { getPaginaArriendoEquipos, updatePaginaArriendoEquipos, uploadImagenPagina, getGaleriaImagenes, uploadImagenGaleria, deleteImagenGaleria } from './servidor'

export default function AdminArriendoEquipos() {
  const [paginaData, setPaginaData] = useState(null)
  const [galeria, setGaleria] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [modalGaleria, setModalGaleria] = useState(false)
  const [nuevaImagen, setNuevaImagen] = useState({
    titulo: '',
    descripcion: '',
    alt_text: '',
    categoria: 'equipos'
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setLoading(true)
      const [dataPagina, dataGaleria] = await Promise.all([
        getPaginaArriendoEquipos(),
        getGaleriaImagenes()
      ])
      setPaginaData(dataPagina || {})
      setGaleria(dataGaleria || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(campo, valor) {
    setPaginaData(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  async function handleImagenChange(campo, e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('La imagen no puede superar 5MB', 'error')
      return
    }

    try {
      const formDataImg = new FormData()
      formDataImg.append('imagen', file)
      formDataImg.append('campo', campo)

      const resultado = await uploadImagenPagina(formDataImg)
      
      if (resultado.success) {
        setPaginaData(prev => ({
          ...prev,
          [campo]: resultado.url
        }))
        mostrarMensaje('Imagen subida correctamente', 'success')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error al subir imagen', 'error')
    }
  }

  async function handleSubirImagenGaleria(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('La imagen no puede superar 5MB', 'error')
      return
    }

    try {
      setSubiendoImagen(true)
      const formDataImg = new FormData()
      formDataImg.append('imagen', file)
      formDataImg.append('titulo', nuevaImagen.titulo)
      formDataImg.append('descripcion', nuevaImagen.descripcion)
      formDataImg.append('alt_text', nuevaImagen.alt_text)
      formDataImg.append('categoria', nuevaImagen.categoria)

      const resultado = await uploadImagenGaleria(formDataImg)
      
      if (resultado.success) {
        mostrarMensaje('Imagen agregada a la galería', 'success')
        setModalGaleria(false)
        setNuevaImagen({ titulo: '', descripcion: '', alt_text: '', categoria: 'equipos' })
        await cargarDatos()
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error al subir imagen', 'error')
    } finally {
      setSubiendoImagen(false)
    }
  }

  async function handleEliminarImagen(id) {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    try {
      const resultado = await deleteImagenGaleria(id)
      
      if (resultado.success) {
        mostrarMensaje('Imagen eliminada', 'success')
        await cargarDatos()
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error al eliminar imagen', 'error')
    }
  }

  async function handleGuardar() {
    try {
      setGuardando(true)
      const resultado = await updatePaginaArriendoEquipos(paginaData)
      
      if (resultado.success) {
        mostrarMensaje('Cambios guardados correctamente', 'success')
        await cargarDatos()
      } else {
        mostrarMensaje('Error al guardar', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error al guardar cambios', 'error')
    } finally {
      setGuardando(false)
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderContent}>
          <h1>Editar Página: Arriendo de Equipos</h1>
          <p>Los cambios se verán reflejados al guardar</p>
        </div>
        <div className={styles.adminHeaderActions}>
          <a href="/tendidos" target="_blank" className={styles.btnPreview}>
            <ion-icon name="eye-outline"></ion-icon>
            Ver Página
          </a>
          <button 
            onClick={handleGuardar} 
            disabled={guardando}
            className={styles.btnGuardar}
          >
            <ion-icon name="save-outline"></ion-icon>
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
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

      <main className={styles.tendidos}>
        <section className={styles.hero} style={paginaData?.hero_imagen_url ? { backgroundImage: `url(${paginaData.hero_imagen_url})` } : {}}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.container}>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Hero</label>
                <input
                  type="text"
                  value={paginaData?.hero_titulo || ''}
                  onChange={(e) => handleChange('hero_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Arriendo de Equipos"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Subtítulo Hero</label>
                <input
                  type="text"
                  value={paginaData?.hero_subtitulo || ''}
                  onChange={(e) => handleChange('hero_subtitulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Soluciones especializadas..."
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Imagen Hero</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImagenChange('hero_imagen_url', e)}
                  className={styles.editFile}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.types}>
          <div className={styles.container}>
            <div className={styles.typesGrid}>
              <div className={styles.typeCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Tipo 1</label>
                  <input
                    type="text"
                    value={paginaData?.tipo1_icono || ''}
                    onChange={(e) => handleChange('tipo1_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="flash-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Tipo 1</label>
                  <input
                    type="text"
                    value={paginaData?.tipo1_titulo || ''}
                    onChange={(e) => handleChange('tipo1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Tendido Aéreo"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Tipo 1</label>
                  <textarea
                    value={paginaData?.tipo1_desc || ''}
                    onChange={(e) => handleChange('tipo1_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.typeCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Tipo 2</label>
                  <input
                    type="text"
                    value={paginaData?.tipo2_icono || ''}
                    onChange={(e) => handleChange('tipo2_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="layers-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Tipo 2</label>
                  <input
                    type="text"
                    value={paginaData?.tipo2_titulo || ''}
                    onChange={(e) => handleChange('tipo2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Tendido Subterráneo"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Tipo 2</label>
                  <textarea
                    value={paginaData?.tipo2_desc || ''}
                    onChange={(e) => handleChange('tipo2_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.catalog}>
          <div className={styles.container}>
            <div className={styles.catalogGrid}>
              <div className={styles.catalogContent}>
                <span className={styles.sectionLabel}>Catálogo Digital</span>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Catálogo</label>
                  <input
                    type="text"
                    value={paginaData?.catalogo_titulo || ''}
                    onChange={(e) => handleChange('catalogo_titulo', e.target.value)}
                    className={styles.editInput}
                    placeholder="Explora el Catálogo"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Catálogo</label>
                  <textarea
                    value={paginaData?.catalogo_descripcion || ''}
                    onChange={(e) => handleChange('catalogo_descripcion', e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.catalogVideo}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>URL Video</label>
                  <input
                    type="text"
                    value={paginaData?.video_url || ''}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="/tendidos-video.mp4"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Imagen Poster Video</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagenChange('video_poster_url', e)}
                    className={styles.editFile}
                  />
                </div>
              </div>
            </div>
          </div>
        </section><section className={styles.features}>
          <div className={styles.container}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.sectionTitle}>Características y Beneficios</h2>
            </div>
            <div className={styles.featuresGrid}>
              <div className={styles.featureColumn}>
                <h3 className={styles.featureSubtitle}>Características:</h3>
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className={styles.featureItem}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Título Característica {num}</label>
                      <input
                        type="text"
                        value={paginaData?.[`caracteristica${num}_titulo`] || ''}
                        onChange={(e) => handleChange(`caracteristica${num}_titulo`, e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Calidad y Durabilidad"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción {num}</label>
                      <textarea
                        value={paginaData?.[`caracteristica${num}_desc`] || ''}
                        onChange={(e) => handleChange(`caracteristica${num}_desc`, e.target.value)}
                        className={styles.editTextareaSmall}
                        rows={2}
                        placeholder="Descripción..."
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.featureColumn}>
                <h3 className={styles.featureSubtitle}>Ventajas:</h3>
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className={styles.featureItem}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Título Ventaja {num}</label>
                      <input
                        type="text"
                        value={paginaData?.[`ventaja${num}_titulo`] || ''}
                        onChange={(e) => handleChange(`ventaja${num}_titulo`, e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Ahorro en Costos"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción {num}</label>
                      <textarea
                        value={paginaData?.[`ventaja${num}_desc`] || ''}
                        onChange={(e) => handleChange(`ventaja${num}_desc`, e.target.value)}
                        className={styles.editTextareaSmall}
                        rows={2}
                        placeholder="Descripción..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gallery}>
          <div className={styles.container}>
            <div className={styles.galleryHeader}>
              <h2 className={styles.sectionTitle}>Gestión de Galería</h2>
              <button onClick={() => setModalGaleria(true)} className={styles.btnAgregarImagen}>
                <ion-icon name="add-circle-outline"></ion-icon>
                Agregar Imagen
              </button>
            </div>
            <div className={styles.galleryAdmin}>
              {galeria.map((imagen) => (
                <div key={imagen.id} className={styles.galleryItemAdmin}>
                  <Image 
                    src={imagen.url}
                    alt={imagen.alt_text || imagen.titulo || 'Imagen'}
                    width={200}
                    height={150}
                    className={styles.galleryImgAdmin}
                  />
                  <div className={styles.galleryInfoAdmin}>
                    <div className={styles.galleryTituloAdmin}>{imagen.titulo || 'Sin título'}</div>
                    <div className={styles.galleryCategoriaAdmin}>{imagen.categoria}</div>
                  </div>
                  <button onClick={() => handleEliminarImagen(imagen.id)} className={styles.btnEliminar}>
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {modalGaleria && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Agregar Imagen a Galería</h3>
              <button onClick={() => setModalGaleria(false)} className={styles.modalClose}>
                <ion-icon name="close"></ion-icon>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título</label>
                <input
                  type="text"
                  value={nuevaImagen.titulo}
                  onChange={(e) => setNuevaImagen(prev => ({ ...prev, titulo: e.target.value }))}
                  className={styles.editInput}
                  placeholder="Título de la imagen"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción</label>
                <textarea
                  value={nuevaImagen.descripcion}
                  onChange={(e) => setNuevaImagen(prev => ({ ...prev, descripcion: e.target.value }))}
                  className={styles.editTextarea}
                  rows={3}
                  placeholder="Descripción..."
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Texto Alternativo</label>
                <input
                  type="text"
                  value={nuevaImagen.alt_text}
                  onChange={(e) => setNuevaImagen(prev => ({ ...prev, alt_text: e.target.value }))}
                  className={styles.editInput}
                  placeholder="Texto alternativo"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Categoría</label>
                <select
                  value={nuevaImagen.categoria}
                  onChange={(e) => setNuevaImagen(prev => ({ ...prev, categoria: e.target.value }))}
                  className={styles.editInput}
                >
                  <option value="equipos">Equipos</option>
                  <option value="proyectos">Proyectos</option>
                  <option value="instalaciones">Instalaciones</option>
                  <option value="taller">Taller</option>
                </select>
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Seleccionar Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirImagenGaleria}
                  className={styles.editFile}
                  disabled={subiendoImagen}
                />
              </div>
              {subiendoImagen && (
                <div className={styles.uploading}>Subiendo imagen...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}