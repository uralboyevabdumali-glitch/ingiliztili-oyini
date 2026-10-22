import { useState } from 'react';
import { Check } from 'lucide-react';
import { PET_LIST, PETS } from '../data/pets.js';
import PetAvatar from './PetAvatar.jsx';
import Button from './Button.jsx';

/** Hamroh tanlash: hayvon, uning ismi va (ixtiyoriy) foydalanuvchi ismi */
export default function PetChooser({ initialType = 'owl', initialName = '', userName = '', askUserName = true, onDone, submitLabel = 'Boshladik!' }) {
  const [type, setType] = useState(initialType);
  const [name, setName] = useState(initialName || PETS[initialType].defaultName);
  const [touched, setTouched] = useState(!!initialName);
  const [user, setUser] = useState(userName);

  const choose = (t) => {
    setType(t);
    if (!touched) setName(PETS[t].defaultName);
  };

  const submit = (e) => {
    e.preventDefault();
    onDone({ type, name: name.trim() || PETS[type].defaultName, userName: user.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex justify-center">
        <div className="grid h-36 w-36 place-items-center rounded-full bg-brand-light dark:bg-brand/15">
          <PetAvatar type={type} stage={2} mood="happy" size={124} className="animate-floaty" />
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink-soft dark:text-night-soft">Hamrohingni tanla</legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup">
          {PET_LIST.map((p) => {
            const active = p.id === type;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(p.id)}
                className={`relative flex flex-col items-center rounded-2xl border-2 p-1.5 transition ${
                  active ? 'border-brand bg-brand-light dark:bg-brand/20' : 'border-slate-200 hover:border-brand/50 dark:border-night-line'
                }`}
              >
                {active && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <PetAvatar type={p.id} stage={2} size={46} />
                <span className="mt-0.5 text-[11px] font-bold leading-tight">{p.kind}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-brand dark:text-blue-300">
          {PETS[type].kind}: "{PETS[type].sound}"
        </p>
      </fieldset>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-ink-soft dark:text-night-soft">Hamrohingning ismi</span>
        <input
          value={name}
          maxLength={16}
          onChange={(e) => {
            setName(e.target.value);
            setTouched(true);
          }}
          className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 font-semibold outline-none focus:border-brand dark:border-night-line dark:bg-night"
        />
      </label>
      {askUserName && (
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft dark:text-night-soft">Sening isming (sertifikat uchun)</span>
          <input
            value={user}
            maxLength={32}
            placeholder="Masalan: Aziza"
            onChange={(e) => setUser(e.target.value)}
            className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 font-semibold outline-none placeholder:text-slate-400 focus:border-brand dark:border-night-line dark:bg-night"
          />
        </label>
      )}
      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
