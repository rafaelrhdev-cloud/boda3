<?php
/**
 * GET /api/validar_familia.php?codigo=RIOS2026
 * Devuelve los datos de la familia y su lista de invitados,
 * o un error si el código no existe o ya fue confirmado.
 */
require_once __DIR__ . '/../config.php';

$codigo = trim($_GET['codigo'] ?? '');

if ($codigo === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Código no proporcionado.']);
    exit;
}

$conexion = obtenerConexion();

$stmt = $conexion->prepare("SELECT id, codigo, nombre_familia, cupo_maximo, confirmado FROM familias WHERE codigo = ?");
$stmt->bind_param('s', $codigo);
$stmt->execute();
$resultado = $stmt->get_result();
$familia = $resultado->fetch_assoc();

if (!$familia) {
    echo json_encode(['ok' => false, 'mensaje' => 'No encontramos ese código de invitación.']);
    exit;
}

if ((int)$familia['confirmado'] === 1) {
    echo json_encode(['ok' => false, 'mensaje' => 'Esta invitación ya fue confirmada anteriormente.']);
    exit;
}

$stmtInv = $conexion->prepare("SELECT nombre FROM invitados WHERE familia_id = ? ORDER BY id ASC LIMIT 5");
$stmtInv->bind_param('i', $familia['id']);
$stmtInv->execute();
$resInv = $stmtInv->get_result();

$invitados = [];
while ($row = $resInv->fetch_assoc()) {
    $invitados[] = $row['nombre'];
}

echo json_encode([
    'ok' => true,
    'familia' => [
        'id' => $familia['codigo'],
        'nombre_familia' => $familia['nombre_familia'],
        'invitados' => $invitados
    ]
]);
