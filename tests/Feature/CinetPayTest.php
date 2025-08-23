<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class CinetPayTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Configuration de test pour CinetPay
        config([
            'cinetpay.api_key' => 'test_api_key',
            'cinetpay.site_id' => 'test_site_id',
            'cinetpay.secret_key' => 'test_secret_key',
            'cinetpay.environment' => 'test'
        ]);
    }

    /** @test */
    public function it_can_instantiate_cinetpay_controller()
    {
        $controller = new \App\Http\Controllers\CinetPayController();
        $this->assertInstanceOf(\App\Http\Controllers\CinetPayController::class, $controller);
    }

    /** @test */
    public function it_can_access_initialize_route()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $response = $this->get('/api/cinetpay/initialize');
        
        // Devrait retourner 405 Method Not Allowed car c'est une route POST
        $response->assertStatus(405);
    }

    /** @test */
    public function it_can_initialize_payment()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $paymentData = [
            'transaction_id' => 'test_' . time(),
            'amount' => 1000,
            'currency' => 'XOF',
            'description' => 'Test payment',
            'customer_name' => 'Test User',
            'customer_surname' => 'Test',
            'customer_email' => 'test@example.com',
            'customer_phone_number' => '+22501234567',
            'notify_url' => 'https://example.com/notify',
            'return_url' => 'https://example.com/return',
            'channels' => 'ALL',
            'lang' => 'fr'
        ];

        $response = $this->postJson('/api/cinetpay/initialize', $paymentData, [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ]);

        // Si nous avons une erreur 500, affichons le contenu pour le débogage
        if ($response->status() === 500) {
            dump('Response content:', $response->content());
            dump('Response status:', $response->status());
        }

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'payment_url',
                    'transaction_id'
                ]);

        // Vérifier que le paiement a été créé en base
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'transaction_id' => $paymentData['transaction_id'],
            'amount' => 1000,
            'currency' => 'XOF',
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
                        ->post('/api/cinetpay/initialize', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'transaction_id',
                    'amount',
                    'currency',
                    'description',
                    'customer_name',
                    'customer_email',
                    'notify_url',
                    'return_url',
                    'channels',
                    'lang'
                ]);
    }

    /** @test */
    public function it_validates_currency_format()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $paymentData = [
            'transaction_id' => 'test_' . time(),
            'amount' => 1000,
            'currency' => 'USD', // Devise non supportée
            'description' => 'Test payment',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'notify_url' => 'https://example.com/notify',
            'return_url' => 'https://example.com/return',
            'channels' => 'ALL',
            'lang' => 'fr'
        ];

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
                        ->post('/api/cinetpay/initialize', $paymentData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['currency']);
    }

    /** @test */
    public function it_validates_amount_minimum()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $paymentData = [
            'transaction_id' => 'test_' . time(),
            'amount' => 50, // Montant trop faible
            'currency' => 'XOF',
            'description' => 'Test payment',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'notify_url' => 'https://example.com/notify',
            'return_url' => 'https://example.com/return',
            'channels' => 'ALL',
            'lang' => 'fr'
        ];

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
                        ->post('/api/cinetpay/initialize', $paymentData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['amount']);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $paymentData = [
            'transaction_id' => 'test_' . time(),
            'amount' => 1000,
            'currency' => 'XOF',
            'description' => 'Test payment',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'notify_url' => 'https://example.com/notify',
            'return_url' => 'https://example.com/return',
            'channels' => 'ALL',
            'lang' => 'fr'
        ];

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
                        ->post('/api/cinetpay/initialize', $paymentData);

        $response->assertStatus(401);
    }

    /** @test */
    public function it_handles_notification_webhook()
    {
        $payment = Payment::factory()->create([
            'transaction_id' => 'test_transaction_123',
            'status' => 'pending'
        ]);

        $notificationData = [
            'cpm_trans_id' => 'test_transaction_123',
            'cpm_site_id' => 'test_site_id',
            'cpm_amount' => 1000,
            'cpm_currency' => 'XOF',
            'cpm_payid' => 'test_pay_id',
            'cpm_payment_date' => now()->format('Y-m-d H:i:s'),
            'cpm_payment_time' => now()->format('H:i:s'),
            'cpm_error_message' => '',
            'cpm_phone_prefixe' => '+225',
            'cpm_phone_num' => '01234567',
            'cpm_ipn_ack' => 'Y',
            'cpm_result' => '00',
            'cpm_trans_status' => 'ACCEPTED',
            'cpm_designation' => 'Test payment',
            'buyer_name' => 'Test User'
        ];

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
                        ->post('/api/cinetpay/notify', $notificationData);

        $response->assertStatus(200);

        // Vérifier que le paiement a été mis à jour
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'completed'
        ]);
    }

    /** @test */
    public function it_handles_return_page()
    {
        $payment = Payment::factory()->create([
            'transaction_id' => 'test_transaction_456',
            'status' => 'completed'
        ]);

        $response = $this->get('/api/cinetpay/return?transaction_id=test_transaction_456');

        $response->assertStatus(302); // Redirection
    }
}
