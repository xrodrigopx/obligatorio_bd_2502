// cosas que uso en varios lados de la app
const { useState, useEffect } = React;

// esto es un hook que hice para hacer mas facil las llamadas al servidor
const useApi = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const llamarApi = async (url, opciones = {}) => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(url, opciones);

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || `error ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setCargando(false); // siempre paro el loading
    }
  };

  return { llamarApi, cargando, error, setError };
};

// funcion para mostrar fechas bonitas
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-ES");
};

// revisa si una sancion todavia esta vigente
const esActiva = (fechaFin) => {
  return new Date(fechaFin) >= new Date();
};
