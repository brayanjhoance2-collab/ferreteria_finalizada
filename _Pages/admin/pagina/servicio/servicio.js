"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './servicio.module.css'
import { getPaginaServicioTecnico, updatePaginaServicioTecnico, uploadImagenPagina } from './servidor'

export default function AdminServicioTecnico() {
  const [paginaData, setPaginaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setLoading(true)
      const dataPagina = await getPaginaServicioTecnico()
      setPaginaData(dataPagina || {})
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

  async function handleGuardar() {
    try {
      setGuardando(true)
      const resultado = await updatePaginaServicioTecnico(paginaData)
      
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
          <h1>Editar Página: Servicio Técnico</h1>
          <p>Los cambios se verán reflejados al guardar</p>
        </div>
        <div className={styles.adminHeaderActions}>
          <a href="/servicio-tecnico" target="_blank" className={styles.btnPreview}>
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

      <main className={styles.servicio}>
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
                  placeholder="Servicio Técnico"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Subtítulo Hero</label>
                <input
                  type="text"
                  value={paginaData?.hero_subtitulo || ''}
                  onChange={(e) => handleChange('hero_subtitulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Mantenimiento y reparación..."
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

        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.introContent}>
              <span className={styles.sectionLabel}>Servicio Especializado</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Introducción</label>
                <input
                  type="text"
                  value={paginaData?.intro_titulo || ''}
                  onChange={(e) => handleChange('intro_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Explora el Servicio Técnico..."
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción</label>
                <textarea
                  value={paginaData?.intro_descripcion || ''}
                  onChange={(e) => handleChange('intro_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={6}
                  placeholder="Descripción..."
                />
              </div>
            </div>
          </div>
        </section>
        <section className={styles.queOfrecemos}>
          <div className={styles.container}>
            <div className={styles.queOfrecemosHeader}>
              <span className={styles.sectionLabel}>Nuestros Servicios</span>
              <h2 className={styles.sectionTitle}>¿Qué Ofrecemos?</h2>
            </div>
            <div className={styles.serviciosGrid}>
              <div className={styles.servicioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Servicio 1</label>
                  <input
                    type="text"
                    value={paginaData?.servicio1_icono || ''}
                    onChange={(e) => handleChange('servicio1_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="search-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Servicio 1</label>
                  <input
                    type="text"
                    value={paginaData?.servicio1_titulo || ''}
                    onChange={(e) => handleChange('servicio1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Diagnóstico y Solución"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 1</label>
                  <textarea
                    value={paginaData?.servicio1_desc || ''}
                    onChange={(e) => handleChange('servicio1_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.servicioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Servicio 2</label>
                  <input
                    type="text"
                    value={paginaData?.servicio2_icono || ''}
                    onChange={(e) => handleChange('servicio2_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="construct-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Servicio 2</label>
                  <input
                    type="text"
                    value={paginaData?.servicio2_titulo || ''}
                    onChange={(e) => handleChange('servicio2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Restauración de Equipos"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 2</label>
                  <textarea
                    value={paginaData?.servicio2_desc || ''}
                    onChange={(e) => handleChange('servicio2_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.servicioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Servicio 3</label>
                  <input
                    type="text"
                    value={paginaData?.servicio3_icono || ''}
                    onChange={(e) => handleChange('servicio3_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="people-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Servicio 3</label>
                  <input
                    type="text"
                    value={paginaData?.servicio3_titulo || ''}
                    onChange={(e) => handleChange('servicio3_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Asesoría Técnica"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 3</label>
                  <textarea
                    value={paginaData?.servicio3_desc || ''}
                    onChange={(e) => handleChange('servicio3_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.servicioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Servicio 4</label>
                  <input
                    type="text"
                    value={paginaData?.servicio4_icono || ''}
                    onChange={(e) => handleChange('servicio4_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="school-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Servicio 4</label>
                  <input
                    type="text"
                    value={paginaData?.servicio4_titulo || ''}
                    onChange={(e) => handleChange('servicio4_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Capacitación"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 4</label>
                  <textarea
                    value={paginaData?.servicio4_desc || ''}
                    onChange={(e) => handleChange('servicio4_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.serviciosPrincipales}>
          <div className={styles.container}>
            <div className={styles.serviciosPrincipalesGrid}>
              <div className={styles.servicioDestacado}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Destacado 1</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_icono || ''}
                    onChange={(e) => handleChange('destacado1_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="settings-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Destacado 1</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_titulo || ''}
                    onChange={(e) => handleChange('destacado1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Reparación y Reacondicionamiento"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Destacado 1</label>
                  <textarea
                    value={paginaData?.destacado1_desc || ''}
                    onChange={(e) => handleChange('destacado1_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 1</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_feature1 || ''}
                    onChange={(e) => handleChange('destacado1_feature1', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Diagnóstico gratuito"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 2</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_feature2 || ''}
                    onChange={(e) => handleChange('destacado1_feature2', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Repuestos originales"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 3</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_feature3 || ''}
                    onChange={(e) => handleChange('destacado1_feature3', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Garantía extendida"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 4</label>
                  <input
                    type="text"
                    value={paginaData?.destacado1_feature4 || ''}
                    onChange={(e) => handleChange('destacado1_feature4', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Servicio a domicilio"
                  />
                </div>
              </div>
              <div className={styles.servicioDestacado}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono Destacado 2</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_icono || ''}
                    onChange={(e) => handleChange('destacado2_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="shield-checkmark-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Destacado 2</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_titulo || ''}
                    onChange={(e) => handleChange('destacado2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Mantenimiento Preventivo"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Destacado 2</label>
                  <textarea
                    value={paginaData?.destacado2_desc || ''}
                    onChange={(e) => handleChange('destacado2_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 1</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_feature1 || ''}
                    onChange={(e) => handleChange('destacado2_feature1', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Programación flexible"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 2</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_feature2 || ''}
                    onChange={(e) => handleChange('destacado2_feature2', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Reportes detallados"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 3</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_feature3 || ''}
                    onChange={(e) => handleChange('destacado2_feature3', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Historial de servicio"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Feature 4</label>
                  <input
                    type="text"
                    value={paginaData?.destacado2_feature4 || ''}
                    onChange={(e) => handleChange('destacado2_feature4', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Alertas preventivas"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.beneficios}>
          <div className={styles.container}>
            <div className={styles.beneficiosHeader}>
              <span className={styles.sectionLabel}>Ventajas</span>
              <h2 className={styles.sectionTitle}>¿Por Qué Elegirnos?</h2>
            </div>
            <div className={styles.beneficiosGrid}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className={styles.beneficioItem}>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Icono Beneficio {num}</label>
                    <input
                      type="text"
                      value={paginaData?.[`beneficio${num}_icono`] || ''}
                      onChange={(e) => handleChange(`beneficio${num}_icono`, e.target.value)}
                      className={styles.editInputSmall}
                      placeholder="time-outline"
                    />
                  </div>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Título {num}</label>
                    <input
                      type="text"
                      value={paginaData?.[`beneficio${num}_titulo`] || ''}
                      onChange={(e) => handleChange(`beneficio${num}_titulo`, e.target.value)}
                      className={styles.editInputSmall}
                      placeholder="Respuesta Rápida"
                    />
                  </div>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Descripción {num}</label>
                    <textarea
                      value={paginaData?.[`beneficio${num}_desc`] || ''}
                      onChange={(e) => handleChange(`beneficio${num}_desc`, e.target.value)}
                      className={styles.editTextareaSmall}
                      rows={3}
                      placeholder="Descripción..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.proceso}>
          <div className={styles.container}>
            <div className={styles.procesoHeader}>
              <span className={styles.sectionLabel}>Cómo Trabajamos</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Proceso</label>
                <input
                  type="text"
                  value={paginaData?.proceso_titulo || ''}
                  onChange={(e) => handleChange('proceso_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Proceso de Servicio"
                />
              </div>
            </div>
            <div className={styles.procesoSteps}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className={styles.procesoStep}>
                  <div className={styles.stepNumber}>{num}</div>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Título Paso {num}</label>
                    <input
                      type="text"
                      value={paginaData?.[`paso${num}_titulo`] || ''}
                      onChange={(e) => handleChange(`paso${num}_titulo`, e.target.value)}
                      className={styles.editInputSmall}
                      placeholder="Solicitud de Servicio"
                    />
                  </div>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Descripción Paso {num}</label>
                    <textarea
                      value={paginaData?.[`paso${num}_desc`] || ''}
                      onChange={(e) => handleChange(`paso${num}_desc`, e.target.value)}
                      className={styles.editTextareaSmall}
                      rows={2}
                      placeholder="Descripción..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título CTA</label>
                <input
                  type="text"
                  value={paginaData?.cta_titulo || ''}
                  onChange={(e) => handleChange('cta_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="¿Necesitas Servicio Técnico?"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción CTA</label>
                <textarea
                  value={paginaData?.cta_descripcion || ''}
                  onChange={(e) => handleChange('cta_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={2}
                  placeholder="Descripción..."
                />
              </div>
              <div className={styles.ctaButtons}>
                <span className={styles.ctaButton}>
                  <ion-icon name="mail-outline"></ion-icon>
                  Solicitar Servicio
                </span>
                <span className={styles.ctaButtonSecondary}>
                  <ion-icon name="call-outline"></ion-icon>
                  Llamar Ahora
                </span>
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Nota CTA</label>
                <input
                  type="text"
                  value={paginaData?.cta_nota || ''}
                  onChange={(e) => handleChange('cta_nota', e.target.value)}
                  className={styles.editInputSmall}
                  placeholder="Servicio de emergencia disponible 24/7"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}