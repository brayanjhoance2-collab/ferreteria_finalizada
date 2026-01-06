"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './header.module.css'
import { obtenerUsuarioSesion, obtenerEmpresaInfo, cerrarSesion } from './servidor'

export default function HeaderAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false)
  const [submenuAbierto, setSubmenuAbierto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (menuPerfilAbierto) {
      cargarDatos()
    }
  }, [menuPerfilAbierto])

  const cargarDatos = async () => {
    try {
      const [dataUsuario, dataEmpresa] = await Promise.all([
        obtenerUsuarioSesion(),
        obtenerEmpresaInfo()
      ])
      
      if (dataUsuario.valida && dataUsuario.usuario) {
        setUsuario(dataUsuario.usuario)
      } else {
        router.push('/login')
      }
      
      if (dataEmpresa) {
        setEmpresa(dataEmpresa)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const toggleSubmenu = (menu) => {
    setSubmenuAbierto(submenuAbierto === menu ? null : menu)
  }

  const menuPrincipal = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'speedometer-outline',
      link: '/admin/dashboard'
    },
    {
      id: 'equipos',
      title: 'Equipos',
      icon: 'construct-outline',
      submenu: [
        { title: 'Categorías', link: '/admin/equipos/categorias', icon: 'folder-outline' },
        { title: 'Lista de Equipos', link: '/admin/equipos/lista', icon: 'list-outline' },
        { title: 'Agregar Equipo', link: '/admin/equipos/agregar', icon: 'add-circle-outline' }
      ]
    },
    {
      id: 'arriendos',
      title: 'Arriendos',
      icon: 'cart-outline',
      submenu: [
        { title: 'Lista de Arriendos', link: '/admin/arriendos/lista', icon: 'list-outline' },
        { title: 'Nuevo Arriendo', link: '/admin/arriendos/nuevo', icon: 'add-circle-outline' },
        { title: 'Pagos', link: '/admin/arriendos/pagos', icon: 'card-outline' }
      ]
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: 'people-outline',
      link: '/admin/clientes/lista'
    }
  ]

  const menuPerfil = [
    {
      id: 'empresa',
      title: 'Empresa',
      icon: 'business-outline',
      link: '/admin/empresa'
    },
    {
      id: 'miperfil',
      title: 'Mi Perfil',
      icon: 'person-circle-outline',
      link: '/admin/miperfil'
    },
    {
      id: 'paginaweb',
      title: 'Página Web',
      icon: 'globe-outline',
      submenu: [
        { title: 'Arriendo Equipos de Tendido', link: '/admin/pagina/arriendoequipos', icon: 'construct-outline' },
        { title: 'Servicio Técnico', link: '/admin/pagina/serviciotecnico', icon: 'build-outline' },
        { title: 'Certificaciones', link: '/admin/pagina/certificaciones', icon: 'school-outline' },
        { title: 'Sobre Nosotros', link: '/admin/pagina/sobrenosotros', icon: 'information-circle-outline' },
        { title: 'Contacto', link: '/admin/pagina/contacto', icon: 'mail-outline' }
      ]
    },
    {
      id: 'contactos',
      title: 'Contactos',
      icon: 'chatbubbles-outline',
      link: '/admin/contactos'
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      icon: 'cog-outline',
      submenu: [
        { title: 'Sistema', link: '/admin/configuracion/sistema', icon: 'settings-outline' },
        { title: 'Términos', link: '/admin/configuracion/terminos', icon: 'document-text-outline' },
        { title: 'Privacidad', link: '/admin/configuracion/privacidad', icon: 'shield-outline' }
      ]
    },
    {
      id: 'auditoria',
      title: 'Auditoría',
      icon: 'analytics-outline',
      link: '/admin/auditoria'
    }
  ]

  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.loading}>Cargando...</div>
        </div>
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link href="/admin/dashboard" className={styles.logo}>
            {empresa?.logo_url ? (
              <img 
                src={empresa.logo_url} 
                alt={empresa.nombre || 'Logo'} 
                className={styles.logoImage}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt={empresa?.nombre || 'Logo'} 
                className={styles.logoImage}
              />
            )}
          </Link>

          <nav className={styles.navCenter}>
            <ul className={styles.navList}>
              {menuPrincipal.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  {item.submenu ? (
                    <>
                      <button
                        className={`${styles.navLink} ${styles.navLinkSubmenu} ${
                          submenuAbierto === item.id ? styles.active : ''
                        }`}
                        onClick={() => toggleSubmenu(item.id)}
                      >
                        <ion-icon name={item.icon}></ion-icon>
                        <span>{item.title}</span>
                        <ion-icon 
                          name={submenuAbierto === item.id ? 'chevron-up' : 'chevron-down'}
                          className={styles.chevron}
                        ></ion-icon>
                      </button>
                      <ul className={`${styles.submenu} ${submenuAbierto === item.id ? styles.submenuOpen : ''}`}>
                        {item.submenu.map((subitem) => (
                          <li key={subitem.link}>
                            <Link
                              href={subitem.link}
                              className={`${styles.submenuLink} ${
                                pathname === subitem.link ? styles.submenuLinkActive : ''
                              }`}
                            >
                              <ion-icon name={subitem.icon}></ion-icon>
                              <span>{subitem.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.link}
                      className={`${styles.navLink} ${
                        pathname === item.link ? styles.active : ''
                      }`}
                    >
                      <ion-icon name={item.icon}></ion-icon>
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.userSection}>
            <button 
              className={styles.userButton}
              onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
            >
              <div className={styles.userAvatar}>
                {usuario?.avatar_url ? (
                  <img 
                    src={usuario.avatar_url} 
                    alt={usuario.nombre_completo} 
                    className={styles.userAvatarImage}
                  />
                ) : (
                  <ion-icon name="person"></ion-icon>
                )}
              </div>
              <ion-icon name="chevron-down" className={styles.userChevron}></ion-icon>
            </button>

            <div className={`${styles.menuPerfil} ${menuPerfilAbierto ? styles.menuPerfilOpen : ''}`}>
              <div className={styles.menuPerfilHeader}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{usuario?.nombre_completo || 'Usuario'}</span>
                  <span className={styles.userEmail}>{usuario?.email || ''}</span>
                  <span className={styles.userRole}>{usuario?.rol || 'admin'}</span>
                </div>
              </div>

              <div className={styles.menuPerfilBody}>
                {menuPerfil.map((item) => (
                  <div key={item.id} className={styles.menuPerfilItem}>
                    {item.submenu ? (
                      <>
                        <button
                          className={styles.menuPerfilLink}
                          onClick={() => toggleSubmenu(item.id)}
                        >
                          <ion-icon name={item.icon}></ion-icon>
                          <span>{item.title}</span>
                          <ion-icon 
                            name={submenuAbierto === item.id ? 'chevron-up' : 'chevron-down'}
                            className={styles.chevron}
                          ></ion-icon>
                        </button>
                        <div className={`${styles.menuPerfilSubmenu} ${submenuAbierto === item.id ? styles.menuPerfilSubmenuOpen : ''}`}>
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.link}
                              href={subitem.link}
                              className={`${styles.menuPerfilSublink} ${
                                pathname === subitem.link ? styles.menuPerfilSublinkActive : ''
                              }`}
                              onClick={() => setMenuPerfilAbierto(false)}
                            >
                              <ion-icon name={subitem.icon}></ion-icon>
                              <span>{subitem.title}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.link}
                        className={styles.menuPerfilLink}
                        onClick={() => setMenuPerfilAbierto(false)}
                      >
                        <ion-icon name={item.icon}></ion-icon>
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.menuPerfilFooter}>
                <button 
                  className={styles.logoutButton}
                  onClick={handleCerrarSesion}
                >
                  <ion-icon name="log-out-outline"></ion-icon>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            className={styles.menuToggleMobile}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <ion-icon name={menuAbierto ? 'close' : 'menu'}></ion-icon>
          </button>
        </div>
      </div>

      <nav className={`${styles.navMobile} ${menuAbierto ? styles.navMobileOpen : ''}`}>
        <div className={styles.navMobileContent}>
          {[...menuPrincipal, ...menuPerfil].map((item) => (
            <div key={item.id} className={styles.navMobileItem}>
              {item.submenu ? (
                <>
                  <button
                    className={styles.navMobileLink}
                    onClick={() => toggleSubmenu(item.id)}
                  >
                    <ion-icon name={item.icon}></ion-icon>
                    <span>{item.title}</span>
                    <ion-icon 
                      name={submenuAbierto === item.id ? 'chevron-up' : 'chevron-down'}
                      className={styles.chevron}
                    ></ion-icon>
                  </button>
                  <div className={`${styles.navMobileSubmenu} ${submenuAbierto === item.id ? styles.navMobileSubmenuOpen : ''}`}>
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.link}
                        href={subitem.link}
                        className={`${styles.navMobileSublink} ${
                          pathname === subitem.link ? styles.navMobileActive : ''
                        }`}
                        onClick={() => setMenuAbierto(false)}
                      >
                        <ion-icon name={subitem.icon}></ion-icon>
                        <span>{subitem.title}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.link}
                  className={`${styles.navMobileLink} ${
                    pathname === item.link ? styles.navMobileActive : ''
                  }`}
                  onClick={() => setMenuAbierto(false)}
                >
                  <ion-icon name={item.icon}></ion-icon>
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
          
          <button 
            className={styles.navMobileLogout}
            onClick={handleCerrarSesion}
          >
            <ion-icon name="log-out-outline"></ion-icon>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {(menuPerfilAbierto || menuAbierto) && (
        <div 
          className={styles.overlay}
          onClick={() => {
            setMenuPerfilAbierto(false)
            setMenuAbierto(false)
          }}
        ></div>
      )}
    </header>
  )
}