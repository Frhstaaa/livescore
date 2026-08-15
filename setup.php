<?php
/**
 * Root level forwarder / runner for setup.php
 */
if (file_exists(__DIR__ . '/public/setup.php')) {
    require_once __DIR__ . '/public/setup.php';
} else {
    die("File public/setup.php tidak ditemukan.");
}
