<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class ImageHelper
{
    /**
     * Convert uploaded image to WebP format and save in destination directory.
     */
    public static function convertToWebp(UploadedFile $file, string $directory = 'uploads/logos', int $quality = 85): string
    {
        $realPath = $file->getRealPath();
        $imageContent = file_get_contents($realPath);
        $image = @\imagecreatefromstring($imageContent);

        $filename = 'logo_' . time() . '_' . uniqid() . '.webp';
        $destinationPath = public_path($directory);

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0777, true);
        }

        $fullPath = $destinationPath . '/' . $filename;

        if ($image !== false) {
            // Convert transparent PNG/GIF background preservation
            \imagepalettetotruecolor($image);
            \imagealphablending($image, true);
            \imagesavealpha($image, true);

            // Save image in WebP format
            \imagewebp($image, $fullPath, $quality);
            \imagedestroy($image);

            return '/' . $directory . '/' . $filename;
        }

        // Fallback move if GD fails
        $fallbackName = time() . '_' . $file->getClientOriginalName();
        $file->move($destinationPath, $fallbackName);

        return '/' . $directory . '/' . $fallbackName;
    }
}
