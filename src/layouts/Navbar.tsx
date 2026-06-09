import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

interface UsuarioSesion {
  nombre: string;
  correo: string;
  rol: {
    id: number;
    nombre: string;
  };
}

// 1. Ampliamos la definición de rutas válidas en la interfaz de props
interface NavbarProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'admin-categorias' | 'admin-juegos') => void;
  currentPage: 'home' | 'login' | 'register' | 'admin-categorias' | 'admin-juegos';
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error al parsear el usuario de la sesión", e);
      }
    }
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    alert('Sesión cerrada correctamente.');
    onNavigate('home');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand} onClick={() => onNavigate('home')}>
        LUDOPATÍA<span className={styles.brandAccent}>AUDIT</span>
      </div>

      <div className={styles.navActions}>
        <span 
          className={styles.link} 
          style={{ color: currentPage === 'home' ? '#ffffff' : '' }}
          onClick={() => onNavigate('home')}
        >
          Catálogo
        </span>

        {usuario ? (
          <div className={styles.userInfo}>
            
            {/* ENLACES EXCLUSIVOS PARA ROLES ADMINISTRATIVOS */}
            {(usuario.rol?.nombre?.toLowerCase() === 'admin' || usuario.rol?.nombre?.toLowerCase() === 'administrador' || usuario.rol?.id === 1) && (
              <>
                <span 
                  className={styles.link} 
                  style={{ color: currentPage === 'admin-categorias' ? '#ffffff' : '', marginRight: '4px' }}
                  onClick={() => onNavigate('admin-categorias')}
                >
                  Categorías
                </span>
                <span 
                  className={styles.link} 
                  style={{ color: currentPage === 'admin-juegos' ? '#ffffff' : '', marginRight: '16px' }}
                  onClick={() => onNavigate('admin-juegos')}
                >
                  + Añadir Juego
                </span>
              </>
            )}

            <span className={styles.welcomeText}>
              Agente: <span className={styles.userName}>{usuario.nombre}</span>
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Salir
            </button>
          </div>
        ) : (
          <>
            <span 
              className={styles.link} 
              style={{ color: currentPage === 'register' ? '#ffffff' : '' }}
              onClick={() => onNavigate('register')}
            >
              Registro
            </span>
            <button className={styles.authBtn} onClick={() => onNavigate('login')}>
              Iniciar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}