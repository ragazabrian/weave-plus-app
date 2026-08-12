import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AI_PROVIDERS, EFFORTS, findModel, modelsByProvider, type AiEffort } from "@/lib/ai-models";

/**
 * Composer model picker: active model, an effort submenu and "More models"
 * listing every model grouped by family. Every model is ready to use, so
 * nobody has to connect an account before chatting.
 */
export function ModelMenu({
  modelId,
  effort,
  onSelectModel,
  onSelectEffort,
}: {
  modelId: string;
  effort: AiEffort;
  onSelectModel: (id: string) => void;
  onSelectEffort: (effort: AiEffort) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = findModel(modelId);

  function choose(id: string) {
    onSelectModel(id);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="inline-flex min-h-9 items-center gap-2 rounded-ui px-2.5 py-1.5 text-body-sm font-medium text-snow-white transition-colors hover:bg-accent"
        aria-label="Choose the AI model"
      >
        <span>{active?.label ?? "Choose a model"}</span>
        <span className="text-slate">{effort}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-72 rounded-card-sm border-0 bg-graphite-surface p-1.5 hairline"
      >
        {active ? (
          <DropdownMenuItem
            className="flex cursor-default items-start gap-3 rounded-ui px-3 py-2.5 focus:bg-accent"
            onSelect={(event) => event.preventDefault()}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm font-medium text-snow-white">{active.label}</span>
              <span className="block text-caption text-slate">{active.blurb}</span>
            </span>
            <HugeiconsIcon
              icon={Tick02Icon}
              size={16}
              strokeWidth={2}
              className="mt-0.5 text-dusk-violet"
            />
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-ui px-3 py-2.5 text-body-sm text-snow-white focus:bg-accent data-[state=open]:bg-accent">
            <span className="flex-1">Effort</span>
            <span className="text-slate">{effort}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40 rounded-card-sm border-0 bg-graphite-surface p-1.5 hairline">
            {EFFORTS.map((option) => (
              <DropdownMenuItem
                key={option}
                onSelect={() => onSelectEffort(option)}
                className="flex items-center gap-2 rounded-ui px-3 py-2 text-body-sm capitalize text-snow-white focus:bg-accent"
              >
                <span className="flex-1">{option}</span>
                {option === effort ? (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={14}
                    strokeWidth={2}
                    className="text-dusk-violet"
                  />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-ui px-3 py-2.5 text-body-sm text-snow-white focus:bg-accent data-[state=open]:bg-accent">
            <span className="flex-1">More models</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-[60vh] w-64 overflow-y-auto rounded-card-sm border-0 bg-graphite-surface p-1.5 hairline">
            {AI_PROVIDERS.map((provider, index) => (
              <div key={provider.id}>
                {index > 0 ? <DropdownMenuSeparator className="bg-white/8" /> : null}
                <DropdownMenuLabel className="px-3 pb-1 pt-2 text-caption uppercase tracking-widest text-slate">
                  {provider.label}
                </DropdownMenuLabel>
                {modelsByProvider(provider.id).map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onSelect={() => choose(model.id)}
                    className="flex items-center gap-2 rounded-ui px-3 py-2 text-body-sm text-snow-white focus:bg-accent"
                  >
                    <span className="flex-1 truncate">{model.label}</span>
                    {model.id === modelId ? (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={14}
                        strokeWidth={2}
                        className="text-dusk-violet"
                      />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
