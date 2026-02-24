import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, addExamSession, getStats, saveStats, updateStreak } from '../db';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { READING_TEXTS } from '../data/reading';
import { VOCABULARY } from '../data/vocabulary';
import { LISTENING_EXERCISES } from '../data/listening';
import { speak } from '../tts';
import { shuffleArray, pickRandom } from '../utils';

// ─── Types ──────────────────────────────────────────────────────────────

interface ExamQuestion {
  type: 'mcq' | 'truefalse' | 'fill';
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  listeningScript?: string;
  readingText?: string;
  readingTitle?: string;
  explanation?: string;
}

interface ExamSection {
  number: number;
  part: 'A' | 'B' | 'C';
  partName: string;
  name: string;
  instructionCs: string;
  questions: ExamQuestion[];
}

interface MiniQuestion {
  type: 'vocab' | 'grammar' | 'reading';
  question: string;
  options: string[];
  answerIndex: number;
}

type Phase =
  | 'menu'
  | 'exam_intro'
  | 'section_intro'
  | 'exam_q'
  | 'section_done'
  | 'exam_result'
  | 'mini'
  | 'mini_result'
  | 'timer';

// ─── Helpers ────────────────────────────────────────────────────────────

function scoreColor(pct: number): string {
  if (pct >= 60) return '#22c55e';
  if (pct >= 44) return '#eab308';
  return '#ef4444';
}

function checkFillAnswer(userInput: string, correct: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  if (norm(userInput) === norm(correct)) return true;
  if (correct.includes('...')) {
    const parts = correct.split('...').map(p => norm(p)).filter(Boolean);
    return parts.length > 0 && parts.every(p => norm(userInput).includes(p));
  }
  return false;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

// ─── Generators ─────────────────────────────────────────────────────────

function generateExamSections(): ExamSection[] {
  const sections: ExamSection[] = [];
  const usedGrammarIds = new Set<string>();

  // ── Part A: Poslech ──────────────────────────────

  const dictPool = LISTENING_EXERCISES.filter(e => e.type === 'dictation');
  const dictPicked = pickRandom(dictPool, Math.min(4, dictPool.length));
  sections.push({
    number: 1, part: 'A', partName: 'Poslech', name: 'Diktát',
    instructionCs: 'Poslechněte nahrávku a vyberte větu, kterou jste slyšeli.',
    questions: dictPicked.map(ex => {
      const q = ex.questions[0];
      return {
        type: 'mcq' as const,
        question: q?.question ?? 'Kterou větu jste slyšeli?',
        options: q?.options ?? [],
        correctIndex: q?.answerIndex ?? 0,
        listeningScript: ex.script,
      };
    }),
  });

  const compPool = shuffleArray(LISTENING_EXERCISES.filter(e => e.type === 'comprehension'));
  const tfQs: ExamQuestion[] = [];
  const compMcqQs: ExamQuestion[] = [];
  for (const ex of compPool) {
    for (const q of ex.questions) {
      if (q.type === 'truefalse' && tfQs.length < 4 && q.options && q.answerIndex !== undefined) {
        tfQs.push({
          type: 'truefalse', question: q.question,
          options: q.options, correctIndex: q.answerIndex,
          listeningScript: ex.script,
        });
      } else if (q.type === 'mcq' && compMcqQs.length < 4 && q.options && q.answerIndex !== undefined) {
        compMcqQs.push({
          type: 'mcq', question: q.question,
          options: q.options, correctIndex: q.answerIndex,
          listeningScript: ex.script,
        });
      }
    }
  }

  sections.push({
    number: 2, part: 'A', partName: 'Poslech', name: 'Pravda/Nepravda',
    instructionCs: 'Poslechněte nahrávku a rozhodněte, zda je tvrzení pravdivé nebo nepravdivé.',
    questions: tfQs,
  });

  const gapPool = LISTENING_EXERCISES.filter(e => e.type === 'gapfill');
  const gapPicked = pickRandom(gapPool, Math.min(4, gapPool.length));
  sections.push({
    number: 3, part: 'A', partName: 'Poslech', name: 'Doplňování',
    instructionCs: 'Poslechněte nahrávku a doplňte chybějící slovo.',
    questions: gapPicked.map(ex => {
      const q = ex.questions[0];
      return {
        type: 'fill' as const,
        question: q?.question ?? ex.script,
        correctAnswer: q?.answer ?? '',
        listeningScript: ex.script,
      };
    }),
  });

  sections.push({
    number: 4, part: 'A', partName: 'Poslech', name: 'Porozumění',
    instructionCs: 'Poslechněte nahrávku a vyberte správnou odpověď.',
    questions: compMcqQs,
  });

  // ── Part B: Čtení ───────────────────────────────

  const readingPicked = pickRandom(READING_TEXTS, Math.min(2, READING_TEXTS.length));

  const mapReadingQ = (rt: typeof READING_TEXTS[number]) =>
    rt.questions.slice(0, 4).map(q => ({
      type: 'mcq' as const,
      question: q.question,
      options: q.options,
      correctIndex: q.answerIndex,
      readingText: rt.text,
      readingTitle: rt.title,
    }));

  sections.push({
    number: 5, part: 'B', partName: 'Čtení', name: 'Čtení s porozuměním',
    instructionCs: 'Přečtěte si text a odpovězte na otázky.',
    questions: readingPicked[0] ? mapReadingQ(readingPicked[0]) : [],
  });

  sections.push({
    number: 6, part: 'B', partName: 'Čtení', name: 'Čtení – detailní',
    instructionCs: 'Přečtěte si text pozorně a odpovězte na detailní otázky.',
    questions: readingPicked[1] ? mapReadingQ(readingPicked[1]) : [],
  });

  const clozePool = GRAMMAR_EXERCISES.filter(e => e.type === 'open_cloze' || e.type === 'cloze');
  const cloze7 = pickRandom(clozePool, Math.min(4, clozePool.length));
  cloze7.forEach(e => usedGrammarIds.add(e.id));
  sections.push({
    number: 7, part: 'B', partName: 'Čtení', name: 'Jazyk v kontextu',
    instructionCs: 'Doplňte správný tvar slova do věty.',
    questions: cloze7.map(ex => ({
      type: 'fill' as const, question: ex.prompt,
      correctAnswer: ex.answer, explanation: ex.explanationCs,
    })),
  });

  // ── Part C: Jazyková kompetence ─────────────────

  const vocabPicked = pickRandom(VOCABULARY, Math.min(4, VOCABULARY.length));
  sections.push({
    number: 8, part: 'C', partName: 'Jazyk', name: 'Slovní zásoba',
    instructionCs: 'Vyberte správný český překlad anglického slova.',
    questions: vocabPicked.map(word => {
      const wrong = pickRandom(VOCABULARY.filter(w => w.id !== word.id).map(w => w.cs), 3);
      const opts = shuffleArray([word.cs, ...wrong]);
      return {
        type: 'mcq' as const,
        question: `Co znamená "${word.en}"?`,
        options: opts, correctIndex: opts.indexOf(word.cs),
      };
    }),
  });

  const mcqPool = GRAMMAR_EXERCISES.filter(e => e.type === 'mcq' && e.options && !usedGrammarIds.has(e.id));
  const mcq9 = pickRandom(mcqPool, Math.min(4, mcqPool.length));
  mcq9.forEach(e => usedGrammarIds.add(e.id));
  sections.push({
    number: 9, part: 'C', partName: 'Jazyk', name: 'Gramatika MCQ',
    instructionCs: 'Vyberte správnou odpověď.',
    questions: mcq9.map(ex => ({
      type: 'mcq' as const, question: ex.prompt,
      options: ex.options!, correctIndex: ex.options!.indexOf(ex.answer),
      explanation: ex.explanationCs,
    })),
  });

  const cloze10pool = GRAMMAR_EXERCISES.filter(
    e => (e.type === 'cloze' || e.type === 'open_cloze') && !usedGrammarIds.has(e.id),
  );
  const cloze10 = pickRandom(cloze10pool, Math.min(4, cloze10pool.length));
  sections.push({
    number: 10, part: 'C', partName: 'Jazyk', name: 'Open cloze',
    instructionCs: 'Doplňte správné slovo do věty.',
    questions: cloze10.map(ex => ({
      type: 'fill' as const, question: ex.prompt,
      correctAnswer: ex.answer, explanation: ex.explanationCs,
    })),
  });

  return sections;
}

function generateMiniQuestions(): MiniQuestion[] {
  const result: MiniQuestion[] = [];

  const vocabWords = pickRandom(VOCABULARY, Math.min(8, VOCABULARY.length));
  for (const word of vocabWords) {
    const wrong = pickRandom(VOCABULARY.filter(w => w.id !== word.id).map(w => w.cs), 3);
    const opts = shuffleArray([word.cs, ...wrong]);
    result.push({ type: 'vocab', question: `Co znamená "${word.en}"?`, options: opts, answerIndex: opts.indexOf(word.cs) });
  }

  const grammarExs = pickRandom(GRAMMAR_EXERCISES.filter(e => e.type === 'mcq' && e.options), 6);
  for (const ex of grammarExs) {
    result.push({ type: 'grammar', question: ex.prompt, options: ex.options!, answerIndex: ex.options!.indexOf(ex.answer) });
  }

  const readingTexts = pickRandom(READING_TEXTS, Math.min(2, READING_TEXTS.length));
  for (const rt of readingTexts) {
    for (const q of rt.questions.slice(0, 3)) {
      result.push({ type: 'reading', question: `[${rt.title}] ${q.question}`, options: q.options, answerIndex: q.answerIndex });
    }
  }

  return shuffleArray(result);
}

// ─── Component ──────────────────────────────────────────────────────────

export default function ExamSim() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('menu');

  // Exam state
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [secIdx, setSecIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillText, setFillText] = useState('');
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(3600);
  const secCorrectRef = useRef<number[]>([]);
  const examTimerRef = useRef<number>(0);
  const autoRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  // Mini-test state
  const [miniQs, setMiniQs] = useState<MiniQuestion[]>([]);
  const [miniIdx, setMiniIdx] = useState(0);
  const [miniSel, setMiniSel] = useState<number | null>(null);
  const [miniAnswered, setMiniAnswered] = useState(false);
  const miniCorrectRef = useRef(0);
  const miniByTypeRef = useRef<Record<string, [number, number]>>({
    vocab: [0, 0], grammar: [0, 0], reading: [0, 0],
  });

  // Timer mode state
  const [timerMinutes, setTimerMinutes] = useState(110);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number>(0);

  useEffect(() => () => {
    clearTimeout(autoRef.current);
    clearInterval(examTimerRef.current);
    clearInterval(timerRef.current);
  }, []);

  // ── Shared helpers ──────────────────────────────

  function resetQ() {
    setSelected(null);
    setFillText('');
    setAnswered(false);
    setWasCorrect(false);
    setAudioPlayed(false);
    clearTimeout(autoRef.current);
  }

  function findNextNonEmpty(sections: ExamSection[], fromIdx: number): number {
    let i = fromIdx;
    while (i < sections.length && sections[i].questions.length === 0) i++;
    return i < sections.length ? i : -1;
  }

  function playAudio(script: string) {
    setAudioPlayed(true);
    speak(script, 0.85).catch(() => {});
  }

  // ── Full exam ───────────────────────────────────

  function startExam() {
    const secs = generateExamSections();
    const first = findNextNonEmpty(secs, 0);
    if (first === -1) return;

    setExamSections(secs);
    secCorrectRef.current = new Array(secs.length).fill(0);
    startTimeRef.current = Date.now();
    setExamTimeLeft(3600);
    setSecIdx(first);
    setQIdx(0);
    resetQ();
    setPhase('section_intro');

    if (examTimerRef.current) clearInterval(examTimerRef.current);
    examTimerRef.current = window.setInterval(() => {
      setExamTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(examTimerRef.current);
          examTimerRef.current = 0;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function beginSection() {
    setQIdx(0);
    resetQ();
    setPhase('exam_q');
  }

  function checkExamAnswer() {
    const sec = examSections[secIdx];
    const q = sec.questions[qIdx];
    const correct = q.type === 'fill'
      ? checkFillAnswer(fillText, q.correctAnswer || '')
      : selected === q.correctIndex;

    setAnswered(true);
    setWasCorrect(correct);
    if (correct) secCorrectRef.current[secIdx]++;

    const isLastQ = qIdx + 1 >= sec.questions.length;
    autoRef.current = window.setTimeout(() => {
      if (isLastQ) {
        setPhase('section_done');
      } else {
        setQIdx(qIdx + 1);
        resetQ();
      }
    }, 1500);
  }

  function advanceFromSectionDone() {
    const next = findNextNonEmpty(examSections, secIdx + 1);
    if (next === -1) {
      finishExam();
    } else {
      setSecIdx(next);
      setQIdx(0);
      resetQ();
      setPhase('section_intro');
    }
  }

  async function finishExam() {
    clearInterval(examTimerRef.current);
    examTimerRef.current = 0;

    const secs = examSections;
    const scores = secCorrectRef.current;
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const totalQ = secs.reduce((s, sec) => s + sec.questions.length, 0);

    if (totalQ > 0) {
      const stats = await getStats();
      stats.totalExercisesDone += totalQ;
      stats.totalStudyMinutes += (Date.now() - startTimeRef.current) / 60000;
      await saveStats(stats);
      await updateStreak();

      const part = { A: { c: 0, t: 0 }, B: { c: 0, t: 0 }, C: { c: 0, t: 0 } };
      secs.forEach((s, i) => { part[s.part].c += scores[i]; part[s.part].t += s.questions.length; });

      await addExamSession({
        type: 'internal', startedAt: startTimeRef.current, endedAt: Date.now(),
        scoreTotal: pct(totalCorrect, totalQ), maxScore: 100,
        scoreBySkill: {
          listening: pct(part.A.c, part.A.t),
          reading: pct(part.B.c, part.B.t),
          language: pct(part.C.c, part.C.t),
        },
        notes: '',
      });

      await addDrillSession({
        date: new Date().toISOString().slice(0, 10), type: 'exam',
        startedAt: startTimeRef.current, endedAt: Date.now(),
        totalItems: totalQ, correctItems: totalCorrect,
        tags: ['exam', 'cermat', 'full'],
      });
    }

    setPhase('exam_result');
  }

  // ── Mini-test ───────────────────────────────────

  function startMini() {
    const qs = generateMiniQuestions();
    setMiniQs(qs);
    setMiniIdx(0);
    setMiniSel(null);
    setMiniAnswered(false);
    miniCorrectRef.current = 0;
    miniByTypeRef.current = { vocab: [0, 0], grammar: [0, 0], reading: [0, 0] };
    startTimeRef.current = Date.now();
    setPhase('mini');
  }

  function checkMiniAnswer() {
    const q = miniQs[miniIdx];
    const correct = miniSel === q.answerIndex;
    setMiniAnswered(true);
    if (correct) miniCorrectRef.current++;
    const bt = miniByTypeRef.current[q.type];
    bt[1]++;
    if (correct) bt[0]++;
  }

  function nextMiniQ() {
    if (miniIdx + 1 >= miniQs.length) {
      finishMini();
    } else {
      setMiniIdx(miniIdx + 1);
      setMiniSel(null);
      setMiniAnswered(false);
    }
  }

  async function finishMini() {
    const total = miniQs.length;
    const correct = miniCorrectRef.current;

    const stats = await getStats();
    stats.totalExercisesDone += total;
    stats.totalStudyMinutes += (Date.now() - startTimeRef.current) / 60000;
    await saveStats(stats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10), type: 'exam',
      startedAt: startTimeRef.current, endedAt: Date.now(),
      totalItems: total, correctItems: correct,
      tags: ['exam', 'mini'],
    });

    const bt = miniByTypeRef.current;
    await addExamSession({
      type: 'internal', startedAt: startTimeRef.current, endedAt: Date.now(),
      scoreTotal: pct(correct, total), maxScore: 100,
      scoreBySkill: {
        listening: 0,
        reading: pct(bt.reading[0], bt.reading[1]),
        language: pct(bt.vocab[0] + bt.grammar[0], bt.vocab[1] + bt.grammar[1]),
      },
      notes: 'mini-test',
    });

    setPhase('mini_result');
  }

  // ── Timer mode ──────────────────────────────────

  function startTimer() {
    setTimerSec(timerMinutes * 60);
    setTimerRunning(true);
    setPhase('timer');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = 0; setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = 0;
    setTimerRunning(false);
    setPhase('menu');
  }

  // ─── RENDER ───────────────────────────────────────────────────────────

  // ── Menu ────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Simulace zkoušky</h1>
        <p className="page-subtitle">Procvič si formát didaktického testu z angličtiny.</p>

        <div className="space-y-4">
          <div className="card-hover cursor-pointer" onClick={() => setPhase('exam_intro')}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">📋</div>
              <div>
                <h3 className="font-bold text-slate-900">Kompletní simulace</h3>
                <p className="text-sm text-slate-500">
                  Plný CERMAT test – 10 částí, ~40 otázek, 60 minut. Poslech, čtení i jazyk.
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover cursor-pointer" onClick={startMini}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-slate-900">Mini-test</h3>
                <p className="text-sm text-slate-500">
                  Rychlý mix ~20 otázek ze slovíček, gramatiky a čtení. Bez časového limitu.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">⏱️</div>
              <div>
                <h3 className="font-bold text-slate-900">Časovač pro PDF</h3>
                <p className="text-sm text-slate-500">
                  Otevři si PDF test z CERMAT a spusť odpočet jako na reálné maturitě.
                </p>
              </div>
            </div>
            <label className="block mb-3">
              <span className="text-sm text-slate-600">Čas ({timerMinutes} minut)</span>
              <input type="range" className="w-full mt-1" min={10} max={120} step={5}
                value={timerMinutes} onChange={e => setTimerMinutes(+e.target.value)} />
              <div className="flex justify-between text-xs text-slate-400">
                <span>10 min</span><span>Oficiální: 110 min</span><span>120 min</span>
              </div>
            </label>
            <button className="btn-primary w-full" onClick={startTimer}>Spustit časovač</button>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Kde najdeš oficiální testy?</h3>
            <p className="text-sm text-blue-700 mb-3">
              CERMAT zveřejňuje testy z předchozích let včetně poslechů a klíčů správných odpovědí.
            </p>
            <a href="https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi"
              target="_blank" rel="noopener noreferrer"
              className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm">
              Otevřít CERMAT →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Exam Intro ──────────────────────────────────

  if (phase === 'exam_intro') {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[65vh]">
        <button className="btn-ghost text-sm self-start mb-8" onClick={() => setPhase('menu')}>← Zpět</button>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Kompletní simulace</h1>
          <p className="text-slate-500 mb-6">Didaktický test z angličtiny – formát CERMAT</p>

          <div className="card text-left mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Test se skládá ze 3 bloků:</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="badge bg-blue-100 text-blue-700 text-xs mt-0.5">A</span>
                <div><strong>Poslech</strong> – diktát, pravda/nepravda, doplňování, porozumění</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="badge bg-green-100 text-green-700 text-xs mt-0.5">B</span>
                <div><strong>Čtení</strong> – porozumění textu, detailní čtení, jazyk v kontextu</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="badge bg-purple-100 text-purple-700 text-xs mt-0.5">C</span>
                <div><strong>Jazyk</strong> – slovní zásoba, gramatika MCQ, open cloze</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">Časový limit</span>
              <span className="font-bold text-slate-800">60 minut</span>
            </div>
          </div>

          <button className="btn-primary btn-lg w-full" onClick={startExam}>
            Spustit test
          </button>
        </div>
      </div>
    );
  }

  // ── Section Intro ───────────────────────────────

  if (phase === 'section_intro') {
    const section = examSections[secIdx];
    if (!section) { setPhase('menu'); return null; }

    const partColors: Record<string, string> = {
      A: 'bg-blue-100 text-blue-700',
      B: 'bg-green-100 text-green-700',
      C: 'bg-purple-100 text-purple-700',
    };

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[65vh]">
        <div className="w-full flex justify-end mb-8">
          <span className={`text-sm font-mono font-bold ${
            examTimeLeft === 0 ? 'text-red-500 animate-pulse'
              : examTimeLeft < 300 ? 'text-red-500'
              : examTimeLeft < 600 ? 'text-amber-500'
              : 'text-slate-700'
          }`}>
            {examTimeLeft === 0 ? '⏰ Čas vypršel!' : `⏱ ${fmtTime(examTimeLeft)}`}
          </span>
        </div>

        <div className="text-center max-w-sm">
          <span className={`badge ${partColors[section.part] || ''} mb-3`}>
            Blok {section.part} · {section.partName}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Část {section.number}: {section.name}
          </h2>
          <p className="text-slate-500 mb-2">{section.instructionCs}</p>
          <p className="text-sm text-slate-400 mb-8">{section.questions.length} otázek</p>
          <button className="btn-primary btn-lg w-full" onClick={beginSection}>Pokračovat</button>
        </div>
      </div>
    );
  }

  // ── Exam Question ───────────────────────────────

  if (phase === 'exam_q') {
    const section = examSections[secIdx];
    const q = section?.questions[qIdx];
    if (!section || !q) { setPhase('section_done'); return null; }

    const totalQ = examSections.reduce((s, sec) => s + sec.questions.length, 0);
    const doneSoFar = examSections.slice(0, secIdx).reduce((s, sec) => s + sec.questions.length, 0) + qIdx;
    const showQuestion = !q.listeningScript || audioPlayed;

    return (
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500 font-medium">
            {section.number}. {section.name} · {qIdx + 1}/{section.questions.length}
          </span>
          <span className={`text-sm font-mono font-bold ${
            examTimeLeft === 0 ? 'text-red-500 animate-pulse'
              : examTimeLeft < 300 ? 'text-red-500'
              : examTimeLeft < 600 ? 'text-amber-500'
              : 'text-slate-700'
          }`}>
            {examTimeLeft === 0 ? '⏰ Čas vypršel!' : `⏱ ${fmtTime(examTimeLeft)}`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
          <div className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(doneSoFar / Math.max(1, totalQ)) * 100}%` }} />
        </div>

        {/* Listening: play button (before audio) */}
        {q.listeningScript && !audioPlayed && (
          <button className="btn-primary btn-lg w-full flex items-center justify-center gap-3 py-6 mb-4"
            onClick={() => playAudio(q.listeningScript!)}>
            <span className="text-3xl">🔊</span>
            <span className="text-lg">Přehrát nahrávku</span>
          </button>
        )}

        {/* Listening: replay button (after audio) */}
        {q.listeningScript && audioPlayed && (
          <button className="btn-ghost text-sm mb-3 flex items-center gap-1"
            onClick={() => speak(q.listeningScript!, 0.85).catch(() => {})}>
            🔄 Přehrát znovu
          </button>
        )}

        {/* Reading text */}
        {q.readingText && (
          <div className="card !p-4 mb-4 max-h-52 overflow-y-auto border-l-4 border-primary-200">
            <h4 className="font-bold text-slate-800 text-sm mb-2">{q.readingTitle}</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{q.readingText}</p>
          </div>
        )}

        {/* Question card */}
        {showQuestion && (
          <>
            <div className="card !p-6 mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 leading-relaxed">{q.question}</h3>

              {/* MCQ / True-False options */}
              {(q.type === 'mcq' || q.type === 'truefalse') && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button key={i}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        answered
                          ? i === q.correctIndex
                            ? 'border-green-500 bg-green-50 font-medium'
                            : selected === i
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-100'
                          : selected === i
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                      onClick={() => { if (!answered) setSelected(i); }}
                      disabled={answered}>
                      {opt} {answered && i === q.correctIndex && ' ✓'}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill input */}
              {q.type === 'fill' && (
                <div>
                  <input className="input w-full" value={fillText}
                    onChange={e => setFillText(e.target.value)}
                    placeholder="Napište odpověď…" disabled={answered}
                    onKeyDown={e => { if (e.key === 'Enter' && fillText.trim() && !answered) checkExamAnswer(); }} />
                  {answered && (
                    <p className={`mt-2 text-sm font-semibold ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {wasCorrect ? '✓ Správně!' : `✗ Správná odpověď: ${q.correctAnswer}`}
                    </p>
                  )}
                </div>
              )}

              {answered && q.explanation && (
                <p className="mt-3 text-sm text-slate-500 italic border-t border-slate-100 pt-3">
                  {q.explanation}
                </p>
              )}
            </div>

            {!answered && (
              <button className="btn-primary btn-lg w-full"
                disabled={q.type === 'fill' ? !fillText.trim() : selected === null}
                onClick={checkExamAnswer}>
                Zkontrolovat
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Section Done ────────────────────────────────

  if (phase === 'section_done') {
    const section = examSections[secIdx];
    if (!section) { advanceFromSectionDone(); return null; }
    const secPct = pct(secCorrectRef.current[secIdx], section.questions.length);

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3">{secPct >= 60 ? '✅' : secPct >= 44 ? '👍' : '📝'}</div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Část {section.number}/10 dokončena
          </h2>
          <p className="text-slate-500 mb-1">{section.name}</p>
          <p className="text-2xl font-bold mt-2" style={{ color: scoreColor(secPct) }}>
            {secCorrectRef.current[secIdx]}/{section.questions.length}
          </p>
          <p className="text-sm text-slate-400 mt-1 mb-8">{secPct}% správně</p>
          <button className="btn-primary btn-lg" onClick={advanceFromSectionDone}>
            Pokračovat
          </button>
        </div>
      </div>
    );
  }

  // ── Exam Result ─────────────────────────────────

  if (phase === 'exam_result') {
    const scores = secCorrectRef.current;
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const totalQ = examSections.reduce((s, sec) => s + sec.questions.length, 0);
    const totalPct = pct(totalCorrect, totalQ);
    const passed = totalPct >= 44;

    const parts: Record<string, { c: number; t: number; label: string }> = {
      A: { c: 0, t: 0, label: 'A) Poslech' },
      B: { c: 0, t: 0, label: 'B) Čtení' },
      C: { c: 0, t: 0, label: 'C) Jazyk' },
    };
    examSections.forEach((s, i) => {
      parts[s.part].c += scores[i] || 0;
      parts[s.part].t += s.questions.length;
    });

    return (
      <div className="page-container">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">
            {!passed ? '😔' : totalPct >= 75 ? '🎉' : totalPct >= 60 ? '✅' : '👍'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Výsledek testu</h2>
          <div className="text-5xl font-bold mt-3" style={{ color: scoreColor(totalPct) }}>
            {totalPct}%
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: scoreColor(totalPct) }}>
            {passed ? 'Prospěl/a!' : 'Neprospěl/a – trénuj dál!'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalCorrect}/{totalQ} správných odpovědí · hranice: 44%
          </p>
        </div>

        {/* Overall bar */}
        <div className="card mb-4">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${totalPct}%`, backgroundColor: scoreColor(totalPct) }} />
            <div className="absolute top-0 h-full border-r-2 border-amber-500" style={{ left: '44%' }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span>
            <span className="text-amber-500 font-medium">44%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Part breakdown */}
        <div className="card mb-4">
          <h3 className="section-title">Hodnocení podle bloků</h3>
          <div className="space-y-3">
            {Object.values(parts).map(p => (
              <ResultRow key={p.label} label={p.label} correct={p.c} total={p.t} />
            ))}
          </div>
        </div>

        {/* Section breakdown */}
        <div className="card mb-4">
          <h3 className="section-title">Hodnocení podle částí</h3>
          <div className="space-y-2">
            {examSections.map((s, i) => {
              if (s.questions.length === 0) return null;
              const sp = pct(scores[i] || 0, s.questions.length);
              return (
                <div key={s.number} className="flex items-center justify-between text-sm py-0.5">
                  <span className="text-slate-600">{s.number}. {s.name}</span>
                  <span className="font-semibold" style={{ color: scoreColor(sp) }}>
                    {scores[i] || 0}/{s.questions.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary flex-1" onClick={() => setPhase('menu')}>Zkusit znovu</button>
        </div>
      </div>
    );
  }

  // ── Mini-test ───────────────────────────────────

  if (phase === 'mini') {
    const q = miniQs[miniIdx];
    if (!q) return null;
    const isCorrect = miniSel === q.answerIndex;

    const typeBadge: Record<string, { bg: string; label: string }> = {
      vocab: { bg: 'bg-blue-100 text-blue-700', label: 'Slovíčka' },
      grammar: { bg: 'bg-purple-100 text-purple-700', label: 'Gramatika' },
      reading: { bg: 'bg-green-100 text-green-700', label: 'Čtení' },
    };
    const tb = typeBadge[q.type];

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <span className={`badge ${tb.bg}`}>{tb.label}</span>
          <span className="text-sm text-slate-500 font-medium">{miniIdx + 1}/{miniQs.length}</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
          <div className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(miniIdx / miniQs.length) * 100}%` }} />
        </div>

        <div className="card !p-6 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 leading-relaxed">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  miniAnswered
                    ? i === q.answerIndex
                      ? 'border-green-500 bg-green-50 font-medium'
                      : miniSel === i
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-100'
                    : miniSel === i
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                onClick={() => { if (!miniAnswered) setMiniSel(i); }}
                disabled={miniAnswered}>
                {opt} {miniAnswered && i === q.answerIndex && ' ✓'}
              </button>
            ))}
          </div>
        </div>

        {!miniAnswered ? (
          <button className="btn-primary btn-lg w-full" disabled={miniSel === null}
            onClick={checkMiniAnswer}>
            Zkontrolovat
          </button>
        ) : (
          <button className="btn-primary btn-lg w-full" onClick={nextMiniQ}>
            {miniIdx + 1 >= miniQs.length ? 'Zobrazit výsledky' : 'Další →'}
          </button>
        )}
      </div>
    );
  }

  // ── Mini Result ─────────────────────────────────

  if (phase === 'mini_result') {
    const total = miniQs.length;
    const correct = miniCorrectRef.current;
    const p = pct(correct, total);
    const passed = p >= 44;
    const bt = miniByTypeRef.current;

    return (
      <div className="page-container">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">
            {!passed ? '😔' : p >= 70 ? '🎉' : '✅'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Výsledek mini-testu</h2>
          <div className="text-4xl font-bold mt-2" style={{ color: scoreColor(p) }}>
            {p}%
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {passed ? 'Prospěl/a!' : 'Zatím neprospěl/a – trénuj dál!'}
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="section-title">Rozpad výsledků</h3>
          <div className="space-y-3">
            <ResultRow label="Slovíčka" correct={bt.vocab[0]} total={bt.vocab[1]} />
            <ResultRow label="Gramatika" correct={bt.grammar[0]} total={bt.grammar[1]} />
            <ResultRow label="Čtení" correct={bt.reading[0]} total={bt.reading[1]} />
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="section-title">Celkově</h3>
          <p className="text-sm text-slate-600">{correct}/{total} správně ({p}%)</p>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden relative">
            <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: scoreColor(p) }} />
            <div className="absolute top-0 h-full border-r-2 border-amber-500" style={{ left: '44%' }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span className="text-amber-500 font-medium">44 (min.)</span>
            <span>100</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary flex-1" onClick={() => setPhase('menu')}>Zkusit znovu</button>
        </div>
      </div>
    );
  }

  // ── Timer ───────────────────────────────────────

  if (phase === 'timer') {
    const progress = 1 - timerSec / (timerMinutes * 60);
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500 mb-2">Zbývající čas</p>
          <div className={`text-6xl font-mono font-bold ${
            timerSec === 0 ? 'text-red-500 animate-pulse'
              : timerSec < 300 ? 'text-red-500'
              : timerSec < 600 ? 'text-amber-500'
              : 'text-slate-900'
          }`}>
            {fmtTime(timerSec)}
          </div>
        </div>

        <div className="w-full max-w-xs mb-8">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${
              timerSec < 300 ? 'bg-red-500' : timerSec < 600 ? 'bg-amber-500' : 'bg-primary-500'
            }`} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {timerSec === 0 ? (
          <div className="text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Čas vypršel!</h2>
            <button className="btn-primary btn-lg" onClick={() => setPhase('menu')}>Zpět do menu</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button className="btn-danger btn-lg" onClick={stopTimer}>Zastavit časovač</button>
            <a href="https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi"
              target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-sm">
              Otevřít testy na CERMAT →
            </a>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─── Helper Components ──────────────────────────────────────────────────

function ResultRow({ label, correct, total }: { label: string; correct: number; total: number }) {
  const p = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold" style={{ color: scoreColor(p) }}>
          {correct}/{total} ({p}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, backgroundColor: scoreColor(p) }} />
      </div>
    </div>
  );
}
