export const useDebounce = () => {
	const timers: Map<
		string,
		{
			timeout: NodeJS.Timeout;
			start: number;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
			func: () => unknown | Promise<() => unknown>;
		}
	> = new Map();

	const runningExecutions: Map<string, Promise<unknown>> = new Map();

	const debounce = async (
		id: string,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
		func: () => unknown | Promise<() => unknown>,
		debounce: number,
		maxDebounce: number,
	) => {
		const old = timers.get(id);
		const start = old?.start || Date.now();

		const run = async () => {
			if (runningExecutions.has(id)) {
				// wait for previous execution to finish
				await runningExecutions.get(id);
			}

			timers.delete(id);

			const execution = func();

			runningExecutions.set(id, execution);
			const executionResult = await execution;
			runningExecutions.delete(id);

			return executionResult;
		};

		if (old?.timeout) {
			clearTimeout(old.timeout);
		}

		if (debounce === 0) {
			return run();
		}

		if (Date.now() - start >= maxDebounce) {
			return run();
		}

		timers.set(id, {
			start,
			timeout: setTimeout(run, debounce),
			func: run,
		});
	};

	const executeNow = (id: string) => {
		const old = timers.get(id);
		if (old) {
			clearTimeout(old.timeout);
			return old.func();
		}
	};

	const isDebounced = (id: string): boolean => {
		return timers.has(id);
	};

	const isCurrentlyExecuting = (id: string): boolean => {
		return runningExecutions.has(id);
	};

	return { debounce, isDebounced, isCurrentlyExecuting, executeNow };
};
