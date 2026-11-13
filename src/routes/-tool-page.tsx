import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import {
  GeneratorShell,
  type GeneratorMode,
} from '@/components/generator-shell';

export function toolPageRouteOptions(opts: {
  title: string;
  subtitle: string;
  mode?: GeneratorMode;
}) {
  return {
    loader: () => {
      const locale = getLocale();
      return {
        title: opts.title,
        description: opts.subtitle,
        locale,
      };
    },
    head: ({
      loaderData,
    }: {
      loaderData?: { title?: string; description?: string };
    }) => ({
      meta: loaderData
        ? [
            { title: loaderData.title },
            { name: 'description', content: loaderData.description },
          ]
        : [],
    }),
    component: function ToolPage() {
      return (
        <GeneratorShell
          mode={opts.mode ?? 'image'}
          title={opts.title}
          subtitle={opts.subtitle}
        />
      );
    },
  };
}

export function toolLabels() {
  return {
    comingSoon: m['generator.empty_body'](),
  };
}
