<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Get allowed origins from environment variable or use default
        $allowedOrigins = $this->getAllowedOrigins();

        // Get the origin of the request
        $origin = $request->headers->get('Origin');

        // Check if origin is allowed
        $allowOrigin = '*'; // Default to * for development
        if ($origin && $this->isOriginAllowed($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        } elseif (app()->environment('production')) {
            // In production, be more restrictive
            if ($origin) {
                $allowOrigin = $this->isOriginAllowed($origin, $allowedOrigins) ? $origin : null;
            }
        }

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowOrigin ?: '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Bypass-Tunnel-Reminder')
                ->header('Access-Control-Max-Age', '86400')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        $response = $next($request);

        if ($allowOrigin) {
            $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Bypass-Tunnel-Reminder');
            $response->headers->set('Access-Control-Max-Age', '86400');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }

    /**
     * Get allowed origins from environment or use defaults
     */
    private function getAllowedOrigins(): array
    {
        $env = app()->environment();

        if ($env === 'local') {
            return [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:8000',
                'http://127.0.0.1:8000',
            ];
        }

        // For production/staging, parse from FRONTEND_URL env variable
        $frontendUrl = env('FRONTEND_URL');
        if ($frontendUrl) {
            return [parse_url($frontendUrl, PHP_URL_HOST) ?: $frontendUrl];
        }

        // Fallback to Railway/Vercel production URLs
        return [
            'https://room-rent-backend-production-7530.up.railway.app',
            'https://your-frontend-domain.com', // Update this with your actual domain
        ];
    }

    /**
     * Check if the given origin is in the allowed list
     */
    private function isOriginAllowed(string $origin, array $allowedOrigins): bool
    {
        if (app()->environment('local')) {
            return true; // Allow all in local environment
        }

        foreach ($allowedOrigins as $allowed) {
            if ($origin === $allowed || $origin === 'https://' . $allowed || $origin === 'http://' . $allowed) {
                return true;
            }
        }

        return false;
    }
}

