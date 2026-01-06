"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './header.module.css'
import { getEmpresaInfo } from './servidor'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [empresaInfo, setEmpresaInfo] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    async function loadData() {
      const data = await getEmpresaInfo()
      setEmpresaInfo(data)
    }
    loadData()

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  if (!empresaInfo) return null

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.topBar}>
          <div className={styles.container}>
            <div className={styles.topBarContent}>
              <div className={styles.contactInfo}>
                <a href={`tel:${empresaInfo.telefono}`} className={styles.contactItem}>
                  <ion-icon name="call-outline"></ion-icon>
                  <span>{empresaInfo.telefono}</span>
                </a>
                <a href={`mailto:${empresaInfo.email}`} className={styles.contactItem}>
                  <ion-icon name="mail-outline"></ion-icon>
                  <span>{empresaInfo.email}</span>
                </a>
                <div className={styles.contactItem}>
                  <ion-icon name="time-outline"></ion-icon>
                  <span>Lu - Jue {empresaInfo.horario_lun_jue} ; Vie {empresaInfo.horario_vie}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className={styles.mainNav}>
          <div className={styles.container}>
            <div className={styles.navContent}>
              <Link href="/" className={styles.logo}>
                <img 
                  src={empresaInfo.logo_url || "/logo.png"} 
                  alt={empresaInfo.nombre}
                  className={styles.logoImage}
                />
              </Link>

              <button 
                className={styles.hamburger} 
                onClick={toggleMenu}
                aria-label="Abrir menú"
              >
                <span className={styles.hamburgerIcon}>
                  <span className={styles.hmLines}>
                    <span className={`${styles.hmLine} ${styles.line1}`}></span>
                    <span className={`${styles.hmLine} ${styles.line2}`}></span>
                    <span className={`${styles.hmLine} ${styles.line3}`}></span>
                  </span>
                </span>
              </button>

              <ul className={styles.navLinks}>
                <li>
                  <Link href="/tendidos">ARRIENDO EQUIPOS DE TENDIDO</Link>
                </li>
                <li>
                  <Link href="/servicio">SERVICIO TÉCNICO</Link>
                </li>
                <li>
                  <Link href="/certificaciones">CERTIFICACIONES</Link>
                </li>
                <li>
                  <Link href="/nosotros">SOBRE NOSOTROS</Link>
                </li>
                <li>
                  <Link href="/contacto" className={styles.contactBtn}>CONTACTO</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <button 
          className={styles.closeBtn} 
          onClick={closeMenu}
          aria-label="Cerrar menú"
        >
          <ion-icon name="close-outline"></ion-icon>
        </button>

        <div className={styles.mobileMenuContent}>
          <div className={styles.mobileLogoSection}>
            <img 
              src={empresaInfo.logo_url || "/logo.png"} 
              alt={empresaInfo.nombre}
              className={styles.mobileLogoImage}
            />
          </div>

          <ul className={styles.mobileNavLinks}>
            <li>
              <Link href="/tendidos" onClick={closeMenu}>
                <ion-icon name="construct-outline"></ion-icon>
                <span>ARRIENDO EQUIPOS DE TENDIDO</span>
              </Link>
            </li>
            <li>
              <Link href="/servicio" onClick={closeMenu}>
                <ion-icon name="settings-outline"></ion-icon>
                <span>SERVICIO TÉCNICO</span>
              </Link>
            </li>
            <li>
              <Link href="/certificaciones" onClick={closeMenu}>
                <ion-icon name="ribbon-outline"></ion-icon>
                <span>CERTIFICACIONES</span>
              </Link>
            </li>
            <li>
              <Link href="/nosotros" onClick={closeMenu}>
                <ion-icon name="business-outline"></ion-icon>
                <span>SOBRE NOSOTROS</span>
              </Link>
            </li>
            <li>
              <Link href="/contacto" onClick={closeMenu} className={styles.mobileContactLink}>
                <ion-icon name="mail-outline"></ion-icon>
                <span>CONTACTO</span>
              </Link>
            </li>
          </ul>

          <div className={styles.mobileContactInfo}>
            <a href={`tel:${empresaInfo.telefono}`} className={styles.mobileContactItem}>
              <ion-icon name="call-outline"></ion-icon>
              <span>{empresaInfo.telefono}</span>
            </a>
            <a href={`mailto:${empresaInfo.email}`} className={styles.mobileContactItem}>
              <ion-icon name="mail-outline"></ion-icon>
              <span>{empresaInfo.email}</span>
            </a>
          </div>
        </div>
      </div>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}
    </>
  )
}