const FormularioParticipante = ({ participanteAgregado }) => {
  // aca guardo los datos que el usuario escribe en el form
  const [datos, setDatos] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    email: "",
  });

  // esto es para mostrar el spinner cuando esta cargando
  const [enviando, setEnviando] = useState(false);

  // para mostrar mensajes de error o exito
  const [mensaje, setMensaje] = useState("");

  // funcion que se ejecuta cuando el usuario tipea algo
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos({
      ...datos, // esto mantiene los otros datos
      [name]: value,
    });
    // limpio el mensaje si habia alguno
    if (mensaje) setMensaje("");
  };

  // cuando apreta el boton de enviar
  const manejarEnvio = async (evento) => {
    evento.preventDefault(); // para que no recargue la pagina

    // chequeo que no falte ningun campo
    if (!datos.ci || !datos.nombre || !datos.apellido || !datos.email) {
      setMensaje("falta completar algunos campos");
      return;
    }

    // verifico que el email este bien escrito
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(datos.email)) {
      setMensaje("el email no está bien escrito");
      return;
    }

    setEnviando(true);
    setMensaje("guardando participante...");

    try {
      // mando los datos al servidor
      const respuesta = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        setMensaje("participante agregado correctamente!");
        // limpio todos los campos del form
        setDatos({ ci: "", nombre: "", apellido: "", email: "" });
        // actualizo la lista
        participanteAgregado();
        // limpio el mensaje despues de 3 seg
        setTimeout(() => setMensaje(""), 3000);
      } else {
        const datosError = await respuesta.json();
        setMensaje("error: " + (datosError.error || "algo salio mal"));
      }
    } catch (error) {
      setMensaje("error de conexion: " + error.message);
    } finally {
      setEnviando(false); // siempre dejo de mostrar el loading
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-user-plus me-2"></i>
          agregar participante
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={manejarEnvio}>
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-id-card me-1"></i>
              cedula de identidad
            </label>
            <input
              type="text"
              className="form-control"
              name="ci"
              placeholder="ej: 12345678"
              value={datos.ci}
              onChange={manejarCambio}
              disabled={enviando}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-user me-1"></i>
              nombre
            </label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              placeholder="ej: juan"
              value={datos.nombre}
              onChange={manejarCambio}
              disabled={enviando}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-user me-1"></i>
              apellido
            </label>
            <input
              type="text"
              className="form-control"
              name="apellido"
              placeholder="ej: perez"
              value={datos.apellido}
              onChange={manejarCambio}
              disabled={enviando}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-envelope me-1"></i>
              email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="ej: juan.perez@email.com"
              value={datos.email}
              onChange={manejarCambio}
              disabled={enviando}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={enviando}
          >
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                guardando...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-1"></i>
                agregar participante
              </>
            )}
          </button>
        </form>

        {mensaje && (
          <div
            className={`alert mt-3 ${
              mensaje.includes("error")
                ? "alert-danger"
                : mensaje.includes("correctamente")
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
