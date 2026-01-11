@if(isset($editable) && $editable)
    <style>
        .editable-field:hover, [data-editable]:hover {
            outline: 2px dashed #3498db;
            outline-offset: 2px;
            cursor: text;
            background-color: rgba(52, 152, 219, 0.05);
            border-radius: 2px;
        }
        .editable-field:focus, [data-editable]:focus {
            outline: 2px solid #3498db;
            background-color: rgba(52, 152, 219, 0.1);
        }
        
        /* Disable contenteditable outline on print */
        @media print {
            .editable-field:hover, [data-editable]:hover,
            .editable-field:focus, [data-editable]:focus {
                outline: none;
                background-color: transparent;
            }
        }
    </style>
@endif
