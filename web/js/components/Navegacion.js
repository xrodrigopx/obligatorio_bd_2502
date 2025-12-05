const Navegacion = ({
  paginaActual,
  onCambiarPagina,
  estadoConexion,
  onLogout,
  usuario,
}) => {
  // determinar si el usuario es docente
  const esDocente = usuario?.rol === "docente";

  // aca defino todas las paginas de la app
  // solo los docentes pueden ver participantes, salas, sanciones y reportes
  const todasLasPaginas = [
    {
      id: "participantes",
      nombre: "participantes",
      icono: "fas fa-users",
      soloDocente: true,
    },
    {
      id: "salas",
      nombre: "salas",
      icono: "fas fa-door-open",
      soloDocente: true,
    },
    {
      id: "sanciones",
      nombre: "sanciones",
      icono: "fas fa-ban",
      soloDocente: true,
    },
    {
      id: "reservas",
      nombre: "reservas",
      icono: "fas fa-calendar-plus",
      soloDocente: false,
    },
    {
      id: "reportes",
      nombre: "reportes",
      icono: "fas fa-chart-bar",
      soloDocente: true,
    },
  ];

  // filtrar paginas segun el rol del usuario
  const paginas = todasLasPaginas.filter(
    (pagina) => !pagina.soloDocente || esDocente
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <i className="fas fa-building me-2"></i>
            sistema de reservas de salas
          </a>

          <ul className="navbar-nav flex-row">
            {paginas.map((pagina) => (
              <li key={pagina.id} className="nav-item me-2">
                <button
                  className={`nav-link btn btn-link text-light ${
                    paginaActual === pagina.id ? "active fw-bold" : ""
                  }`}
                  onClick={() => onCambiarPagina(pagina.id)}
                >
                  <i className={`${pagina.icono} me-1`}></i>
                  {pagina.nombre}
                </button>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {usuario && (
              <span className="badge bg-info">
                <i className="fas fa-user me-1"></i>
                {usuario.nombre} {usuario.apellido} (
                {esDocente ? "docente" : "alumno"})
              </span>
            )}
            <span
              className={`badge ${
                estadoConexion === "conectado"
                  ? "bg-success"
                  : estadoConexion === "error"
                  ? "bg-danger"
                  : "bg-warning"
              }`}
            >
              <i
                className={`fas ${
                  estadoConexion === "conectado"
                    ? "fa-wifi"
                    : estadoConexion === "error"
                    ? "fa-exclamation-triangle"
                    : "fa-spinner fa-spin"
                } me-1`}
              ></i>
              {estadoConexion === "conectado"
                ? "conectado"
                : estadoConexion === "error"
                ? "sin conexion"
                : "conectando..."}
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={onLogout}
              title="cerrar sesion"
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              salir
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
