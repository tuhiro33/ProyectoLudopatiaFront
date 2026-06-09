import React, { useState } from 'react';
import api from '../../api/axios';
import styles from "./Register.module.css";

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica de contraseñas
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // POST al endpoint de Go: /api/auth/register
      await api.post('/auth/register', {
        nombre,
        correo,
        contrasena,
        rol_id: 2 // Rol por defecto: Usuario
      });

      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      onRegisterSuccess(); // Redirige al login
      
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo completar el registro. Inténtalo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        <p className={styles.subtitle}>Comenta acerca de algunos de tus juegos favoritos</p>

        {error && <div className={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Apodo</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Apodo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              className={styles.input}
              placeholder="agente@ludopatia.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Procesando datos...' : 'Registrar Agente'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tienes una cuenta?{' '}
          <span className={styles.link} onClick={onNavigateToLogin}>
            Inicia Sesión
          </span>
        </p>
      </div>
    </div>
  );
}