import { type Juego } from '../../interfaces';
import styles from './JuegoCard.module.css';

interface JuegoCardProps {
  juego: Juego;
}

export default function JuegoCard({ juego }: JuegoCardProps) {
  
  const getBadgeClass = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('deportes') || name.includes('futbol')) return styles.badgeDeportes;
    if (name.includes('multi') || name.includes('online')) return styles.badgeMultiplayer;
    if (name.includes('competitivo') || name.includes('ranked')) return styles.badgeCompetitivo;
    if (name.includes('accion') || name.includes('shooter')) return styles.badgeAccion;
    return styles.badgeDefault;
  };

  return (
    <div className={styles.cardHorizontal}>
      {/* Contenedor temporal de la imagen del juego */}
     <div className={styles.imageContainer}>
        {juego.imagen_url ? (
          <img 
            src={juego.imagen_url} 
            alt={`Portada de ${juego.titulo}`} 
            className={styles.gameImage} 
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            NO IMAGE AVAILABLE
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{juego.titulo}</h3>
          
          <div className={styles.badgeContainer}>
            {juego.categorias?.map((cat) => (
              <span key={cat.id} className={`${styles.badge} ${getBadgeClass(cat.nombre)}`}>
                {cat.nombre}
              </span>
            ))}
            {juego.nivel_dependencia?.nombre && (
              <span className={`${styles.badge} ${styles.badgeDefault}`}>
                {juego.nivel_dependencia.nombre}
              </span>
            )}
          </div>
        </div>

        <p className={styles.description}>
          {juego.descripcion || 'No hay una descripción detallada registrada para este título todavía.'}
        </p>
      </div>

      <div className={styles.arrowContainer}>
        ❯
      </div>
    </div>
  );
}