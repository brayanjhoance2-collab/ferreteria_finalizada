"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './nosotros.module.css'
import { getEmpresaInfo, getValoresEmpresa, getPaginaSobreNosotros, updatePaginaSobreNosotros, uploadImagenPagina } from './servidor'

export default function AdminSobreNosotros() {
  const [empresaInfo, setEmpresaInfo] = useState(null)
  const [valores, setValores] = useState([])
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
      const [dataEmpresa, dataValores, dataPagina] = await Promise.all([
        getEmpresaInfo(),
        getValoresEmpresa(),
        getPaginaSobreNosotros()
      ])
      setEmpresaInfo(dataEmpresa)
      setValores(dataValores || [])
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
      const resultado = await updatePaginaSobreNosotros(paginaData)
      
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

  if (!empresaInfo) {
    return <div className={styles.error}>Error al cargar la información</div>
  }

  const currentYear = new Date().getFullYear()
  const aniosExperiencia = currentYear - empresaInfo.fecha_fundacion

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderContent}>
          <h1>Editar Página: Sobre Nosotros</h1>
          <p>Los cambios se verán reflejados al guardar</p>
        </div>
        <div className={styles.adminHeaderActions}>
          <a href="/nosotros" target="_blank" className={styles.btnPreview}>
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

      <main className={styles.nosotros}>
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
                  placeholder="Sobre Nosotros"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Subtítulo Hero</label>
                <input
                  type="text"
                  value={paginaData?.hero_subtitulo || ''}
                  onChange={(e) => handleChange('hero_subtitulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="años de experiencia..."
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
                <span className={styles.sectionLabel}>Nuestra Empresa</span>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Introducción</label>
                  <input
                    type="text"
                    value={paginaData?.intro_titulo || ''}
                    onChange={(e) => handleChange('intro_titulo', e.target.value)}
                    className={styles.editInput}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción</label>
                  <textarea
                    value={paginaData?.intro_descripcion || ''}
                    onChange={(e) => handleChange('intro_descripcion', e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                    placeholder="Descripción de la empresa..."
                  />
                </div>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Número 1</label>
                      <input
                        type="text"
                        value={paginaData?.stat1_numero || ''}
                        onChange={(e) => handleChange('stat1_numero', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="24+"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Label 1</label>
                      <input
                        type="text"
                        value={paginaData?.stat1_label || ''}
                        onChange={(e) => handleChange('stat1_label', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Años de Experiencia"
                      />
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Número 2</label>
                      <input
                        type="text"
                        value={paginaData?.stat2_numero || ''}
                        onChange={(e) => handleChange('stat2_numero', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="100+"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Label 2</label>
                      <input
                        type="text"
                        value={paginaData?.stat2_label || ''}
                        onChange={(e) => handleChange('stat2_label', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Proyectos Completados"
                      />
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Número 3</label>
                      <input
                        type="text"
                        value={paginaData?.stat3_numero || ''}
                        onChange={(e) => handleChange('stat3_numero', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="50+"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Label 3</label>
                      <input
                        type="text"
                        value={paginaData?.stat3_label || ''}
                        onChange={(e) => handleChange('stat3_label', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Equipos Disponibles"
                      />
                    </div>
                  </div>
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
                    alt="Empresa"
                    width={600}
                    height={500}
                    className={styles.image}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.historia}>
          <div className={styles.container}>
            <div className={styles.historiaContent}>
              <span className={styles.sectionLabel}>Nuestra Trayectoria</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Historia</label>
                <input
                  type="text"
                  value={paginaData?.historia_titulo || ''}
                  onChange={(e) => handleChange('historia_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Historia"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción Historia</label>
                <textarea
                  value={paginaData?.historia_descripcion || ''}
                  onChange={(e) => handleChange('historia_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={6}
                  placeholder="Historia de la empresa..."
                />
              </div>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <ion-icon name="flag-outline"></ion-icon>
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Año 1</label>
                      <input
                        type="text"
                        value={paginaData?.timeline1_year || ''}
                        onChange={(e) => handleChange('timeline1_year', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="2000"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción 1</label>
                      <input
                        type="text"
                        value={paginaData?.timeline1_desc || ''}
                        onChange={(e) => handleChange('timeline1_desc', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Fundación"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <ion-icon name="construct-outline"></ion-icon>
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Año 2</label>
                      <input
                        type="text"
                        value={paginaData?.timeline2_year || ''}
                        onChange={(e) => handleChange('timeline2_year', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="2005"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción 2</label>
                      <input
                        type="text"
                        value={paginaData?.timeline2_desc || ''}
                        onChange={(e) => handleChange('timeline2_desc', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Expansión"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <ion-icon name="trophy-outline"></ion-icon>
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Año 3</label>
                      <input
                        type="text"
                        value={paginaData?.timeline3_year || ''}
                        onChange={(e) => handleChange('timeline3_year', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="2010"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción 3</label>
                      <input
                        type="text"
                        value={paginaData?.timeline3_desc || ''}
                        onChange={(e) => handleChange('timeline3_desc', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Reconocimiento"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <ion-icon name="rocket-outline"></ion-icon>
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Año 4</label>
                      <input
                        type="text"
                        value={paginaData?.timeline4_year || ''}
                        onChange={(e) => handleChange('timeline4_year', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="2024"
                      />
                    </div>
                    <div className={styles.editableGroup}>
                      <label className={styles.editLabel}>Descripción 4</label>
                      <input
                        type="text"
                        value={paginaData?.timeline4_desc || ''}
                        onChange={(e) => handleChange('timeline4_desc', e.target.value)}
                        className={styles.editInputSmall}
                        placeholder="Innovación"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.mision}>
          <div className={styles.container}>
            <div className={styles.misionGrid}>
              <div className={styles.misionCard}>
                <div className={styles.misionIcon}>
  <ion-icon name="flag-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Misión</label>
                  <input
                    type="text"
                    value={paginaData?.mision_titulo || ''}
                    onChange={(e) => handleChange('mision_titulo', e.target.value)}
                    className={styles.editInput}
                    placeholder="Misión"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Texto Misión</label>
                  <textarea
                    value={paginaData?.mision_texto || ''}
                    onChange={(e) => handleChange('mision_texto', e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                    placeholder="Texto de la misión..."
                  />
                </div>
              </div>
              <div className={styles.misionCard}>
                <div className={styles.misionIcon}>
                  <ion-icon name="telescope-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Visión</label>
                  <input
                    type="text"
                    value={paginaData?.vision_titulo || ''}
                    onChange={(e) => handleChange('vision_titulo', e.target.value)}
                    className={styles.editInput}
                    placeholder="Visión"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Texto Visión</label>
                  <textarea
                    value={paginaData?.vision_texto || ''}
                    onChange={(e) => handleChange('vision_texto', e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                    placeholder="Texto de la visión..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.diferenciadores}>
          <div className={styles.container}>
            <div className={styles.diferenciadorHeader}>
              <span className={styles.sectionLabel}>Por qué elegirnos</span>
              <h2 className={styles.sectionTitle}>Nuestros Diferenciadores</h2>
            </div>
            <div className={styles.diferenciadorGrid}>
              <div className={styles.diferenciadorItem}>
                <div className={styles.diferenciadorIcon}>
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Dif. 1</label>
                  <input
                    type="text"
                    value={paginaData?.dif1_titulo || ''}
                    onChange={(e) => handleChange('dif1_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Equipos Certificados"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 1</label>
                  <textarea
                    value={paginaData?.dif1_descripcion || ''}
                    onChange={(e) => handleChange('dif1_descripcion', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.diferenciadorItem}>
                <div className={styles.diferenciadorIcon}>
                  <ion-icon name="people-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Dif. 2</label>
                  <input
                    type="text"
                    value={paginaData?.dif2_titulo || ''}
                    onChange={(e) => handleChange('dif2_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Asesoría Especializada"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 2</label>
                  <textarea
                    value={paginaData?.dif2_descripcion || ''}
                    onChange={(e) => handleChange('dif2_descripcion', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.diferenciadorItem}>
                <div className={styles.diferenciadorIcon}>
                  <ion-icon name="flash-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Dif. 3</label>
                  <input
                    type="text"
                    value={paginaData?.dif3_titulo || ''}
                    onChange={(e) => handleChange('dif3_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Respuesta Inmediata"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 3</label>
                  <textarea
                    value={paginaData?.dif3_descripcion || ''}
                    onChange={(e) => handleChange('dif3_descripcion', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
              <div className={styles.diferenciadorItem}>
                <div className={styles.diferenciadorIcon}>
                  <ion-icon name="trending-up-outline"></ion-icon>
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Título Dif. 4</label>
                  <input
                    type="text"
                    value={paginaData?.dif4_titulo || ''}
                    onChange={(e) => handleChange('dif4_titulo', e.target.value)}
                    className={styles.editInputSmall}
                    placeholder="Tecnología de Vanguardia"
                  />
                </div>
                <div className={styles.editableGroup}>
                  <label className={styles.editLabel}>Descripción 4</label>
                  <textarea
                    value={paginaData?.dif4_descripcion || ''}
                    onChange={(e) => handleChange('dif4_descripcion', e.target.value)}
                    className={styles.editTextareaSmall}
                    rows={3}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.certificaciones}>
          <div className={styles.container}>
            <div className={styles.certificacionesContent}>
              <span className={styles.sectionLabel}>Respaldo y Garantía</span>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Título Certificaciones</label>
                <input
                  type="text"
                  value={paginaData?.cert_titulo || ''}
                  onChange={(e) => handleChange('cert_titulo', e.target.value)}
                  className={styles.editInput}
                  placeholder="Certificaciones y Alianzas"
                />
              </div>
              <div className={styles.editableGroup}>
                <label className={styles.editLabel}>Descripción Certificaciones</label>
                <textarea
                  value={paginaData?.cert_descripcion || ''}
                  onChange={(e) => handleChange('cert_descripcion', e.target.value)}
                  className={styles.editTextarea}
                  rows={4}
                  placeholder="Descripción..."
                />
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
                  placeholder="¿Listo para trabajar con nosotros?"
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
                  Contáctanos
                </span>
                <span className={styles.ctaButtonSecondary}>
                  <ion-icon name="construct-outline"></ion-icon>
                  Ver Equipos
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function getIconForValor(nombre) {
  const iconMap = {
    'Calidad': 'star-outline',
    'Confianza': 'shield-checkmark-outline',
    'Servicio': 'people-outline',
    'Experiencia': 'trophy-outline',
    'Innovación': 'bulb-outline',
    'Compromiso': 'heart-outline',
    'Seguridad': 'lock-closed-outline',
    'Excelencia': 'medal-outline',
    'Responsabilidad': 'checkmark-circle-outline',
    'Profesionalismo': 'briefcase-outline'
  }
  return iconMap[nombre] || 'checkmark-circle-outline'
}