const Login = ({ onLogin }) => {
  // aca guardo lo que el usuario escribe
  const [credenciales, setCredenciales] = useState({
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [intentando, setIntentando] = useState(false);

  // cuando el usuario escribe en los inputs
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setCredenciales({
      ...credenciales,
      [name]: value,
    });
    if (error) setError("");
  };

  // cuando hace submit del form
  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    // validar que no esten vacios
    if (!credenciales.correo || !credenciales.password) {
      setError("falta completar algunos campos");
      return;
    }

    setIntentando(true);

    try {
      // llamar al endpoint de login
      const respuesta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: credenciales.correo,
          password: credenciales.password,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // login exitoso
        onLogin(datos.usuario);
      } else {
        // credenciales incorrectas
        setError(datos.error || "credenciales incorrectas");
        setIntentando(false);
      }
    } catch (error) {
      setError("error de conexion con el servidor");
      setIntentando(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        className="card shadow-lg"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="fas fa-user-circle fa-3x text-primary mb-3"></i>
            <h3 className="mb-2">sistema de reservas</h3>
            <p className="text-muted small">ingresa tus credenciales</p>
          </div>

          <form onSubmit={manejarSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-envelope me-2"></i>
                correo electronico
              </label>
              <input
                type="email"
                className="form-control"
                name="correo"
                value={credenciales.correo}
                onChange={manejarCambio}
                placeholder="ingresa tu correo"
                disabled={intentando}
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                <i className="fas fa-lock me-2"></i>
                contraseña
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={credenciales.password}
                onChange={manejarCambio}
                placeholder="ingresa tu contraseña"
                disabled={intentando}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={intentando}
            >
              {intentando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  ingresando...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  iniciar sesion
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              usa las credenciales proporcionadas
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
