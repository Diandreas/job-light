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
            color?: string | string[];
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
    // Ajout de constantes pour les styles et thèmes
    private static readonly DEFAULT_COLORS = {
        primary: '#3366CC',
        secondary: '#FF6900',
        accent: '#00C851',
        background: '#FFFFFF',
        text: '#333333',
        textLight: '#777777', // Lightened for better visibility
        success: '#00C851',
        warning: '#FF8800',
        error: '#CC0000'
    };

    // Thèmes prédéfinis améliorés avec plus d'options
    private static readonly THEME_PRESETS = {
        'modern-corporate': {
            primary: '#1f3a93',
            secondary: '#1976d2',
            accent: '#42a5f5',
            background: '#ffffff',
            text: '#333333',
            fonts: {
                heading: 'Montserrat',
                body: 'Roboto',
                accent: 'Montserrat'
            },
            design: {
                preferredBg: 'gradient',
                cornerRounding: 'medium',
                shadow: true
            }
        },
        'creative-vibrant': {
            primary: '#e91e63',
            secondary: '#ff5722',
            accent: '#ffc107',
            background: '#fafafa',
            text: '#212121',
            fonts: {
                heading: 'Raleway',
                body: 'Open Sans',
                accent: 'Pacifico'
            },
            design: {
                preferredBg: 'dots',
                cornerRounding: 'high',
                shadow: true
            }
        },
        'academic-clean': {
            primary: '#2e7d32',
            secondary: '#388e3c',
            accent: '#66bb6a',
            background: '#ffffff',
            text: '#424242',
            fonts: {
                heading: 'Georgia',
                body: 'Cambria',
                accent: 'Times New Roman'
            },
            design: {
                preferredBg: 'none',
                cornerRounding: 'low',
                shadow: false
            }
        },
        'tech-minimal': {
            primary: '#455a64',
            secondary: '#607d8b',
            accent: '#00acc1',
            background: '#ffffff',
            text: '#333333',
            fonts: {
                heading: 'Segoe UI',
                body: 'Arial',
                accent: 'Segoe UI Light'
            },
            design: {
                preferredBg: 'grid',
                cornerRounding: 'none',
                shadow: false
            }
        },
        'elegant-dark': {
            primary: '#263238',
            secondary: '#546e7a',
            accent: '#90a4ae',
            background: '#eceff1',
            text: '#263238',
            textLight: '#455a64',
            fonts: {
                heading: 'Playfair Display',
                body: 'Lato',
                accent: 'Playfair Display SC'
            },
            design: {
                preferredBg: 'gradient',
                cornerRounding: 'medium',
                shadow: true
            }
        },
        'cameroon': {
            primary: '#007A4D', // Green from Cameroon flag
            secondary: '#CE1126', // Red from Cameroon flag
            accent: '#FCD116',   // Yellow from Cameroon flag
            background: '#FFFFFF',
            text: '#333333',
            textLight: '#666666',
            fonts: {
                heading: 'Montserrat',
                body: 'Open Sans',
                accent: 'Raleway'
            },
            design: {
                preferredBg: 'cameroon-flag',
                cornerRounding: 'medium',
                shadow: true
            }
        },
        'afrique-moderne': {
            primary: '#8C4799', // Purple
            secondary: '#F39200', // Orange
            accent: '#009CA6',   // Teal
            background: '#FFFFFF',
            text: '#333333',
            textLight: '#666666',
            fonts: {
                heading: 'Ubuntu',
                body: 'Roboto',
                accent: 'Ubuntu'
            },
            design: {
                preferredBg: 'dots',
                cornerRounding: 'high',
                shadow: true
            }
        },
        'digital-futuriste': {
            primary: '#3A86FF',
            secondary: '#FF006E',
            accent: '#8338EC',
            background: '#030F26',
            text: '#FFFFFF',
            textLight: '#CCCCCC',
            fonts: {
                heading: 'Exo 2',
                body: 'Roboto',
                accent: 'Orbitron'
            },
            design: {
                preferredBg: 'futuriste',
                cornerRounding: 'high',
                shadow: true
            }
        },
        'nature-et-ecologie': {
            primary: '#2E7D32',
            secondary: '#81C784',
            accent: '#FBC02D',
            background: '#F9FBE7',
            text: '#33691E',
            textLight: '#558B2F',
            fonts: {
                heading: 'Montserrat',
                body: 'Nunito',
                accent: 'Caveat'
            },
            design: {
                preferredBg: 'organic',
                cornerRounding: 'medium',
                shadow: false
            }
        }
    };

    // Fonction de création simplifiée pour les backgrounds
    private static createBackgroundPattern(pres, slide, pattern, color) {
        switch(pattern) {
            case 'dots':
                // Crée un motif de points pour l'arrière-plan
                for (let x = 0; x < 13; x++) {
                    for (let y = 0; y < 8; y++) {
                        if ((x + y) % 2 === 0) continue;
                        slide.addShape(pres.ShapeType.ellipse, {
                            x: x * 1.0, y: y * 1.0, w: 0.05, h: 0.05,
                            fill: { color: color + '20' },
                            line: { type: 'none' }
                        });
                    }
                }
                break;
            case 'grid':
                // Crée un motif de grille pour l'arrière-plan
                for (let x = 0; x < 13; x++) {
                    slide.addShape(pres.ShapeType.line, {
                        x: x * 1.0, y: 0, w: 0, h: 7.5,
                        line: { color: color + '10', pt: 0.5 }
                    });
                }
                for (let y = 0; y < 8; y++) {
                    slide.addShape(pres.ShapeType.line, {
                        x: 0, y: y * 1.0, w: 13.0, h: 0,
                        line: { color: color + '10', pt: 0.5 }
                    });
                }
                break;
            case 'waves':
                // Crée un motif d'ondes en bas de la diapo
                for (let i = 0; i < 5; i++) {
                    slide.addShape(pres.ShapeType.wave, {
                        x: 0, y: 6.0 + (i * 0.3), w: 13.3, h: 1.0,
                        fill: { color: color + (15 - i * 3).toString(16) },
                        line: { type: 'none' },
                        flipH: i % 2 === 0
                    });
                }
                break;
            case 'cameroon-flag':
                // Crée un arrière-plan subtil inspiré des couleurs du drapeau camerounais
                // Fond blanc
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#FFFFFF' },
                    line: { type: 'none' }
                });

                // Bande verte à gauche (subtile)
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: 0.5, h: '100%',
                    fill: { color: '#007A4D' },
                    line: { type: 'none' }
                });

                // Bande rouge à droite (subtile)
                slide.addShape(pres.ShapeType.rect, {
                    x: 12.83, y: 0, w: 0.5, h: '100%',
                    fill: { color: '#CE1126' },
                    line: { type: 'none' }
                });

                // Étoile jaune en bas à droite (subtile)
                slide.addShape(pres.ShapeType.star5, {
                    x: 12.0, y: 6.5, w: 0.8, h: 0.8,
                    fill: { color: '#FCD116' },
                    line: { type: 'none' }
                });
                break;
            case 'gradient':
                // Crée un dégradé élégant
                const stops = [
                    { position: 0, color: color + 'FF' },
                    { position: 100, color: color + '00' }
                ];
                slide.background = {
                    color: '#FFFFFF',
                    gradient: {
                        type: 'linear',
                        angle: 45,
                        stops: stops
                    }
                };
                break;
            case 'futuriste':
                // Crée un arrière-plan futuriste avec des lignes et des points
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#030F26' }, // Fond bleu très foncé
                    line: { type: 'none' }
                });

                // Lignes horizontales
                for (let y = 0; y < 8; y += 0.5) {
                    slide.addShape(pres.ShapeType.line, {
                        x: 0, y: y, w: 13.33, h: 0,
                        line: { color: color + '10', pt: 0.25 }
                    });
                }

                // Points lumineux
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 13;
                    const y = Math.random() * 7.5;
                    const size = 0.02 + (Math.random() * 0.08);

                    slide.addShape(pres.ShapeType.ellipse, {
                        x: x, y: y, w: size, h: size,
                        fill: { color: '#FFFFFF' },
                        line: { type: 'none' }
                    });
                }

                // Cercle graphique dans le coin
                slide.addShape(pres.ShapeType.ellipse, {
                    x: -2, y: -2, w: 6, h: 6,
                    fill: { color: color + '10' },
                    line: { color: color + '30', pt: 1 }
                });
                break;
            case 'organic':
                // Crée un motif organique inspiré par la nature
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#F9FBE7' }, // Fond très légèrement vert
                    line: { type: 'none' }
                });

                // Feuilles stylisées
                for (let i = 0; i < 5; i++) {
                    const x = Math.random() * 12;
                    const y = Math.random() * 6.5;
                    const size = 0.5 + (Math.random() * 1);
                    const rotation = Math.random() * 360;

                    slide.addShape(pres.ShapeType.ellipse, {
                        x: x, y: y, w: size, h: size * 2,
                        fill: { color: color + '15' },
                        line: { color: color + '30', pt: 0.5 },
                        rotate: rotation
                    });
                }

                // Vague organique en bas
                slide.addShape(pres.ShapeType.wave, {
                    x: 0, y: 6.5, w: 13.33, h: 1,
                    fill: { color: color + '20' },
                    line: { type: 'none' },
                    flipV: true
                });
                break;
            case 'geometric':
                // Crée un motif géométrique moderne
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#FFFFFF' },
                    line: { type: 'none' }
                });

                // Formes géométriques
                const shapes = [
                    { type: pres.ShapeType.rect, x: -2, y: -2, w: 5, h: 5 },
                    { type: pres.ShapeType.rect, x: 10, y: 5, w: 4, h: 4 },
                    { type: pres.ShapeType.triangle, x: 8, y: -1, w: 3, h: 3 },
                    { type: pres.ShapeType.ellipse, x: -1, y: 5, w: 3, h: 3 }
                ];

                shapes.forEach(shape => {
                    slide.addShape(shape.type, {
                        x: shape.x, y: shape.y, w: shape.w, h: shape.h,
                        fill: { color: color + '10' },
                        line: { color: color + '30', pt: 0.75 }
                    });
                });
                break;
            case 'diagonal-stripes':
                // Crée un motif de rayures diagonales
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#FFFFFF' },
                    line: { type: 'none' }
                });

                for (let i = -10; i < 20; i += 2) {
                    slide.addShape(pres.ShapeType.line, {
                        x: 0, y: i, w: 20, h: -20,
                        line: { color: color + '10', pt: 0.5 }
                    });
                }
                break;
            case 'circles':
                // Crée un motif de cercles concentriques
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%',
                    fill: { color: '#FFFFFF' },
                    line: { type: 'none' }
                });

                const centers = [
                    { x: -3, y: -3 },
                    { x: 16, y: -3 },
                    { x: -3, y: 10 },
                    { x: 16, y: 10 }
                ];

                centers.forEach(center => {
                    for (let r = 1; r <= 6; r++) {
                        slide.addShape(pres.ShapeType.ellipse, {
                            x: center.x - r, y: center.y - r, w: r * 2, h: r * 2,
                            fill: { color: 'none' },
                            line: { color: color + (10 - r).toString(16), pt: 0.5 }
                        });
                    }
                });
                break;
            default:
                // Par défaut, pas d'arrière-plan spécial
                slide.background = { color: '#FFFFFF' };
        }
    }

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

            // Configuration globale améliorée
            pres.layout = 'LAYOUT_16x9';
            pres.title = data.title;
            pres.author = data.author || 'Guidy AI';
            pres.subject = data.subtitle || '';
            pres.company = 'Guidy AI';

            // Définir les marges par défaut pour toutes les diapositives
            pres.defineLayout({
                name: 'CUSTOM',
                width: 13.33,
                height: 7.5
            });
            pres.layout = 'CUSTOM';

            // Appliquer le thème avec options avancées
            const theme = this.setupTheme(data.theme);

            // Vérification initiale des slides pour éviter les diapositives vides
            data.slides = this.validateSlides(data.slides);

            // Créer les diapositives
            await this.createSlides(pres, data.slides, theme, data.animations?.enabled || false);

            // Générer le PowerPoint
            const result = await pres.write('blob');
            return this.ensureBlobResponse(result);
        } catch (error) {
            console.error('Error generating PowerPoint:', error);
            throw new Error(`Erreur lors de la génération de la présentation: ${error.message}`);
        }
    }

    // Nouvelle méthode pour valider les slides avant la génération
    private static validateSlides(slides: PowerPointSlide[]): PowerPointSlide[] {
        return slides.map(slide => {
            // Vérifier que le type de slide est valide
            if (!slide.type) {
                console.warn('Slide sans type défini, utilisation du type "content" par défaut');
                slide.type = 'content';
            }

            // Vérifier que le titre est défini
            if (!slide.title) {
                console.warn('Slide sans titre, ajout d\'un titre par défaut');
                slide.title = 'Slide';
            }

            // Vérifier les données pour les slides de type chart
            if (slide.type === 'chart' && (!slide.data || !slide.data.labels || !slide.data.datasets)) {
                console.warn('Données de graphique invalides, ajout de données fictives');
                slide.data = {
                    labels: ['Donnée 1', 'Donnée 2', 'Donnée 3'],
                    datasets: [{
                        name: 'Série de données',
                        values: [10, 20, 30]
                    }]
                };
            }

            // Vérifier les événements pour les slides de type timeline
            if (slide.type === 'timeline' && (!slide.events || slide.events.length === 0)) {
                console.warn('Données de chronologie invalides, ajout d\'événements fictifs');
                slide.events = [
                    { date: '2000', title: 'Événement 1', description: 'Description de l\'événement 1' },
                    { date: '2010', title: 'Événement 2', description: 'Description de l\'événement 2' }
                ];
            }

            return slide;
        });
    }

    private static setupTheme(themeData: any) {
        // Fusionner avec les couleurs par défaut
        let colors = { ...this.DEFAULT_COLORS };
        let fonts = {
            heading: 'Segoe UI',
            body: 'Segoe UI',
            accent: 'Arial'
        };
        let design = {
            preferredBg: 'none',
            cornerRounding: 'medium', // none, low, medium, high
            shadow: false
        };

        // Appliquer un preset si spécifié
        if (themeData.name && this.THEME_PRESETS[themeData.name]) {
            const preset = this.THEME_PRESETS[themeData.name];
            colors = { ...colors, ...preset };

            if (preset.fonts) {
                fonts = { ...fonts, ...preset.fonts };
            }

            if (preset.design) {
                design = { ...design, ...preset.design };
            }
        }

        // Appliquer les couleurs personnalisées
        if (themeData.colors) {
            colors = { ...colors, ...themeData.colors };
        }

        // Appliquer les polices personnalisées
        if (themeData.fonts) {
            fonts = { ...fonts, ...themeData.fonts };
        }

        // S'assurer que les couleurs text et textLight ont un contraste suffisant avec le fond
        colors.text = this.ensureContrast(colors.text, colors.background);
        colors.textLight = this.ensureContrast(colors.textLight || '#777777', colors.background);

        return {
            colors,
            fonts,
            design,
            spacing: themeData.spacing || {
                tight: false,
                margins: 'standard'
            }
        };
    }

    // Nouvelle méthode pour assurer un contraste suffisant entre texte et fond
    private static ensureContrast(textColor: string, bgColor: string): string {
        const getColorBrightness = (color: string): number => {
            // Convertir la couleur hex en RGB
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            // Calculer la luminosité (formule de luminosité perçue)
            return (r * 299 + g * 587 + b * 114) / 1000;
        };

        const textBrightness = getColorBrightness(textColor);
        const bgBrightness = getColorBrightness(bgColor);

        // Si le contraste est insuffisant (différence de luminosité < 125)
        if (Math.abs(textBrightness - bgBrightness) < 125) {
            // Si le fond est sombre, rendre le texte plus clair
            if (bgBrightness < 128) {
                return '#FFFFFF'; // Blanc
            } else {
                return '#333333'; // Noir/gris foncé
            }
        }

        return textColor; // Le contraste est suffisant, conserver la couleur d'origine
    }

    private static async createSlides(pres: any, slides: PowerPointSlide[], theme: any, enableAnimations: boolean) {
        for (let i = 0; i < slides.length; i++) {
            const slideData = slides[i];
            try {
                // Console log pour le débogage
                console.log(`Creating slide ${i + 1} of type ${slideData.type}`);

                // Appliquer les transitions et animations si activées
                const slideOptions = enableAnimations ? {
                    transition: {
                        name: this.getTransitionForSlideType(slideData.type),
                        duration: 1.0
                    }
                } : {};

                switch (slideData.type) {
                    case 'title':
                        this.createTitleSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'content':
                        this.createContentSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'two-column':
                        this.createTwoColumnSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'chart':
                        this.createChartSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'table':
                        this.createTableSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'comparison':
                        this.createComparisonSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'process':
                        this.createProcessSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'timeline':
                        this.createTimelineSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'conclusion':
                        this.createConclusionSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'quote':
                        this.createQuoteSlide(pres, slideData, theme, slideOptions);
                        break;
                    case 'image':
                        this.createImageSlide(pres, slideData, theme, slideOptions);
                        break;
                    default:
                        console.warn(`Type de slide inconnu: ${slideData.type}, création d'une diapositive basique`);
                        this.createBasicSlide(pres, slideData, theme, slideOptions);
                }
            } catch (error) {
                console.error(`Error creating slide ${i + 1} of type ${slideData.type}:`, error);
                // Créer une diapositive d'erreur pour que la présentation puisse continuer
                this.createErrorSlide(pres, `Erreur dans la diapositive ${i + 1}`, error.message, theme);
            }
        }
    }

    // Nouvelle méthode pour créer une diapositive d'erreur
    private static createErrorSlide(pres: any, title: string, errorMessage: string, theme: any) {
        const slide = pres.addSlide();

        // Titre avec style
        slide.addText(title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.error,
            bold: true
        });

        // Message d'erreur
        slide.addText(`Une erreur est survenue lors de la création de cette diapositive:\n${errorMessage}`, {
            x: 0.5, y: 2.0, w: '95%', h: 4.0,
            fontSize: 18,
            fontFace: theme.fonts.body,
            color: theme.colors.text,
            valign: pres.AlignV.middle,
            align: pres.AlignH.center
        });
    }

    // Fonctions de création de diapositives

    private static createTitleSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        } else if (theme.design?.preferredBg) {
            this.createBackgroundPattern(pres, slide, theme.design.preferredBg, theme.colors.primary);
        }

        // Propriétés de style basées sur le thème
        const cornerRadius = this.getCornerRadius(theme.design?.cornerRounding || 'medium');

        // Effet de superposition d'image pour un design plus moderne
        if (theme.design?.shadow) {
            // Grand cercle décoratif
            slide.addShape(pres.ShapeType.ellipse, {
                x: -3, y: -3, w: 8, h: 8,
                fill: { color: theme.colors.primary + '15' },
                line: { type: 'none' }
            });

            // Rectangle décoratif
            slide.addShape(pres.ShapeType.roundRect, {
                x: 9, y: 5, w: 5, h: 5,
                fill: { color: theme.colors.secondary + '15' },
                line: { type: 'none' },
                radius: cornerRadius
            });
        }

        // Zone de titre avec style amélioré
        const titleBox = {
            x: 0.5,
            y: 2.0,
            w: '85%',
            h: 2.0
        };

        // Ajouter un fond au titre si le thème le demande
        if (theme.design?.shadow) {
            slide.addShape(pres.ShapeType.roundRect, {
                x: titleBox.x - 0.1,
                y: titleBox.y - 0.1,
                w: titleBox.w,
                h: titleBox.h + 0.2,
                fill: { color: theme.colors.background },
                line: { color: theme.colors.primary + '30', pt: 1 },
                radius: cornerRadius,
                shadow: {
                    type: 'outer',
                    blur: 15,
                    offset: 5,
                    angle: 45,
                    color: '00000020'
                }
            });
        }

        // Titre avec style amélioré
        slide.addText(slideData.title, {
            ...titleBox,
            fontSize: 54,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true,
            align: pres.AlignH.center,
            valign: pres.AlignV.middle,
            shadow: theme.design?.shadow ? {
                type: 'outer',
                blur: 10,
                offset: 3,
                angle: 45,
                color: '00000030'
            } : undefined
        });

        // Sous-titre avec style élégant
        if (slideData.subtitle) {
            // Fond du sous-titre
            if (theme.design?.shadow) {
                slide.addShape(pres.ShapeType.roundRect, {
                    x: 2.0,
                    y: 4.2,
                    w: 9.0,
                    h: 1.2,
                    fill: { color: theme.colors.background },
                    line: { color: theme.colors.secondary + '30', pt: 1 },
                    radius: cornerRadius
                });
            }

            slide.addText(slideData.subtitle, {
                x: 2.0, y: 4.2, w: 9.0, h: 1.2,
                fontSize: 28,
                fontFace: theme.fonts.body,
                color: theme.colors.secondary,
                align: pres.AlignH.center,
                italic: true,
                shadow: theme.design?.shadow ? {
                    type: 'outer',
                    blur: 5,
                    offset: 2,
                    angle: 45,
                    color: '00000020'
                } : undefined
            });
        }

        // Ligne décorative élégante ou autre élément graphique
        if (theme.design?.cornerRounding === 'none') {
            // Design minimaliste avec ligne simple
            slide.addShape(pres.ShapeType.rect, {
                x: 4, y: 5.8, w: 5, h: 0.05,
                fill: { color: theme.colors.accent || theme.colors.secondary },
                line: { type: 'none' }
            });
        } else {
            // Design moderne avec plusieurs éléments graphiques
            slide.addShape(pres.ShapeType.roundRect, {
                x: 4, y: 5.8, w: 2, h: 0.1,
                fill: { color: theme.colors.primary },
                line: { type: 'none' },
                radius: cornerRadius
            });

            slide.addShape(pres.ShapeType.roundRect, {
                x: 6.5, y: 5.8, w: 1, h: 0.1,
                fill: { color: theme.colors.secondary },
                line: { type: 'none' },
                radius: cornerRadius
            });

            slide.addShape(pres.ShapeType.roundRect, {
                x: 8, y: 5.8, w: 1.5, h: 0.1,
                fill: { color: theme.colors.accent || theme.colors.secondary },
                line: { type: 'none' },
                radius: cornerRadius
            });
        }

        // Élément graphique supplémentaire selon le thème
        if (theme.design?.cornerRounding === 'high') {
            // Éléments graphiques supplémentaires pour un design plus dynamique
            const graphicColor = theme.colors.accent || theme.colors.secondary;

            // Cercle décoratif
            slide.addShape(pres.ShapeType.ellipse, {
                x: 11.5, y: 6.0, w: 1.0, h: 1.0,
                fill: { color: graphicColor + '40' },
                line: { color: graphicColor, pt: 2 }
            });

            // Petit cercle interne
            slide.addShape(pres.ShapeType.ellipse, {
                x: 11.75, y: 6.25, w: 0.5, h: 0.5,
                fill: { color: graphicColor },
                line: { type: 'none' }
            });
        }
    }

    private static createContentSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec effet de soulignement
        slide.addText(slideData.title, {
            x: 0.5, y: 0.7, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Ligne de séparation avec effet dégradé
        slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 1.5, w: '95%', h: 0.05,
            fill: { color: theme.colors.secondary },
            line: { type: 'none' }
        });

        // Contenu avec puces personnalisées
        if (slideData.content && slideData.content.length > 0) {
            slideData.content.forEach((point, index) => {
                // Icône de puce personnalisée avec style
                const bulletColors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
                slide.addShape(pres.ShapeType.roundRect, {
                    x: 0.8, y: 1.9 + (index * 0.8), w: 0.3, h: 0.3,
                    fill: { color: bulletColors[index % bulletColors.length] },
                    line: { type: 'none' },
                    radius: 0.15
                });

                // Texte du point avec mise en forme soignée
                slide.addText(point, {
                    x: 1.3, y: 1.8 + (index * 0.8), w: '85%', h: 0.6,
                    fontSize: 20,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text,
                    valign: pres.AlignV.middle
                });
            });
        } else {
            // Message si aucun contenu n'est défini
            slide.addText("Contenu à définir", {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                fontFace: theme.fonts.body,
                color: theme.colors.textLight,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    private static createTwoColumnSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec effet de soulignement
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Ligne de séparation
        slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 1.3, w: '95%', h: 0.05,
            fill: { color: theme.colors.secondary },
            line: { type: 'none' }
        });

        // Colonne gauche avec effet d'ombre
        const leftColX = 0.5;
        const colWidth = 5.5;

        // Amélioration du fond pour éviter les problèmes de contraste
        const leftColBgColor = theme.colors.primary + '08'; // Fond très léger

        slide.addShape(pres.ShapeType.roundRect, {
            x: leftColX, y: 1.6, w: colWidth, h: 5.2,
            fill: { color: leftColBgColor },
            line: { color: theme.colors.primary + '20', pt: 1 },
            radius: 0.2
        });

        // Titre de la colonne gauche
        if (slideData.leftTitle) {
            slide.addShape(pres.ShapeType.roundRect, {
                x: leftColX, y: 1.6, w: colWidth, h: 0.6,
                fill: { color: theme.colors.primary },
                line: { type: 'none' },
                radius: [0.2, 0.2, 0, 0]
            });

            slide.addText(slideData.leftTitle, {
                x: leftColX, y: 1.6, w: colWidth, h: 0.6,
                fontSize: 18,
                fontFace: theme.fonts.heading,
                color: '#FFFFFF', // Texte blanc pour assurer la lisibilité
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });
        }

        // Contenu de la colonne gauche
        if (slideData.leftContent && slideData.leftContent.length > 0) {
            slideData.leftContent.forEach((point, index) => {
                // Puce personnalisée
                slide.addText('●', {
                    x: leftColX + 0.3, y: 2.4 + (index * 0.7), w: 0.3, h: 0.5,
                    fontSize: 16,
                    color: theme.colors.primary,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });

                // Texte du point
                slide.addText(point, {
                    x: leftColX + 0.7, y: 2.4 + (index * 0.7), w: colWidth - 1.0, h: 0.5,
                    fontSize: 16,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text, // Couleur de texte contrastée
                    valign: pres.AlignV.middle
                });
            });
        }

        // Colonne droite avec effet d'ombre
        const rightColX = 6.5;

        // Amélioration du fond pour éviter les problèmes de contraste
        const rightColBgColor = theme.colors.secondary + '08'; // Fond très léger

        slide.addShape(pres.ShapeType.roundRect, {
            x: rightColX, y: 1.6, w: colWidth, h: 5.2,
            fill: { color: rightColBgColor },
            line: { color: theme.colors.secondary + '20', pt: 1 },
            radius: 0.2
        });

        // Titre de la colonne droite
        if (slideData.rightTitle) {
            slide.addShape(pres.ShapeType.roundRect, {
                x: rightColX, y: 1.6, w: colWidth, h: 0.6,
                fill: { color: theme.colors.secondary },
                line: { type: 'none' },
                radius: [0.2, 0.2, 0, 0]
            });

            slide.addText(slideData.rightTitle, {
                x: rightColX, y: 1.6, w: colWidth, h: 0.6,
                fontSize: 18,
                fontFace: theme.fonts.heading,
                color: '#FFFFFF', // Texte blanc pour assurer la lisibilité
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });
        }

        // Contenu de la colonne droite
        if (slideData.rightContent && slideData.rightContent.length > 0) {
            slideData.rightContent.forEach((point, index) => {
                // Puce personnalisée
                slide.addText('●', {
                    x: rightColX + 0.3, y: 2.4 + (index * 0.7), w: 0.3, h: 0.5,
                    fontSize: 16,
                    color: theme.colors.secondary,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });

                // Texte du point
                slide.addText(point, {
                    x: rightColX + 0.7, y: 2.4 + (index * 0.7), w: colWidth - 1.0, h: 0.5,
                    fontSize: 16,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text, // Couleur de texte contrastée
                    valign: pres.AlignV.middle
                });
            });
        }
    }

    private static createChartSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);
        const cornerRadius = this.getCornerRadius(theme.design?.cornerRounding || 'medium');

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        } else if (theme.design?.preferredBg) {
            this.createBackgroundPattern(pres, slide, theme.design.preferredBg, theme.colors.primary);
        }

        // Container for title with shadow if needed
        if (theme.design?.shadow) {
            slide.addShape(pres.ShapeType.roundRect, {
                x: 0.4, y: 0.4, w: '95%', h: 0.9,
                fill: { color: theme.colors.background },
                line: { color: theme.colors.primary + '30', pt: 1 },
                radius: cornerRadius,
                shadow: {
                    type: 'outer',
                    blur: 8,
                    offset: 3,
                    angle: 45,
                    color: '00000020'
                }
            });
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            ...this.getTextStyle(theme, 'heading')
        });

        try {
            // Vérifier si les données du graphique sont valides
            if (!slideData.data || !slideData.data.labels || !slideData.data.datasets || slideData.data.datasets.length === 0) {
                throw new Error("Données du graphique invalides ou manquantes");
            }

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

            const chartType = chartTypeMap[slideData.chartType?.toLowerCase()] || pres.ChartType.bar;

            // Cadre élégant pour le graphique avec effet 3D si activé
            if (theme.design?.shadow) {
                slide.addShape(pres.ShapeType.roundRect, {
                    x: 0.4, y: 1.4, w: '95%', h: 4.7,
                    fill: { color: theme.colors.background },
                    line: { color: theme.colors.primary + '30', pt: 1.5 },
                    radius: cornerRadius,
                    shadow: {
                        type: 'outer',
                        blur: 15,
                        offset: 5,
                        angle: 45,
                        color: '00000025'
                    }
                });
            } else {
                slide.addShape(pres.ShapeType.roundRect, {
                    x: 0.5, y: 1.5, w: '95%', h: 4.5,
                    fill: { color: theme.colors.background },
                    line: { color: theme.colors.primary + '30', pt: 1.5 },
                    radius: cornerRadius
                });
            }

            // Préparer les données avec couleurs améliorées
            const chartColors = [
                theme.colors.primary,
                theme.colors.secondary,
                theme.colors.accent || '#00C851',
                '#8E24AA',  // Purple
                '#D81B60',  // Pink
                '#00897B',  // Teal
                '#FB8C00',  // Orange
                '#5E35B1'   // Deep Purple
            ];

            // Traiter les couleurs (peut être une seule couleur ou un tableau)
            const processColors = (dataset, index) => {
                if (dataset.color) {
                    if (Array.isArray(dataset.color)) {
                        return dataset.color;
                    } else {
                        return dataset.color;
                    }
                }
                return chartColors[index % chartColors.length];
            };

            const chartData = slideData.data.datasets.map((dataset, index) => ({
                name: dataset.name,
                labels: slideData.data?.labels || [],
                values: dataset.values,
                color: processColors(dataset, index)
            }));

            // Configuration du graphique avec style amélioré
            const chartOptions = {
                x: 0.7, y: 1.7, w: '90%', h: 4.0,
                showTitle: !!slideData.data.title,
                title: slideData.data.title || '',
                titleColor: theme.colors.text,
                titleFontSize: 16,
                titleBold: true,
                showLegend: true, // Toujours afficher la légende pour éviter les problèmes
                legendPos: 'b',
                legendColor: theme.colors.text, // Assurer la visibilité de la légende
                chartColors: chartData.map(d => d.color),
                chartColorsOpacity: 80, // Improved opacity for better visibility
                showValue: true,
                dataLabelFontSize: 12,
                dataLabelFontFace: theme.fonts.body,
                valAxisLabelColor: theme.colors.text, // Amélioration du contraste
                catAxisLabelColor: theme.colors.text, // Amélioration du contraste
                valAxisLabelFontSize: 10,
                catAxisLabelFontSize: 10,
                valAxisLabelFontFace: theme.fonts.body,
                catAxisLabelFontFace: theme.fonts.body,
                dataLabelColor: theme.colors.text,
                lineSize: 3, // Thicker lines for better visibility
                lineSmooth: true, // Smooth lines for modern look
                valGridLine: { color: theme.colors.textLight + '30', style: 'solid' },
                catGridLine: { color: theme.colors.textLight + '30', style: 'solid' },
                dataLabelFormatCode: '#,##0', // Format numbers with commas
                shadow: theme.design?.shadow ? { type: 'subtle', angle: 45, blur: 3, offset: 2 } : undefined
            };

            // Ajuster les options selon le type de graphique
            if (slideData.chartType === 'bar') {
                chartOptions['barDir'] = 'bar';
            } else if (slideData.chartType === 'column') {
                chartOptions['barDir'] = 'col';
            } else if (slideData.chartType === 'pie' || slideData.chartType === 'donut') {
                chartOptions['showValue'] = true;
                chartOptions['dataLabelFormatCode'] = '#,##0.0"%"';
                chartOptions['showPercent'] = true;

                if (slideData.chartType === 'donut') {
                    chartOptions['holeSize'] = 50; // 50% hole size for donut
                }
            }

            slide.addChart(chartType, chartData, chartOptions);

            // Ajouter l'insight si disponible, avec un design amélioré
            if (slideData.data.insight) {
                // Container for the insight with design based on theme
                if (theme.design?.shadow) {
                    slide.addShape(pres.ShapeType.roundRect, {
                        x: 0.5, y: 6.1, w: '95%', h: 1.0,
                        fill: { color: theme.colors.primary + '10' },
                        line: { color: theme.colors.primary + '30', pt: 1 },
                        radius: cornerRadius
                    });

                    // Light bulb icon for insight
                    slide.addShape(pres.ShapeType.ellipse, {
                        x: 0.7, y: 6.2, w: 0.6, h: 0.6,
                        fill: { color: theme.colors.secondary },
                        line: { type: 'none' }
                    });

                    // Light bulb top
                    slide.addShape(pres.ShapeType.rect, {
                        x: 0.95, y: 6.1, w: 0.1, h: 0.25,
                        fill: { color: theme.colors.secondary },
                        line: { type: 'none' }
                    });
                }

                slide.addText("Insight: " + slideData.data.insight, {
                    x: theme.design?.shadow ? 1.5 : 0.5,
                    y: 6.2,
                    w: theme.design?.shadow ? '85%' : '95%',
                    h: 0.8,
                    fontSize: 16,
                    fontFace: theme.fonts.body,
                    color: theme.colors.text,
                    italic: true,
                    align: pres.AlignH.left
                });
            }
        } catch (error) {
            console.error('Error creating chart:', error);
            // Afficher un message d'erreur élégant

            // Error container
            slide.addShape(pres.ShapeType.roundRect, {
                x: 2.0, y: 2.5, w: 9.0, h: 2.5,
                fill: { color: theme.colors.error + '15' },
                line: { color: theme.colors.error, pt: 1 },
                radius: cornerRadius
            });

            // Error icon
            slide.addShape(pres.ShapeType.ellipse, {
                x: 5.5, y: 3.0, w: 2.0, h: 2.0,
                fill: { color: theme.colors.error + '20' },
                line: { color: theme.colors.error, pt: 2 }
            });

            slide.addText("!", {
                x: 5.5, y: 3.0, w: 2.0, h: 2.0,
                fontSize: 60,
                color: theme.colors.error,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle,
                bold: true
            });

            slide.addText("Données du graphique indisponibles: " + error.message, {
                x: 0.5, y: 5.0, w: '95%', h: 1.0,
                fontSize: 18,
                color: theme.colors.error,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    private static createTableSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Vérifier si les données du tableau sont valides
            if (!slideData.table || !slideData.table.headers || !slideData.table.rows) {
                throw new Error("Données du tableau invalides ou manquantes");
            }

            // Préparer les données du tableau avec design amélioré
            const tableData = [
                // En-têtes avec style amélioré
                slideData.table.headers.map(header => ({
                    text: header,
                    options: {
                        bold: true,
                        fontSize: 18,
                        fontFace: theme.fonts.heading,
                        color: '#FFFFFF', // Texte blanc pour les en-têtes
                        fill: { color: theme.colors.primary },
                        align: pres.AlignH.center,
                        valign: pres.AlignV.middle
                    }
                })),
                // Lignes avec style alterné et mise en évidence
                ...slideData.table.rows.map((row, rowIndex) =>
                    row.map((cell, cellIndex) => {
                        // Déterminer si cette cellule doit être mise en évidence
                        const isEmphasis = slideData.table?.emphasis?.includes(rowIndex);

                        // Déterminer le style selon la position et l'emphase
                        let cellStyle = {
                            fontSize: 16,
                            fontFace: theme.fonts.body,
                            color: isEmphasis ? theme.colors.primary : theme.colors.text,
                            bold: isEmphasis,
                            fill: {
                                color: isEmphasis
                                    ? theme.colors.primary + '15'
                                    : rowIndex % 2 === 0
                                        ? theme.colors.background
                                        : theme.colors.primary + '05'
                            },
                            align: pres.AlignH.center,
                            valign: pres.AlignV.middle
                        };

                        return {
                            text: cell,
                            options: cellStyle
                        };
                    })
                )
            ];

            // Calculer la largeur optimale des colonnes
            const colCount = slideData.table.headers.length;
            const availWidth = 12.0; // Largeur disponible
            const colWidth = [];

            // Répartir l'espace également
            const width = availWidth / colCount;
            for (let i = 0; i < colCount; i++) {
                colWidth.push(width);
            }

            // Ajouter le tableau avec style amélioré
            slide.addTable(tableData, {
                x: 0.5,
                y: 1.7,
                w: '95%',
                colW: colWidth,
                border: { pt: 1, color: theme.colors.primary + '50' },
                margin: 0.1
            });
        } catch (error) {
            console.error('Error creating table:', error);
            slide.addText("Erreur d'affichage du tableau: " + error.message, {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.error,
                align: pres.AlignH.center
            });
        }
    }

    private static createComparisonSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Vérifier si les données de comparaison sont valides
            if (!slideData.comparison) {
                throw new Error("Données de comparaison manquantes");
            }

            // Colonnes de comparaison
            const leftX = 0.5;
            const rightX = 6.8;
            const colWidth = 5.8;

            // Colonne gauche
            slide.addShape(pres.ShapeType.roundRect, {
                x: leftX, y: 1.5, w: colWidth, h: 4.5,
                fill: { color: theme.colors.primary + '10' },
                line: { color: theme.colors.primary, pt: 2 },
                radius: 0.3
            });

            if (slideData.comparison.leftTitle) {
                // Banner pour le titre
                slide.addShape(pres.ShapeType.roundRect, {
                    x: leftX, y: 1.5, w: colWidth, h: 0.8,
                    fill: { color: theme.colors.primary },
                    line: { type: 'none' },
                    radius: [0.3, 0.3, 0, 0]
                });

                // Titre
                slide.addText(slideData.comparison.leftTitle, {
                    x: leftX + 0.3, y: 1.6, w: colWidth - 0.6, h: 0.6,
                    fontSize: 22,
                    fontFace: theme.fonts.heading,
                    color: '#FFFFFF', // Texte blanc pour meilleur contraste
                    bold: true,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });
            }

            // Points de la colonne gauche
            if (slideData.comparison.leftPoints && slideData.comparison.leftPoints.length > 0) {
                slideData.comparison.leftPoints.forEach((point, index) => {
                    // Texte du point
                    slide.addText(`✓ ${point}`, {
                        x: leftX + 0.5, y: 2.5 + (index * 0.7), w: colWidth - 1.0, h: 0.6,
                        fontSize: 16,
                        fontFace: theme.fonts.body,
                        color: theme.colors.text,
                        valign: pres.AlignV.middle
                    });
                });
            }

            // Colonne droite
            slide.addShape(pres.ShapeType.roundRect, {
                x: rightX, y: 1.5, w: colWidth, h: 4.5,
                fill: { color: theme.colors.secondary + '10' },
                line: { color: theme.colors.secondary, pt: 2 },
                radius: 0.3
            });

            if (slideData.comparison.rightTitle) {
                // Banner pour le titre
                slide.addShape(pres.ShapeType.roundRect, {
                    x: rightX, y: 1.5, w: colWidth, h: 0.8,
                    fill: { color: theme.colors.secondary },
                    line: { type: 'none' },
                    radius: [0.3, 0.3, 0, 0]
                });

                // Titre
                slide.addText(slideData.comparison.rightTitle, {
                    x: rightX + 0.3, y: 1.6, w: colWidth - 0.6, h: 0.6,
                    fontSize: 22,
                    fontFace: theme.fonts.heading,
                    color: '#FFFFFF', // Texte blanc pour meilleur contraste
                    bold: true,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });
            }

            // Points de la colonne droite
            if (slideData.comparison.rightPoints && slideData.comparison.rightPoints.length > 0) {
                slideData.comparison.rightPoints.forEach((point, index) => {
                    // Texte du point
                    slide.addText(`✓ ${point}`, {
                        x: rightX + 0.5, y: 2.5 + (index * 0.7), w: colWidth - 1.0, h: 0.6,
                        fontSize: 16,
                        fontFace: theme.fonts.body,
                        color: theme.colors.text,
                        valign: pres.AlignV.middle
                    });
                });
            }

            // VS au centre avec effet 3D
            slide.addShape(pres.ShapeType.ellipse, {
                x: 5.8, y: 3.3, w: 1.3, h: 1.3,
                fill: { color: theme.colors.accent || theme.colors.primary },
                line: { color: theme.colors.background, pt: 3 }
            });

            slide.addText('VS', {
                x: 5.8, y: 3.3, w: 1.3, h: 1.3,
                fontSize: 28,
                fontFace: theme.fonts.accent,
                color: theme.colors.background,
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });

            // Verdict ou conclusion
            if (slideData.comparison.verdict) {
                slide.addText(slideData.comparison.verdict, {
                    x: 1.5, y: 6.2, w: 10, h: 0.8,
                    fontSize: 18,
                    fontFace: theme.fonts.heading,
                    color: theme.colors.success || theme.colors.accent || theme.colors.primary,
                    bold: true,
                    align: pres.AlignH.center,
                    fill: { color: (theme.colors.success || theme.colors.accent || theme.colors.primary) + '20' },
                    line: { color: theme.colors.success || theme.colors.accent || theme.colors.primary, pt: 2 },
                    margin: 0.1
                });
            }
        } catch (error) {
            console.error('Error creating comparison slide:', error);
            slide.addText("Erreur d'affichage de la comparaison: " + error.message, {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.error,
                align: pres.AlignH.center
            });
        }
    }

    private static createProcessSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Vérifier si les données du processus sont valides
            if (!slideData.process || !slideData.process.steps || slideData.process.steps.length === 0) {
                throw new Error("Données du processus invalides ou manquantes");
            }

            // Ligne de flux du processus
            slide.addShape(pres.ShapeType.rect, {
                x: 0.5, y: 2.5, w: 12, h: 0.1,
                fill: { color: theme.colors.primary },
                line: { type: 'none' }
            });

            const steps = slideData.process.steps;
            const stepWidth = 11.0 / steps.length;
            const startY = 1.8;

            steps.forEach((step, index) => {
                const xPos = 0.8 + (index * stepWidth);
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
                        fill: { color: theme.colors.accent || theme.colors.secondary },
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
                    color: theme.colors.text, // Amélioration du contraste
                    align: pres.AlignH.center,
                    valign: pres.AlignV.top
                });
            });
        } catch (error) {
            console.error('Error creating process slide:', error);
            slide.addText("Erreur d'affichage du processus: " + error.message, {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.error,
                align: pres.AlignH.center
            });
        }
    }

    private static createTimelineSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        try {
            // Vérifier si les événements sont valides
            if (!slideData.events || slideData.events.length === 0) {
                throw new Error("Données de chronologie manquantes");
            }

            // Ligne de temps principale
            slide.addShape(pres.ShapeType.rect, {
                x: 0.5, y: 3.7, w: 12, h: 0.15,
                fill: { color: theme.colors.primary },
                line: { type: 'none' }
            });

            // Événements
            const eventsCount = slideData.events.length;
            const spacing = 11 / (eventsCount - 1 || 1);

            slideData.events.forEach((event, index) => {
                const xPos = 1.0 + (index * spacing);
                const isEven = index % 2 === 0;
                const yOffset = isEven ? -1.7 : 1.0;

                // Point sur la timeline
                slide.addShape(pres.ShapeType.ellipse, {
                    x: xPos - 0.25, y: 3.58, w: 0.5, h: 0.5,
                    fill: { color: theme.colors.secondary },
                    line: { color: theme.colors.primary, pt: 2 }
                });

                // Date avec meilleure visibilité
                slide.addShape(pres.ShapeType.roundRect, {
                    x: xPos - 0.7, y: 3.7 + (isEven ? 0.2 : -0.7), w: 1.4, h: 0.4,
                    fill: { color: theme.colors.primary + '20' },
                    line: { color: theme.colors.primary, pt: 1 },
                    radius: 0.2
                });

                slide.addText(event.date, {
                    x: xPos - 0.7, y: 3.7 + (isEven ? 0.2 : -0.7), w: 1.4, h: 0.4,
                    fontSize: 12,
                    fontFace: theme.fonts.heading,
                    color: theme.colors.primary,
                    bold: true,
                    align: pres.AlignH.center,
                    valign: pres.AlignV.middle
                });

                // Boîte d'événement
                const boxY = isEven ? 1.7 : 4.3;
                slide.addShape(pres.ShapeType.roundRect, {
                    x: xPos - 1.5, y: boxY, w: 3.0, h: 1.5,
                    fill: { color: theme.colors.background },
                    line: { color: isEven ? theme.colors.primary : theme.colors.secondary, pt: 1.5 },
                    radius: 0.3
                });

                // Ligne de connexion
                slide.addShape(pres.ShapeType.line, {
                    x: xPos, y: 3.7, w: 0, h: yOffset,
                    line: { color: theme.colors.primary, pt: 1, dashType: 'dash' }
                });

                // Titre de l'événement avec fond coloré
                if (event.title) {
                    slide.addShape(pres.ShapeType.roundRect, {
                        x: xPos - 1.4, y: boxY + 0.1, w: 2.8, h: 0.5,
                        fill: { color: isEven ? theme.colors.primary + '20' : theme.colors.secondary + '20' },
                        line: { type: 'none' },
                        radius: [0.2, 0.2, 0, 0]
                    });

                    slide.addText(event.title, {
                        x: xPos - 1.4, y: boxY + 0.1, w: 2.8, h: 0.5,
                        fontSize: 14,
                        fontFace: theme.fonts.heading,
                        color: isEven ? theme.colors.primary : theme.colors.secondary,
                        bold: true,
                        align: pres.AlignH.center,
                        valign: pres.AlignV.middle
                    });

                    // Description
                    slide.addText(event.description, {
                        x: xPos - 1.4, y: boxY + 0.6, w: 2.8, h: 0.8,
                        fontSize: 12,
                        fontFace: theme.fonts.body,
                        color: theme.colors.text,
                        align: pres.AlignH.center
                    });
                } else {
                    // Si pas de titre, utiliser la description comme titre
                    slide.addText(event.description, {
                        x: xPos - 1.4, y: boxY + 0.1, w: 2.8, h: 1.3,
                        fontSize: 13,
                        fontFace: theme.fonts.body,
                        color: theme.colors.text,
                        align: pres.AlignH.center,
                        valign: pres.AlignV.middle
                    });
                }
            });
        } catch (error) {
            console.error('Error creating timeline slide:', error);
            slide.addText("Erreur d'affichage de la chronologie: " + error.message, {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                color: theme.colors.error,
                align: pres.AlignH.center
            });
        }
    }

    private static createConclusionSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Arrière-plan gradienté
        slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: '100%',
            fill: { color: theme.colors.background },
            line: { type: 'none' }
        });

        // Titre avec emphase
        slide.addText(slideData.title, {
            x: 0.5, y: 1, w: '95%', h: 1,
            fontSize: 36,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true,
            align: pres.AlignH.center
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
                fill: { color: theme.colors.secondary },
                line: { type: 'none' }
            });

            slide.addText(slideData.finalStatement, {
                x: 1, y: 5.5, w: '85%', h: 1.2,
                fontSize: 24,
                fontFace: theme.fonts.heading,
                color: '#FFFFFF', // Texte blanc pour meilleur contraste
                bold: true,
                align: pres.AlignH.center,
                valign: pres.AlignV.middle
            });
        }
    }

    private static createQuoteSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

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
            valign: pres.AlignV.middle
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

    private static createImageSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 32,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Zone d'image placeholder améliorée
        slide.addShape(pres.ShapeType.rect, {
            x: 1.5, y: 1.5, w: 10, h: 4.5,
            fill: { color: theme.colors.background },
            line: { color: theme.colors.primary, pt: 2, dashType: 'dash' }
        });

        // Icône d'image
        slide.addShape(pres.ShapeType.rect, {
            x: 5.5, y: 3, w: 2, h: 1.5,
            fill: { color: theme.colors.primary + '20' },
            line: { color: theme.colors.primary, pt: 1 }
        });

        slide.addText('Image à ajouter', {
            x: 1.5, y: 3.5, w: 10, h: 0.5,
            fontSize: 20,
            fontFace: theme.fonts.body,
            color: theme.colors.primary,
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

    private static createBasicSlide(pres: any, slideData: PowerPointSlide, theme: any, options: any = {}) {
        const slide = pres.addSlide(options);

        // Appliquer un motif d'arrière-plan
        if (slideData.design?.background) {
            this.createBackgroundPattern(pres, slide, slideData.design.background, theme.colors.primary);
        }

        // Titre avec style amélioré
        slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '95%', h: 0.8,
            fontSize: 28,
            fontFace: theme.fonts.heading,
            color: theme.colors.primary,
            bold: true
        });

        // Contenu avec mise en page élégante
        if (slideData.content && slideData.content.length > 0) {
            // Traiter le contenu comme des paragraphes
            const contentText = slideData.content.join('\n\n');

            slide.addText(contentText, {
                x: 0.5, y: 1.5, w: '95%', h: 4.5,
                fontSize: 18,
                fontFace: theme.fonts.body,
                color: theme.colors.text,
                lineSpacing: 32
            });
        } else {
            // Message si aucun contenu n'est défini
            slide.addText("Contenu à définir", {
                x: 0.5, y: 3.0, w: '95%', h: 1.0,
                fontSize: 20,
                fontFace: theme.fonts.body,
                color: theme.colors.textLight,
                align: pres.AlignH.center,
                italic: true
            });
        }
    }

    // Fonctions utilitaires

    // Méthode utilitaire pour obtenir le rayon de coin approprié selon le style du thème
    private static getCornerRadius(cornerRounding: string): number {
        switch(cornerRounding) {
            case 'none': return 0;
            case 'low': return 0.1;
            case 'medium': return 0.2;
            case 'high': return 0.4;
            default: return 0.2;
        }
    }

    // Méthode utilitaire pour obtenir l'épaisseur de bordure appropriée selon le style du thème
    private static getBorderThickness(theme: any): number {
        switch(theme.design?.cornerRounding) {
            case 'none': return 0;
            case 'low': return 0.5;
            case 'medium': return 1;
            case 'high': return 1.5;
            default: return 1;
        }
    }

    // Méthode utilitaire pour appliquer une ombre si nécessaire
    private static applyShadowIfNeeded(theme: any, intensity: 'light' | 'medium' | 'strong' = 'medium') {
        if (!theme.design?.shadow) return undefined;

        const shadowIntensity = {
            light: { blur: 5, offset: 2, opacity: '15' },
            medium: { blur: 10, offset: 3, opacity: '25' },
            strong: { blur: 15, offset: 5, opacity: '35' }
        };

        const settings = shadowIntensity[intensity];

        return {
            type: 'outer',
            blur: settings.blur,
            offset: settings.offset,
            angle: 45,
            color: '000000' + settings.opacity
        };
    }

    // Méthode utilitaire pour créer un style de texte cohérent
    private static getTextStyle(theme: any, type: 'heading' | 'subheading' | 'body' | 'accent', options: any = {}) {
        const styles = {
            heading: {
                fontSize: options.fontSize || 32,
                fontFace: theme.fonts.heading,
                color: theme.colors.primary,
                bold: true
            },
            subheading: {
                fontSize: options.fontSize || 24,
                fontFace: theme.fonts.heading,
                color: theme.colors.secondary,
                bold: true
            },
            body: {
                fontSize: options.fontSize || 18,
                fontFace: theme.fonts.body,
                color: theme.colors.text
            },
            accent: {
                fontSize: options.fontSize || 20,
                fontFace: theme.fonts.accent,
                color: theme.colors.accent || theme.colors.secondary,
                italic: options.italic !== undefined ? options.italic : true
            }
        };

        return {
            ...styles[type],
            ...options,
            shadow: this.applyShadowIfNeeded(theme, options.shadowIntensity)
        };
    }

    private static getChartColor(index: number, theme: any): string {
        const colors = [
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.accent || '#00C851',
            theme.colors.success || '#00C851',
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
