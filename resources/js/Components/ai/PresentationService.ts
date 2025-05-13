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
        title?: string;
        labels: string[];
        datasets: {
            name: string;
            values: number[];
            color?: string;
        }[];
        insight?: string;
    };
    finalStatement?: string;
    events?: {
        date: string;
        title?: string;
        description: string;
    }[];
    table?: {
        headers: string[];
        rows: string[][];
        emphasis?: number[];
        style?: string;
    };
    comparison?: {
        leftTitle: string;
        leftPoints: string[];
        rightTitle: string;
        rightPoints: string[];
        verdict?: string;
    };
    process?: {
        steps: {
            number: number;
            title: string;
            description: string;
            icon?: string;
        }[];
    };
    design?: {
        background?: string;
        emphasis?: string;
    };
}

interface PowerPointData {
    title: string;
    subtitle?: string;
    author?: string;
    presentationType?: string;
    slides: PowerPointSlide[];
    theme: {
        name?: string;
        colors: {
            primary: string;
            secondary: string;
            accent?: string;
            background: string;
            text: string;
            textLight?: string;
            success?: string;
            warning?: string;
            error?: string;
        };
        fonts?: {
            heading?: string;
            body?: string;
            accent?: string;
        };
        spacing?: {
            tight?: boolean;
            margins?: string;
        };
    };
    animations?: {
        enabled: boolean;
        style?: string;
    };
}

export class PowerPointService {
    private static readonly DEFAULT_COLORS = {
        primary: '#3366CC',
        secondary: '#FF6900',
        accent: '#00C851',
        background: '#FFFFFF',
        text: '#333333',
        textLight: '#666666',
        success: '#00C851',
        warning: '#FF8800',
        error: '#CC0000'
    };

    private static readonly THEME_PRESETS = {
        'modern-corporate': {
            primary: '#1f3a93',
            secondary: '#1976d2',
            accent: '#42a5f5',
            background: '#ffffff',
            text: '#333333'
        },
        'creative-vibrant': {
            primary: '#e91e63',
            secondary: '#ff5722',
            accent: '#ffc107',
            background: '#fafafa',
            text: '#212121'
        },
        'academic-clean': {
            primary: '#2e7d32',
            secondary: '#388e3c',
            accent: '#66bb6a',
            background: '#ffffff',
            text: '#424242'
        },
        'tech-minimal': {
            primary: '#455a64',
            secondary: '#607d8b',
            accent: '#00acc1',
            background: '#ffffff',
            text: '#333333'
        }
    };

    static async generateFromJSON(jsonData: string): Promise<Blob> {
        let data: PowerPointData;
        try {
            data = JSON.parse(jsonData);
        } catch (error) {
            console.error('Invalid JSON data:', error);
            throw new Error('Le format JSON fourni est invalide');
        }

        try {
            const pres = new pptxgen();

            // Configuration globale avancée
            pres.layout = 'LAYOUT_16x9';
            pres.title = data.title;
            pres.author = data.author || 'Guidy AI';
            pres.subject = data.subtitle || '';
            pres.company = 'Guidy AI';

            // Appliquer le thème
            const theme = this.setupTheme(data.theme);

            // Créer les diapositives
            await this.createSlides(pres, data.slides, theme);

            // Générer le PowerPoint
            const result = await pres.write('blob');
            return this.ensureBlobResponse(result);
        } catch (error) {
            console.error('Error generating PowerPoint:', error);
            throw new Error(`Erreur lors de la génération de la présentation: ${error.message}`);
        }
    }

    private static setupTheme(themeData: any) {
        // Fusionner avec les couleurs par défaut
        let colors = { ...this.DEFAULT_COLORS };

        // Appliquer un preset si spécifié
        if (themeData.name && this.THEME_PRESETS[themeData.name]) {
            colors = { ...colors, ...this.THEME_PRESETS[themeData.name] };
        }

        // Appliquer les couleurs personnalisées
        if (themeData.colors) {
            colors = { ...colors, ...themeData.colors };
        }

        return {
            colors,
            fonts: themeData.fonts || {
                heading: 'Segoe UI',
                body: 'Segoe UI',
                accent: 'Arial'
            },
            spacing: themeData.spacing || {
                tight: false,
                margins: 'standard'
            }
        };
    }

    private static async createSlides(pres: any, slides: PowerPointSlide[], theme: any) {
        for (let i = 0; i < slides.length; i++) {
            const slideData = slides[i];
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
                    case 'table':
                        this.createTableSlide(pres, slideData, theme);
                        break;
                    case 'comparison':
                        this.createComparisonSlide(pres, slideData, theme);
                        break;
                    case 'process':
                        this.createProcessSlide(pres, slideData, theme);
                        break;
                    case 'timeline':
                        this.createTimelineSlide(pres, slideData, theme);
                        break;
                    case 'conclusion':
                        this.createConclusionSlide(pres, slideData, theme);
                        break;
                    case 'quote':
                        this.createQuoteSlide(pres, slideData, theme);
                        break;
                    case 'image':
                        this.createImageSlide(pres, slideData, theme);
                        break;
                    default:
                        this.createBasicSlide(pres, slideData, theme);
                }
            } catch (error) {
                console.error(`Error creating slide ${i + 1} of type ${slideData.type}:`, error);
                // Continue with other slides
            }
        }
    }

    // Slides améliorées avec design professionnel

    private static createTitleSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Arrière-plan avec gradient subtil
        slide.background = {
            color: theme.colors.background,
            transparency: 0
        };

        // Forme décorative
        slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 1.5,
            fill: {
                type: 'gradient',
                colors: [
                    { position: 0, color: theme.colors.primary },
                    { position: 100, color: theme.colors.secondary }
                ],
                angle: 45
            },
            line: { type: 'none' }
        });

        // Titre principal avec ombre
        slide.addText(slideData.title, {
            x: 0.5, y: 2.5, w: '95%', h: 2,
            fontSize: 48,
            fontFace: theme.fonts.heading,
            color: theme.colors.text,
            bold: true,
            align: pres.AlignH.center,
            valign: pres.AlignV.middle,
            shadow: {
                type: 'outer',
                blur: 8,
                offset: 4,
                angle: 45,
                color: '00000020'
            }
        });

        // Sous-titre
        if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
                x: 0.5, y: 4.2, w: '95%', h: 1,
                fontSize: 28,
                fontFace: theme.fonts.body,
                color: theme.colors.secondary,
                align: pres.AlignH.center,
                italic: true
            });
        }

        // Ligne décorative en bas
        slide.addShape(pres.ShapeType.rect, {
            x: 4, y: 6.2, w: 5, h: 0.3,
            fill: { color: theme.colors.accent },
            line: { type: 'none' }
        });
    }

    private static createContentSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre avec ligne de séparation
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Ligne de séparation
        slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 1.2, w: '95%', h: 0.05,
            fill: { color: theme.colors.secondary },
            line: { type: 'none' }
        });

        // Contenu avec puces personnalisées
        if (slideData.content && slideData.content.length > 0) {
            slideData.content.forEach((point, index) => {
                // Icône de puce personnalisée
                slide.addText('●', {
                    x: 0.8, y: 1.8 + (index * 0.8), w: 0.3, h: 0.6,
                    fontSize: 24,
                    color: theme.colors.accent,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });

                // Texte du point
                slide.addText(point, {
                    x: 1.2, y: 1.8 + (index * 0.8), w: '88%', h: 0.6,
                    fontSize: 20,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text,
                    valign: pres.AlignV.middle
                });
            });
        }
    }

    private static createChartSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        if (!slideData.data || !slideData.chartType) return;

        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.3, w: '95%', h: 0.6,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Déterminer le type de graphique
            const chartTypeMap = {
                bar: pres.ChartType.bar,
                column: pres.ChartType.bar,
                line: pres.ChartType.line,
                pie: pres.ChartType.pie,
                donut: pres.ChartType.doughnut,
                scatter: pres.ChartType.scatter,
                area: pres.ChartType.area
            };

            const chartType = chartTypeMap[slideData.chartType.toLowerCase()] || pres.ChartType.bar;

            // Préparer les données avec couleurs automatiques
            const chartData = slideData.data.datasets.map((dataset, index) => ({
                name: dataset.name,
                labels: slideData.data?.labels || [],
                values: dataset.values,
                color: dataset.color || this.getChartColor(index, theme)
            }));

            // Configuration du graphique
            const chartOptions = {
                x: 0.5, y: 1.2, w: '95%', h: 4.5,
                showTitle: !!slideData.data.title,
                title: slideData.data.title || '',
                titleColor: theme.colors.text,
                titleFontSize: 16,
                showLegend: chartData.length > 1,
                legendPos: 'b',
                chartColors: chartData.map(d => d.color),
                chartColorsOpacity: 85,
                showValue: true,
                dataLabelFontSize: 12,
                valAxisLabelColor: theme.colors.textLight,
                catAxisLabelColor: theme.colors.textLight,
                dataLabelColor: theme.colors.text,
                valGridLine: { color: theme.colors.textLight + '40', style: 'solid' },
                catGridLine: { color: theme.colors.textLight + '40', style: 'solid' }
            };

            // Ajuster les options selon le type de graphique
            if (slideData.chartType === 'bar') {
                chartOptions['barDir'] = 'col';
            } else if (slideData.chartType === 'column') {
                chartOptions['barDir'] = 'bar';
            }

            slide.addChart(chartType, chartData, chartOptions);

            // Ajouter l'insight si disponible
            if (slideData.data.insight) {
                slide.addText(slideData.data.insight, {
                    x: 0.5, y: 6.0, w: '95%', h: 0.8,
                    fontSize: 16,
                    fontFace: theme.fonts.body,
                    color: theme.colors.secondary,
                    italic: true,
                    align: pres.AlignH.center,
                    fill: { color: theme.colors.background },
                    line: { color: theme.colors.secondary, pt: 1 },
                    margin: 0.1
                });
            }
        } catch (error) {
            console.error('Error creating chart:', error);
            // Afficher un message d'erreur élégant
            slide.addText("Données du graphique indisponibles", {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.textLight,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    private static createTableSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        if (!slideData.table) return;

        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Préparer les données du tableau
            const tableData = [
                slideData.table.headers.map(header => ({
                    text: header,
                    options: {
                        bold: true,
                        fontSize: 18,
                        color: theme.colors.background,
                        fill: { color: theme.colors.primary },
                        align: pres.AlignH.center,
                        valign: pres.AlignV.middle
                    }
                })),
                ...slideData.table.rows.map((row, rowIndex) =>
                    row.map((cell, cellIndex) => ({
                        text: cell,
                        options: {
                            fontSize: 16,
                            color: theme.colors.text,
                            fill: {
                                color: slideData.table?.emphasis?.includes(rowIndex)
                                    ? theme.colors.secondary + '20'
                                    : theme.colors.background
                            },
                            align: pres.AlignH.center,
                            valign: pres.AlignV.middle
                        }
                    }))
                )
            ];

            // Calculer la largeur des colonnes
            const colCount = slideData.table.headers.length;
            const colWidth = Array(colCount).fill(10 / colCount);

            // Ajouter le tableau
            slide.addTable(tableData, {
                x: 0.5,
                y: 1.5,
                w: '95%',
                colW: colWidth,
                border: { pt: 1, color: theme.colors.textLight },
                margin: 0.1
            });
        } catch (error) {
            console.error('Error creating table:', error);
            slide.addText("Erreur d'affichage du tableau", {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.error,
                align: pres.AlignH.center
            });
        }
    }

    private static createComparisonSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        if (!slideData.comparison) return;

        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Colonnes de comparaison
        const leftX = 0.5;
        const rightX = 6.5;
        const colWidth = 5.8;

        // Colonne gauche
        slide.addShape(pres.ShapeType.rect, {
            x: leftX, y: 1.5, w: colWidth, h: 4.5,
            fill: { color: theme.colors.primary + '10' },
            line: { color: theme.colors.primary, pt: 2 }
        });

        slide.addText(slideData.comparison.leftTitle, {
            x: leftX, y: 1.7, w: colWidth, h: 0.6,
            fontSize: 24,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true,
            align: pres.AlignH.center
        });

        slideData.comparison.leftPoints.forEach((point, index) => {
            slide.addText(`✓ ${point}`, {
                x: leftX + 0.3, y: 2.5 + (index * 0.7), w: colWidth - 0.6, h: 0.6,
                fontSize: 16,
                fontFace: theme.fonts.body,
                color: theme.colors.text,
                valign: pres.AlignV.middle
            });
        });

        // Colonne droite
        slide.addShape(pres.ShapeType.rect, {
            x: rightX, y: 1.5, w: colWidth, h: 4.5,
            fill: { color: theme.colors.secondary + '10' },
            line: { color: theme.colors.secondary, pt: 2 }
        });

        slide.addText(slideData.comparison.rightTitle, {
            x: rightX, y: 1.7, w: colWidth, h: 0.6,
            fontSize: 24,
            fontFace: theme.fonts.heading,
            color: theme.colors.secondary,
            bold: true,
            align: pres.AlignH.center
        });

        slideData.comparison.rightPoints.forEach((point, index) => {
            slide.addText(`✓ ${point}`, {
                x: rightX + 0.3, y: 2.5 + (index * 0.7), w: colWidth - 0.6, h: 0.6,
                fontSize: 16,
                fontFace: theme.fonts.body,
                color: theme.colors.text,
                valign: pres.AlignV.middle
            });
        });

        // VS au centre
        slide.addText('VS', {
            x: 5.8, y: 3.5, w: 1.4, h: 1,
            fontSize: 48,
            fontFace: theme.fonts.accent,
            color: theme.colors.accent,
            bold: true,
            align: pres.AlignH.center,
            valign: pres.AlignV.middle
        });

        // Verdict
        if (slideData.comparison.verdict) {
            slide.addText(slideData.comparison.verdict, {
                x: 0.5, y: 6.2, w: '95%', h: 0.8,
                fontSize: 18,
                fontFace: theme.fonts.body,
                color: theme.colors.success,
                bold: true,
                align: pres.AlignH.center,
                fill: { color: theme.colors.success + '20' },
                line: { color: theme.colors.success, pt: 2 },
                margin: 0.1
            });
        }
    }

    private static createProcessSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        if (!slideData.process || !slideData.process.steps) return;

        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        const steps = slideData.process.steps;
        const stepWidth = 10 / steps.length;
        const startY = 2.0;

        steps.forEach((step, index) => {
            const xPos = 0.5 + (index * stepWidth);
            const isLastStep = index === steps.length - 1;

            // Cercle numéroté
            slide.addShape(pres.ShapeType.ellipse, {
                x: xPos + (stepWidth/2) - 0.4, y: startY, w: 0.8, h: 0.8,
                fill: { color: theme.colors.primary },
                line: { color: theme.colors.secondary, pt: 3 }
            });

            slide.addText(step.number.toString(), {
                x: xPos + (stepWidth/2) - 0.4, y: startY, w: 0.8, h: 0.8,
                fontSize: 24,
                fontFace: theme.fonts.heading,
                color: theme.colors.background,
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });

            // Flèche vers l'étape suivante
            if (!isLastStep) {
                slide.addShape(pres.ShapeType.rightArrow, {
                    x: xPos + stepWidth - 0.6, y: startY + 0.3, w: 1.2, h: 0.2,
                    fill: { color: theme.colors.accent },
                    line: { type: 'none' }
                });
            }

            // Titre de l'étape
            slide.addText(step.title, {
                x: xPos, y: startY + 1.2, w: stepWidth, h: 0.6,
                fontSize: 16,
                fontFace: theme.fonts.heading,
                color: theme.colors.text,
                bold: true,
                align: pres.AlignH.center
            });

            // Description
            slide.addText(step.description, {
                x: xPos + 0.1, y: startY + 1.9, w: stepWidth - 0.2, h: 2.0,
                fontSize: 12,
                fontFace: theme.fonts.body,
                color: theme.colors.textLight,
                align: pres.AlignH.left,
                valign: pres.AlignV.top
            });
        });
    }

    private static createTimelineSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Ligne de temps principale
        slide.addShape(pres.ShapeType.rect, {
            x: 1, y: 3.2, w: 11, h: 0.1,
            fill: { color: theme.colors.primary },
            line: { type: 'none' }
        });

        // Événements
        if (slideData.events && slideData.events.length > 0) {
            const eventsCount = slideData.events.length;
            const spacing = 10 / (eventsCount - 1 || 1);

            slideData.events.forEach((event, index) => {
                const xPos = 1.5 + (index * spacing);
                const isEven = index % 2 === 0;
                const yOffset = isEven ? -1.5 : 1.2;

                // Point sur la timeline
                slide.addShape(pres.ShapeType.ellipse, {
                    x: xPos - 0.2, y: 3.0, w: 0.4, h: 0.4,
                    fill: { color: theme.colors.secondary },
                    line: { color: theme.colors.primary, pt: 2 }
                });

                // Date
                slide.addText(event.date, {
                    x: xPos - 1, y: 3.2 + (isEven ? 0.5 : -1.0), w: 2, h: 0.4,
                    fontSize: 14,
                    fontFace: theme.fonts.body,
                    color: theme.colors.primary,
                    bold: true,
                    align: pres.AlignH.center
                });

                // Boîte d'événement
                const boxY = isEven ? 1.5 : 4.5;
                slide.addShape(pres.ShapeType.rect, {
                    x: xPos - 1.2, y: boxY, w: 2.4, h: 1.2,
                    fill: { color: theme.colors.background },
                    line: { color: theme.colors.secondary, pt: 1 },
                    shadow: {
                        type: 'outer',
                        blur: 4,
                        offset: 2,
                        angle: 45,
                        color: '00000020'
                    }
                });

                // Ligne de connexion
                slide.addShape(pres.ShapeType.line, {
                    x: xPos, y: 3.2, w: 0, h: yOffset,
                    line: { color: theme.colors.textLight, pt: 1, dashType: 'dash' }
                });

                // Titre de l'événement
                const eventTitle = event.title || event.description;
                slide.addText(eventTitle, {
                    x: xPos - 1.1, y: boxY + 0.1, w: 2.2, h: 0.4,
                    fontSize: 12,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text,
                    bold: true,
                    align: pres.AlignH.center
                });

                // Description (si title existe)
                if (event.title && event.description) {
                    slide.addText(event.description, {
                        x: xPos - 1.1, y: boxY + 0.5, w: 2.2, h: 0.6,
                        fontSize: 10,
                        fontFace: theme.fonts.body,
                        color: theme.colors.textLight,
                        align: pres.AlignH.center
                    });
                }
            });
        }
    }

    private static createConclusionSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Arrière-plan gradienté
        slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: '100%',
            fill: {
                type: 'gradient',
                colors: [
                    { position: 0, color: theme.colors.background },
                    { position: 100, color: theme.colors.primary + '10' }
                ],
                angle: 45
            },
            line: { type: 'none' }
        });

        // Titre avec emphase
        slide.addText(slideData.title, {
            x: 0.5, y: 1, w: '95%', h: 1,
            fontSize: 36,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true,
            align: pres.AlignH.center,
            shadow: {
                type: 'outer',
                blur: 6,
                offset: 3,
                angle: 45,
                color: '00000030'
            }
        });

        // Points clés
        if (slideData.content && slideData.content.length > 0) {
            slideData.content.forEach((point, index) => {
                slide.addText(`⬧ ${point}`, {
                    x: 1.5, y: 2.5 + (index * 0.8), w: '80%', h: 0.7,
                    fontSize: 20,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text,
                    bold: true,
                    valign: pres.AlignV.middle
                });
            });
        }

        // Message final avec cadre
        if (slideData.finalStatement) {
            slide.addShape(pres.ShapeType.rect, {
                x: 1, y: 5.5, w: '85%', h: 1.2,
                fill: {
                    type: 'gradient',
                    colors: [
                        { position: 0, color: theme.colors.secondary },
                        { position: 100, color: theme.colors.accent }
                    ]
                },
                line: { type: 'none' },
                shadow: {
                    type: 'outer',
                    blur: 8,
                    offset: 4,
                    angle: 45,
                    color: '00000040'
                }
            });

            slide.addText(slideData.finalStatement, {
                x: 1, y: 5.5, w: '85%', h: 1.2,
                fontSize: 24,
                fontFace: theme.fonts.heading,
                color: theme.colors.background,
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });
        }
    }

    private static createQuoteSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Arrière-plan avec motif subtil
        slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: '100%',
            fill: { color: theme.colors.background },
            line: { type: 'none' }
        });

        // Guillemets décoratifs
        slide.addText('"', {
            x: 1, y: 1.5, w: 1, h: 1.5,
            fontSize: 120,
            fontFace: theme.fonts.accent,
            color: theme.colors.primary + '40',
            align: pres.AlignH.center,
            valign: pres.AlignV.middle
        });

        slide.addText('"', {
            x: 11, y: 4.5, w: 1, h: 1.5,
            fontSize: 120,
            fontFace: theme.fonts.accent,
            color: theme.colors.primary + '40',
            align: pres.AlignH.center,
            valign: pres.AlignV.middle,
            rotate: 180
        });

        // Citation
        if (slideData.content && slideData.content.length > 0) {
            slide.addText(slideData.content[0], {
                x: 2, y: 2.5, w: '70%', h: 2.5,
                fontSize: 32,
                fontFace: theme.fonts.accent,
                fontStyle: 'italic',
                color: theme.colors.text,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });
        }

        // Auteur
        if (slideData.subtitle) {
            slide.addShape(pres.ShapeType.rect, {
                x: 3, y: 5.2, w: 7, h: 0.05,
                fill: { color: theme.colors.secondary },
                line: { type: 'none' }
            });

            slide.addText(slideData.subtitle, {
                x: 3, y: 5.5, w: 7, h: 0.6,
                fontSize: 18,
                fontFace: theme.fonts.body,
                color: theme.colors.secondary,
                bold: true,
                align: pres.AlignH.center
            });
        }
    }

    private static createImageSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Zone d'image placeholder
        slide.addShape(pres.ShapeType.rect, {
            x: 1.5, y: 1.5, w: 10, h: 4.5,
            fill: { color: theme.colors.background },
            line: { color: theme.colors.textLight, pt: 2, dashType: 'dash' }
        });

        slide.addText('Image à ajouter', {
            x: 1.5, y: 3.5, w: 10, h: 0.5,
            fontSize: 20,
            fontFace: theme.fonts.body,
            color: theme.colors.textLight,
            align: pres.AlignH.center,
            italic: true
        });

        // Légende
        if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
                x: 1.5, y: 6.2, w: 10, h: 0.6,
                fontSize: 14,
                fontFace: theme.fonts.body,
                color: theme.colors.textLight,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    private static createBasicSlide(pres: any, slideData: PowerPointSlide, theme: any) {
        const slide = pres.addSlide();

        // Titre
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Contenu
        if (slideData.content && slideData.content.length > 0) {
            slide.addText(slideData.content.join('\n\n'), {
                x: 0.5, y: 1.5, w: '95%', h: 4.5,
                fontSize: 18,
                fontFace: theme.fonts.body,
                color: theme.colors.text,
                lineSpacing: 32
            });
        }
    }

    // Utilitaires

    private static getChartColor(index: number, theme: any): string {
        const colors = [
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.accent,
            theme.colors.success,
            theme.colors.warning,
            '#8E24AA',
            '#D81B60',
            '#00897B',
            '#FB8C00',
            '#5E35B1'
        ];
        return colors[index % colors.length];
    }

    private static ensureBlobResponse(result: any): Blob {
        if (result instanceof Blob) {
            return result;
        } else if (result instanceof ArrayBuffer || result instanceof Uint8Array) {
            return new Blob([result], {
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            });
        } else if (typeof result === 'string') {
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
    }
}
