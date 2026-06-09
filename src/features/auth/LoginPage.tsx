import React, { useState } from 'react';
import api from '../../api/axios';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: {
      id: number;
      nombre: string;
    };
  };
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        correo,
        contrasena,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      alert(`¡Acceso concedido. Bienvenido, ${response.data.usuario.nombre}!`);
      onLoginSuccess();
      
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Fallo de autenticación. No se pudo establecer contacto con la base de datos central.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>AUTENTICACIÓN DE CREDENCIALES DE AUDITORÍA</p>

        {error && <div className={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label className={styles.label}>Contraseña de Acceso</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Verificando firma...' : 'Autenticar'}
          </button>
        </form>
      </div>
    </div>
  );
}