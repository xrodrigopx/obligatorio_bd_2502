const SancionesPage = () => {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // funcion para cargar sanciones
  const cargarSanciones = async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch("/api/sanciones");
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setSanciones(datos);
      } else {
        setError("error al cargar sanciones");
      }
    } catch (error) {
      setError("error de conexion: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // cargar sanciones cuando se monta el componente
  useEffect(() => {
    cargarSanciones();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <FormularioSancion sancionAgregada={cargarSanciones} />
        </div>
        <div className="col-md-8">
          {cargando ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">cargando...</span>
              </div>
              <p className="mt-2">Cargando sanciones...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button
                className="btn btn-outline-danger btn-sm ms-2"
                onClick={cargarSanciones}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Reintentar
              </button>
            </div>
          ) : (
            <ListaSanciones sanciones={sanciones} recargar={cargarSanciones} />
          )}
        </div>
      </div>
    </div>
  );
};
