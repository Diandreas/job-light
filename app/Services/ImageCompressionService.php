<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ImageCompressionService
{
    protected array $config;

    public function __construct()
    {
        $this->config = [
            'jpeg_quality' => 85,
            'png_quality' => 90,
            'webp_quality' => 85,
            'max_width' => 1920,
            'max_height' => 1080,
            'thumbnail_width' => 300,
            'thumbnail_height' => 300,
            'formats' => ['jpg', 'jpeg', 'png', 'webp'],
        ];
    }

    public function compressAndStore(UploadedFile $file, string $directory = 'services'): array
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = $this->generateUniqueFilename($originalName, $extension);
        
        // Créer l'image avec Intervention Image
        $image = Image::read($file->path());
        $originalWidth = $image->width();
        $originalHeight = $image->height();
        $originalSize = $file->getSize();
        
        // Stockage du fichier original
        $originalPath = $file->storeAs("images/{$directory}/original", $filename, 'public');
        
        // Compression de l'image principale
        $compressedPath = $this->compressImage($image, $directory, $filename, $extension);
        
        // Création de la miniature
        $thumbnailPath = $this->createThumbnail($image, $directory, $filename, $extension);
        
        // Obtenir les tailles des fichiers compressés
        $compressedSize = Storage::disk('public')->size($compressedPath);
        
        return [
            'original_name' => $file->getClientOriginalName(),
            'path' => $originalPath,
            'compressed_path' => $compressedPath,
            'thumbnail_path' => $thumbnailPath,
            'file_size' => $originalSize,
            'compressed_size' => $compressedSize,
            'mime_type' => $file->getMimeType(),
            'width' => $originalWidth,
            'height' => $originalHeight,
        ];
    }

    protected function compressImage($image, string $directory, string $filename, string $extension): string
    {
        // Redimensionner si nécessaire
        if ($image->width() > $this->config['max_width'] || $image->height() > $this->config['max_height']) {
            $image->scaleDown(width: $this->config['max_width'], height: $this->config['max_height']);
        }

        $compressedPath = "images/{$directory}/compressed/{$filename}";
        $fullPath = storage_path('app/public/' . $compressedPath);
        
        // Créer le répertoire s'il n'existe pas
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Appliquer la compression selon le format
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image->toJpeg($this->config['jpeg_quality'])->save($fullPath);
                break;
            case 'png':
                $image->toPng()->save($fullPath);
                break;
            case 'webp':
                $image->toWebp($this->config['webp_quality'])->save($fullPath);
                break;
            default:
                $image->toJpeg($this->config['jpeg_quality'])->save($fullPath);
        }

        return $compressedPath;
    }

    protected function createThumbnail($image, string $directory, string $filename, string $extension): string
    {
        $thumbnailImage = clone $image;
        $thumbnailImage->cover(
            $this->config['thumbnail_width'], 
            $this->config['thumbnail_height']
        );

        $thumbnailPath = "images/{$directory}/thumbnails/{$filename}";
        $fullPath = storage_path('app/public/' . $thumbnailPath);
        
        // Créer le répertoire s'il n'existe pas
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Sauvegarder la miniature
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $thumbnailImage->toJpeg($this->config['jpeg_quality'])->save($fullPath);
                break;
            case 'png':
                $thumbnailImage->toPng()->save($fullPath);
                break;
            case 'webp':
                $thumbnailImage->toWebp($this->config['webp_quality'])->save($fullPath);
                break;
            default:
                $thumbnailImage->toJpeg($this->config['jpeg_quality'])->save($fullPath);
        }

        return $thumbnailPath;
    }

    protected function generateUniqueFilename(string $originalName, string $extension): string
    {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
        
        return $safeName . '_' . $timestamp . '_' . $random . '.' . $extension;
    }

    public function deleteImages(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    public function validateImageFile(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        
        $validExtensions = $this->config['formats'];
        $validMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp'
        ];

        return in_array($extension, $validExtensions) && in_array($mimeType, $validMimeTypes);
    }

    public function getCompressionStats(array $imageData): array
    {
        $originalSize = $imageData['file_size'];
        $compressedSize = $imageData['compressed_size'] ?? $originalSize;
        
        $reduction = $originalSize - $compressedSize;
        $percentage = $originalSize > 0 ? ($reduction / $originalSize) * 100 : 0;
        
        return [
            'original_size' => $this->formatBytes($originalSize),
            'compressed_size' => $this->formatBytes($compressedSize),
            'reduction' => $this->formatBytes($reduction),
            'percentage' => round($percentage, 1),
        ];
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}