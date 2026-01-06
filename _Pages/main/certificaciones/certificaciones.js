"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './certificaciones.module.css'
import { getPaginaCertificaciones, getProgramasCertificacion } from './servidor'

export default function Certificaciones() {
  const [paginaData, setPaginaData] = useState(null)
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dataPagina, dataProgramas] = await Promise.all([
          getPaginaCertificaciones(),
          getProgramasCertificacion()
        ])
        setPaginaData(dataPagina)
        setProgramas(dataProgramas || [])
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
    <main className={styles.certificaciones}>
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
            <div className={styles.introGrid}>
              <div className={styles.introContent}>
                <span className={styles.sectionLabel}>Capacitación</span>
                {paginaData?.intro_titulo && (
                  <h2 className={styles.sectionTitle}>{paginaData.intro_titulo}</h2>
                )}
                {paginaData?.intro_descripcion && (
                  <p className={styles.introText}>{paginaData.intro_descripcion}</p>
                )}
              </div>
              {paginaData?.intro_imagen_url && (
                <div className={styles.introImage}>
                  <Image 
                    src={paginaData.intro_imagen_url}
                    alt="Certificaciones"
                    width={600}
                    height={400}
                    className={styles.image}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.beneficio1_titulo || paginaData?.beneficio2_titulo || paginaData?.beneficio3_titulo || paginaData?.beneficio4_titulo) && (
        <section className={styles.beneficios}>
          <div className={styles.container}>
            <div className={styles.beneficiosHeader}>
              <span className={styles.sectionLabel}>Ventajas</span>
              <h2 className={styles.sectionTitle}>Beneficios de Certificarse</h2>
            </div>
            <div className={styles.beneficiosGrid}>
              {paginaData?.beneficio1_titulo && (
                <div className={styles.beneficioCard}>
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
                <div className={styles.beneficioCard}>
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
                <div className={styles.beneficioCard}>
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
                <div className={styles.beneficioCard}>
                  <div className={styles.beneficioIcon}>
                    <ion-icon name={paginaData.beneficio4_icono || 'checkmark-circle-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.beneficioTitle}>{paginaData.beneficio4_titulo}</h3>
                  {paginaData?.beneficio4_desc && (
                    <p className={styles.beneficioDesc}>{paginaData.beneficio4_desc}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {programas.length > 0 && (
        <section className={styles.programas}>
          <div className={styles.container}>
            <div className={styles.programasHeader}>
              <span className={styles.sectionLabel}>Programas</span>
              <h2 className={styles.sectionTitle}>Nuestros Programas de Certificación</h2>
            </div>
            <div className={styles.programasGrid}>
              {programas.map((programa) => (
                <div key={programa.id} className={styles.programaCard}>
                  {programa.imagen_url && (
                    <div className={styles.programaImagen}>
                      <Image 
                        src={programa.imagen_url}
                        alt={programa.nombre}
                        width={400}
                        height={250}
                        className={styles.programaImage}
                      />
                      {programa.destacado && (
                        <span className={styles.programaBadge}>Destacado</span>
                      )}
                    </div>
                  )}
                  <div className={styles.programaContent}>
                    <div className={styles.programaMeta}>
                      <span className={styles.programaNivel}>{programa.nivel}</span>
                      <span className={styles.programaDuracion}>{programa.duracion_horas}h</span>
                    </div>
                    <h3 className={styles.programaTitle}>{programa.nombre}</h3>
                    {programa.descripcion_corta && (
                      <p className={styles.programaDesc}>{programa.descripcion_corta}</p>
                    )}
                    <div className={styles.programaFooter}>
                      <div className={styles.programaPrecio}>S/ {programa.costo}</div>
                      <Link href={`/certificaciones/${programa.slug}`} className={styles.programaBtn}>
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {paginaData?.proceso_titulo && (
        <section className={styles.proceso}>
          <div className={styles.container}>
            <div className={styles.procesoHeader}>
              <span className={styles.sectionLabel}>Cómo funciona</span>
              <h2 className={styles.sectionTitle}>{paginaData.proceso_titulo}</h2>
            </div>
            <div className={styles.procesoGrid}>
              {paginaData?.paso1_numero && (
                <div className={styles.procesoItem}>
                  <div className={styles.procesoNumero}>{paginaData.paso1_numero}</div>
                  <h3 className={styles.procesoTitle}>{paginaData.paso1_titulo}</h3>
                  {paginaData?.paso1_desc && (
                    <p className={styles.procesoDesc}>{paginaData.paso1_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso2_numero && (
                <div className={styles.procesoItem}>
                  <div className={styles.procesoNumero}>{paginaData.paso2_numero}</div>
                  <h3 className={styles.procesoTitle}>{paginaData.paso2_titulo}</h3>
                  {paginaData?.paso2_desc && (
                    <p className={styles.procesoDesc}>{paginaData.paso2_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso3_numero && (
                <div className={styles.procesoItem}>
                  <div className={styles.procesoNumero}>{paginaData.paso3_numero}</div>
                  <h3 className={styles.procesoTitle}>{paginaData.paso3_titulo}</h3>
                  {paginaData?.paso3_desc && (
                    <p className={styles.procesoDesc}>{paginaData.paso3_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.paso4_numero && (
                <div className={styles.procesoItem}>
                  <div className={styles.procesoNumero}>{paginaData.paso4_numero}</div>
                  <h3 className={styles.procesoTitle}>{paginaData.paso4_titulo}</h3>
                  {paginaData?.paso4_desc && (
                    <p className={styles.procesoDesc}>{paginaData.paso4_desc}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.requisitos_titulo || paginaData?.req1_texto) && (
        <section className={styles.requisitos}>
          <div className={styles.container}>
            <div className={styles.requisitosContent}>
              <span className={styles.sectionLabel}>Documentación</span>
              {paginaData?.requisitos_titulo && (
                <h2 className={styles.sectionTitle}>{paginaData.requisitos_titulo}</h2>
              )}
              {paginaData?.requisitos_descripcion && (
                <p className={styles.requisitosText}>{paginaData.requisitos_descripcion}</p>
              )}
              <div className={styles.requisitosGrid}>
                {paginaData?.req1_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req1_texto}</span>
                  </div>
                )}
                {paginaData?.req2_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req2_texto}</span>
                  </div>
                )}
                {paginaData?.req3_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req3_texto}</span>
                  </div>
                )}
                {paginaData?.req4_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req4_texto}</span>
                  </div>
                )}
                {paginaData?.req5_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req5_texto}</span>
                  </div>
                )}
                {paginaData?.req6_texto && (
                  <div className={styles.requisitoItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{paginaData.req6_texto}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {(paginaData?.testimonio1_nombre || paginaData?.testimonio2_nombre || paginaData?.testimonio3_nombre) && (
        <section className={styles.testimonios}>
          <div className={styles.container}>
            <div className={styles.testimoniosHeader}>
              <h2 className={styles.sectionTitle}>Testimonios</h2>
            </div>
            <div className={styles.testimoniosGrid}>
              {paginaData?.testimonio1_nombre && (
                <div className={styles.testimonioCard}>
                  <div className={styles.testimonioQuote}>
                    <ion-icon name="quote"></ion-icon>
                  </div>
                  {paginaData?.testimonio1_texto && (
                    <p className={styles.testimonioTexto}>{paginaData.testimonio1_texto}</p>
                  )}
                  <div className={styles.testimonioAutor}>
                    {paginaData?.testimonio1_imagen_url && (
                      <div className={styles.testimonioAvatar}>
                        <Image 
                          src={paginaData.testimonio1_imagen_url}
                          alt={paginaData.testimonio1_nombre}
                          width={60}
                          height={60}
                          className={styles.testimonioImage}
                        />
                      </div>
                    )}
                    <div className={styles.testimonioInfo}>
                      <div className={styles.testimonioNombre}>{paginaData.testimonio1_nombre}</div>
                      {paginaData?.testimonio1_cargo && (
                        <div className={styles.testimonioCargo}>{paginaData.testimonio1_cargo}</div>
                      )}
                      {paginaData?.testimonio1_empresa && (
                        <div className={styles.testimonioEmpresa}>{paginaData.testimonio1_empresa}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {paginaData?.testimonio2_nombre && (
                <div className={styles.testimonioCard}>
                  <div className={styles.testimonioQuote}>
                    <ion-icon name="quote"></ion-icon>
                  </div>
                  {paginaData?.testimonio2_texto && (
                    <p className={styles.testimonioTexto}>{paginaData.testimonio2_texto}</p>
                  )}
                  <div className={styles.testimonioAutor}>
                    {paginaData?.testimonio2_imagen_url && (
                      <div className={styles.testimonioAvatar}>
                        <Image 
                          src={paginaData.testimonio2_imagen_url}
                          alt={paginaData.testimonio2_nombre}
                          width={60}
                          height={60}
                          className={styles.testimonioImage}
                        />
                      </div>
                    )}
                    <div className={styles.testimonioInfo}>
                      <div className={styles.testimonioNombre}>{paginaData.testimonio2_nombre}</div>
                      {paginaData?.testimonio2_cargo && (
                        <div className={styles.testimonioCargo}>{paginaData.testimonio2_cargo}</div>
                      )}
                      {paginaData?.testimonio2_empresa && (
                        <div className={styles.testimonioEmpresa}>{paginaData.testimonio2_empresa}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {paginaData?.testimonio3_nombre && (
                <div className={styles.testimonioCard}>
                  <div className={styles.testimonioQuote}>
                    <ion-icon name="quote"></ion-icon>
                  </div>
                  {paginaData?.testimonio3_texto && (
                    <p className={styles.testimonioTexto}>{paginaData.testimonio3_texto}</p>
                  )}
                  <div className={styles.testimonioAutor}>
                    {paginaData?.testimonio3_imagen_url && (
                      <div className={styles.testimonioAvatar}>
                        <Image 
                          src={paginaData.testimonio3_imagen_url}
                          alt={paginaData.testimonio3_nombre}
                          width={60}
                          height={60}
                          className={styles.testimonioImage}
                        />
                      </div>
                    )}
                    <div className={styles.testimonioInfo}>
                      <div className={styles.testimonioNombre}>{paginaData.testimonio3_nombre}</div>
                      {paginaData?.testimonio3_cargo && (
                        <div className={styles.testimonioCargo}>{paginaData.testimonio3_cargo}</div>
                      )}
                      {paginaData?.testimonio3_empresa && (
                        <div className={styles.testimonioEmpresa}>{paginaData.testimonio3_empresa}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.certificadores_titulo || paginaData?.cert_logo1_url) && (
        <section className={styles.certificadores}>
          <div className={styles.container}>
            <div className={styles.certificadoresContent}>
              <span className={styles.sectionLabel}>Alianzas</span>
              {paginaData?.certificadores_titulo && (
                <h2 className={styles.sectionTitle}>{paginaData.certificadores_titulo}</h2>
              )}
              {paginaData?.certificadores_descripcion && (
                <p className={styles.certificadoresText}>{paginaData.certificadores_descripcion}</p>
              )}
              <div className={styles.certificadoresLogos}>
                {paginaData?.cert_logo1_url && (
                  <div className={styles.logoItem}>
                    <Image 
                      src={paginaData.cert_logo1_url}
                      alt="Certificador 1"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  </div>
                )}
                {paginaData?.cert_logo2_url && (
                  <div className={styles.logoItem}>
                    <Image 
                      src={paginaData.cert_logo2_url}
                      alt="Certificador 2"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  </div>
                )}
                {paginaData?.cert_logo3_url && (
                  <div className={styles.logoItem}>
                    <Image 
                      src={paginaData.cert_logo3_url}
                      alt="Certificador 3"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  </div>
                )}
                {paginaData?.cert_logo4_url && (
                  <div className={styles.logoItem}>
                    <Image 
                      src={paginaData.cert_logo4_url}
                      alt="Certificador 4"
                      width={150}
                      height={80}
                      className={styles.logoImage}
                    />
                  </div>
                )}
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
                  Contactar Ahora
                </Link>
                <Link href="#programas" className={styles.ctaButtonSecondary}>
                  <ion-icon name="list-outline"></ion-icon>
                  Ver Programas
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}