import { useMemo, useState } from 'react';
import { FiBarChart2, FiCloud, FiEdit, FiFileText, FiHeart, FiMapPin } from 'react-icons/fi';

import FloatingLines from './components/FloatingLines/FloatingLines.jsx';
import GlassIcons from './components/GlassIcons/GlassIcons.jsx';
import './survey.css';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdyajgz';

const STEP_LABELS = ['Регион', 'Идея', 'Цифра', 'Цена'];

const QUESTIONS = [
  {
    id: 'region',
    type: 'text',
    number: '01',
    text: 'Из какого вы города или района?',
    sub: 'Название поможет понять географию спроса — можно кратко.',
    placeholder: 'Например: Самарканд, Наманган, Андижан…',
  },
  {
    id: 'idea',
    type: 'single',
    number: '02',
    text: 'Какая IT-идея, на ваш взгляд, нужнее всего в регионах Узбекистана?',
    sub: 'Выберите одну — ту, которой реально не хватает у вас дома.',
    options: [
      { emoji: '🔧', label: 'Маркетплейс мастеров и ремонта', sub: 'Найти сантехника, электрика, отделочника' },
      { emoji: '👷', label: 'HR-платформа для рабочих', sub: 'Заводы, стройки, рестораны ищут сотрудников' },
      { emoji: '📊', label: 'SaaS-учёт для малого бизнеса', sub: 'Бухгалтерия и касса для ИП и магазинов' },
      { emoji: '🌾', label: 'Агромаркетплейс для фермеров', sub: 'Продажа урожая напрямую без посредников' },
      { emoji: '📦', label: 'Логистика и доставка', sub: 'Для интернет-магазинов и e-commerce' },
      { emoji: '🎓', label: 'EdTech — подготовка к DTM/ЕГЭ', sub: 'Онлайн-репетиторы и курсы' },
    ],
  },
  {
    id: 'digital',
    type: 'single',
    number: '03',
    text: 'Люди 25+ лет у вас дома — насколько уверенно пользуются смартфоном и интернетом?',
    sub: 'Ориентируйтесь на родителей, соседей, знакомых из вашего города или района.',
    options: [
      { emoji: '💪', label: 'Уверенно — сами всё делают', sub: 'Оплачивают, заказывают такси, переписываются' },
      { emoji: '🙂', label: 'В основном справляются', sub: 'Иногда просят детей помочь с чем-то новым' },
      { emoji: '😕', label: 'Только базовое', sub: 'WhatsApp и звонки — больше ничего' },
      { emoji: '📵', label: 'Почти не пользуются', sub: 'Кнопочный телефон или вообще без смартфона' },
    ],
  },
  {
    id: 'price',
    type: 'single',
    number: '04',
    text: 'Какую сумму в месяц люди у вас готовы платить за удобный сервис?',
    sub: 'Например, за приложение, где легко найти мастера или работника.',
    options: [
      { emoji: '🆓', label: 'Только бесплатно', sub: 'Платить за приложение не будут вообще' },
      { emoji: '💵', label: '10 000 – 20 000 сум (~$0.8–1.5)', sub: 'Небольшая сумма, почти символическая' },
      { emoji: '💰', label: '30 000 – 50 000 сум (~$2.5–4)', sub: 'Если сервис реально полезный' },
      { emoji: '💎', label: '100 000+ сум (~$8+)', sub: 'За качественный продукт заплатят хорошо' },
    ],
  },
];

async function sendToFormspree(payload) {
  const url = (typeof FORMSPREE_ENDPOINT === 'string' && FORMSPREE_ENDPOINT.trim()) || '';
  if (!url) return { ok: false, skipped: true };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      _subject: 'Опрос IT Узбекистан — новый ответ',
      ...payload,
    }),
  });

  return { ok: res.ok, skipped: false, status: res.status };
}

function clampPercent(x) {
  return Math.max(0, Math.min(100, x));
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({
    region: '',
    idea: null,
    digital: null,
    price: null,
  });
  const [isDone, setIsDone] = useState(false);
  const [sendingState, setSendingState] = useState({ state: 'idle' }); // idle | sending | ok | err

  const pct = Math.round(((Math.min(current, QUESTIONS.length - 1) + 1) / QUESTIONS.length) * 100);

  const glassItems = useMemo(
    () => [
      { icon: <FiMapPin />, color: 'indigo', label: 'Регион' },
      { icon: <FiFileText />, color: 'blue', label: 'Идея' },
      { icon: <FiHeart />, color: 'red', label: 'Польза' },
      { icon: <FiCloud />, color: 'purple', label: 'Онлайн' },
      { icon: <FiEdit />, color: 'orange', label: 'Просто' },
      { icon: <FiBarChart2 />, color: 'green', label: 'Вывод' },
    ],
    []
  );

  const q = QUESTIONS[current];

  const stepState = (i) => (i < current ? 'done' : i === current ? 'active' : 'todo');

  const selectOption = (idx) => {
    setAnswers((a) => ({ ...a, [q.id]: idx }));
    // mobile friendly: go next shortly
    window.setTimeout(() => {
      if (current === QUESTIONS.length - 1) {
        finish();
      } else {
        setCurrent((c) => c + 1);
      }
    }, 220);
  };

  const nextFromText = () => {
    const v = (answers.region || '').trim();
    setAnswers((a) => ({ ...a, region: v || 'Не указано' }));
    setCurrent((c) => Math.min(c + 1, QUESTIONS.length - 1));
  };

  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  const finish = async () => {
    setIsDone(true);
    setSendingState({ state: 'sending' });

    const ideaIdx = answers.idea;
    const digitalIdx = answers.digital;
    const priceIdx = answers.price;

    const ideaLabel = QUESTIONS[1].options?.[ideaIdx]?.label || '—';
    const digitalLabel = QUESTIONS[2].options?.[digitalIdx]?.label || '—';
    const priceLabel = QUESTIONS[3].options?.[priceIdx]?.label || '—';

    const payload = {
      region: answers.region || 'Не указано',
      idea: ideaLabel,
      idea_index: ideaIdx,
      digital: digitalLabel,
      digital_index: digitalIdx,
      price: priceLabel,
      price_index: priceIdx,
      submitted_at: new Date().toISOString(),
    };

    try {
      const result = await sendToFormspree(payload);
      if (result.ok) setSendingState({ state: 'ok' });
      else setSendingState({ state: 'err', status: result.status });
    } catch {
      setSendingState({ state: 'err' });
    }
  };

  const restart = () => {
    setAnswers({ region: '', idea: null, digital: null, price: null });
    setCurrent(0);
    setIsDone(false);
    setSendingState({ state: 'idle' });
  };

  const copyText = useMemo(() => {
    const ideaLabel = QUESTIONS[1].options?.[answers.idea]?.label || '—';
    const digitalLabel = QUESTIONS[2].options?.[answers.digital]?.label || '—';
    const priceLabel = QUESTIONS[3].options?.[answers.price]?.label || '—';
    return `📍 Регион: ${answers.region || 'Не указано'}\n💡 Лучшая идея: ${ideaLabel}\n📱 Уровень цифровой грамотности 25+: ${digitalLabel}\n💳 Готовность платить: ${priceLabel}`;
  }, [answers]);

  const digitalPct = clampPercent([90, 65, 35, 10][answers.digital ?? 1] ?? 50);
  const pricePct = clampPercent([5, 40, 75, 100][answers.price ?? 1] ?? 50);

  const canNext =
    q?.type === 'text' ? true : answers[q.id] !== null && answers[q.id] !== undefined;

  return (
    <>
      <div className="bg-webgl">
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[5, 7, 5]}
          lineDistance={[8, 8, 8]}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax
          animationSpeed={1}
          linesGradient={['#e945f5', '#a78bfa', '#6a6a6a']}
          mixBlendMode="screen"
        />
      </div>

      <div className="wrap">
        <header className="hero" role="banner">
          <div className="badge">
            <span className="badge-dot" aria-hidden="true" /> IT-опрос · Узбекистан
          </div>
          <h1>Какие IT-идеи реально нужны в вашем регионе?</h1>
          <div className="hero-meta">
            <span>Анонимно</span>
            <span>~3 минуты</span>
            <span>С телефона удобно</span>
          </div>

          <div className="hero-icons" aria-hidden="true">
            <GlassIcons items={glassItems} colorful={false} />
          </div>
        </header>

        <div className="stepper" aria-hidden="true">
          {QUESTIONS.map((_, i) => {
            const s = stepState(i);
            return (
              <div key={i} className={`step ${s}`}>
                <div className="step-circle">{s === 'done' ? '✓' : i + 1}</div>
                <span className="step-label">{STEP_LABELS[i]}</span>
              </div>
            );
          })}
        </div>

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-meta">
            <span>{isDone ? 'Готово' : `Вопрос ${current + 1} из ${QUESTIONS.length}`}</span>
            <span>{isDone ? '100%' : `${pct}%`}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${isDone ? 100 : pct}%` }} />
          </div>
        </div>

        <main role="main">
          {!isDone ? (
            <div className="question-card">
              <div className="q-number">Вопрос {q.number}</div>
              <h2 className="q-text">{q.text}</h2>
              <p className="q-sub">{q.sub}</p>

              {q.type === 'text' ? (
                <>
                  <label className="sr-only" htmlFor="region">
                    {q.text}
                  </label>
                  <input
                    id="region"
                    className="region-input"
                    type="text"
                    inputMode="text"
                    autoComplete="address-level2"
                    placeholder={q.placeholder}
                    value={answers.region}
                    onChange={(e) => setAnswers((a) => ({ ...a, region: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') nextFromText();
                    }}
                  />

                  <div className="nav">
                    <div />
                    <button type="button" className="btn btn-primary" onClick={nextFromText}>
                      Далее →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="options" role="radiogroup" aria-label={q.text}>
                    {q.options.map((o, idx) => {
                      const selected = answers[q.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`option ${selected ? 'selected' : ''}`}
                          aria-pressed={selected ? 'true' : 'false'}
                          onPointerMove={(e) => {
                            const el = e.currentTarget;
                            const r = el.getBoundingClientRect();
                            el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                            el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                          }}
                          onClick={() => selectOption(idx)}
                        >
                          <span className="opt-radio" aria-hidden="true" />
                          <span className="opt-emoji" aria-hidden="true">
                            {o.emoji}
                          </span>
                          <span>
                            <span className="opt-label">{o.label}</span>
                            {o.sub ? <span className="opt-sub">{o.sub}</span> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="nav">
                    {current > 0 ? (
                      <button type="button" className="btn btn-ghost" onClick={prev}>
                        ← Назад
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!canNext}
                      onClick={() => {
                        if (current === QUESTIONS.length - 1) finish();
                        else setCurrent((c) => c + 1);
                      }}
                    >
                      {current === QUESTIONS.length - 1 ? 'Завершить ✓' : 'Далее →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="results-card">
              {sendingState.state === 'sending' ? (
                <div className="submission-banner warn">Отправка ответов…</div>
              ) : sendingState.state === 'ok' ? (
                <div className="submission-banner ok">Ответы отправлены. Спасибо!</div>
              ) : sendingState.state === 'err' ? (
                <div className="submission-banner err">
                  Не удалось отправить ответы{sendingState.status ? ` (код ${sendingState.status})` : ''}. Итог ниже можно
                  скопировать вручную.
                </div>
              ) : null}

              <div className="results-header">
                <div className="results-icon" aria-hidden="true">
                  ✅
                </div>
                <h2>Спасибо за ответы</h2>
                <p>Ниже — краткий итог. Полные ответы доступны в кабинете Formspree.</p>
              </div>

              <div className="result-row">
                <div className="result-label">📍 Ваш регион</div>
                <div className="result-value">{answers.region || 'Не указано'}</div>
              </div>

              <div className="divider" />

              <div className="result-row">
                <div className="result-label">💡 Самая нужная идея</div>
                <div className="result-value">
                  {QUESTIONS[1].options?.[answers.idea]?.emoji} {QUESTIONS[1].options?.[answers.idea]?.label}
                </div>
              </div>

              <div className="divider" />

              <div className="result-row">
                <div className="result-label">📱 Цифровая грамотность 25+</div>
                <div className="result-value">
                  {QUESTIONS[2].options?.[answers.digital]?.emoji} {QUESTIONS[2].options?.[answers.digital]?.label}
                </div>
                <div className="result-bar-bg">
                  <div className="result-bar-fill" style={{ width: `${digitalPct}%` }} />
                </div>
              </div>

              <div className="divider" />

              <div className="result-row">
                <div className="result-label">💳 Готовность платить</div>
                <div className="result-value">
                  {QUESTIONS[3].options?.[answers.price]?.emoji} {QUESTIONS[3].options?.[answers.price]?.label}
                </div>
                <div className="result-bar-bg">
                  <div className="result-bar-fill" style={{ width: `${pricePct}%` }} />
                </div>
              </div>

              <div className="copy-block">
                <div className="copy-label">Скопируйте итог</div>
                <pre className="copy-text" id="copy-content">
                  {copyText}
                </pre>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    try {
                      await navigator.clipboard.writeText(copyText);
                      btn.textContent = '✅ Скопировано';
                      window.setTimeout(() => (btn.textContent = '📋 Скопировать ответы'), 1800);
                    } catch {
                      btn.textContent = 'Не удалось скопировать';
                      window.setTimeout(() => (btn.textContent = '📋 Скопировать ответы'), 1800);
                    }
                  }}
                >
                  📋 Скопировать ответы
                </button>
              </div>

              <button type="button" className="btn btn-ghost full" onClick={restart}>
                Пройти заново
              </button>
            </div>
          )}

          <p className="footer-note">
            Сайт работает на GitHub Pages, ответы уходят в Formspree. На телефоне фон облегчён автоматически.
          </p>
        </main>
      </div>
    </>
  );
}

