<?php
/**
 * POST /api/confirmar.php
 * Body JSON:
 * {
 *   "codigo": "RIOS2026",
 *   "nombre_familia": "Familia Ríos",
 *   "respuestas": { "Sr. Alberto Ríos": true, "Sra. Patricia Ríos": false, ... }
 * }
 *
 * Bloquea una segunda confirmación para el mismo código (control real,
 * a nivel base de datos) y registra qué dispositivo confirmó.
 */
require_once __DIR__ . '/../config.php';

$datos = json_decode(file_get_contents('php://input'), true);

$codigo = trim($datos['codigo'] ?? '');
$respuestas = $datos['respuestas'] ?? [];

if ($codigo === '' || !is_array($respuestas) || count($respuestas) === 0) {
    echo json_encode(['ok' => false, 'mensaje' => 'Datos incompletos.']);
    exit;
}

// Límite de seguridad: nunca más de 5 invitados por envío
if (count($respuestas) > 5) {
    $respuestas = array_slice($respuestas, 0, 5, true);
}

$conexion = obtenerConexion();
$conexion->begin_transaction();

try {
    $stmt = $conexion->prepare("SELECT id, confirmado FROM familias WHERE codigo = ? FOR UPDATE");
    $stmt->bind_param('s', $codigo);
    $stmt->execute();
    $familia = $stmt->get_result()->fetch_assoc();

    if (!$familia) {
        throw new Exception('Código de invitación no encontrado.');
    }
    if ((int)$familia['confirmado'] === 1) {
        throw new Exception('Esta invitación ya fue confirmada anteriormente.');
    }

    $familiaId = $familia['id'];

    $stmtUpd = $conexion->prepare("UPDATE invitados SET asiste = ? WHERE familia_id = ? AND nombre = ?");
    foreach ($respuestas as $nombre => $asiste) {
        $valor = $asiste ? 1 : 0;
        $stmtUpd->bind_param('iis', $valor, $familiaId, $nombre);
        $stmtUpd->execute();
    }

    $hash = obtenerHuellaDispositivo();
    $ip = obtenerIp();

    $stmtFam = $conexion->prepare("UPDATE familias SET confirmado = 1, fecha_confirmacion = NOW(), dispositivo_hash = ?, ip_confirmacion = ? WHERE id = ?");
    $stmtFam->bind_param('ssi', $hash, $ip, $familiaId);
    $stmtFam->execute();

    $conexion->commit();
    echo json_encode(['ok' => true, 'mensaje' => 'Confirmación registrada.']);

} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}
