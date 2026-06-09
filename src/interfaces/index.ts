export interface NivelDependencia {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface NivelAleatoriedad {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface TipoLootbox {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Juego {
  id: number;
  titulo: string;
  descripcion: string;
  desarrollador: string;
  imagen_url?: string;
  created_at: string;
  
  // Agrega estas relaciones para que TypeScript las reconozca en los mapeos
  nivel_aleatoriedad?: { id: number; nombre: string; descripcion: string };
  nivel_dependencia?: { id: number; nombre: string; descripcion: string };
  categorias?: Array<{ id: number; nombre: string; descripcion: string }>;
  tipos_lootbox?: Array<{ id: number; nombre: string; descripcion: string }>;

  // CLAVE: Añadimos el tipo estructurado para tus comentarios/reseñas
  resenas?: Array<{
    id: number;
    contenido: string;
    created_at?: string;
    usuario?: {
      nombre: string;
    };
  }>;
}

export interface Resena {
  id: number;
  juego_id: number;
  calificacion_estrellas: number;
  comentario: string;
  created_at: string;
}

