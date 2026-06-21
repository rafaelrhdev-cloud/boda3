<?php
/**
 * Ejecuta este archivo UNA SOLA VEZ desde el navegador o consola
 * para generar el hash de la contraseña del administrador, y luego
 * insértalo manualmente en la tabla `administradores`:
 *
 *   INSERT INTO administradores (usuario, password_hash)
 *   VALUES ('admin', 'PEGA_AQUI_EL_HASH_GENERADO');
 *
 * Después de usarlo, BORRA o protege este archivo por seguridad.
 */
$passwordTexto = 'boda2026'; // cámbiala antes de generar el hash
echo password_hash($passwordTexto, PASSWORD_BCRYPT);
