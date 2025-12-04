const FormularioSala = ({ salaAgregada }) => {
  // aca guardo los datos de la sala que el usuario escribe
  const [datos, setDatos] = useState({
    nombre_sala: "",
    edificio: "",
    capacidad: "",
    tipo_sala: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [edificios, setEdificios] = useState([]);
  const [cargandoEdificios, setCargandoEdificios] = useState(true);

  // cargo los edificios cuando se abre la pagina
  useEffect(() => {
    const cargarEdificios = async () => {
      try {
        const respuesta = await fetch("/api/edificios");
        if (respuesta.ok) {
          const datosEdificios = await respuesta.json();
          setEdificios(datosEdificios);
        }
      } catch (error) {
        console.error("error cargando edificios:", error);
      } finally {
        setCargandoEdificios(false);
      }
    };

    cargarEdificios();
  }, []);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos({
      ...datos,
      [name]: value,
    });
    if (mensaje) setMensaje("");
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    if (
      !datos.nombre_sala ||
      !datos.edificio ||
      !datos.capacidad ||
      !datos.tipo_sala
    ) {
      setMensaje("falta completar algunos campos");
      return;
    }

    const cap = parseInt(datos.capacidad);
    if (isNaN(cap) || cap <= 0) {
      setMensaje("la capacidad tiene que ser un numero positivo");
      return;
    }

    setEnviando(true);
    setMensaje("agregando sala...");

    try {
      const respuesta = await fetch("/api/salas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        setMensaje("sala agregada correctamente");
        setDatos({
          nombre_sala: "",
          edificio: "",
          capacidad: "",
          tipo_sala: "",
        });
        setTimeout(() => setMensaje(""), 3000);
        if (salaAgregada) salaAgregada();
      } else {
        const datosError = await respuesta.json();
        setMensaje("Error: " + (datosError.error || "Error desconocido"));
      }
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-plus-circle me-2"></i>
          agregar sala
        </h5>
      </div>
      <div className="card-body">
        {cargandoEdificios ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">cargando...</span>
            </div>
            <p className="small mt-1">cargando edificios...</p>
          </div>
        ) : (
          <form onSubmit={manejarEnvio}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-door-open me-1"></i>
                nombre de la sala
              </label>
              <input
                type="text"
                className="form-control"
                name="nombre_sala"
                placeholder="Ej: S101, Aula Magna"
                value={datos.nombre_sala}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-building me-1"></i>
                Edificio
              </label>
              <select
                className="form-select"
                name="edificio"
                value={datos.edificio}
                onChange={manejarCambio}
                disabled={enviando}
              >
                <option value="">Seleccione un edificio</option>
                {edificios.map((edificio) => (
                  <option
                    key={edificio.nombre_edificio}
                    value={edificio.nombre_edificio}
                  >
                    {edificio.nombre_edificio} - {edificio.direccion}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-users me-1"></i>
                Capacidad
              </label>
              <input
                type="number"
                className="form-control"
                name="capacidad"
                placeholder="Número de personas"
                min="1"
                value={datos.capacidad}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-tag me-1"></i>
                Tipo de Sala
              </label>
              <select
                className="form-select"
                name="tipo_sala"
                value={datos.tipo_sala}
                onChange={manejarCambio}
                disabled={enviando}
              >
                <option value="">Seleccione el tipo de sala</option>
                <option value="libre">Libre</option>
                <option value="docente">Docente</option>
                <option value="posgrado">Posgrado</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-1"></i>
                  Agregar Sala
                </>
              )}
            </button>
          </form>
        )}

        {mensaje && (
          <div
            className={`alert mt-3 ${
              mensaje.includes("Error")
                ? "alert-danger"
                : mensaje.includes("exitosamente")
                ? "alert-success"
                : "alert-info"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};
