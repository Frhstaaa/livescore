<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and apply security HTTP headers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Remove PHP signature header
        if (function_exists('header_remove')) {
            header_remove('X-Powered-By');
        }

        // In local development, allow iframe previewing / simulators
        if (app()->isLocal()) {
            $response->headers->remove('X-Frame-Options');
            $response->headers->remove('Content-Security-Policy');
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', '*');
        } else {
            // Production Security Headers
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
            $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

            $csp = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; " .
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; " .
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https: http:; " .
                   "font-src 'self' data: https://fonts.gstatic.com https: http:; " .
                   "img-src 'self' data: https: http: blob:; " .
                   "connect-src 'self' https: http: ws: wss:; " .
                   "frame-ancestors *;";
            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
