@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <!-- Template Vide par Sécurité -->
    <style>
         @page { margin: 20mm; size: A4; }
         body { font-family: sans-serif; }
    </style>
</head>
<body>
    <h1>CV Generation Error</h1>
    <p>Please select a valid template.</p>
</body>
<x-cv-editable-scripts />
</html>
@endsection
