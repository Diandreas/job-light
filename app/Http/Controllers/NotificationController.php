<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Afficher les notifications de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $notifications = $user->pushNotifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = $user->pushNotifications()->unread()->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        
        $this->notificationService->markAllNotificationsAsRead($user);

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues'
        ]);
    }

    /**
     * Enregistrer un token de device pour les notifications push
     */
    public function registerDeviceToken(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
            'platform' => 'required|in:ios,android,web',
            'device_name' => 'nullable|string'
        ]);

        $user = Auth::user();
        
        $deviceToken = $this->notificationService->registerDeviceToken(
            $user,
            $request->device_token,
            $request->platform,
            $request->device_name
        );

        return response()->json([
            'success' => true,
            'message' => 'Token de device enregistré avec succès',
            'device_token_id' => $deviceToken->id
        ]);
    }

    /**
     * Désactiver un token de device
     */
    public function unregisterDeviceToken(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string'
        ]);

        $user = Auth::user();
        
        $this->notificationService->unregisterDeviceToken($user, $request->device_token);

        return response()->json([
            'success' => true,
            'message' => 'Token de device désactivé avec succès'
        ]);
    }

    /**
     * API pour obtenir les notifications non lues
     */
    public function getUnreadNotifications(Request $request)
    {
        $user = Auth::user();
        $limit = $request->get('limit', 10);
        
        $notifications = $this->notificationService->getUnreadNotifications($user, $limit);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->count()
        ]);
    }

    /**
     * Afficher la page des préférences de notification
     */
    public function showSettings(Request $request)
    {
        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();

        return Inertia::render('Settings/Notifications', [
            'preferences' => $preferences
        ]);
    }

    /**
     * Mettre à jour les préférences de notification
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'email_job_matches' => 'boolean',
            'email_application_updates' => 'boolean',
            'email_new_messages' => 'boolean',
            'push_job_matches' => 'boolean',
            'push_application_updates' => 'boolean',
            'push_new_messages' => 'boolean',
            'job_alert_keywords' => 'array',
            'preferred_locations' => 'array',
            'preferred_employment_types' => 'array'
        ]);

        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();
        
        $preferences->update($request->all());

        return redirect()->route('settings.notifications')
            ->with('success', 'Vos préférences de notification ont été mises à jour avec succès !');
    }
}
