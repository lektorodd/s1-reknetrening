// Internationalization system for Derivasjonstrening v3
// Supports Norwegian (nn), English (en), Spanish (es)

export type Lang = 'nn' | 'en' | 'es';

export interface I18nStrings {
	// Navigation
	nav_dashboard: string;
	nav_theory: string;
	nav_guided: string;
	nav_practice: string;
	nav_stats: string;
	nav_help: string;

	// Dashboard
	dash_welcome: string;
	dash_subtitle: string;
	dash_focus_header: string;
	dash_focus_desc: string;
	mode_mix_title: string;
	mode_mix_desc: string;
	dash_guided_header: string;
	dash_guided_desc: string;
	dash_guided_link: string;

	// Topics
	topic_chain: string;
	topic_product: string;
	topic_quotient: string;

	// Buttons
	btn_start_focus: string;
	btn_start_mix: string;
	btn_solution: string;
	btn_hide: string;
	btn_mastered: string;
	btn_practice: string;
	btn_hint: string;
	btn_hide_hint: string;
	btn_draw_focus: string;
	btn_new_mix: string;
	btn_new_focus: string;

	// Chart labels
	chart_mastered: string;
	chart_practice: string;
	chart_pending: string;

	// Theory
	theory_formula: string;
	theory_explanation: string;

	// Practice
	practice_subtitle_mix: string;
	label_mix: string;
	hint_title: string;
	label_recommended: string;
	mix_end_text: string;
	focus_end_text: string;

	// Stats
	stat_total_attempted: string;
	stat_mastery_rate: string;
	stat_hint_usage: string;
	stat_chart_total: string;
	stat_chart_topic: string;
	stat_chart_level: string;
	stat_due_review: string;
	stat_success_rate: string;
	stat_confidence_map: string;
	stat_session_history: string;
	stat_review_schedule: string;
	stat_due_now: string;
	stat_due_tomorrow: string;
	stat_due_week: string;
	stat_streak: string;
	stat_practice_now: string;
	stat_never_attempted: string;
	stat_last_seen: string;
	stat_next_review: string;

	// Filters
	filter_rule: string;
	filter_levels: string;
	filter_types: string;

	// Problem types
	type_poly: string;
	type_root: string;
	type_exp: string;
	type_log: string;

	// Help
	help_title: string;
	help_focus_title: string;
	help_focus_desc: string;
	help_mix_title: string;
	help_mix_desc: string;
	help_stats_title: string;
	help_stats_desc: string;

	// Generic labels
	label_level: string;
	label_problems_count: string;
	no_problems_found: string;
	label_about: string;
	label_about_version: string;
	label_about_design: string;

	// Guidance fading
	fading_study: string;
	fading_last_step: string;
	fading_last_two: string;
	fading_apply: string;
	fading_independent: string;
	fading_reveal: string;
	fading_your_turn: string;
	fading_badge_guided: string;
	fading_badge_solo: string;
	guided_more_support: string;
	guided_less_support: string;
	guided_next_problem: string;
	guided_problem_of: string;
	guided_complete_title: string;
	guided_complete_desc: string;
	guided_new_round: string;
	guided_to_arena: string;
	guided_other_topic: string;
	theory_pattern: string;
	theory_think_aloud: string;
	theory_mnemonic: string;
	theory_worked_example: string;
	self_explain_title: string;
	self_explain_correct: string;
	self_explain_wrong: string;

	// Landing page
	landing_title: string;
	landing_subtitle: string;
	landing_principles_title: string;
	landing_principle_srs: string;
	landing_principle_srs_desc: string;
	landing_principle_fading: string;
	landing_principle_fading_desc: string;
	landing_principle_adaptive: string;
	landing_principle_adaptive_desc: string;
	landing_choose_module: string;

	// Module names (short)
	module_derivative_name: string;
	module_logarithm_name: string;

	// Logarithm topics
	topic_log_product: string;
	topic_log_quotient: string;
	topic_log_power: string;
	topic_log_simplify: string;
	topic_log_equation: string;
	topic_exp_equation: string;

	// Navigation
	nav_back_modules: string;
}

const nn: I18nStrings = {
	nav_dashboard: 'Oversikt',
	nav_theory: 'Teoribank',
	nav_guided: 'Rettleia Øving',
	nav_practice: 'Treningsarena',
	nav_stats: 'Min Statistikk',
	nav_help: 'Hjelp',
	dash_welcome: 'Velkommen!',
	dash_subtitle: 'Hva vil du trene på i dag?',
	dash_focus_header: 'Fokustrening',
	dash_focus_desc: 'Velg selv regel, nivå og type. Perfekt for mengdetrening.',
	mode_mix_title: 'Smart Miks',
	mode_mix_desc: 'Algoritmen finner dine svake sider og gir deg en blanding.',
	dash_guided_header: 'Rettleia Øving',
	dash_guided_desc: 'Steg-for-steg oppgåver med gradvis mindre støtte.',
	dash_guided_link: 'Start øving →',
	topic_chain: 'Kjerneregelen',
	topic_product: 'Produktregelen',
	topic_quotient: 'Brøkregelen',
	btn_start_focus: 'Gå til Fokus',
	btn_start_mix: 'Start Trening',
	btn_solution: 'Vis Fasit',
	btn_hide: 'Skjul Fasit',
	btn_mastered: 'Fikk det til',
	btn_practice: 'Trenger øving',
	btn_hint: 'Hint',
	btn_hide_hint: 'Skjul Hint',
	btn_draw_focus: 'Trekk 5 oppgaver',
	btn_new_mix: 'Prøv 5 nye oppgaver',
	btn_new_focus: 'Trekk 5 nye (samme filtre)',
	chart_mastered: 'Mestret',
	chart_practice: 'Må øves',
	chart_pending: 'Ikke startet',
	theory_formula: 'Formel',
	theory_explanation: 'Forklaring',
	practice_subtitle_mix: 'Smart Miks – Tilpasset deg',
	label_mix: '???',
	hint_title: 'Hjelp på veien',
	label_recommended: 'Anbefalt',
	mix_end_text: 'Ferdig med denne runden?',
	focus_end_text: 'Vil du ha flere av samme type?',
	stat_total_attempted: 'Utført',
	stat_mastery_rate: 'Mestring',
	stat_hint_usage: 'Hint Brukt',
	stat_chart_total: 'Total Oversikt',
	stat_chart_topic: 'Ferdighet per Emne',
	stat_chart_level: 'Ferdighet per Nivå',
	stat_due_review: 'Klar for repetisjon',
	stat_success_rate: 'Treffsikkerheit',
	stat_confidence_map: 'Mestringsgrad per emne',
	stat_session_history: 'Økthistorikk',
	stat_review_schedule: 'Repetisjonsplan',
	stat_due_now: 'Forfalt no',
	stat_due_tomorrow: 'I morgon',
	stat_due_week: 'Neste 7 dagar',
	stat_streak: 'Rekke',
	stat_practice_now: 'Øv no',
	stat_never_attempted: 'Ikkje prøvd',
	stat_last_seen: 'Sist sett',
	stat_next_review: 'Neste repetisjon',
	filter_rule: 'Regel',
	filter_levels: 'Vanskelighetsgrad',
	filter_types: 'Matematisk Område',
	type_poly: 'Polynomer',
	type_root: 'Røtter',
	type_exp: 'Eksponential',
	type_log: 'Logaritmer',
	help_title: 'Hjelp & Informasjon',
	help_focus_title: 'Fokustrening',
	help_focus_desc: 'Her kan du skreddersy din egen økt. Velg hvilken regel du vil øve på, hvilke vanskelighetsgrader (1–5) og hvilke typer funksjoner. Trykk «Trekk oppgaver» for å generere 5 unike oppgaver som passer dine valg.',
	help_mix_title: 'Smart Miks',
	help_mix_desc: 'Dette er «den smarte læreren». Algoritmen ser på hva du har gjort før. Hvis du markerer oppgaver som «Trenger øving», vil Smart Miks gi deg flere av disse oppgavene senere. Den prioriterer også emner du har gjort lite av.',
	help_stats_title: 'Statistikk & Progresjon',
	help_stats_desc: '«Mestret» betyr at du føler deg trygg på oppgaven. «Trenger øving» betyr at du vil se den igjen senere. Statistikken viser deg hvor du er sterk og hvor du bør legge inn en ekstra innsats.',
	label_level: 'Nivå',
	label_problems_count: 'oppgaver',
	no_problems_found: 'Ingen oppgaver funnet med disse filtrene.',
	label_about: 'Om Derivasjonstrening',
	label_about_version: 'Versjon 3.0 – bygget med SvelteKit og kognitiv vitenskap.',
	label_about_design: 'Designsystem:',
	fading_study: 'Studer dette løysingseksempelet nøye.',
	fading_last_step: 'Fullfør siste steg sjølv!',
	fading_last_two: 'Fullfør dei to siste stega sjølv!',
	fading_apply: 'Bruk regelen og forenkle sjølv!',
	fading_independent: 'Løys oppgåva heilt sjølv!',
	fading_reveal: 'Vis løysing',
	fading_your_turn: 'Din tur!',
	fading_badge_guided: 'Rettleia',
	fading_badge_solo: 'Sjølvstendig',
	guided_more_support: '← Meir støtte',
	guided_less_support: 'Mindre →',
	guided_next_problem: 'Neste oppgåve →',
	guided_problem_of: 'av',
	guided_complete_title: 'Runde fullført! 🎉',
	guided_complete_desc: 'Du har gjennomført ein komplett fading-sti.',
	guided_new_round: '🔄 Ny runde',
	guided_to_arena: '💪 Treningsarena',
	guided_other_topic: '📚 Anna tema',
	theory_pattern: 'Korleis kjenner du det att?',
	theory_think_aloud: '💭 Tenke høgt',
	theory_mnemonic: '💡 Hugseregel',
	theory_worked_example: 'Gjennomgang steg for steg',
	self_explain_title: 'Refleksjonsspørsmål',
	self_explain_correct: 'Riktig! 🎯',
	self_explain_wrong: 'Ikkje heilt — prøv igjen!',
	landing_title: 'Mattetrening',
	landing_subtitle: 'Forskingsbasert øving med tilpassa repetisjon',
	landing_principles_title: 'Slik fungerer det',
	landing_principle_srs: 'Mellomromsrepetisjon',
	landing_principle_srs_desc: 'Algoritmen minner deg på det du er i ferd med å gløyme — akkurat til rett tid.',
	landing_principle_fading: 'Gradvis meistring',
	landing_principle_fading_desc: 'Start med gjennomgang, deretter fyller du inn stadig meir sjølv.',
	landing_principle_adaptive: 'Tilpassa vanskegrad',
	landing_principle_adaptive_desc: 'Oppgåvene tilpassar seg ditt nivå automatisk.',
	landing_choose_module: 'Vel eit emne',
	module_derivative_name: 'Derivasjon',
	module_logarithm_name: 'Logaritmar',
	topic_log_product: 'Produktsetningen',
	topic_log_quotient: 'Kvotientsetningen',
	topic_log_power: 'Potenssetningen',
	topic_log_simplify: 'Forenkle',
	topic_log_equation: 'Logaritmiske likningar',
	topic_exp_equation: 'Eksponentiallikningar',
	nav_back_modules: '← Alle emne'
};

const en: I18nStrings = {
	nav_dashboard: 'Dashboard',
	nav_theory: 'Theory Bank',
	nav_guided: 'Guided Practice',
	nav_practice: 'Practice Arena',
	nav_stats: 'My Stats',
	nav_help: 'Help',
	dash_welcome: 'Welcome!',
	dash_subtitle: 'What to practice today?',
	dash_focus_header: 'Focus Training',
	dash_focus_desc: 'Choose rule, level and type yourself. Perfect for targeted practice.',
	mode_mix_title: 'Smart Mix',
	mode_mix_desc: 'The algorithm finds your weak spots and gives you a tailored set.',
	dash_guided_header: 'Guided Practice',
	dash_guided_desc: 'Step-by-step problems with gradually less support.',
	dash_guided_link: 'Start practice →',
	topic_chain: 'Chain Rule',
	topic_product: 'Product Rule',
	topic_quotient: 'Quotient Rule',
	btn_start_focus: 'Go to Focus',
	btn_start_mix: 'Start Training',
	btn_solution: 'Show Answer',
	btn_hide: 'Hide Answer',
	btn_mastered: 'Got it!',
	btn_practice: 'Need Practice',
	btn_hint: 'Hint',
	btn_hide_hint: 'Hide Hint',
	btn_draw_focus: 'Draw 5 Problems',
	btn_new_mix: 'Try 5 New Tasks',
	btn_new_focus: 'Draw 5 New (Same Filters)',
	chart_mastered: 'Mastered',
	chart_practice: 'Needs Work',
	chart_pending: 'Not Started',
	theory_formula: 'Formula',
	theory_explanation: 'Explanation',
	practice_subtitle_mix: 'Smart Mix – Adaptive',
	label_mix: '???',
	hint_title: 'Quick Tip',
	label_recommended: 'Recommended',
	mix_end_text: 'Done with this set?',
	focus_end_text: 'Want more of the same?',
	stat_total_attempted: 'Completed',
	stat_mastery_rate: 'Mastery',
	stat_hint_usage: 'Hint Usage',
	stat_chart_total: 'Progress',
	stat_chart_topic: 'Skill per Topic',
	stat_chart_level: 'Skill per Level',
	stat_due_review: 'Due for review',
	stat_success_rate: 'Success rate',
	stat_confidence_map: 'Concept Confidence',
	stat_session_history: 'Session History',
	stat_review_schedule: 'Review Schedule',
	stat_due_now: 'Due now',
	stat_due_tomorrow: 'Due tomorrow',
	stat_due_week: 'Next 7 days',
	stat_streak: 'Streak',
	stat_practice_now: 'Practice now',
	stat_never_attempted: 'Not attempted',
	stat_last_seen: 'Last seen',
	stat_next_review: 'Next review',
	filter_rule: 'Rule',
	filter_levels: 'Levels',
	filter_types: 'Math Area',
	type_poly: 'Polynomials',
	type_root: 'Roots',
	type_exp: 'Exponential',
	type_log: 'Logarithms',
	help_title: 'Help & Info',
	help_focus_title: 'Focus Training',
	help_focus_desc: 'Customise your own session. Choose which rule to practice, difficulty levels (1–5), and function types. Press "Draw problems" to generate 5 unique problems matching your filters.',
	help_mix_title: 'Smart Mix',
	help_mix_desc: 'This is the "smart teacher." The algorithm looks at what you\'ve done before. If you mark problems as "Need Practice," Smart Mix will give you more of them later. It also prioritises topics you\'ve done less of.',
	help_stats_title: 'Stats & Progression',
	help_stats_desc: '"Mastered" means you feel confident. "Need Practice" means you want to see it again. Stats show where you\'re strong and where to focus more effort.',
	label_level: 'Level',
	label_problems_count: 'problems',
	no_problems_found: 'No problems found with these filters.',
	label_about: 'About Derivasjonstrening',
	label_about_version: 'Version 3.0 – built with SvelteKit and cognitive science.',
	label_about_design: 'Design system:',
	fading_study: 'Study this worked example carefully.',
	fading_last_step: 'Complete the last step yourself!',
	fading_last_two: 'Complete the last two steps yourself!',
	fading_apply: 'Apply the rule and simplify yourself!',
	fading_independent: 'Solve the problem independently!',
	fading_reveal: 'Show Solution',
	fading_your_turn: 'Your turn!',
	fading_badge_guided: 'Guided',
	fading_badge_solo: 'Independent',
	guided_more_support: '← More support',
	guided_less_support: 'Less →',
	guided_next_problem: 'Next problem →',
	guided_problem_of: 'of',
	guided_complete_title: 'Round complete! 🎉',
	guided_complete_desc: 'You completed a full fading path.',
	guided_new_round: '🔄 New round',
	guided_to_arena: '💪 Training arena',
	guided_other_topic: '📚 Other topic',
	theory_pattern: 'How do you recognize it?',
	theory_think_aloud: '💭 Think aloud',
	theory_mnemonic: '💡 Memory aid',
	theory_worked_example: 'Step-by-step walkthrough',
	self_explain_title: 'Reflection Question',
	self_explain_correct: 'Correct! 🎯',
	self_explain_wrong: 'Not quite — try again!',
	landing_title: 'Mattetrening',
	landing_subtitle: 'Research-based practice with adaptive repetition',
	landing_principles_title: 'How it works',
	landing_principle_srs: 'Spaced Repetition',
	landing_principle_srs_desc: 'The algorithm reminds you of what you\'re about to forget — at exactly the right time.',
	landing_principle_fading: 'Guided Mastery',
	landing_principle_fading_desc: 'Start with walkthroughs, then gradually fill in more on your own.',
	landing_principle_adaptive: 'Adaptive Difficulty',
	landing_principle_adaptive_desc: 'Problems adapt to your level automatically.',
	landing_choose_module: 'Choose a topic',
	module_derivative_name: 'Derivatives',
	module_logarithm_name: 'Logarithms',
	topic_log_product: 'Product Rule',
	topic_log_quotient: 'Quotient Rule',
	topic_log_power: 'Power Rule',
	topic_log_simplify: 'Simplify',
	topic_log_equation: 'Logarithmic Equations',
	topic_exp_equation: 'Exponential Equations',
	nav_back_modules: '← All topics'
};

const es: I18nStrings = {
	nav_dashboard: 'Tablero',
	nav_theory: 'Teoría',
	nav_guided: 'Práctica Guiada',
	nav_practice: 'Arena de Práctica',
	nav_stats: 'Mis Estadísticas',
	nav_help: 'Ayuda',
	dash_welcome: '¡Bienvenido!',
	dash_subtitle: '¿Qué quieres practicar hoy?',
	dash_focus_header: 'Entrenamiento Enfocado',
	dash_focus_desc: 'Elige regla, nivel y tipo tú mismo. Perfecto para práctica dirigida.',
	mode_mix_title: 'Mezcla Inteligente',
	mode_mix_desc: 'El algoritmo encuentra tus debilidades y te da una mezcla personalizada.',
	dash_guided_header: 'Práctica Guiada',
	dash_guided_desc: 'Problemas paso a paso con apoyo gradualmente menor.',
	dash_guided_link: 'Iniciar práctica →',
	topic_chain: 'Regla de la Cadena',
	topic_product: 'Regla del Producto',
	topic_quotient: 'Regla del Cociente',
	btn_start_focus: 'Ir a Enfoque',
	btn_start_mix: 'Empezar',
	btn_solution: 'Ver Solución',
	btn_hide: 'Ocultar Solución',
	btn_mastered: '¡Lo tengo!',
	btn_practice: 'Necesito Práctica',
	btn_hint: 'Pista',
	btn_hide_hint: 'Ocultar Pista',
	btn_draw_focus: 'Extraer 5 Problemas',
	btn_new_mix: 'Prueba 5 Nuevas',
	btn_new_focus: 'Extraer 5 Nuevas (Mismos Filtros)',
	chart_mastered: 'Dominado',
	chart_practice: 'Necesita Práctica',
	chart_pending: 'Pendiente',
	theory_formula: 'Fórmula',
	theory_explanation: 'Explicación',
	practice_subtitle_mix: 'Mezcla Inteligente – Adaptativa',
	label_mix: '???',
	hint_title: 'Pista',
	label_recommended: 'Recomendado',
	mix_end_text: '¿Terminaste con este grupo?',
	focus_end_text: '¿Quieres más del mismo tipo?',
	stat_total_attempted: 'Completado',
	stat_mastery_rate: 'Dominio',
	stat_hint_usage: 'Uso de Pistas',
	stat_chart_total: 'Progreso Total',
	stat_chart_topic: 'Habilidad por Tema',
	stat_chart_level: 'Habilidad por Nivel',
	stat_due_review: 'Listo para repasar',
	stat_success_rate: 'Tasa de éxito',
	stat_confidence_map: 'Confianza por Concepto',
	stat_session_history: 'Historial de Sesiones',
	stat_review_schedule: 'Plan de Repaso',
	stat_due_now: 'Pendiente ahora',
	stat_due_tomorrow: 'Mañana',
	stat_due_week: 'Próximos 7 días',
	stat_streak: 'Racha',
	stat_practice_now: 'Practicar ahora',
	stat_never_attempted: 'Sin intentar',
	stat_last_seen: 'Visto por última vez',
	stat_next_review: 'Próximo repaso',
	filter_rule: 'Regla',
	filter_levels: 'Niveles',
	filter_types: 'Área Matemática',
	type_poly: 'Polinomios',
	type_root: 'Raíces',
	type_exp: 'Exponencial',
	type_log: 'Logaritmos',
	help_title: 'Ayuda e Información',
	help_focus_title: 'Entrenamiento Enfocado',
	help_focus_desc: 'Personaliza tu sesión. Elige qué regla practicar, niveles de dificultad (1–5) y tipos de funciones. Presiona "Extraer problemas" para generar 5 problemas únicos.',
	help_mix_title: 'Mezcla Inteligente',
	help_mix_desc: 'Este es el "profesor inteligente". El algoritmo analiza lo que has hecho antes. Si marcas problemas como "Necesito Práctica", la Mezcla Inteligente te dará más de estos después.',
	help_stats_title: 'Estadísticas y Progresión',
	help_stats_desc: '"Dominado" significa que te sientes seguro. "Necesita Práctica" significa que quieres verlo de nuevo. Las estadísticas muestran dónde eres fuerte y dónde enfocarte más.',
	label_level: 'Nivel',
	label_problems_count: 'problemas',
	no_problems_found: 'No se encontraron problemas con estos filtros.',
	label_about: 'Sobre Derivasjonstrening',
	label_about_version: 'Versión 3.0 – hecho con SvelteKit y ciencia cognitiva.',
	label_about_design: 'Sistema de diseño:',
	fading_study: 'Estudia este ejemplo resuelto con cuidado.',
	fading_last_step: '¡Completa el último paso tú mismo!',
	fading_last_two: '¡Completa los dos últimos pasos tú mismo!',
	fading_apply: '¡Aplica la regla y simplifica tú mismo!',
	fading_independent: '¡Resuelve el problema de forma independiente!',
	fading_reveal: 'Mostrar Solución',
	fading_your_turn: '¡Tu turno!',
	fading_badge_guided: 'Guiado',
	fading_badge_solo: 'Independiente',
	guided_more_support: '← Más apoyo',
	guided_less_support: 'Menos →',
	guided_next_problem: 'Siguiente →',
	guided_problem_of: 'de',
	guided_complete_title: '¡Ronda completa! 🎉',
	guided_complete_desc: 'Has completado un camino de desvanecimiento.',
	guided_new_round: '🔄 Nueva ronda',
	guided_to_arena: '💪 Arena de práctica',
	guided_other_topic: '📚 Otro tema',
	theory_pattern: '¿Cómo lo reconoces?',
	theory_think_aloud: '💭 Pensar en voz alta',
	theory_mnemonic: '💡 Regla mnemotécnica',
	theory_worked_example: 'Paso a paso',
	self_explain_title: 'Pregunta de Reflexión',
	self_explain_correct: '¡Correcto! 🎯',
	self_explain_wrong: 'No exactamente — ¡inténtalo de nuevo!',
	landing_title: 'Mattetrening',
	landing_subtitle: 'Práctica basada en investigación con repetición adaptativa',
	landing_principles_title: 'Cómo funciona',
	landing_principle_srs: 'Repetición Espaciada',
	landing_principle_srs_desc: 'El algoritmo te recuerda lo que estás por olvidar — justo a tiempo.',
	landing_principle_fading: 'Dominio Guiado',
	landing_principle_fading_desc: 'Comienza con recorridos, luego completa cada vez más por tu cuenta.',
	landing_principle_adaptive: 'Dificultad Adaptativa',
	landing_principle_adaptive_desc: 'Los problemas se adaptan a tu nivel automáticamente.',
	landing_choose_module: 'Elige un tema',
	module_derivative_name: 'Derivadas',
	module_logarithm_name: 'Logaritmos',
	topic_log_product: 'Regla del Producto',
	topic_log_quotient: 'Regla del Cociente',
	topic_log_power: 'Regla de la Potencia',
	topic_log_simplify: 'Simplificar',
	topic_log_equation: 'Ecuaciones Logarítmicas',
	topic_exp_equation: 'Ecuaciones Exponenciales',
	nav_back_modules: '← Todos los temas'
};

const translations: Record<Lang, I18nStrings> = { nn, en, es };

export function t(lang: Lang, key: keyof I18nStrings): string {
	return translations[lang]?.[key] ?? key;
}

export function getStrings(lang: Lang): I18nStrings {
	return translations[lang] ?? translations.nn;
}

export const LANG_FLAGS: Record<Lang, string> = {
	nn: '🇳🇴',
	en: '🇬🇧',
	es: '🇪🇸'
};

export const AVAILABLE_LANGS: Lang[] = ['nn', 'en', 'es'];
