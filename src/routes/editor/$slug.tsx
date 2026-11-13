import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';

import { useSession } from '@/core/auth/client';
import {
  getWrapVehicle,
  WRAP_AI_CREDITS,
  WRAP_EDITABLE_VEHICLES,
  wrapTemplateUrl,
  wrapVehicleLabel,
} from '@/config/wrap';
import { WRAP_DESIGNS } from '@/config/wrap-gallery';
import { ApiError } from '@/lib/api-client';
import {
  fetchWrapBalance,
  fetchWrapImageBlob,
  listWrapGenerations,
  startWrapGeneration,
  waitForWrapGeneration,
} from '@/lib/wrap/api';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { wrapEditorLabels } from '@/blocks/wrap/editor-labels';
import {
  EDITOR_PANELS,
  WrapEditor,
  type EditorInitial,
  type EditorPanel,
} from '@/components/wrap/editor/wrap-editor';

export const Route = createFileRoute('/editor/$slug')({
  validateSearch: (search: Record<string, unknown>) => {
    const panel =
      typeof search.panel === 'string' &&
      (EDITOR_PANELS as string[]).includes(search.panel)
        ? (search.panel as EditorPanel)
        : undefined;
    return {
      panel,
      prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
      design: typeof search.design === 'string' ? search.design : undefined,
      share: search.share === '1' || search.share === true ? true : undefined,
      fill: typeof search.fill === 'string' ? search.fill : undefined,
    };
  },
  loader: ({ params }) => {
    const vehicle = getWrapVehicle(params.slug);
    if (!vehicle?.editable) throw notFound();
    const locale = getLocale();
    const label = wrapVehicleLabel(vehicle);
    return {
      locale,
      vehicle,
      title: m['wrap.editor.meta_title']({ vehicle: label }, { locale }),
      description: m['wrap.editor.meta_description'](
        { vehicle: label },
        { locale }
      ),
    };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? wrapPageHead({
          path: `/editor/${params.slug}`,
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: EditorPage,
});

function EditorPage() {
  const { vehicle } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const labels = useMemo(() => wrapEditorLabels(), []);

  const balanceQuery = useQuery({
    queryKey: ['credits-balance', session?.user?.id],
    queryFn: fetchWrapBalance,
    enabled: signedIn,
    staleTime: 15_000,
  });

  const historyQuery = useQuery({
    queryKey: ['wrap-generations', session?.user?.id],
    queryFn: async () => (await listWrapGenerations()).items,
    enabled: signedIn,
    staleTime: 10_000,
  });

  const initial = useMemo<EditorInitial>(() => {
    const design = search.design
      ? WRAP_DESIGNS.find((d) => d.id === search.design)
      : undefined;
    return {
      panel: search.panel,
      prompt: search.prompt,
      fill: search.fill,
      share: search.share,
      design: design
        ? { id: design.id, title: design.title, recipe: design.recipe }
        : undefined,
    };
  }, [search]);

  const ai = useMemo(
    () => ({
      signedIn,
      signInHref: `/sign-in?callbackUrl=${encodeURIComponent(`/editor/${vehicle.slug}?panel=ai`)}`,
      pricingHref: '/pricing',
      credits: balanceQuery.data?.balance ?? null,
      cost: WRAP_AI_CREDITS,
      history: (historyQuery.data ?? []).map((item) => ({
        id: item.id,
        prompt: item.prompt,
        status: item.status,
        imageUrl: item.imageUrl,
      })),
      async generate(prompt: string) {
        try {
          const started = await startWrapGeneration({
            prompt,
            vehicle: vehicle.slug,
          });
          const done = await waitForWrapGeneration(started.id);
          if (done.status !== 'succeeded' || !done.imageUrl) {
            throw new Error(m['wrap.editor.ai_failed']());
          }
          void balanceQuery.refetch();
          void historyQuery.refetch();
          return fetchWrapImageBlob(done.imageUrl);
        } catch (error) {
          if (error instanceof ApiError) {
            if (/credit/i.test(error.message)) {
              throw new Error(m['wrap.editor.ai_err_credits']());
            }
            if (/not configured|unconfigured/i.test(error.message)) {
              throw new Error(m['wrap.editor.ai_err_unconfigured']());
            }
            if (/wait|busy|rate/i.test(error.message)) {
              throw new Error(m['wrap.editor.ai_err_busy']());
            }
          }
          if (error instanceof Error && error.message === 'timeout') {
            throw new Error(m['wrap.editor.ai_timeout']());
          }
          throw error instanceof Error
            ? error
            : new Error(m['wrap.editor.ai_failed']());
        }
      },
      fetchImage: fetchWrapImageBlob,
    }),
    [signedIn, balanceQuery, historyQuery, vehicle.slug]
  );

  return (
    <WrapEditor
      vehicle={vehicle}
      vehicles={WRAP_EDITABLE_VEHICLES.map((v) => ({
        slug: v.slug,
        label: wrapVehicleLabel(v),
      }))}
      vehicleLabel={wrapVehicleLabel(vehicle)}
      templateUrl={wrapTemplateUrl(vehicle)}
      gallery={WRAP_DESIGNS.map((d) => ({
        id: d.id,
        title: d.title,
        recipe: d.recipe,
      }))}
      labels={labels}
      ai={ai}
      initial={initial}
      galleryHref="/gallery"
      contactHref="/contact"
      onVehicle={(slug) => {
        void navigate({ to: '/editor/$slug', params: { slug } });
      }}
    />
  );
}
