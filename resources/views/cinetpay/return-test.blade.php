<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CinetPay - URL de Retour</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .status {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .info {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">✅ {{ $status }}</div>
        <div class="message">{{ $message }}</div>
        <div class="info">
            <strong>URL de retour CinetPay</strong><br>
            Cette page confirme que votre URL de retour est correctement configurée et accessible.
        </div>
    </div>
</body>
</html>