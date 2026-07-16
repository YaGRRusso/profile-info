import { useEffect, useMemo, useRef, useState } from "react";

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const EXPECTED_MS = 3 * 60 * 1000;
const STAGE_COUNT = 7;
const TICK_MS = 100;

interface Stage {
  end: number;
  weight: number;
}

function createStages(count: number): Stage[] {
  const stages: Stage[] = [];
  let start = 0;

  for (let index = 0; index < count; index += 1) {
    const end = start + (100 - start) / GOLDEN_RATIO ** 2;
    stages.push({ end, weight: (end - start) * GOLDEN_RATIO ** index });
    start = end;
  }

  return stages;
}

function progressAt(
  elapsed: number,
  expected: number,
  stages: Stage[]
): number {
  if (elapsed <= 0 || expected <= 0 || stages.length === 0) return 0;

  const totalWeight = stages.reduce((sum, stage) => sum + stage.weight, 0);
  let start = 0;
  let stageStartedAt = 0;

  for (const stage of stages) {
    const duration = (expected * stage.weight) / totalWeight;
    const stageEndsAt = stageStartedAt + duration;

    if (elapsed < stageEndsAt) {
      const ratio = (elapsed - stageStartedAt) / duration;
      return start + (stage.end - start) * ratio;
    }

    start = stage.end;
    stageStartedAt = stageEndsAt;
  }

  return stages.at(-1)?.end ?? 0;
}

export function useStagedProgress(active: boolean): number {
  const startedAtRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const stages = useMemo(() => createStages(STAGE_COUNT), []);

  useEffect(() => {
    if (!active) {
      startedAtRef.current = null;
      setProgress(0);
      return;
    }

    startedAtRef.current = performance.now();
    setProgress(0);

    const tick = () => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      setProgress(
        progressAt(performance.now() - startedAt, EXPECTED_MS, stages)
      );
    };

    tick();
    const intervalId = setInterval(tick, TICK_MS);
    return () => clearInterval(intervalId);
  }, [active, stages]);

  return progress;
}
