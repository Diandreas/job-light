<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceImage;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    protected ImageCompressionService $imageCompressionService;

    public function __construct(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }

    public function index()
    {
        $services = auth()->user()->services()
            ->with('images')
            ->paginate(10);

        return response()->json([
            'services' => $services,
            'success' => true
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'price_type' => 'nullable|in:fixed,hourly,daily,project',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'main_image' => 'nullable|image|max:10240', // 10MB max
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:10240',
        ]);

        $user = auth()->user();
        $maxOrder = $user->services()->max('order_index') ?? 0;

        DB::transaction(function () use ($request, $user, $maxOrder) {
            // Créer le service
            $service = $user->services()->create([
                'title' => $request->title,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'icon' => $request->icon,
                'price' => $request->price,
                'price_type' => $request->price_type ?? 'fixed',
                'tags' => $request->tags,
                'is_featured' => $request->boolean('is_featured'),
                'is_active' => $request->boolean('is_active', true),
                'order_index' => $maxOrder + 1,
            ]);

            // Traiter l'image principale
            if ($request->hasFile('main_image')) {
                $this->processMainImage($service, $request->file('main_image'));
            }

            // Traiter la galerie d'images
            if ($request->hasFile('gallery_images')) {
                $this->processGalleryImages($service, $request->file('gallery_images'));
            }

            $this->service = $service;
        });

        return response()->json([
            'success' => true,
            'service' => $this->service->load('images'),
            'message' => 'Service créé avec succès.'
        ], 201);
    }

    public function show(Service $service)
    {
        $this->authorize('view', $service);
        
        return response()->json([
            'service' => $service->load('images'),
            'success' => true
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $this->authorize('update', $service);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'price_type' => 'nullable|in:fixed,hourly,daily,project',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'main_image' => 'nullable|image|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:10240',
        ]);

        DB::transaction(function () use ($request, $service) {
            $service->update([
                'title' => $request->title,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'icon' => $request->icon,
                'price' => $request->price,
                'price_type' => $request->price_type ?? 'fixed',
                'tags' => $request->tags,
                'is_featured' => $request->boolean('is_featured'),
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Traiter l'image principale si fournie
            if ($request->hasFile('main_image')) {
                $this->processMainImage($service, $request->file('main_image'));
            }

            // Traiter les nouvelles images de galerie
            if ($request->hasFile('gallery_images')) {
                $this->processGalleryImages($service, $request->file('gallery_images'));
            }
        });

        return response()->json([
            'success' => true,
            'service' => $service->load('images'),
            'message' => 'Service mis à jour avec succès.'
        ]);
    }

    public function destroy(Service $service)
    {
        $this->authorize('delete', $service);

        DB::transaction(function () use ($service) {
            // Supprimer toutes les images
            foreach ($service->images as $image) {
                $this->deleteServiceImage($image);
            }

            $service->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Service supprimé avec succès.'
        ]);
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'services' => 'required|array',
            'services.*.id' => 'required|integer|exists:services,id',
            'services.*.order_index' => 'required|integer',
        ]);

        $user = auth()->user();
        
        DB::transaction(function () use ($request, $user) {
            foreach ($request->services as $serviceData) {
                $service = Service::where('id', $serviceData['id'])
                    ->where('user_id', $user->id)
                    ->first();
                
                if ($service) {
                    $service->update(['order_index' => $serviceData['order_index']]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Ordre des services mis à jour.'
        ]);
    }

    public function deleteImage(ServiceImage $image)
    {
        $this->authorize('update', $image->service);

        $this->deleteServiceImage($image);

        return response()->json([
            'success' => true,
            'message' => 'Image supprimée avec succès.'
        ]);
    }

    public function updateImageOrder(Request $request, Service $service)
    {
        $this->authorize('update', $service);

        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|integer|exists:service_images,id',
            'images.*.order_index' => 'required|integer',
        ]);

        DB::transaction(function () use ($request, $service) {
            foreach ($request->images as $imageData) {
                $image = $service->images()->find($imageData['id']);
                if ($image) {
                    $image->update(['order_index' => $imageData['order_index']]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Ordre des images mis à jour.'
        ]);
    }

    protected function processMainImage(Service $service, $file)
    {
        if (!$this->imageCompressionService->validateImageFile($file)) {
            throw new \InvalidArgumentException('Type de fichier image non valide.');
        }

        // Supprimer l'ancienne image principale s'il y en a une
        $oldMainImage = $service->images()->main()->first();
        if ($oldMainImage) {
            $this->deleteServiceImage($oldMainImage);
        }

        // Comprimer et stocker la nouvelle image
        $imageData = $this->imageCompressionService->compressAndStore($file, 'services');
        
        $service->images()->create(array_merge($imageData, [
            'alt_text' => 'Image principale pour ' . $service->title,
            'is_main' => true,
            'order_index' => 0,
        ]));
    }

    protected function processGalleryImages(Service $service, array $files)
    {
        $maxOrder = $service->images()->max('order_index') ?? 0;

        foreach ($files as $index => $file) {
            if (!$this->imageCompressionService->validateImageFile($file)) {
                continue; // Ignorer les fichiers non valides
            }

            $imageData = $this->imageCompressionService->compressAndStore($file, 'services');
            
            $service->images()->create(array_merge($imageData, [
                'alt_text' => 'Galerie pour ' . $service->title,
                'is_main' => false,
                'order_index' => $maxOrder + $index + 1,
            ]));
        }
    }

    protected function deleteServiceImage(ServiceImage $image)
    {
        // Supprimer les fichiers physiques
        $paths = array_filter([
            $image->path,
            $image->compressed_path,
            $image->thumbnail_path,
        ]);

        $this->imageCompressionService->deleteImages($paths);

        // Supprimer l'enregistrement en base
        $image->delete();
    }

    private $service;
}
