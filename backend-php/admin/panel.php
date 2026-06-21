<?php
session_start();
require_once __DIR__ . '/../config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$conexion = obtenerConexion();

$familias = $conexion->query("SELECT * FROM familias ORDER BY confirmado DESC, nombre_familia ASC");

$totalConfirmados = 0;
$totalAsisten = 0;
$totalNoAsisten = 0;

$resumenInv = $conexion->query("SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN asiste = 1 THEN 1 ELSE 0 END) AS asisten,
    SUM(CASE WHEN asiste = 0 THEN 1 ELSE 0 END) AS no_asisten
  FROM invitados")->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Invitados confirmados — Panel privado</title>
<meta name="robots" content="noindex, nofollow">
<style>
  body{font-family:'Tenor Sans',Arial,sans-serif;background:#F8F4EC;color:#2C2722;margin:0;padding:40px;}
  h1{font-family:Georgia,serif;color:#3E4A3B;}
  .resumen{display:flex;gap:20px;margin-bottom:40px;flex-wrap:wrap;}
  .tarjeta{background:#fff;padding:20px 30px;border:1px solid #eee;text-align:center;}
  .tarjeta strong{display:block;font-size:30px;color:#B68A4E;font-family:Georgia,serif;}
  table{width:100%;border-collapse:collapse;background:#fff;}
  th,td{padding:12px 14px;border-bottom:1px solid #eee;text-align:left;font-size:14px;}
  th{background:#3E4A3B;color:#fff;}
  .si{color:#3E4A3B;font-weight:bold;}
  .no{color:#B6755C;font-weight:bold;}
  .pendiente{color:#999;}
  .top{display:flex;justify-content:space-between;align-items:center;}
  a.logout{color:#B6755C;font-size:13px;}
</style>
</head>
<body>
  <div class="top">
    <h1>Invitados confirmados</h1>
    <a class="logout" href="logout.php">Cerrar sesión</a>
  </div>

  <div class="resumen">
    <div class="tarjeta"><strong><?= (int)$resumenInv['total'] ?></strong>Invitados totales</div>
    <div class="tarjeta"><strong><?= (int)$resumenInv['asisten'] ?></strong>Confirmaron asistencia</div>
    <div class="tarjeta"><strong><?= (int)$resumenInv['no_asisten'] ?></strong>No asistirán</div>
  </div>

  <table>
    <tr><th>Familia / Código</th><th>Invitados</th><th>Estado</th><th>Confirmó</th></tr>
    <?php while ($fam = $familias->fetch_assoc()):
        $inv = $conexion->query("SELECT nombre, asiste FROM invitados WHERE familia_id = " . (int)$fam['id']);
        $nombres = [];
        while ($i = $inv->fetch_assoc()) {
            $estado = $i['asiste'] === null ? '<span class="pendiente">(sin responder)</span>'
                    : ($i['asiste'] ? '<span class="si">Asiste</span>' : '<span class="no">No asiste</span>');
            $nombres[] = htmlspecialchars($i['nombre']) . ' ' . $estado;
        }
    ?>
    <tr>
      <td><strong><?= htmlspecialchars($fam['nombre_familia']) ?></strong><br><small><?= htmlspecialchars($fam['codigo']) ?></small></td>
      <td><?= implode('<br>', $nombres) ?></td>
      <td><?= $fam['confirmado'] ? '<span class="si">Confirmado</span>' : '<span class="pendiente">Pendiente</span>' ?></td>
      <td><?= $fam['fecha_confirmacion'] ? htmlspecialchars($fam['fecha_confirmacion']) : '—' ?></td>
    </tr>
    <?php endwhile; ?>
  </table>
</body>
</html>
