"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './certificaciones.module.css'
import { getPaginaCertificaciones, updatePaginaCertificaciones, uploadImagenPagina } from './servidor'

export default function AdminCertificaciones() {
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
      const dataPagina = await getPaginaCertificaciones()
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
      const resultado = await updatePaginaCertificaciones(paginaData)
      
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
          <h1>Editar Página: Certificaciones</h1>
          <p>Los cambios se verán reflejados al guardar</p>
        </div>
        <div className={styles.adminHeaderActions}>
          <a href="/certificaciones" target="_blank" className={styles.btnPreview}>
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

      <main className={styles.certificaciones}>
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
                  placeholder="Certificaciones Profesionales"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Subtítulo Hero</label>
                <textarea
                  value={paginaData?.hero_subtitulo || ''}
                  onChange={(e) => handleChange('hero_subtitulo', e.target.value)}
                  className={styles.editTextarea}
                  rows={2}
                  placeholder="Programas de capacitación..."
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
            <div className={styles.introGrid}>
              <div className={styles.introContent}>
                <span className={styles.sectionLabel}>Capacitación</span>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Introducción</label>
                  <input
                    type="text"
                    value={paginaData?.intro_titulo || ''}
                    onChange={(e) => handleChange('intro_titulo', e.target.value)}
                    className={styles.editInput}
                    placeholder="Capacitación Certificada"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción</label>
                  <textarea
                    value={paginaData?.intro_descripcion || ''}
                    onChange={(e) => handleChange('intro_descripcion', e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.introImage}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Imagen Introducción</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagenChange('intro_imagen_url', e)}
                    className={styles.editFile}
                  />
                </div>
                {paginaData?.intro_imagen_url && (
                  <Image 
                    src={paginaData.intro_imagen_url}
                    alt="Certificaciones"
                    width={600}
                    height={400}
                    className={styles.image}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.beneficios}>
          <div className={styles.container}>
            <div className={styles.beneficiosHeader}>
              <span className={styles.sectionLabel}>Ventajas</span>
              <h2 className={styles.sectionTitle}>Beneficios de Certificarse</h2>
            </div>
            <div className={styles.beneficiosGrid}>
              <div className={styles.beneficioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono 1</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio1_icono || ''}
                    onChange={(e) => handleChange('beneficio1_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="school-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título 1</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio1_titulo || ''}
                    onChange={(e) => handleChange('beneficio1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Certificación Oficial"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 1</label>
                  <textarea
                    value={paginaData?.beneficio1_desc || ''}
                    onChange={(e) => handleChange('beneficio1_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.beneficioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono 2</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio2_icono || ''}
                    onChange={(e) => handleChange('beneficio2_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="people-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título 2</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio2_titulo || ''}
                    onChange={(e) => handleChange('beneficio2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Instructores Calificados"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 2</label>
                  <textarea
                    value={paginaData?.beneficio2_desc || ''}
                    onChange={(e) => handleChange('beneficio2_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.beneficioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono 3</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio3_icono || ''}
                    onChange={(e) => handleChange('beneficio3_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="construct-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título 3</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio3_titulo || ''}
                    onChange={(e) => handleChange('beneficio3_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Práctica Real"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 3</label>
                  <textarea
                    value={paginaData?.beneficio3_desc || ''}
                    onChange={(e) => handleChange('beneficio3_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.beneficioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Icono 4</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio4_icono || ''}
                    onChange={(e) => handleChange('beneficio4_icono', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="shield-checkmark-outline"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título 4</label>
                  <input
                    type="text"
                    value={paginaData?.beneficio4_titulo || ''}
                    onChange={(e) => handleChange('beneficio4_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Seguridad Laboral"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 4</label>
                  <textarea
                    value={paginaData?.beneficio4_desc || ''}
                    onChange={(e) => handleChange('beneficio4_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.proceso}>
          <div className={styles.container}>
            <div className={styles.procesoHeader}>
              <span className={styles.sectionLabel}>Cómo funciona</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Proceso</label>
                <input
                  type="text"
                  value={paginaData?.proceso_titulo || ''}
                  onChange={(e) => handleChange('proceso_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Proceso de Certificación"
                />
              </div>
            </div>
            <div className={styles.procesoGrid}>
              <div className={styles.procesoItem}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Número Paso 1</label>
                  <input
                    type="text"
                    value={paginaData?.paso1_numero || ''}
                    onChange={(e) => handleChange('paso1_numero', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="01"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Paso 1</label>
                  <input
                    type="text"
                    value={paginaData?.paso1_titulo || ''}
                    onChange={(e) => handleChange('paso1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Inscripción"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Paso 1</label>
                  <textarea
                    value={paginaData?.paso1_desc || ''}
                    onChange={(e) => handleChange('paso1_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={2}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.procesoItem}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Número Paso 2</label>
                  <input
                    type="text"
                    value={paginaData?.paso2_numero || ''}
                    onChange={(e) => handleChange('paso2_numero', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="02"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Paso 2</label>
                  <input
                    type="text"
                    value={paginaData?.paso2_titulo || ''}
                    onChange={(e) => handleChange('paso2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Capacitación"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Paso 2</label>
                  <textarea
                    value={paginaData?.paso2_desc || ''}
                    onChange={(e) => handleChange('paso2_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={2}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.procesoItem}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Número Paso 3</label>
                  <input
                    type="text"
                    value={paginaData?.paso3_numero || ''}
                    onChange={(e) => handleChange('paso3_numero', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="03"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Paso 3</label>
                  <input
                    type="text"
                    value={paginaData?.paso3_titulo || ''}
                    onChange={(e) => handleChange('paso3_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Evaluación"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Paso 3</label>
                  <textarea
                    value={paginaData?.paso3_desc || ''}
                    onChange={(e) => handleChange('paso3_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={2}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.procesoItem}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Número Paso 4</label>
                  <input
                    type="text"
                    value={paginaData?.paso4_numero || ''}
                    onChange={(e) => handleChange('paso4_numero', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="04"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Paso 4</label>
                  <input
                    type="text"
                    value={paginaData?.paso4_titulo || ''}
                    onChange={(e) => handleChange('paso4_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Certificación"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción Paso 4</label>
                  <textarea
                    value={paginaData?.paso4_desc || ''}
                    onChange={(e) => handleChange('paso4_desc', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={2}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.requisitos}>
          <div className={styles.container}>
            <div className={styles.requisitosContent}>
              <span className={styles.sectionLabel}>Documentación</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Requisitos</label>
                <input
                  type="text"
                  value={paginaData?.requisitos_titulo || ''}
                  onChange={(e) => handleChange('requisitos_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Requisitos"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción Requisitos</label>
                <textarea
                  value={paginaData?.requisitos_descripcion || ''}
                  onChange={(e) => handleChange('requisitos_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={3}
                  placeholder="Descripción..."
                />
              </div>
              <div className={styles.requisitosGrid}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 1</label>
                  <input
                    type="text"
                    value={paginaData?.req1_texto || ''}
                    onChange={(e) => handleChange('req1_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Ser mayor de 18 años"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 2</label>
                  <input
                    type="text"
                    value={paginaData?.req2_texto || ''}
                    onChange={(e) => handleChange('req2_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Documento de identidad"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 3</label>
                  <input
                    type="text"
                    value={paginaData?.req3_texto || ''}
                    onChange={(e) => handleChange('req3_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Certificado médico"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 4</label>
                  <input
                    type="text"
                    value={paginaData?.req4_texto || ''}
                    onChange={(e) => handleChange('req4_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Educación básica"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 5</label>
                  <input
                    type="text"
                    value={paginaData?.req5_texto || ''}
                    onChange={(e) => handleChange('req5_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Experiencia previa"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Requisito 6</label>
                  <input
                    type="text"
                    value={paginaData?.req6_texto || ''}
                    onChange={(e) => handleChange('req6_texto', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Fotografías"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.testimonios}>
          <div className={styles.container}>
            <div className={styles.testimoniosHeader}>
              <span className={styles.sectionLabel}>Testimonios</span>
              <h2 className={styles.sectionTitle}>Lo Que Dicen Nuestros Estudiantes</h2>
            </div>
            <div className={styles.testimoniosGrid}>
              <div className={styles.testimonioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Nombre 1</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio1_nombre || ''}
                    onChange={(e) => handleChange('testimonio1_nombre', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Carlos Mendoza"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Cargo 1</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio1_cargo || ''}
                    onChange={(e) => handleChange('testimonio1_cargo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Supervisor"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Empresa 1</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio1_empresa || ''}
                    onChange={(e) => handleChange('testimonio1_empresa', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Constructora XYZ"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Texto 1</label>
                  <textarea
                    value={paginaData?.testimonio1_texto || ''}
                    onChange={(e) => handleChange('testimonio1_texto', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Testimonio..."
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Imagen 1</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagenChange('testimonio1_imagen_url', e)}
                    className={styles.editFile}
                  />
                </div>
              </div>
              <div className={styles.testimonioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Nombre 2</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio2_nombre || ''}
                    onChange={(e) => handleChange('testimonio2_nombre', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="María Torres"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Cargo 2</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio2_cargo || ''}
                    onChange={(e) => handleChange('testimonio2_cargo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Operadora"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Empresa 2</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio2_empresa || ''}
                    onChange={(e) => handleChange('testimonio2_empresa', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Proyectos ABC"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Texto 2</label>
                  <textarea
                    value={paginaData?.testimonio2_texto || ''}
                    onChange={(e) => handleChange('testimonio2_texto', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Testimonio..."
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Imagen 2</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagenChange('testimonio2_imagen_url', e)}
                    className={styles.editFile}
                  />
                </div>
              </div>
              <div className={styles.testimonioCard}>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Nombre 3</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio3_nombre || ''}
                    onChange={(e) => handleChange('testimonio3_nombre', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Roberto Silva"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Cargo 3</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio3_cargo || ''}
                    onChange={(e) => handleChange('testimonio3_cargo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Jefe de Mantenimiento"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Empresa 3</label>
                  <input
                    type="text"
                    value={paginaData?.testimonio3_empresa || ''}
                    onChange={(e) => handleChange('testimonio3_empresa', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Energía SA"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Texto 3</label>
                  <textarea
                    value={paginaData?.testimonio3_texto || ''}
                    onChange={(e) => handleChange('testimonio3_texto', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Testimonio..."
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Imagen 3</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagenChange('testimonio3_imagen_url', e)}
                    className={styles.editFile}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.certificadores}>
          <div className={styles.container}>
            <div className={styles.certificadoresContent}>
              <span className={styles.sectionLabel}>Alianzas</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Certificadores</label>
                <input
                  type="text"
                  value={paginaData?.certificadores_titulo || ''}
                  onChange={(e) => handleChange('certificadores_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Certificadores y Aliados"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción Certificadores</label>
                <textarea
                  value={paginaData?.certificadores_descripcion || ''}
                  onChange={(e) => handleChange('certificadores_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={3}
                  placeholder="Descripción..."
                />
              </div>
              <div className={styles.certificadoresLogos}>
                <div className={styles.logoItem}>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Logo Certificador 1</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagenChange('cert_logo1_url', e)}
                      className={styles.editFile}
                    />
                  </div>
                  {paginaData?.cert_logo1_url && (
                    <Image 
                      src={paginaData.cert_logo1_url}
                      alt="Certificador 1"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  )}
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Logo Certificador 2</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagenChange('cert_logo2_url', e)}
                      className={styles.editFile}
                    />
                  </div>
                  {paginaData?.cert_logo2_url && (
                    <Image 
                      src={paginaData.cert_logo2_url}
                      alt="Certificador 2"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  )}
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Logo Certificador 3</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagenChange('cert_logo3_url', e)}
                      className={styles.editFile}
                    />
                  </div>
                  {paginaData?.cert_logo3_url && (
                    <Image 
                      src={paginaData.cert_logo3_url}
                      alt="Certificador 3"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  )}
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.editableGroup}>
                    <label className={styles.editLabel}>Logo Certificador 4</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagenChange('cert_logo4_url', e)}
                      className={styles.editFile}
                    />
                  </div>
                  {paginaData?.cert_logo4_url && (
                    <Image 
                      src={paginaData.cert_logo4_url}
                      alt="Certificador 4"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  )}
                </div>
              </div>
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
                  placeholder="¿Listo para certificarte?"
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
                  Contactar Ahora
                </span>
                <span className={styles.ctaButtonSecondary}>
                  <ion-icon name="list-outline"></ion-icon>
                  Ver Programas
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}