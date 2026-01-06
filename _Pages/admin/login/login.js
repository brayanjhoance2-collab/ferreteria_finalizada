"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'
import { iniciarSesion } from './servidor'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.username || !formData.password) {
      setError('Por favor complete todos los campos')
      setLoading(false)
      return
    }

    try {
      const resultado = await iniciarSesion(formData.username, formData.password)
      
      if (resultado.success) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(resultado.message || 'Usuario o contraseña incorrectos')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.login}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginHeader}>
            <div className={styles.logoContainer}>
              <ion-icon name="business-outline"></ion-icon>
            </div>
            <h1 className={styles.loginTitle}>Iniciar Sesión</h1>
            <p className={styles.loginSubtitle}>Acceso al panel administrativo</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBox}>
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Usuario
              </label>
              <div className={styles.inputWrapper}>
                <ion-icon name="person-outline"></ion-icon>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={styles.input}
                  placeholder="Ingrese su usuario"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <ion-icon name="lock-closed-outline"></ion-icon>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={styles.input}
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  <ion-icon name={showPassword ? 'eye-off-outline' : 'eye-outline'}></ion-icon>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <ion-icon name="log-in-outline"></ion-icon>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className={styles.loginFooter}>
            <div className={styles.securityNote}>
              <ion-icon name="shield-checkmark-outline"></ion-icon>
              <span>Conexión segura y encriptada</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}