"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './footer.module.css'
import { getEmpresaInfo } from './servidor'

export default function Footer() {
  const [empresaInfo, setEmpresaInfo] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEmpresaInfo()
        setEmpresaInfo(data)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    loadData()
  }, [])

  if (!empresaInfo) return null

  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <div className={styles.footerLogo}>
                <img 
                  src={empresaInfo.logo_url || "/logo.png"}
                  alt={empresaInfo.nombre}
                  className={styles.logoImage}
                />
              </div>
              <p className={styles.footerDesc}>
                {empresaInfo.descripcion || 'Soluciones integrales en arriendo de equipos para tendidos eléctricos. Más de 20 años de experiencia respaldando proyectos en todo el Perú.'}
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <ion-icon name="logo-linkedin"></ion-icon>
                </a>
                <a href="#" className={styles.socialLink} aria-label="WhatsApp">
                  <ion-icon name="logo-whatsapp"></ion-icon>
                </a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Navegación</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/tendidos">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Arriendo Equipos de Tendido
                  </Link>
                </li>
                <li>
                  <Link href="/servicio">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Servicio Técnico
                  </Link>
                </li>
                <li>
                  <Link href="/certificaciones">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Certificaciones
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Legal</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/terminos">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Contacto</h3>
              <ul className={styles.footerContact}>
                <li>
                  <div className={styles.contactIcon}>
                    <ion-icon name="call"></ion-icon>
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Teléfono</span>
                    <a href={`tel:${empresaInfo.telefono}`} className={styles.contactValue}>
                      {empresaInfo.telefono}
                    </a>
                  </div>
                </li>
                <li>
                  <div className={styles.contactIcon}>
                    <ion-icon name="mail"></ion-icon>
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Email</span>
                    <a href={`mailto:${empresaInfo.email}`} className={styles.contactValue}>
                      {empresaInfo.email}
                    </a>
                  </div>
                </li>
                <li>
                  <div className={styles.contactIcon}>
                    <ion-icon name="time"></ion-icon>
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Horario</span>
                    <span className={styles.contactValue}>
                      Lun - Jue: {empresaInfo.horario_lun_jue}
                    </span>
                    <span className={styles.contactValue}>
                      Vie: {empresaInfo.horario_vie}
                    </span>
                    <span className={styles.contactValue}>
                      Sáb: {empresaInfo.horario_sab}
                    </span>
                  </div>
                </li>
                <li>
                  <div className={styles.contactIcon}>
                    <ion-icon name="location"></ion-icon>
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Ubicación</span>
                    <span className={styles.contactValue}>Lima, Perú</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              &copy; {currentYear} {empresaInfo.nombre}. Todos los derechos reservados.
            </p>
            <div className={styles.footerBottomLinks}>
              <Link href="/privacidad">Política de Privacidad</Link>
              <span className={styles.separator}>|</span>
              <Link href="/terminos">Términos y Condiciones</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}