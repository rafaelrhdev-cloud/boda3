<?php
/**
 * Configuración de conexión a la base de datos.
 * EDITA estos 4 valores con los datos reales del hosting del cliente.
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'boda_rsvp');
define('DB_USER', 'root');
define('DB_PASS', '');

function obtenerConexion(): mysqli {
    $conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conexion->connect_error) {
        http_response_code(500);
        die(json_encode(['ok' => false, 'mensaje' => 'Error de conexión a la base de datos.']));
    }
    $conexion->set_charset('utf8mb4');
    return $conexion;
}

/**
 * Genera una huella simple del dispositivo/navegador a partir del
 * User-Agent + IP. No es infalible (eso requeriría cookies/JS adicional),
 * pero combinado con el bloqueo por localStorage en el frontend y con
 * "una confirmación por código" en esta base de datos, es suficiente
 * para evitar duplicados accidentales.
 */
function obtenerHuellaDispositivo(): string {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return hash('sha256', $ua . '|' . $ip);
}

function obtenerIp(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '';
}

// Permitir llamadas desde el frontend (ajusta el dominio en producción)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
