import { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  title: string;
  subtitle?: string;
  accent?: 'cpu' | 'ram' | 'network' | 'disk' | 'gpu' | 'battery' | 'sensors' | 'bluetooth';
  children: ReactNode;
};

export function Panel({ title, subtitle, accent = 'cpu', children }: Props) {
  return (
    <section className="rounded-lg border border-border-subtle bg-background-secondary/80 p-4 shadow-md backdrop-blur-md">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground-primary">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-foreground-secondary">{subtitle}</p>
          ) : null}
        </div>
        <span
          className={clsx('h-2 w-14 rounded-full shadow-inner', {
            'bg-cpu-500': accent === 'cpu',
            'bg-ram-500': accent === 'ram',
            'bg-network-500': accent === 'network',
            'bg-disk-500': accent === 'disk',
            'bg-gpu-500': accent === 'gpu',
            'bg-battery-500': accent === 'battery',
            'bg-sensors-500': accent === 'sensors',
            'bg-bluetooth-500': accent === 'bluetooth'
          })}
          aria-hidden
        />
      </header>
      <div className="space-y-3 text-sm text-foreground-primary">{children}</div>
    </section>
  );
}
