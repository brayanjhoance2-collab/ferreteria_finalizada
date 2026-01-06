"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './servicio.module.css'
import { getPaginaServicioTecnico, getTiposServicio, getGaleriaServicios } from './servidor'

export default function Servicio() {
  const [paginaData, setPaginaData] = useState(null)
  const [servicios, setServicios] = useState([])
  const [galeria, setGaleria] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dataPagina, dataServicios, dataGaleria] = await Promise.all([
          getPaginaServicioTecnico(),
          getTiposServicio(),
          getGaleriaServicios()
        ])
        setPaginaData(dataPagina)
        setServicios(dataServicios || [])
        setGaleria(dataGaleria || [])
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

  return (
    <main className={styles.servicio}>
      <section className={styles.hero} style={paginaData?.hero_imagen_url ? { backgroundImage: `url(${paginaData.hero_imagen_url})` } : {}}>
        <div className={styles.heroContent}>
          <div className={styles.container}>
            {paginaData?.hero_titulo && (
              <h1 className={styles.heroTitle}>{paginaData.hero_titulo}</h1>
            )}
            {paginaData?.hero_subtitulo && (
              <p className={styles.heroSubtitle}>{paginaData.hero_subtitulo}</p>
            )}
          </div>
        </div>
      </section>

      {(paginaData?.intro_titulo || paginaData?.intro_descripcion) && (
        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.introContent}>
              <span className={styles.sectionLabel}>Servicio Especializado</span>
              {paginaData?.intro_titulo && (
                <h2 className={styles.sectionTitle}>{paginaData.intro_titulo}</h2>
              )}
              {paginaData?.intro_descripcion && (
                <p className={styles.introText}>{paginaData.intro_descripcion}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.servicio1_titulo || paginaData?.servicio2_titulo || paginaData?.servicio3_titulo || paginaData?.servicio4_titulo) && (
        <section className={styles.queOfrecemos}>
          <div className={styles.container}>
            <div className={styles.queOfrecemosHeader}>
              <span className={styles.sectionLabel}>Nuestros Servicios</span>
              <h2 className={styles.sectionTitle}>¿Qué Ofrecemos?</h2>
            </div>
            <div className={styles.serviciosGrid}>
              {paginaData?.servicio1_titulo && (
                <div className={styles.servicioCard}>
                  <div className={styles.servicioIcon}>
                    <ion-icon name={paginaData.servicio1_icono || 'construct-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioTitle}>{paginaData.servicio1_titulo}</h3>
                  {paginaData?.servicio1_desc && (
                    <p className={styles.servicioDesc}>{paginaData.servicio1_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.servicio2_titulo && (
                <div className={styles.servicioCard}>
                  <div className={styles.servicioIcon}>
                    <ion-icon name={paginaData.servicio2_icono || 'construct-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioTitle}>{paginaData.servicio2_titulo}</h3>
                  {paginaData?.servicio2_desc && (
                    <p className={styles.servicioDesc}>{paginaData.servicio2_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.servicio3_titulo && (
                <div className={styles.servicioCard}>
                  <div className={styles.servicioIcon}>
                    <ion-icon name={paginaData.servicio3_icono || 'construct-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioTitle}>{paginaData.servicio3_titulo}</h3>
                  {paginaData?.servicio3_desc && (
                    <p className={styles.servicioDesc}>{paginaData.servicio3_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.servicio4_titulo && (
                <div className={styles.servicioCard}>
                  <div className={styles.servicioIcon}>
                    <ion-icon name={paginaData.servicio4_icono || 'construct-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioTitle}>{paginaData.servicio4_titulo}</h3>
                  {paginaData?.servicio4_desc && (
                    <p className={styles.servicioDesc}>{paginaData.servicio4_desc}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.destacado1_titulo || paginaData?.destacado2_titulo) && (
        <section className={styles.serviciosPrincipales}>
          <div className={styles.container}>
            <div className={styles.serviciosPrincipalesGrid}>
              {paginaData?.destacado1_titulo && (
                <div className={styles.servicioDestacado}>
                  <div className={styles.servicioDestacadoIcon}>
                    <ion-icon name={paginaData.destacado1_icono || 'settings-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioDestacadoTitle}>{paginaData.destacado1_titulo}</h3>
                  {paginaData?.destacado1_desc && (
                    <p className={styles.servicioDestacadoDesc}>{paginaData.destacado1_desc}</p>
                  )}
                  {(paginaData?.destacado1_feature1 || paginaData?.destacado1_feature2 || paginaData?.destacado1_feature3 || paginaData?.destacado1_feature4) && (
                    <div className={styles.servicioDestacadoFeatures}>
                      {paginaData?.destacado1_feature1 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado1_feature1}</span>
                        </div>
                      )}
                      {paginaData?.destacado1_feature2 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado1_feature2}</span>
                        </div>
                      )}
                      {paginaData?.destacado1_feature3 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado1_feature3}</span>
                        </div>
                      )}
                      {paginaData?.destacado1_feature4 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado1_feature4}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link href="/contacto" className={styles.servicioDestacadoBtn}>
                    <ion-icon name="mail-outline"></ion-icon>
                    Solicitar Servicio
                  </Link>
                </div>
              )}
              {paginaData?.destacado2_titulo && (
                <div className={styles.servicioDestacado}>
                  <div className={styles.servicioDestacadoIcon}>
                    <ion-icon name={paginaData.destacado2_icono || 'shield-checkmark-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.servicioDestacadoTitle}>{paginaData.destacado2_titulo}</h3>
                  {paginaData?.destacado2_desc && (
                    <p className={styles.servicioDestacadoDesc}>{paginaData.destacado2_desc}</p>
                  )}
                  {(paginaData?.destacado2_feature1 || paginaData?.destacado2_feature2 || paginaData?.destacado2_feature3 || paginaData?.destacado2_feature4) && (
                    <div className={styles.servicioDestacadoFeatures}>
                      {paginaData?.destacado2_feature1 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado2_feature1}</span>
                        </div>
                      )}
                      {paginaData?.destacado2_feature2 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado2_feature2}</span>
                        </div>
                      )}
                      {paginaData?.destacado2_feature3 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado2_feature3}</span>
                        </div>
                      )}
                      {paginaData?.destacado2_feature4 && (
                        <div className={styles.featureItem}>
                          <ion-icon name="checkmark-circle"></ion-icon>
                          <span>{paginaData.destacado2_feature4}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link href="/contacto" className={styles.servicioDestacadoBtn}>
                    <ion-icon name="calendar-outline"></ion-icon>
                    Agendar Mantenimiento
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {galeria.length > 0 && (
        <section className={styles.galeria}>
          <div className={styles.container}>
            <div className={styles.galeriaHeader}>
              <span className={styles.sectionLabel}>Galería</span>
              <h2 className={styles.sectionTitle}>Nuestro Trabajo</h2>
              <p className={styles.galeriaDesc}>
                Conoce algunos de nuestros trabajos de servicio técnico y mantenimiento
              </p>
            </div>
            <div className={styles.galeriaGrid}>
              {galeria.slice(0, 6).map((imagen) => (
                <div key={imagen.id} className={styles.galeriaItem}>
                  <Image 
                    src={imagen.url}
                    alt={imagen.alt_text || imagen.titulo || 'Servicio Técnico'}
                    width={400}
                    height={300}
                    className={styles.galeriaImg}
                  />
                  {imagen.titulo && (
                    <div className={styles.galeriaOverlay}>
                      <span className={styles.galeriaTitle}>{imagen.titulo}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.beneficio1_titulo || paginaData?.beneficio2_titulo || paginaData?.beneficio3_titulo || paginaData?.beneficio4_titulo || paginaData?.beneficio5_titulo || paginaData?.beneficio6_titulo) && (
        <section className={styles.beneficios}>
          <div className={styles.container}>
            <div className={styles.beneficiosHeader}>
              <span className={styles.sectionLabel}>Ventajas</span>
              <h2 className={styles.sectionTitle}>¿Por Qué Elegirnos?</h2>
            </div>
            <div className={styles.beneficiosGrid}>
              {paginaData?.beneficio1_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio1_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio1_titulo}</h3>
                  {paginaData?.beneficio1_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio1_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.beneficio2_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio2_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio2_titulo}</h3>
                  {paginaData?.beneficio2_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio2_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.beneficio3_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio3_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio3_titulo}</h3>
                  {paginaData?.beneficio3_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio3_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.beneficio4_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio4_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio4_titulo}</h3>
                  {paginaData?.beneficio4_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio4_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.beneficio5_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio5_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio5_titulo}</h3>
                  {paginaData?.beneficio5_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio5_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.beneficio6_titulo && (
                <div className={styles.beneficioItem}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio6_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio6_titulo}</h3>
                  {paginaData?.beneficio6_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio6_desc}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {paginaData?.proceso_titulo && (
        <section className={styles.proceso}>
          <div className={styles.container}>
            <div className={styles.procesoHeader}>
              <span className={styles.sectionLabel}>Cómo Trabajamos</span>
              <h2 className={styles.sectionTitle}>{paginaData.proceso_titulo}</h2>
            </div>
            <div className={styles.procesoSteps}>
              {paginaData?.paso1_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>1</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso1_titulo}</h3>
                  {paginaData?.paso1_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso1_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso2_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>2</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso2_titulo}</h3>
                  {paginaData?.paso2_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso2_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso3_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>3</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso3_titulo}</h3>
                  {paginaData?.paso3_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso3_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso4_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>4</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso4_titulo}</h3>
                  {paginaData?.paso4_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso4_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso5_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>5</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso5_titulo}</h3>
                  {paginaData?.paso5_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso5_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso6_titulo && (
                <div className={styles.procesoStep}>
                  <div className={styles.stepNumber}>6</div>
                  <h3 className={styles.stepTitle}>{paginaData.paso6_titulo}</h3>
                  {paginaData?.paso6_desc && (
                    <p className={styles.stepDesc}>{paginaData.paso6_desc}</p>
                  )}
                </div>
              )}
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
                  Solicitar Servicio
                </Link>
                <a href="tel:+51123456789" className={styles.ctaButtonSecondary}>
                  <ion-icon name="call-outline"></ion-icon>
                  Llamar Ahora
                </a>
              </div>
              {paginaData?.cta_nota && (
                <p className={styles.ctaNote}>
                  <ion-icon name="time-outline"></ion-icon>
                  {paginaData.cta_nota}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}