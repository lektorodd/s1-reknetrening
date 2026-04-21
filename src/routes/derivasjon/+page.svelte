<script lang="ts">
	import { onMount } from 'svelte';
	import { getStrings, type Lang } from '$lib/i18n';
	import { generateProblemBank, type Problem, type TopicId, type ProblemType } from '$lib/modules/derivative/generator';
	import type { ProblemStatus, ViewId } from '$lib/stores';
	import { saveProgress, saveHints, saveLanguage } from '$lib/stores';
	import * as storage from '$lib/utils/storage';
	import { typesetMath } from '$lib/utils/mathjax';
	import {
		loadStudentModel, saveStudentModel,
		conceptIdFromProblem, getSuccessRate, getDueCount,
		type StudentModel
	} from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
	import { selectNextProblems } from '$lib/engine/problem-selector';

	import Header from '$lib/components/Header.svelte';
	import DashboardView from '$lib/components/DashboardView.svelte';
	import TheoryView from '$lib/components/TheoryView.svelte';
	import GuidedPracticeView from '$lib/components/GuidedPracticeView.svelte';
	import PracticeView from '$lib/components/PracticeView.svelte';
	import StatsView from '$lib/components/StatsView.svelte';
	import HelpView from '$lib/components/HelpView.svelte';

	// ── State ──
	let currentView = $state<ViewId>('dashboard');
	let language = $state<Lang>(storage.load<Lang>('language', 'nn'));
	let mode = $state<'focus' | 'mix'>('focus');
	let activeTopic = $state<TopicId>('chain');
	let progress = $state<Record<number, ProblemStatus>>(storage.load('progress', {}));
	let hints = $state<number[]>(storage.load('hints', []));
	let activeProblems = $state<Problem[]>([]);
	let filters = $state({ levels: [1, 2, 3, 4, 5], types: ['poly', 'root', 'exp', 'log'] as ProblemType[] });

	// ── Learning Engine ──
	let studentModel = $state<StudentModel>(loadStudentModel());

	// ── Problem Bank ──
	let problemBank = $state<Problem[]>([]);

	onMount(() => {
		problemBank = generateProblemBank();
		requestAnimationFrame(() => typesetMath());
	});

	// ── Derived ──
	const texts = $derived(getStrings(language));

	// ── Navigation ──
	function navigateTo(view: ViewId) {
		currentView = view;
		requestAnimationFrame(() => typesetMath());
	}

	// ── Language ──
	function changeLanguage(lang: Lang) {
		language = lang;
		saveLanguage(lang);
		requestAnimationFrame(() => typesetMath());
	}

	// ── Practice Mode ──
	function setMode(newMode: 'focus' | 'mix') {
		mode = newMode;
		activeProblems = [];
		if (newMode === 'mix') startMix();
	}

	function changeTopic(topic: TopicId) {
		activeTopic = topic;
		activeProblems = [];
	}

	function toggleFilter(category: 'level' | 'type', value: number | string) {
		if (category === 'level') {
			const v = value as number;
			const idx = filters.levels.indexOf(v);
			if (idx === -1) filters.levels = [...filters.levels, v];
			else filters.levels = filters.levels.filter((l) => l !== v);
		} else {
			const v = value as ProblemType;
			const idx = filters.types.indexOf(v);
			if (idx === -1) filters.types = [...filters.types, v];
			else filters.types = filters.types.filter((t) => t !== v);
		}
	}

	function drawProblems() {
		let candidates = problemBank.filter(
			(p) =>
				p.topic === activeTopic &&
				filters.levels.includes(p.level) &&
				filters.types.includes(p.type)
		);

		if (candidates.length === 0) {
			alert(texts.no_problems_found);
			return;
		}

		// Shuffle and take 5
		candidates.sort(() => 0.5 - Math.random());
		const selected = candidates.slice(0, 5);
		selected.sort((a, b) => a.level - b.level);
		activeProblems = selected;
		requestAnimationFrame(() => typesetMath());
	}

	function startMix() {
		if (problemBank.length === 0) return;
		const selected = selectNextProblems(studentModel, problemBank, 5);
		activeProblems = selected;
		mode = 'mix';
		requestAnimationFrame(() => typesetMath());
	}

	function startFocus() {
		mode = 'focus';
		activeProblems = [];
		navigateTo('practice');
	}

	function rateProblem(id: number, status: ProblemStatus) {
		// Update legacy progress map
		progress = { ...progress, [id]: status };
		saveProgress(progress);

		// Update student model
		const problem = problemBank.find(p => p.id === id);
		if (problem) {
			const conceptId = conceptIdFromProblem(problem.topic, problem.type);
			updateAfterAttempt(studentModel, {
				conceptId,
				correct: status === 'mastered',
				hintUsed: hints.includes(id)
			});
			saveStudentModel(studentModel);
		}

		requestAnimationFrame(() => typesetMath());
	}
</script>

<svelte:head>
	<title>{texts.module_derivative_name} · Mattetrening</title>
</svelte:head>

<Header
	{language}
	{currentView}
	onNavigate={navigateTo}
	onLanguageChange={changeLanguage}
	showBackLink={true}
/>

<main class="main-content">
	{#if currentView === 'dashboard'}
		<DashboardView
			{texts}
			{progress}
			{problemBank}
			{studentModel}
			onNavigate={navigateTo}
			onStartMix={() => { startMix(); navigateTo('practice'); }}
			onStartFocus={startFocus}
		/>
	{:else if currentView === 'theory'}
		<TheoryView {texts} {language} />
	{:else if currentView === 'guided'}
		<GuidedPracticeView
			{texts}
			{language}
			{problemBank}
			{studentModel}
			{progress}
			onRate={rateProblem}
			onNavigate={(view) => { currentView = view as ViewId; }}
		/>
	{:else if currentView === 'practice'}
		<PracticeView
			{texts}
			{language}
			{mode}
			{activeProblems}
			{problemBank}
			{progress}
			{studentModel}
			{activeTopic}
			{filters}
			onSetMode={setMode}
			onChangeTopic={changeTopic}
			onToggleFilter={toggleFilter}
			onDrawProblems={drawProblems}
			onStartMix={startMix}
			onRate={rateProblem}
		/>
	{:else if currentView === 'stats'}
		<StatsView
			{texts}
			{progress}
			{problemBank}
			{hints}
			{studentModel}
			onPractice={(conceptId) => {
				const [topic, type] = conceptId.split('_');
				if (topic) activeTopic = topic as TopicId;
				if (type) filters = { ...filters, types: [type as ProblemType] };
				mode = 'focus';
				activeProblems = [];
				navigateTo('practice');
			}}
		/>
	{:else if currentView === 'help'}
		<HelpView {texts} />
	{/if}
</main>

<style>
	.main-content {
		flex: 1;
	}
</style>
