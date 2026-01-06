"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './home.module.css'
import { getHomeData } from './servidor'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const [currentPartnerSlide, setCurrentPartnerSlide] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const homeData = await getHomeData()
        setData(homeData)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!data || !data.heroImages || data.heroImages.length === 0) return

    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % data.heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [data])

  useEffect(() => {
    if (!data || !data.certificadores || data.certificadores.length === 0) return

    const interval = setInterval(() => {
      setCurrentPartnerSlide((prev) => (prev + 1) % data.certificadores.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [data])

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!data) {
    return <div className={styles.error}>Error al cargar datos</div>
  }

  const getVisiblePartners = () => {
    if (!data.certificadores || data.certificadores.length === 0) return []
    
    const total = data.certificadores.length
    const slides = []
    
    for (let i = -2; i <= 2; i++) {
      const index = (currentPartnerSlide + i + total) % total
      slides.push({
        ...data.certificadores[index],
        position: i
      })
    }
    
    return slides
  }

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        {data.heroImages && data.heroImages.map((hero, index) => (
          <div
            key={index}
            className={`${styles.heroSlide} ${index === currentHeroSlide ? styles.activeSlide : ''}`}
            style={{ backgroundImage: `url(${hero.imagen_url})` }}
          >

          </div>
        ))}
        <div className={styles.heroDots}>
          {data.heroImages && data.heroImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentHeroSlide ? styles.activeDot : ''}`}
              onClick={() => setCurrentHeroSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      <section className={styles.servicios}>
        <div className={styles.container}>
          <div className={styles.serviciosHeader}>
            <span className={styles.sectionLabel}>Nuestros Servicios</span>
            <h2 className={styles.sectionTitle}>¿Qué Ofrecemos?</h2>
          </div>
          <div className={styles.serviciosGrid}>
            <div className={styles.servicioCard}>
              <div className={styles.servicioIcon}>
                <ion-icon name="flash-outline"></ion-icon>
              </div>
              <h3 className={styles.servicioTitle}>Arriendo de Equipos</h3>
              <p className={styles.servicioDesc}>
                Amplia variedad de equipos especializados para tendidos eléctricos aéreos y subterráneos, disponibles para arriendo a corto y largo plazo.
              </p>
              <Link href="/tendidos" className={styles.servicioLink}>
                Ver más
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </Link>
            </div>
            <div className={styles.servicioCard}>
              <div className={styles.servicioIcon}>
                <ion-icon name="construct-outline"></ion-icon>
              </div>
              <h3 className={styles.servicioTitle}>Servicio Técnico</h3>
              <p className={styles.servicioDesc}>
                Mantenimiento preventivo y correctivo de equipos. Reparación, diagnóstico y asesoría técnica especializada por personal calificado.
              </p>
              <Link href="/servicio-tecnico" className={styles.servicioLink}>
                Ver más
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </Link>
            </div>
            <div className={styles.servicioCard}>
              <div className={styles.servicioIcon}>
                <ion-icon name="school-outline"></ion-icon>
              </div>
              <h3 className={styles.servicioTitle}>Certificaciones</h3>
              <p className={styles.servicioDesc}>
                Programas de capacitación y certificación para operadores. Formación profesional con instructores calificados y equipos de última generación.
              </p>
              <Link href="/certificaciones" className={styles.servicioLink}>
                Ver más
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </Link>
            </div>
          </div>
          <div className={styles.serviciosCta}>
            <Link href="/contacto" className={styles.ctaButton}>
              <ion-icon name="document-text-outline"></ion-icon>
              Solicitar Cotización Gratuita
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <span className={styles.sectionLabel}>Nuestra Empresa</span>
              <h2 className={styles.sectionTitle}>
                {data.sobreNosotros?.intro_titulo || 'Conoce más sobre nosotros'}
              </h2>
              <p className={styles.aboutText}>
                {data.sobreNosotros?.intro_descripcion || data.empresaInfo?.descripcion || ''}
              </p>
              <div className={styles.aboutStats}>
                {data.sobreNosotros?.stat1_numero && (
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{data.sobreNosotros.stat1_numero}</div>
                    <div className={styles.statLabel}>{data.sobreNosotros.stat1_label}</div>
                  </div>
                )}
                {data.sobreNosotros?.stat2_numero && (
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{data.sobreNosotros.stat2_numero}</div>
                    <div className={styles.statLabel}>{data.sobreNosotros.stat2_label}</div>
                  </div>
                )}
                {data.sobreNosotros?.stat3_numero && (
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{data.sobreNosotros.stat3_numero}</div>
                    <div className={styles.statLabel}>{data.sobreNosotros.stat3_label}</div>
                  </div>
                )}
              </div>
              <Link href="/nosotros" className={styles.aboutButton}>
                Conocer más
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </Link>
            </div>
            <div className={styles.aboutImage}>
              {data.sobreNosotros?.intro_imagen_url && (
                <Image
                  src={data.sobreNosotros.intro_imagen_url}
                  alt={data.empresaInfo?.nombre || 'Empresa'}
                  width={600}
                  height={500}
                  className={styles.image}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {data.certificadores && data.certificadores.length > 0 && (
        <section className={styles.partners}>
          <div className={styles.container}>
            <div className={styles.partnersHeader}>
              <span className={styles.sectionLabel}>Alianzas Estratégicas</span>
              <h2 className={styles.sectionTitle}>Nuestros Proveedores y Aliados</h2>
              <p className={styles.partnersDesc}>
                {data.certificaciones?.certificadores_descripcion || 'Trabajamos con las principales marcas y entidades del sector'}
              </p>
            </div>
            <div className={styles.slider}>
              <div className={styles.sliderTrack}>
                {getVisiblePartners().map((logo, index) => (
                  <div
                    key={`${logo.id}-${index}`}
                    className={`${styles.sliderItem} ${
                      logo.position === 0 ? styles.active : ''
                    } ${Math.abs(logo.position) === 1 ? styles.adjacent : ''} ${
                      Math.abs(logo.position) === 2 ? styles.far : ''
                    }`}
                    style={{
                      transform: `translateX(${logo.position * 280}px) scale(${
                        logo.position === 0 ? 1 : Math.abs(logo.position) === 1 ? 0.85 : 0.7
                      })`,
                      opacity: Math.abs(logo.position) === 2 ? 0.3 : Math.abs(logo.position) === 1 ? 0.6 : 1,
                      zIndex: 10 - Math.abs(logo.position)
                    }}
                  >
                    <div className={styles.logoWrapper}>
                      <Image
                        src={logo.url}
                        alt={logo.alt_text || logo.titulo || 'Partner'}
                        width={200}
                        height={120}
                        className={styles.logoImage}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sliderDots}>
              {data.certificadores.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentPartnerSlide ? styles.activeDot : ''}`}
                  onClick={() => setCurrentPartnerSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.location}>
        <div className={styles.container}>
          <div className={styles.locationGrid}>
            <div className={styles.locationContent}>
              <span className={styles.sectionLabel}>Ubicación</span>
              <h2 className={styles.sectionTitle}>Encuéntranos</h2>
              <div className={styles.locationInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <ion-icon name="location-outline"></ion-icon>
                  </div>
                  <div className={styles.infoText}>
                    <div className={styles.infoLabel}>Dirección</div>
                    <div className={styles.infoValue}>
                      {data.contacto?.ubicacion_texto || 'Lima, Perú'}
                    </div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <ion-icon name="call-outline"></ion-icon>
                  </div>
                  <div className={styles.infoText}>
                    <div className={styles.infoLabel}>Teléfono</div>
                    <div className={styles.infoValue}>{data.empresaInfo?.telefono || ''}</div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <ion-icon name="mail-outline"></ion-icon>
                  </div>
                  <div className={styles.infoText}>
                    <div className={styles.infoLabel}>Email</div>
                    <div className={styles.infoValue}>{data.empresaInfo?.email || ''}</div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <ion-icon name="time-outline"></ion-icon>
                  </div>
                  <div className={styles.infoText}>
                    <div className={styles.infoLabel}>Horario</div>
                    <div className={styles.infoValue}>
                      Lun - Jue: {data.empresaInfo?.horario_lun_jue || ''}
                      <br />
                      Vie: {data.empresaInfo?.horario_vie || ''}
                      <br />
                      Sáb: {data.empresaInfo?.horario_sab || ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.locationMap}>
              {data.contacto?.mapa_url && (
                <iframe
                  src={data.contacto.mapa_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}