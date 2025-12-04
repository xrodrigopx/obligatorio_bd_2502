const ModalEditarParticipante = ({ participante, onCerrar, onActualizar }) => {
  const [datos, setDatos] = useState({
    nombre: participante.nombre,
    apellido: participante.apellido,
    email: participante.email,
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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

    // validar que todos los campos esten llenos
    if (!datos.nombre || !datos.apellido || !datos.email) {
      setMensaje("falta completar algunos campos");
      return;
    }

    // validar formato del email
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(datos.email)) {
      setMensaje("el email no esta bien escrito");
      return;
    }

    setEnviando(true);
    setMensaje("actualizando participante...");

    try {
      const respuesta = await fetch(`/api/participants/${participante.ci}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        setMensaje("Participante actualizado exitosamente");
        setTimeout(() => {
          onCerrar();
          onActualizar();
        }, 1500);
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
    <div
      className="modal show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-edit me-2"></i>
              Editar Participante
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCerrar}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={manejarEnvio}>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-id-card me-1"></i>
                  CI (no modificable)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={participante.ci}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-user me-1"></i>
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={datos.nombre}
                  onChange={manejarCambio}
                  disabled={enviando}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-user me-1"></i>
                  Apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="apellido"
                  value={datos.apellido}
                  onChange={manejarCambio}
                  disabled={enviando}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-envelope me-1"></i>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={datos.email}
                  onChange={manejarCambio}
                  disabled={enviando}
                />
              </div>

              {mensaje && (
                <div
                  className={`alert ${
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

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      Actualizar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCerrar}
                  disabled={enviando}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
