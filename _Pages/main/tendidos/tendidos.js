"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './tendidos.module.css'
import { getPaginaArriendoEquipos, getCatalogos, getGaleriaTendidos } from './servidor'

export default function Tendidos() {
  const [paginaData, setPaginaData] = useState(null)
  const [catalogos, setCatalogos] = useState([])
  const [galeria, setGaleria] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [currentGalleryPage, setCurrentGalleryPage] = useState(1)
  const [visibleGallery, setVisibleGallery] = useState(8)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 32

  useEffect(() => {
    async function loadData() {
      try {
        const [dataPagina, dataCatalogos, dataGaleria] = await Promise.all([
          getPaginaArriendoEquipos(),
          getCatalogos(),
          getGaleriaTendidos()
        ])
        setPaginaData(dataPagina)
        setCatalogos(dataCatalogos || [])
        setGaleria(dataGaleria || [])
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredGallery = galeria.filter(img => {
    if (filterType === 'all') return true
    if (filterType === 'newest') return true
    return img.categoria === filterType
  }).sort((a, b) => {
    if (filterType === 'newest') {
      return new Date(b.fecha_subida) - new Date(a.fecha_subida)
    }
    return 0
  })

  const totalGalleryPages = Math.ceil(filteredGallery.length / itemsPerPage)
  const startGalleryIndex = (currentGalleryPage - 1) * itemsPerPage
  const endGalleryIndex = startGalleryIndex + itemsPerPage
  const currentGallery = filteredGallery.slice(startGalleryIndex, endGalleryIndex)

  const loadMoreGallery = () => {
    setVisibleGallery(prev => prev + 8)
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <main className={styles.tendidos}>
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

      {(paginaData?.tipo1_titulo || paginaData?.tipo2_titulo) && (
        <section className={styles.types}>
          <div className={styles.container}>
            <div className={styles.typesGrid}>
              {paginaData?.tipo1_titulo && (
                <div className={styles.typeCard}>
                  <div className={styles.typeIcon}>
                    <ion-icon name={paginaData.tipo1_icono || 'flash-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.typeTitle}>{paginaData.tipo1_titulo}</h3>
                  {paginaData?.tipo1_desc && (
                    <p className={styles.typeDesc}>{paginaData.tipo1_desc}</p>
                  )}
                </div>
              )}
              {paginaData?.tipo2_titulo && (
                <div className={styles.typeCard}>
                  <div className={styles.typeIcon}>
                    <ion-icon name={paginaData.tipo2_icono || 'layers-outline'}></ion-icon>
                  </div>
                  <h3 className={styles.typeTitle}>{paginaData.tipo2_titulo}</h3>
                  {paginaData?.tipo2_desc && (
                    <p className={styles.typeDesc}>{paginaData.tipo2_desc}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(paginaData?.catalogo_titulo || catalogos.length > 0) && (
        <section className={styles.catalog}>
          <div className={styles.container}>
            <div className={styles.catalogGrid}>
              <div className={styles.catalogContent}>
                <span className={styles.sectionLabel}>Catálogo Digital</span>
                {paginaData?.catalogo_titulo && (
                  <h2 className={styles.sectionTitle}>{paginaData.catalogo_titulo}</h2>
                )}
                {paginaData?.catalogo_descripcion && (
                  <p className={styles.catalogText}>{paginaData.catalogo_descripcion}</p>
                )}
                {catalogos && catalogos.length > 0 ? (
                  catalogos.map((catalogo) => (
                    <a 
                      key={catalogo.id}
                      href={catalogo.archivo_url} 
                      download 
                      className={styles.downloadBtn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ion-icon name="download-outline"></ion-icon>
                      Descargar {catalogo.nombre}
                    </a>
                  ))
                ) : (
                  <a href="#" className={styles.downloadBtn}>
                    <ion-icon name="download-outline"></ion-icon>
                    Descargar Catálogo
                  </a>
                )}
              </div>
              <div className={styles.catalogVideo}>
                <div className={styles.videoWrapper}>
                  {paginaData?.video_url ? (
                    <video 
                      controls 
                      poster={paginaData.video_poster_url || '/video-poster.jpg'}
                      className={styles.video}
                    >
                      <source src={paginaData.video_url} type="video/mp4" />
                      Tu navegador no soporta el tag de video.
                    </video>
                  ) : (
                    <video 
                      controls 
                      poster="/video-poster.jpg"
                      className={styles.video}
                    >
                      <source src="/tendidos-video.mp4" type="video/mp4" />
                      Tu navegador no soporta el tag de video.
                    </video>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {(paginaData?.caracteristica1_titulo || paginaData?.ventaja1_titulo) && (
        <section className={styles.features}>
          <div className={styles.container}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.sectionTitle}>Características y Beneficios</h2>
            </div>
            <div className={styles.featuresGrid}>
              {(paginaData?.caracteristica1_titulo || paginaData?.caracteristica2_titulo || paginaData?.caracteristica3_titulo || paginaData?.caracteristica4_titulo) && (
                <div className={styles.featureColumn}>
                  <h3 className={styles.featureSubtitle}>Características y Beneficios:</h3>
                  <ul className={styles.featureList}>
                    {paginaData?.caracteristica1_titulo && (
                      <li>
                        <ion-icon name="checkmark-circle"></ion-icon>
                        <div>
                          <strong>{paginaData.caracteristica1_titulo}:</strong>
                          <span>{paginaData.caracteristica1_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.caracteristica2_titulo && (
                      <li>
                        <ion-icon name="checkmark-circle"></ion-icon>
                        <div>
                          <strong>{paginaData.caracteristica2_titulo}:</strong>
                          <span>{paginaData.caracteristica2_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.caracteristica3_titulo && (
                      <li>
                        <ion-icon name="checkmark-circle"></ion-icon>
                        <div>
                          <strong>{paginaData.caracteristica3_titulo}:</strong>
                          <span>{paginaData.caracteristica3_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.caracteristica4_titulo && (
                      <li>
                        <ion-icon name="checkmark-circle"></ion-icon>
                        <div>
                          <strong>{paginaData.caracteristica4_titulo}:</strong>
                          <span>{paginaData.caracteristica4_desc}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {(paginaData?.ventaja1_titulo || paginaData?.ventaja2_titulo || paginaData?.ventaja3_titulo || paginaData?.ventaja4_titulo) && (
                <div className={styles.featureColumn}>
                  <h3 className={styles.featureSubtitle}>Ventajas de Arrendar con Nosotros:</h3>
                  <ul className={styles.featureList}>
                    {paginaData?.ventaja1_titulo && (
                      <li>
                        <ion-icon name="cash-outline"></ion-icon>
                        <div>
                          <strong>{paginaData.ventaja1_titulo}:</strong>
                          <span>{paginaData.ventaja1_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.ventaja2_titulo && (
                      <li>
                        <ion-icon name="time-outline"></ion-icon>
                        <div>
                          <strong>{paginaData.ventaja2_titulo}:</strong>
                          <span>{paginaData.ventaja2_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.ventaja3_titulo && (
                      <li>
                        <ion-icon name="people-outline"></ion-icon>
                        <div>
                          <strong>{paginaData.ventaja3_titulo}:</strong>
                          <span>{paginaData.ventaja3_desc}</span>
                        </div>
                      </li>
                    )}
                    {paginaData?.ventaja4_titulo && (
                      <li>
                        <ion-icon name="git-compare-outline"></ion-icon>
                        <div>
                          <strong>{paginaData.ventaja4_titulo}:</strong>
                          <span>{paginaData.ventaja4_desc}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {galeria.length > 0 && (
        <section className={styles.gallery}>
          <div className={styles.container}>
            <div className={styles.galleryHeader}>
              <h2 className={styles.sectionTitle}>Galería - Nuestros Equipos</h2>
              <div className={styles.galleryFilters}>
                <button 
                  className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  Todos
                </button>
                <button 
                  className={`${styles.filterBtn} ${filterType === 'newest' ? styles.active : ''}`}
                  onClick={() => setFilterType('newest')}
                >
                  Más Nuevos
                </button>
                <button 
                  className={`${styles.filterBtn} ${filterType === 'equipos' ? styles.active : ''}`}
                  onClick={() => setFilterType('equipos')}
                >
                  Equipos
                </button>
                <button 
                  className={`${styles.filterBtn} ${filterType === 'proyectos' ? styles.active : ''}`}
                  onClick={() => setFilterType('proyectos')}
                >
                  Proyectos
                </button>
              </div>
            </div>

            <div className={styles.galleryGridDesktop}>
              {currentGallery.map((imagen) => (
                <div key={imagen.id} className={styles.galleryItem}>
                  <Image 
                    src={imagen.url}
                    alt={imagen.alt_text || imagen.titulo || 'Equipo'}
                    width={400}
                    height={300}
                    className={styles.galleryImg}
                  />
                  {imagen.titulo && (
                    <div className={styles.galleryOverlay}>
                      <span className={styles.galleryTitle}>{imagen.titulo}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.galleryGridMobile}>
              {filteredGallery.slice(0, visibleGallery).map((imagen) => (
                <div key={imagen.id} className={styles.galleryItem}>
                  <Image 
                    src={imagen.url}
                    alt={imagen.alt_text || imagen.titulo || 'Equipo'}
                    width={400}
                    height={300}
                    className={styles.galleryImg}
                  />
                  {imagen.titulo && (
                    <div className={styles.galleryOverlay}>
                      <span className={styles.galleryTitle}>{imagen.titulo}</span>
                    </div>
                  )}
                </div>
              ))}
              {visibleGallery < filteredGallery.length && (
                <button onClick={loadMoreGallery} className={styles.loadMoreBtn}>
                  <ion-icon name="chevron-down-circle-outline"></ion-icon>
                  Cargar más imágenes
                </button>
              )}
            </div>

            {totalGalleryPages > 1 && (
              <div className={styles.paginationDesktop}>
                <button 
                  onClick={() => setCurrentGalleryPage(prev => Math.max(1, prev - 1))}
                  disabled={currentGalleryPage === 1}
                  className={styles.paginationBtn}
                >
                  <ion-icon name="chevron-back"></ion-icon>
                </button>
                {Array.from({ length: totalGalleryPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentGalleryPage(page)}
                    className={`${styles.paginationNumber} ${page === currentGalleryPage ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentGalleryPage(prev => Math.min(totalGalleryPages, prev + 1))}
                  disabled={currentGalleryPage === totalGalleryPages}
                  className={styles.paginationBtn}
                >
                  <ion-icon name="chevron-forward"></ion-icon>
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}