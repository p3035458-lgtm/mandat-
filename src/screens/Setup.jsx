import { A, setupInner } from '../game.js';

// Отдельный экран создания кандидата. Внутри пока прежняя форма (setupInner) с шагами и кнопкой «Начать кампанию».
export default function Setup() {
  return (
    <div className="setup-page">
      <header className="setup-head">
        <button className="btn ghost" onClick={() => A.backMenu()}>← В меню</button>
        <p className="muted">Выберите внешность и биографию, назовите партию, распределите очки, затем начните кампанию.</p>
      </header>
      <section id="setup" className="card setup2" dangerouslySetInnerHTML={{ __html: setupInner() }} />
    </div>
  );
}
