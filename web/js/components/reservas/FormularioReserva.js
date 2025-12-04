const FormularioReserva = () => {
  // aca guardo lo que escribe el usuario para la reserva
  const [datos, setDatos] = useState({
    ci: "",
    nombre_sala: "",
    edificio: "",
    fecha: "",
    id_turno: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [salas, setSalas] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // cargo las salas y edificios cuando se abre la pagina
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // cargo las salas
        const respuestaSalas = await fetch("/api/salas");
        if (respuestaSalas.ok) {
          const datosSalas = await respuestaSalas.json();
          setSalas(datosSalas);
        }

        // cargo los edificios
        const respuestaEdificios = await fetch("/api/edificios");
        if (respuestaEdificios.ok) {
          const datosEdificios = await respuestaEdificios.json();
          setEdificios(datosEdificios);
        }
      } catch (error) {
        console.error("error cargando datos:", error);
        setMensaje("error cargando datos de salas y edificios");
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para manejar cambios en los campos
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos({
      ...datos,
      [name]: value,
    });
    if (mensaje) setMensaje("");
  };

  // Función para enviar la reserva
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    // Validar que todos los campos estén completos
    if (
      !datos.ci ||
      !datos.nombre_sala ||
      !datos.edificio ||
      !datos.fecha ||
      !datos.id_turno
    ) {
      setMensaje("Por favor complete todos los campos");
      return;
    }

    // Validar formato de fecha
    const patronFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!patronFecha.test(datos.fecha)) {
      setMensaje("Formato de fecha inválido. Use YYYY-MM-DD");
      return;
    }

    // Validar que el turno sea un número válido
    const turno = parseInt(datos.id_turno);
    if (isNaN(turno) || turno < 1 || turno > 15) {
      setMensaje("el id del turno tiene que ser un numero entre 1 y 15");
      return;
    }

    setEnviando(true);
    setMensaje("creando reserva...");

    try {
      // preparo los datos para enviar
      const datosReserva = {
        ...datos,
        id_turno: turno,
      };

      // envio al servidor
      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosReserva),
      });

      if (respuesta.ok) {
        setMensaje("Reserva creada exitosamente");
        // Limpiar formulario
        setDatos({
          ci: "",
          nombre_sala: "",
          edificio: "",
          fecha: "",
          id_turno: "",
        });
        setTimeout(() => setMensaje(""), 3000);
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
        <h4 className="mb-0">
          <i className="fas fa-calendar-plus me-2"></i>
          Crear Reserva
        </h4>
      </div>
      <div className="card-body">
        {cargandoDatos ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={manejarEnvio}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-id-card me-1"></i>
                CI del Solicitante
              </label>
              <input
                type="text"
                className="form-control"
                name="ci"
                placeholder="Ej: 12345678"
                value={datos.ci}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-door-open me-1"></i>
                Sala
              </label>
              <select
                className="form-select"
                name="nombre_sala"
                value={datos.nombre_sala}
                onChange={manejarCambio}
                disabled={enviando}
              >
                <option value="">Seleccione una sala</option>
                {salas.map((sala) => (
                  <option
                    key={`${sala.nombre_sala}-${sala.edificio}`}
                    value={sala.nombre_sala}
                  >
                    {sala.nombre_sala} - {sala.edificio} (Cap: {sala.capacidad},
                    Tipo: {sala.tipo_sala})
                  </option>
                ))}
              </select>
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
                <i className="fas fa-calendar me-1"></i>
                Fecha
              </label>
              <input
                type="date"
                className="form-control"
                name="fecha"
                value={datos.fecha}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-clock me-1"></i>
                ID del Turno
              </label>
              <input
                type="number"
                className="form-control"
                name="id_turno"
                placeholder="ID turno (1-15)"
                min="1"
                max="15"
                value={datos.id_turno}
                onChange={manejarCambio}
                disabled={enviando}
              />
              <div className="form-text">Ingrese un número entre 1 y 15</div>
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Creando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-1"></i>
                  Crear Reserva
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
