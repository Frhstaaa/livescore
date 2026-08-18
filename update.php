<?php
/**
 * Root level forwarder / runner for update.php
 */
if (file_exists(__DIR__ . '/public/update.php')) {
    require_once __DIR__ . '/public/update.php';
} else {
    die("File public/update.php tidak ditemukan.");
}
