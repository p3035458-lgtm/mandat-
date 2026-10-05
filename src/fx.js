// Визуальные эффекты поверх игры: частицы, всплывающий текст, виньетка, тряска экрана.
// Всё безопасно вызывать без DOM (в тестах) и при включённом «уменьшить движение».
const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ok = () => typeof document !== 'undefined' && document.body && !calm();

function layer() {
  let l = document.getElementById('fx-layer');
  if (!l) { l = document.createElement('div'); l.id = 'fx-layer'; document.body.appendChild(l); }
  return l;
}

/** Точка, откуда запускать эффект: центр нажатой кнопки или центр экрана. */
export function anchor(el, ev) {
  try {
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    if (ev && ev.clientX != null) return { x: ev.clientX, y: ev.clientY };
  } catch (e) { /* ignore */ }
  return { x: (innerWidth || 800) / 2, y: (innerHeight || 600) / 2 };
}

/** Фонтан из эмодзи (гречка, искры и т.п.). */
export function burst(x, y, { emoji = '🌾', n = 14, power = 1 } = {}) {
  if (!ok()) return;
  try {
    const l = layer();
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'fx-p'; p.textContent = emoji;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      l.appendChild(p);
      if (!p.animate) { p.remove(); continue; }
      const dx = (Math.random() - 0.5) * 240 * power;
      const up = -(70 + Math.random() * 120) * power;
      const rot = (Math.random() - 0.5) * 540;
      const sc = 0.7 + Math.random() * 0.8;
      const a = p.animate([
        { transform: 'translate(-50%,-50%) scale(.4) rotate(0deg)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${up}px)) scale(${sc}) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${up + 150 + Math.random() * 60}px)) scale(${sc}) rotate(${rot}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.3,.6,.4,1)', delay: Math.random() * 90 });
      a.onfinish = () => p.remove();
    }
  } catch (e) { /* ignore */ }
}

/** Всплывающая подпись («+4,3», «−$180 тыс.»). tone: good | bad | warn */
export function floatText(x, y, text, tone = 'good') {
  if (!ok()) return;
  try {
    const t = document.createElement('div');
    t.className = 'fx-t ' + tone; t.textContent = text;
    t.style.left = x + 'px'; t.style.top = y + 'px';
    layer().appendChild(t);
    setTimeout(() => t.remove(), 1400);
  } catch (e) { /* ignore */ }
}

/** Цветная виньетка по краям экрана: danger | scandal | warn | good */
export function flash(kind = 'danger') {
  if (!ok()) return;
  try {
    const v = document.createElement('div');
    v.className = 'fx-vig ' + kind;
    layer().appendChild(v);
    setTimeout(() => v.remove(), 1200);
  } catch (e) { /* ignore */ }
}

export function shake() {
  if (!ok()) return;
  try {
    document.body.classList.remove('fx-shake');
    void document.body.offsetWidth;              // перезапуск анимации
    document.body.classList.add('fx-shake');
    setTimeout(() => document.body.classList.remove('fx-shake'), 650);
  } catch (e) { /* ignore */ }
}

/** Эффект при открытии события: тип берётся из d.fx или из заголовка-«kicker». */
export function eventFx(d) {
  const k = d && d.kicker;
  const kind = (d && d.fx) || (k === 'Покушение' ? 'danger' : k === 'Угроза' ? 'warn' : k === 'Скандал' ? 'scandal' : null);
  if (!kind) return;
  flash(kind);
  if (kind === 'danger') shake();
  if (kind === 'good') { const a = anchor(); burst(a.x, a.y - 60, { emoji: '✨', n: 12, power: 1.2 }); }
}
