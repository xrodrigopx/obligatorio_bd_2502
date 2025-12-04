const SalasPage = () => {
  const [salas, setSalas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // funcion para cargar salas
  const cargarSalas = async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch("/api/salas");
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setSalas(datos);
      } else {
        setError("error al cargar salas");
      }
    } catch (error) {
      setError("error de conexion: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // cargar salas cuando se monta el componente
  useEffect(() => {
    cargarSalas();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <FormularioSala salaAgregada={cargarSalas} />
        </div>
        <div className="col-md-8">
          {cargando ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">cargando...</span>
              </div>
              <p className="mt-2">Cargando salas...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button
                className="btn btn-outline-danger btn-sm ms-2"
                onClick={cargarSalas}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Reintentar
              </button>
            </div>
          ) : (
            <ListaSalas salas={salas} recargar={cargarSalas} />
          )}
        </div>
      </div>
    </div>
  );
};
