@if(isset($editable) && $editable)
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Check if running in iframe
            const isIframe = window.self !== window.top;
            if (!isIframe) return;

            const isEditable = {{ $editable ? 'true' : 'false' }};
            const editableElements = document.querySelectorAll('[contenteditable="true"]');
            let timeoutId;

            editableElements.forEach(element => {
                if (isEditable) {
                    element.addEventListener('input', function() {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            window.parent.postMessage({
                                type: 'CV_UPDATE',
                                payload: {
                                    field: this.dataset.field,
                                    value: this.innerText,
                                    id: this.dataset.id,
                                    model: this.dataset.model
                                }
                            }, '*');
                        }, 500);
                    });

                    element.addEventListener('focus', function() {
                        window.parent.postMessage({
                            type: 'CV_FIELD_FOCUS',
                            payload: {
                                field: this.dataset.field,
                                value: this.innerText,
                                id: this.dataset.id,
                                model: this.dataset.model
                            }
                        }, '*');
                    });
                }
            });

            // Listen for updates from parent
            window.addEventListener('message', function(event) {
                if (event.data?.type === 'CV_UPDATE_CONTENT') {
                     const { field, id, value, model } = event.data.payload;
                     const selector = `[data-field="${field}"][data-id="${id}"][data-model="${model}"]`;
                     const element = document.querySelector(selector);
                     if (element) {
                         element.innerText = value;
                     }
                }
            });
        });
    </script>
@endif
