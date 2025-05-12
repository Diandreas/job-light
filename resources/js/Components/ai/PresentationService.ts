// src/Services/PowerPointService.ts
import pptxgen from 'pptxgenjs';

interface PowerPointSlide {
    type: string;
    title: string;
    subtitle?: string;
    content?: string[];
    leftTitle?: string;
    leftContent?: string[];
    rightTitle?: string;
    rightContent?: string[];
    chartType?: string;
    data?: {
        labels: string[];
        datasets: {
            name: string;
            values: number[];
        }[];
    };
    finalStatement?: string;
    events?: {
        date: string;
        title?: string;
        description: string;
    }[];
}

interface PowerPointData {
    title: string;
    subtitle?: string;
    author?: string;
    slides: PowerPointSlide[];
    theme: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

export class PowerPointService {
    /**
     * Génère une présentation PowerPoint à partir d'une structure JSON
     * @param jsonData Structure JSON de la présentation
     * @returns Blob de la présentation PowerPoint
     */
    static async generateFromJSON(jsonData: string): Promise<Blob> {
        // Analyser le JSON
        let data: PowerPointData;
        try {
            data = JSON.parse(jsonData);
        } catch (error) {
            console.error('Invalid JSON data:', error);
            throw new Error('Le format JSON fourni est invalide');
        }

        try {
            // Créer la présentation
            const pres = new pptxgen();

            // Configuration globale
            pres.layout = 'LAYOUT_16x9';
            pres.title = data.title;
            pres.author = data.author || 'Guidy AI';

            // Définir un thème de couleurs
            const theme = data.theme || {
                primary: '#3366CC',
                secondary: '#FF9900',
                background: '#FFFFFF',
                text: '#333333'
            };

            // Créer les diapositives
            this.createSlides(pres, data.slides, theme);

            // Générer le PowerPoint et s'assurer que nous retournons un Blob
            // @ts-ignore - ignorer l'erreur de type car nous gérons tous les types de retour possibles
            const result = await pres.write('blob');
            
            // Vérifier le type de retour et convertir si nécessaire
            if (result instanceof Blob) {
                return result;
            } else if (result instanceof ArrayBuffer || result instanceof Uint8Array) {
                return new Blob([result], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                });
            } else if (typeof result === 'string') {
                // Si c'est une chaîne base64, la convertir en Blob
                const byteCharacters = atob(result.indexOf('base64,') !== -1 
                    ? result.split('base64,')[1] 
                    : result);
                const byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                    const slice = byteCharacters.slice(offset, offset + 512);
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                return new Blob(byteArrays, {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                });
            } else {
                throw new Error('Format de retour non pris en charge par l\'exportation PowerPoint');
            }
        } catch (error) {
            console.error('Error generating PowerPoint:', error);
            throw new Error(`Erreur lors de la génération de la présentation: ${error.message}`);
        }
    }

    private static createSlides(pres: any, slides: PowerPointSlide[], theme: any) {
        for (const slideData of slides) {
            try {
                switch (slideData.type) {
                    case 'title':
                        this.createTitleSlide(pres, slideData, theme);
                        break;
                    case 'content':
                        this.createContentSlide(pres, slideData, theme);
                        break;
                    case 'two-column':
                        this.createTwoColumnSlide(pres, slideData, theme);
                        break;
                    case 'chart':
                        this.createChartSlide(pres, slideData, theme);
                        break;
                    case 'quote':
                        this.createQuoteSlide(pres, slideData, theme);
                        break;
                    case 'timeline':
                        this.createTimelineSlide(pres, slideData, theme);
                        break;
                    case 'conclusion':
                        this.createConclusionSlide(pres, slideData, theme);
                        break;
                    default:
                        this.createBasicSlide(pres, slideData, theme);
                }
            } catch (error) {
                console.error(`Error creating slide of type ${slideData.type}:`, error);
                // Continue with other slides instead of breaking the entire presentation
            }
        }
    }

    private static createTitleSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre principal
        slide.addText(slideData.title, {
            x: 0.5, y: 1.5, w: '95%', h: 2,
            fontSize: 44,
            color: theme.text,
            bold: true,
            align: pres.AlignH.center
        });

        // Sous-titre si présent
        if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
                x: 0.5, y: 3.5, w: '95%', h: 1,
                fontSize: 28,
                color: theme.secondary,
                align: pres.AlignH.center
            });
        }

        // Ajouter un élément de design
        slide.addShape(pres.ShapeType.rect, {
            x: 4, y: 5.2, w: 5, h: 0.2,
            fill: { color: theme.primary }
        });
    }

    // Dans PresentationService.ts, modifiez la méthode createContentSlide
    // Dans PresentationService.ts
    private static createContentSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 24,
            color: theme.primary,
            bold: true
        });

        // Contenu avec puces
        if (slideData.content && slideData.content.length > 0) {
            try {
                // Créer un tableau d'objets avec le texte pour chaque point
                const bulletPoints = slideData.content.map(item => ({ text: item }));
                
                slide.addText(bulletPoints, {
                    x: 0.5, y: 1.5, w: '95%', h: 4.5,
                    fontSize: 18,
                    color: theme.text,
                    bullet: { type: 'bullet' }
                });
            } catch (error) {
                console.error('Error adding bullet points to content slide:', error);
                // Fallback to simple text without bullets
                slide.addText(slideData.content.join('\n\n'), {
                    x: 0.5, y: 1.5, w: '95%', h: 4.5,
                    fontSize: 18,
                    color: theme.text
                });
            }
        }
    }
    private static createTwoColumnSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 24,
            color: theme.primary,
            bold: true
        });

        // Colonne gauche
        if (slideData.leftTitle) {
            slide.addText(slideData.leftTitle, {
                x: 0.5, y: 1.5, w: '45%', h: 0.6,
                fontSize: 20,
                color: theme.secondary,
                bold: true
            });
        }

        if (slideData.leftContent && slideData.leftContent.length > 0) {
            try {
                // Convertir en format attendu par pptxgen
                const leftBullets = slideData.leftContent.map(item => ({ text: item }));
                
                slide.addText(leftBullets, {
                    x: 0.5, y: 2.2, w: '45%', h: 3.5,
                    fontSize: 16,
                    color: theme.text,
                    bullet: { type: 'bullet' }
                });
            } catch (error) {
                console.error('Error adding left column bullet points:', error);
                // Fallback
                slide.addText(slideData.leftContent.join('\n\n'), {
                    x: 0.5, y: 2.2, w: '45%', h: 3.5,
                    fontSize: 16,
                    color: theme.text
                });
            }
        }

        // Colonne droite
        if (slideData.rightTitle) {
            slide.addText(slideData.rightTitle, {
                x: 6.5, y: 1.5, w: '45%', h: 0.6,
                fontSize: 20,
                color: theme.secondary,
                bold: true
            });
        }

        if (slideData.rightContent && slideData.rightContent.length > 0) {
            try {
                // Convertir en format attendu par pptxgen
                const rightBullets = slideData.rightContent.map(item => ({ text: item }));
                
                slide.addText(rightBullets, {
                    x: 6.5, y: 2.2, w: '45%', h: 3.5,
                    fontSize: 16,
                    color: theme.text,
                    bullet: { type: 'bullet' }
                });
            } catch (error) {
                console.error('Error adding right column bullet points:', error);
                // Fallback
                slide.addText(slideData.rightContent.join('\n\n'), {
                    x: 6.5, y: 2.2, w: '45%', h: 3.5,
                    fontSize: 16,
                    color: theme.text
                });
            }
        }

        // Ligne de séparation
        slide.addShape(pres.ShapeType.line, {
            x: 6.0, y: 1.5, w: 0, h: 4.2,
            line: { color: theme.primary, width: 1 }
        });
    }

    private static createChartSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        if (!slideData.data || !slideData.chartType) return;

        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 24,
            color: theme.primary,
            bold: true
        });

        try {
            // Déterminer le type de graphique
            let chartType;
            switch (slideData.chartType.toLowerCase()) {
                case 'bar': chartType = pres.ChartType.bar; break;
                case 'line': chartType = pres.ChartType.line; break;
                case 'pie': chartType = pres.ChartType.pie; break;
                case 'scatter': chartType = pres.ChartType.scatter; break;
                default: chartType = pres.ChartType.bar;
            }

            // Préparer les données de graphique
            const chartData = slideData.data.datasets.map(dataset => ({
                name: dataset.name,
                labels: slideData.data?.labels || [],
                values: dataset.values
            }));

            // Ajouter le graphique
            slide.addChart(chartType, chartData, {
                x: 0.5, y: 1.5, w: '95%', h: 4.5,
                chartColors: [theme.primary, theme.secondary, '#44AA66', '#AA44AA'],
                showTitle: false,
                showLabel: true,
                chartColorsOpacity: 80
            });
        } catch (error) {
            console.error('Error creating chart slide:', error);
            // Fallback - Add a text placeholder instead of the chart
            slide.addText("Chart data could not be displayed", {
                x: 0.5, y: 2.5, w: '95%', h: 1.5,
                fontSize: 20,
                color: theme.text,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    private static createQuoteSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Quote background
        slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 1.5, w: '95%', h: 3.5,
            fill: { color: theme.primary + '20' }, // Transparence ajoutée
            line: { color: theme.primary, width: 1 }
        });

        // Citation
        if (slideData.content && slideData.content.length > 0) {
            slide.addText(slideData.content[0], {
                x: 1.0, y: 2.0, w: '90%', h: 2.5,
                fontSize: 28,
                fontFace: 'Georgia',
                italic: true,
                color: theme.text,
                align: pres.AlignH.center
            });
        }

        // Auteur de la citation (si disponible)
        if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
                x: 1.0, y: 4.0, w: '90%', h: 0.5,
                fontSize: 16,
                color: theme.secondary,
                align: pres.AlignH.center
            });
        }
    }

    private static createTimelineSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 24,
            color: theme.primary,
            bold: true
        });

        // Ligne de temps
        slide.addShape(pres.ShapeType.line, {
            x: 0.5, y: 2.5, w: '95%', h: 0,
            line: { color: theme.primary, width: 3 }
        });

        // Événements
        if (slideData.events && slideData.events.length > 0) {
            try {
                const eventsCount = slideData.events.length;
                const widthPerEvent = 10 / (eventsCount + 1);

                slideData.events.forEach((event, index) => {
                    const xPos = 0.5 + widthPerEvent * (index + 1);

                    // Point sur la ligne
                    slide.addShape(pres.ShapeType.ellipse, {
                        x: xPos - 0.25, y: 2.25, w: 0.5, h: 0.5,
                        fill: { color: theme.secondary }
                    });

                    // Date
                    slide.addText(event.date, {
                        x: xPos - 1, y: 1.5, w: 2, h: 0.5,
                        fontSize: 16,
                        color: theme.primary,
                        bold: true,
                        align: pres.AlignH.center
                    });

                    // Titre de l'événement (utilise title s'il existe, sinon utilise description comme titre)
                    const eventTitle = event.title || event.description;
                    slide.addText(eventTitle, {
                        x: xPos - 1.5, y: 3.0, w: 3, h: 0.5,
                        fontSize: 14,
                        color: theme.text,
                        bold: true,
                        align: pres.AlignH.center
                    });

                    // Description (seulement si title est défini)
                    if (event.title && event.description) {
                        slide.addText(event.description, {
                            x: xPos - 1.5, y: 3.5, w: 3, h: 1.0,
                            fontSize: 12,
                            color: theme.text,
                            align: pres.AlignH.center
                        });
                    }
                });
            } catch (error) {
                console.error('Error creating timeline events:', error);
                // Add simple text instead if timeline creation fails
                slideData.events.forEach((event, index) => {
                    slide.addText(`${event.date}: ${event.description}`, {
                        x: 0.5, y: 3.0 + (index * 0.5), w: '95%', h: 0.5,
                        fontSize: 14,
                        color: theme.text
                    });
                });
            }
        }
    }

    private static createConclusionSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            color: theme.primary,
            bold: true,
            align: pres.AlignH.center
        });

        // Points clés
        if (slideData.content && slideData.content.length > 0) {
            try {
                // Convertir en format attendu par pptxgen
                const bulletPoints = slideData.content.map(item => ({ text: item }));
                
                slide.addText(bulletPoints, {
                    x: 1.5, y: 1.5, w: '80%', h: 3.0,
                    fontSize: 20,
                    color: theme.text,
                    bullet: { type: 'bullet' }
                });
            } catch (error) {
                console.error('Error adding conclusion bullet points:', error);
                // Fallback
                slide.addText(slideData.content.join('\n\n'), {
                    x: 1.5, y: 1.5, w: '80%', h: 3.0,
                    fontSize: 20,
                    color: theme.text
                });
            }
        }

        // Message final
        if (slideData.finalStatement) {
            slide.addShape(pres.ShapeType.rect, {
                x: 1.5, y: 4.5, w: '80%', h: 1.0,
                fill: { color: theme.secondary + '30' },
                line: { color: theme.secondary, width: 1 }
            });

            slide.addText(slideData.finalStatement, {
                x: 1.5, y: 4.5, w: '80%', h: 1.0,
                fontSize: 20,
                color: theme.text,
                align: pres.AlignH.center,
                bold: true
            });
        }
    }

    private static createBasicSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 24,
            color: theme.primary,
            bold: true
        });

        // Contenu texte simple
        if (slideData.content && slideData.content.length > 0) {
            slide.addText(slideData.content.join('\n\n'), {
                x: 0.5, y: 1.5, w: '95%', h: 4.5,
                fontSize: 18,
                color: theme.text
            });
        }
    }
}
