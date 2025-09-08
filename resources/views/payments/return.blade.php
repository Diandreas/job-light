<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Résultat du Paiement</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .payment-result {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .result-card {
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 15px;
            border: none;
        }
        .status-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .status-success { color: #28a745; }
        .status-pending { color: #ffc107; }
        .status-failed { color: #dc3545; }
        .status-cancelled { color: #6c757d; }
        .status-expired { color: #fd7e14; }
    </style>
</head>
<body>
    <div class="payment-result">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card result-card">
                        <div class="card-body text-center p-5">
                            @if($payment)
                                @switch($payment->status)
                                    @case('completed')
                                        <div class="status-icon status-success">
                                            <i class="fas fa-check-circle"></i>
                                        </div>
                                        <h2 class="text-success mb-3">Paiement Réussi !</h2>
                                        <p class="text-muted mb-4">
                                            Votre paiement a été traité avec succès. Vous recevrez une confirmation par email.
                                        </p>
                                        @break
                                    
                                    @case('pending')
                                        <div class="status-icon status-pending">
                                            <i class="fas fa-clock"></i>
                                        </div>
                                        <h2 class="text-warning mb-3">Paiement en Cours</h2>
                                        <p class="text-muted mb-4">
                                            Votre paiement est en cours de traitement. Veuillez patienter quelques minutes.
                                        </p>
                                        @break
                                    
                                    @case('failed')
                                        <div class="status-icon status-failed">
                                            <i class="fas fa-times-circle"></i>
                                        </div>
                                        <h2 class="text-danger mb-3">Paiement Échoué</h2>
                                        <p class="text-muted mb-4">
                                            Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter le support.
                                        </p>
                                        @break
                                    
                                    @case('cancelled')
                                        <div class="status-icon status-cancelled">
                                            <i class="fas fa-ban"></i>
                                        </div>
                                        <h2 class="text-secondary mb-3">Paiement Annulé</h2>
                                        <p class="text-muted mb-4">
                                            Vous avez annulé le paiement. Vous pouvez réessayer à tout moment.
                                        </p>
                                        @break
                                    
                                    @case('expired')
                                        <div class="status-icon status-expired">
                                            <i class="fas fa-hourglass-end"></i>
                                        </div>
                                        <h2 class="text-warning mb-3">Paiement Expiré</h2>
                                        <p class="text-muted mb-4">
                                            La session de paiement a expiré. Veuillez recommencer.
                                        </p>
                                        @break
                                    
                                    @default
                                        <div class="status-icon status-pending">
                                            <i class="fas fa-question-circle"></i>
                                        </div>
                                        <h2 class="text-info mb-3">Statut Inconnu</h2>
                                        <p class="text-muted mb-4">
                                            Le statut de votre paiement est en cours de vérification.
                                        </p>
                                @endswitch

                                <div class="payment-details mt-4 p-3 bg-light rounded">
                                    <div class="row text-start">
                                        <div class="col-6">
                                            <small class="text-muted">Transaction ID:</small><br>
                                            <strong>{{ $payment->transaction_id }}</strong>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted">Montant:</small><br>
                                            <strong>{{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</strong>
                                        </div>
                                        <div class="col-6 mt-2">
                                            <small class="text-muted">Fournisseur:</small><br>
                                            <strong class="text-capitalize">{{ $payment->provider }}</strong>
                                        </div>
                                        <div class="col-6 mt-2">
                                            <small class="text-muted">Date:</small><br>
                                            <strong>{{ $payment->created_at->format('d/m/Y H:i') }}</strong>
                                        </div>
                                        @if($payment->description)
                                        <div class="col-12 mt-2">
                                            <small class="text-muted">Description:</small><br>
                                            <strong>{{ $payment->description }}</strong>
                                        </div>
                                        @endif
                                    </div>
                                </div>

                                @if($payment->status === 'pending')
                                    <button onclick="checkStatus()" class="btn btn-outline-primary mt-3" id="checkStatusBtn">
                                        <i class="fas fa-sync-alt"></i> Vérifier le Statut
                                    </button>
                                @endif

                            @else
                                <div class="status-icon status-failed">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <h2 class="text-warning mb-3">Transaction Non Trouvée</h2>
                                <p class="text-muted mb-4">
                                    Aucune information de paiement n'a été trouvée pour cette session.
                                </p>
                            @endif

                            <div class="mt-4">
                                <a href="{{ url('/') }}" class="btn btn-primary">
                                    <i class="fas fa-home"></i> Retour à l'Accueil
                                </a>
                                
                                @if($payment && in_array($payment->status, ['failed', 'cancelled', 'expired']))
                                    <button onclick="retryPayment()" class="btn btn-outline-success ms-2">
                                        <i class="fas fa-redo"></i> Réessayer
                                    </button>
                                @endif
                            </div>
                        </div>
                    </div>

                    @if($payment && $payment->status === 'completed')
                        <div class="text-center mt-3">
                            <p class="text-white-50">
                                <i class="fas fa-shield-alt"></i> 
                                Paiement sécurisé via {{ ucfirst($payment->provider) }}
                            </p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://kit.fontawesome.com/your-fontawesome-kit.js"></script>
    <script>
        @if($payment)
        function checkStatus() {
            const btn = document.getElementById('checkStatusBtn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';
            btn.disabled = true;
            
            fetch(`/api/payments/status/{{ $payment->transaction_id }}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.status !== '{{ $payment->status }}') {
                        // Status changed, reload the page
                        location.reload();
                    } else {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        }

        function retryPayment() {
            // Redirect to payment form with same parameters
            const paymentData = {
                amount: {{ $payment->amount }},
                currency: '{{ $payment->currency }}',
                description: '{{ $payment->description }}',
                @if($payment->customer_email)
                customer_email: '{{ $payment->customer_email }}',
                @endif
                @if($payment->customer_phone)
                customer_phone: '{{ $payment->customer_phone }}',
                @endif
            };
            
            // Store in session storage and redirect
            sessionStorage.setItem('retryPaymentData', JSON.stringify(paymentData));
            window.location.href = '/payment-form'; // Adjust URL as needed
        }

        // Auto-refresh for pending payments
        @if($payment->status === 'pending')
        setTimeout(() => {
            checkStatus();
        }, 10000); // Check again after 10 seconds
        @endif
        @endif
    </script>
</body>
</html>