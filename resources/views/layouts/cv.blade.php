<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">

    <style>
        body {
            margin: 10px;
            padding: 0;
            background: white;
            line-height: 1;
        }

        @page {
            margin: 30px;
            size: A4;
        }

        @media print {
            body {
                padding: 0;
                margin: 10px;
                /*font-size: 10px;*/
            }
        }
    </style>

    @stack('styles')
</head>
<body>
@yield('content')
</body>
</html>
