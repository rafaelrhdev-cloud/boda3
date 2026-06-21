<?php
session_start();
require_once __DIR__ . '/../config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario'] ?? '');
    $password = $_POST['password'] ?? '';

    $conexion = obtenerConexion();
    $stmt = $conexion->prepare("SELECT id, password_hash FROM administradores WHERE usuario = ?");
    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $admin = $stmt->get_result()->fetch_assoc();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_id'] = $admin['id'];
        header('Location: panel.php');
        exit;
    } else {
        $error = 'Usuario o contraseña incorrectos.';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Acceso administrador — Boda</title>
<meta name="robots" content="noindex, nofollow">
<style>
  body{font-family:Georgia,serif;background:#F8F4EC;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
  form{background:#fff;padding:40px;border:1px solid #eee;width:300px;}
  h1{font-size:20px;color:#3E4A3B;margin-bottom:20px;}
  input{width:100%;padding:10px;margin-bottom:14px;border:1px solid #ddd;}
  button{width:100%;padding:12px;background:#3E4A3B;color:#fff;border:none;cursor:pointer;}
  .error{color:#B6755C;font-size:13px;}
</style>
</head>
<body>
<form method="POST">
  <h1>Panel de invitados — acceso privado</h1>
  <input type="text" name="usuario" placeholder="Usuario" required>
  <input type="password" name="password" placeholder="Contraseña" required>
  <button type="submit">Entrar</button>
  <p class="error"><?= htmlspecialchars($error) ?></p>
</form>
</body>
</html>
