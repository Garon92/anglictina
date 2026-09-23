import { setSettingsSection } from '../kit';
import { h } from '../kit/dom';
import type { UserSettings } from '../types';

type FontSize = UserSettings['fontSize'];

const FONT_SIZES: [FontSize, string][] = [
  ['small', 'Menší'],
  ['medium', 'Střední'],
  ['large', 'Větší'],
];

function fontSizeField(value: FontSize, onChange: (v: FontSize) => void): HTMLElement {
  const name = `ang-font-${Math.random().toString(36).slice(2, 7)}`;
  const group = h('div', { class: 'g92-segmented g92-segmented--block', role: 'radiogroup', 'aria-label': 'Velikost písma' });
  for (const [v, label] of FONT_SIZES) {
    const input = h('input', { type: 'radio', name, value: v });
    input.checked = v === value;
    input.addEventListener('change', () => {
      if (input.checked) onChange(v);
    });
    group.append(h('label', null, input, h('span', null, h('span', null, label))));
  }
  return h('div', { class: 'g92-field' }, h('span', { class: 'g92-label' }, 'Velikost písma'), group, h('span', { class: 'g92-hint' }, 'Jen v Angličtině.'));
}

/**
 * ⚙ in the app bar opens the kit settings dialog (C-11) with this app's part: its own name
 * ("Jméno v této aplikaci"), "Předčítání", font size, and "Další nastavení…" → the full page
 * (goals, voice, backup).
 */
export function registerSettingsSection(o: {
  getFontSize: () => FontSize;
  setFontSize: (v: FontSize) => void;
  openMore: () => void;
}): () => void {
  return setSettingsSection({
    nameMode: 'app',
    showVoice: true,
    extra: () => fontSizeField(o.getFontSize(), o.setFontSize),
    more: { label: 'Další nastavení…', onClick: o.openMore },
  });
}
