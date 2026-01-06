"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './nosotros.module.css'
import { getEmpresaInfo, getValoresEmpresa, getPaginaSobreNosotros } from './servidor'

export default function Nosotros() {
  const [empresaInfo, setEmpresaInfo] = useState(null)
  const [valores, setValores] = useState([])
  const [paginaData, setPaginaData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dataEmpresa, dataValores, dataPagina] = await Promise.all([
          getEmpresaInfo(),
          getValoresEmpresa(),
          getPaginaSobreNosotros()
        ])
        setEmpresaInfo(dataEmpresa)
        setValores(dataValores || [])
        setPaginaData(dataPagina)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!empresaInfo) {
    return <div className={styles.error}>Error al cargar la información</div>
  }

  const currentYear = new Date().getFullYear()
  const aniosExperiencia = currentYear - empresaInfo.fecha_fundacion

  return (
    <main className={styles.nosotros}>
      <section className={styles.hero} style={paginaData?.hero_imagen_url ? { backgroundImage: `url(${paginaData.hero_imagen_url})` } : {}}>
        <div className={styles.heroContent}>
          <div className={styles.container}>
            {paginaData?.hero_titulo && (
              <h1 className={styles.heroTitle}>{paginaData.hero_titulo}</h1>
            )}
            {paginaData?.hero_subtitulo && (
              <p className={styles.heroSubtitle}>
                {aniosExperiencia} {paginaData.hero_subtitulo}
              </p>
            )}
          </div>
        </div>
      </section>

      {(paginaData?.intro_titulo || paginaData?.intro_descripcion || paginaData?.stat1_numero) && (
        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.introGrid}>
              <div className={styles.introContent}>
                {paginaData?.intro_titulo && (
                  <>
                    <span className={styles.sectionLabel}>Nuestra Empresa</span>
                    <h2 className={styles.sectionTitle}>{paginaData.intro_titulo}</h2>
                  </>
                )}
                {paginaData?.intro_descripcion && (
                  <p className={styles.introText}>{paginaData.intro_descripcion}</p>
                )}
                {(paginaData?.stat1_numero || paginaData?.stat2_numero || paginaData?.stat3_numero) && (
                  <div className={styles.stats}>
                    {paginaData?.stat1_numero && (
                      <div className={styles.statItem}>
                        <div className={styles.statNumber}>{paginaData.stat1_numero}</div>
                        {paginaData?.stat1_label && (
                          <div className={styles.statLabel}>{paginaData.stat1_label}</div>
                        )}
                      </div>
                    )}
                    {paginaData?.stat2_numero && (
                      <div className={styles.statItem}>
                        <div className={styles.statNumber}>{paginaData.stat2_numero}</div>
                        {paginaData?.stat2_label && (
                          <div className={styles.statLabel}>{paginaData.stat2_label}</div>
                        )}
                      </div>
                    )}
                    {paginaData?.stat3_numero && (
                      <div className={styles.statItem}>
                        <div className={styles.statNumber}>{paginaData.stat3_numero}</div>
                        {paginaData?.stat3_label && (
                          <div className={styles.statLabel}>{paginaData.stat3_label}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {paginaData?.intro_imagen_url && (
                <div className={styles.introImage}>
                  <Image 
                    src={paginaData.intro_imagen_url}
                    alt="Ferretería RyM"
                    width={600}
                    height={500}
                    className={styles.image}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.historia_titulo || paginaData?.historia_descripcion) && (
        <section className={styles.historia}>
          <div className={styles.container}>
            <div className={styles.historiaContent}>
              <span className={styles.sectionLabel}>Nuestra Trayectoria</span>
              {paginaData?.historia_titulo && (
                <h2 className={styles.sectionTitle}>{paginaData.historia_titulo}</h2>
              )}
              {paginaData?.historia_descripcion && (
                <div className={styles.historiaText}>
                  {paginaData.historia_descripcion.split('\n\n').map((parrafo, index) => (
                    <p key={index} className={styles.parrafo}>{parrafo}</p>
                  ))}
                </div>
              )}
              {(paginaData?.timeline1_year || paginaData?.timeline2_year || paginaData?.timeline3_year || paginaData?.timeline4_year) && (
                <div className={styles.timeline}>
                  {paginaData?.timeline1_year && (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <ion-icon name="flag-outline"></ion-icon>
                      </div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineYear}>{paginaData.timeline1_year}</h3>
                        {paginaData?.timeline1_desc && (
                          <p className={styles.timelineDesc}>{paginaData.timeline1_desc}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {paginaData?.timeline2_year && (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <ion-icon name="construct-outline"></ion-icon>
                      </div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineYear}>{paginaData.timeline2_year}</h3>
                        {paginaData?.timeline2_desc && (
                          <p className={styles.timelineDesc}>{paginaData.timeline2_desc}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {paginaData?.timeline3_year && (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <ion-icon name="trophy-outline"></ion-icon>
                      </div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineYear}>{paginaData.timeline3_year}</h3>
                        {paginaData?.timeline3_desc && (
                          <p className={styles.timelineDesc}>{paginaData.timeline3_desc}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {paginaData?.timeline4_year && (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <ion-icon name="rocket-outline"></ion-icon>
                      </div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineYear}>{paginaData.timeline4_year}</h3>
                        {paginaData?.timeline4_desc && (
                          <p className={styles.timelineDesc}>{paginaData.timeline4_desc}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {valores.length > 0 && (
        <section className={styles.valores}>
          <div className={styles.container}>
            <div className={styles.valoresHeader}>
              <span className={styles.sectionLabel}>Nuestros Principios</span>
              <h2 className={styles.sectionTitle}>Valores Corporativos</h2>
              <p className={styles.sectionDesc}>
                Los valores que guían cada una de nuestras acciones y decisiones, 
                comprometidos con la excelencia y la satisfacción de nuestros clientes
              </p>
            </div>
            <div className={styles.valoresGrid}>
              {valores.map((valor) => (
                <div key={valor.id} className={styles.valorCard}>
                  <div className={styles.valorIcon}>
                    <ion-icon name={getIconForValor(valor.nombre)}></ion-icon>
                  </div>
                  <h3 className={styles.valorTitle}>{valor.nombre}</h3>
                  <p className={styles.valorDesc}>{valor.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.mision_titulo || paginaData?.vision_titulo) && (
        <section className={styles.mision}>
          <div className={styles.container}>
            <div className={styles.misionGrid}>
              {paginaData?.mision_titulo && (
                <div className={styles.misionCard}>
                  <div className={styles.misionIcon}>
  <ion-icon name="flag-outline"></ion-icon>
                  </div>
                  <h3 className={styles.misionTitle}>{paginaData.mision_titulo}</h3>
                  {paginaData?.mision_texto && (
                    <p className={styles.misionText}>{paginaData.mision_texto}</p>
                  )}
                </div>
              )}
              {paginaData?.vision_titulo && (
                <div className={styles.misionCard}>
                  <div className={styles.misionIcon}>
                    <ion-icon name="telescope-outline"></ion-icon>
                  </div>
                  <h3 className={styles.misionTitle}>{paginaData.vision_titulo}</h3>
                  {paginaData?.vision_texto && (
                    <p className={styles.misionText}>{paginaData.vision_texto}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.dif1_titulo || paginaData?.dif2_titulo || paginaData?.dif3_titulo || paginaData?.dif4_titulo) && (
        <section className={styles.diferenciadores}>
          <div className={styles.container}>
            <div className={styles.diferenciadorHeader}>
              <span className={styles.sectionLabel}>Por qué elegirnos</span>
              <h2 className={styles.sectionTitle}>Nuestros Diferenciadores</h2>
            </div>
            <div className={styles.diferenciadorGrid}>
              {paginaData?.dif1_titulo && (
                <div className={styles.diferenciadorItem}>
                  <div className={styles.diferenciadorIcon}>
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                  </div>
                  <h3 className={styles.diferenciadorTitle}>{paginaData.dif1_titulo}</h3>
                  {paginaData?.dif1_descripcion && (
                    <p className={styles.diferenciadorDesc}>{paginaData.dif1_descripcion}</p>
                  )}
                </div>
              )}
              {paginaData?.dif2_titulo && (
                <div className={styles.diferenciadorItem}>
                  <div className={styles.diferenciadorIcon}>
                    <ion-icon name="people-outline"></ion-icon>
                  </div>
                  <h3 className={styles.diferenciadorTitle}>{paginaData.dif2_titulo}</h3>
                  {paginaData?.dif2_descripcion && (
                    <p className={styles.diferenciadorDesc}>{paginaData.dif2_descripcion}</p>
                  )}
                </div>
              )}
              {paginaData?.dif3_titulo && (
                <div className={styles.diferenciadorItem}>
                  <div className={styles.diferenciadorIcon}>
                    <ion-icon name="flash-outline"></ion-icon>
                  </div>
                  <h3 className={styles.diferenciadorTitle}>{paginaData.dif3_titulo}</h3>
                  {paginaData?.dif3_descripcion && (
                    <p className={styles.diferenciadorDesc}>{paginaData.dif3_descripcion}</p>
                  )}
                </div>
              )}
              {paginaData?.dif4_titulo && (
                <div className={styles.diferenciadorItem}>
                  <div className={styles.diferenciadorIcon}>
                    <ion-icon name="trending-up-outline"></ion-icon>
                  </div>
                  <h3 className={styles.diferenciadorTitle}>{paginaData.dif4_titulo}</h3>
                  {paginaData?.dif4_descripcion && (
                    <p className={styles.diferenciadorDesc}>{paginaData.dif4_descripcion}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.cert_titulo || paginaData?.cert_descripcion) && (
        <section className={styles.certificaciones}>
          <div className={styles.container}>
            <div className={styles.certificacionesContent}>
              <span className={styles.sectionLabel}>Respaldo y Garantía</span>
              {paginaData?.cert_titulo && (
                <h2 className={styles.sectionTitle}>{paginaData.cert_titulo}</h2>
              )}
              {paginaData?.cert_descripcion && (
                <p className={styles.certificacionesText}>{paginaData.cert_descripcion}</p>
              )}
              <div className={styles.certificacionesLogos}>
                <div className={styles.logoItem}>
                  <div className={styles.logoPlaceholder}>
                    <ion-icon name="ribbon-outline"></ion-icon>
                  </div>
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.logoPlaceholder}>
                    <ion-icon name="ribbon-outline"></ion-icon>
                  </div>
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.logoPlaceholder}>
                    <ion-icon name="ribbon-outline"></ion-icon>
                  </div>
                </div>
                <div className={styles.logoItem}>
                  <div className={styles.logoPlaceholder}>
                    <ion-icon name="ribbon-outline"></ion-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {(paginaData?.cta_titulo || paginaData?.cta_descripcion) && (
        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              {paginaData?.cta_titulo && (
                <h2 className={styles.ctaTitle}>{paginaData.cta_titulo}</h2>
              )}
              {paginaData?.cta_descripcion && (
                <p className={styles.ctaText}>{paginaData.cta_descripcion}</p>
              )}
              <div className={styles.ctaButtons}>
                <Link href="/contacto" className={styles.ctaButton}>
                  <ion-icon name="mail-outline"></ion-icon>
                  Contáctanos
                </Link>
                <Link href="/tendidos" className={styles.ctaButtonSecondary}>
                  <ion-icon name="construct-outline"></ion-icon>
                  Ver Equipos
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
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