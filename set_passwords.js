const db = require("./db");
const utils = require("./utils");

// Configurar contraseñas por defecto para todos los usuarios
async function main() {
  const rows = await db.query("SELECT correo FROM login");
  for (const r of rows) {
    let pwd;
    // contraseña especial para admin
    if (r.correo === "admin@example.com") {
      pwd = "admin-bd-ucu-2025";
    } else {
      pwd = r.correo.split("@")[0] + "123";
    }
    const hash = await utils.hashPassword(pwd);
    await db.execute("UPDATE login SET contrasena=? WHERE correo=?", [
      hash,
      r.correo,
    ]);
    console.log(`Contraseña configurada para: ${r.correo}`);
  }
  console.log("\nContraseñas configuradas exitosamente:");
  console.log("- admin@example.com: admin-bd-ucu-2025");
  console.log("- otros usuarios: [nombre]123 (ej: ana.perez123)");
  process.exit(0);
}

main().catch((e) => {
  process.exit(1);
});
