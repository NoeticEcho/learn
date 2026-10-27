<!--
	«Docker в браузере» (part 9, lesson 5). A pretend terminal: no Docker runs here, the page reads
	the commands itself. It knows the handful that matter on a first day: build, images, run (with
	-d, -p, --name, -e, -v), ps, logs, stop, start, rm, rmi and curl against a published port. A
	Dockerfile is a text box beside it; build turns each instruction into a layer, reuses the layers
	that did not change (CACHED), refuses a COPY of a file the build context does not have, and
	warns when a key or a password is written into the image with ENV. The site that `curl` returns
	carries the person's own project name. Everything is a model: sizes and times are made up.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, tick } from 'svelte';

	type Image = { name: string; layers: string[]; size: number; secrets: boolean };
	type Container = { id: string; name: string; image: string; ports: string[]; status: 'running' | 'exited'; env: string[]; volumes: string[]; log: string[] };

	const presets: Record<string, { label: string; text: string }> = {
		simple: { label: 'Простой', text: 'FROM nginx:alpine\nCOPY dist/ /usr/share/nginx/html/\nEXPOSE 80\n' },
		multi: { label: 'Сборка и раздача', text: 'FROM node:lts-alpine AS build\nWORKDIR /app\nCOPY package.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80\n' },
		secret: { label: 'С ошибкой: ключ в образе', text: 'FROM nginx:alpine\nENV API_KEY=sk-live-1234567890\nCOPY dist/ /usr/share/nginx/html/\nEXPOSE 80\n' }
	};
	const known = ['nginx:alpine', 'nginx', 'node:lts-alpine', 'hello-world', 'busybox', 'postgres'];
	const context = ['Dockerfile', 'dist', 'package.json', 'src', '.dockerignore'];

	let dockerfile = $state(presets.simple.text);
	let images = $state<Image[]>([]);
	let containers = $state<Container[]>([]);
	let lastBuild = $state<string[]>([]);
	let out = $state<string[]>(['Это учебный симулятор: настоящего Docker здесь нет. Введите help или нажмите на команду ниже.']);
	let cmd = $state('');
	let title = $state('Мой сайт');
	let box: HTMLElement | undefined = $state();
	let seq = 0;

	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			title = p.title || p.name || title;
		} catch {
			/* the example stays */
		}
	});

	const id = () => (++seq).toString(16).padStart(2, '0') + 'f3a9c1d2e4b5'.slice(0, 10);
	const say = async (...lines: string[]) => {
		out = [...out, ...lines];
		await tick();
		if (box) box.scrollTop = box.scrollHeight;
	};
	const flags = (args: string[]) => {
		const f = { d: false, a: false, rm: false, p: [] as string[], name: '', e: [] as string[], v: [] as string[], t: '', rest: [] as string[] };
		for (let i = 0; i < args.length; i++) {
			const a = args[i];
			if (a === '-d') f.d = true;
			else if (a === '-a') f.a = true;
			else if (a === '--rm') f.rm = true;
			else if (a === '-p') f.p.push(args[++i] ?? '');
			else if (a === '--name') f.name = args[++i] ?? '';
			else if (a === '-e') f.e.push(args[++i] ?? '');
			else if (a === '-v') f.v.push(args[++i] ?? '');
			else if (a === '-t') f.t = args[++i] ?? '';
			else if (a.startsWith('-')) continue;
			else f.rest.push(a);
		}
		return f;
	};
	const find = (n: string) => containers.find((c) => c.name === n || c.id.startsWith(n));

	async function build(args: string[]) {
		const f = flags(args);
		const tag = f.t.includes(':') ? f.t : f.t ? f.t + ':latest' : '';
		if (!tag) return say('ERROR: нужен тег образа: docker build -t site .');
		const ins = dockerfile.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
		if (!ins.length) return say('ERROR: failed to solve: file with no instructions');
		if (!/^FROM\s/i.test(ins[0])) return say('ERROR: failed to solve: dockerfile parse error: первая инструкция должна быть FROM');
		const stages: string[] = [];
		const lines = ['[+] Building 2.4s FINISHED', ' => [internal] load build definition from Dockerfile'];
		let cached = true;
		for (let i = 0; i < ins.length; i++) {
			const l = ins[i];
			const op = l.split(/\s+/)[0].toUpperCase();
			const rest = l.slice(op.length).trim();
			if (op === 'FROM') {
				const m = rest.match(/^(\S+)(?:\s+AS\s+(\S+))?/i);
				if (m?.[2]) stages.push(m[2]);
				const ref = m?.[1] ?? '';
				if (!known.some((k) => ref === k) && !ref.includes('/')) return say(`ERROR: failed to solve: ${ref}: not found. Образ с таким именем не найден.`);
			}
			if (op === 'COPY') {
				const from = rest.match(/--from=(\S+)/)?.[1];
				if (from && !stages.includes(from)) return say(`ERROR: failed to solve: COPY --from=${from}: стадии ${from} нет`);
				if (!from) {
					const src = rest.split(/\s+/).filter((x) => !x.startsWith('--'))[0] ?? '';
					const first = src.replace(/\/$/, '').split('/')[0];
					if (src !== '.' && !context.includes(first)) return say(`ERROR: failed to solve: failed to compute cache key: "/${first}": not found. Такого файла нет в папке сборки.`);
				}
			}
			const same = cached && lastBuild[i] === l;
			if (!same) cached = false;
			lines.push(` => ${same ? 'CACHED ' : ''}[${i + 1}/${ins.length}] ${l}`);
		}
		lines.push(' => exporting to image', ` => => naming to docker.io/library/${tag}`);
		const secrets = ins.some((l) => /^(ENV|ARG)\s+\S*(KEY|TOKEN|SECRET|PASSWORD|PASS)\S*\s*=?/i.test(l));
		images = [{ name: tag, layers: ins, size: 52 + Math.round(ins.length * 1.5), secrets }, ...images.filter((i) => i.name !== tag)];
		lastBuild = ins;
		await say(...lines);
		if (secrets) await say('WARNING: в образ записан секрет (ENV или ARG с KEY, TOKEN, SECRET или PASSWORD). Его увидит любой, у кого есть образ. Передавайте секреты при запуске: docker run -e ... или через env_file.');
	}

	async function run(args: string[]) {
		const f = flags(args);
		const image = f.rest[0];
		if (!image) return say('ERROR: нужен образ: docker run -d -p 8080:80 --name site site');
		const local = images.find((i) => i.name === image || i.name === image + ':latest');
		const lines: string[] = [];
		if (!local) {
			if (!known.includes(image)) return say(`Unable to find image '${image}' locally`, `ERROR: pull access denied for ${image}: репозитория нет или он закрыт. Соберите образ командой docker build.`);
			lines.push(`Unable to find image '${image}' locally`, `${image}: Pulling from library/${image.split(':')[0]}`, 'Status: Downloaded newer image');
		}
		const name = f.name || ['quiet_fox', 'brave_owl', 'calm_hare'][containers.length % 3];
		if (containers.some((c) => c.name === name)) return say(`ERROR: имя "${name}" уже занято контейнером. Выберите другое или удалите: docker rm ${name}`);
		for (const m of f.p) {
			const host = m.split(':')[0];
			const clash = containers.find((c) => c.status === 'running' && c.ports.some((p) => p.split(':')[0] === host));
			if (clash) return say(`ERROR: port is already allocated: порт ${host} уже занят контейнером ${clash.name}. Возьмите другой, например -p ${+host + 1}:80`);
		}
		const c: Container = { id: id(), name, image, ports: f.p, status: 'running', env: f.e, volumes: f.v, log: ['/docker-entrypoint.sh: Configuration complete; ready for start up', 'start worker processes'] };
		containers = [...containers, c];
		await say(...lines, f.d ? c.id : 'nginx запущен; Ctrl+C остановит его. Для работы «в фоне» добавьте -d.');
		if (!f.d) {
			c.status = 'exited';
			containers = [...containers];
		}
		if (!f.p.length) await say('Подсказка: порт не опубликован (нет -p), поэтому снаружи контейнер не откроется.');
	}

	async function exec(line: string) {
		const t = line.trim();
		if (!t) return;
		await say('$ ' + t);
		const [bin, sub, ...args] = t.split(/\s+/);
		if (t === 'clear') return void (out = []);
		if (t === 'ls') return say('Dockerfile  dist/  package.json  src/  .dockerignore');
		if (t === 'help')
			return say(
				'Команды: docker build -t имя .   docker images   docker run -d -p 8080:80 --name site имя',
				'docker ps [-a]   docker logs имя   docker stop имя   docker start имя   docker rm имя   docker rmi имя',
				'curl http://localhost:8080   ls   clear'
			);
		if (bin === 'curl') {
			const port = t.match(/:(\d+)/)?.[1];
			const c = containers.find((x) => x.status === 'running' && x.ports.some((p) => p.split(':')[0] === port));
			if (!c) return say(`curl: (7) Failed to connect to localhost port ${port ?? '80'}: соединение отклонено (контейнер не запущен или порт не опубликован)`);
			c.log = [...c.log, `172.17.0.1 - - "GET / HTTP/1.1" 200 612`];
			containers = [...containers];
			return say('HTTP/1.1 200 OK', `<!doctype html><html lang="ru"><head><title>${title}</title></head><body><h1>${title}</h1>…`);
		}
		if (bin !== 'docker') return say(`${bin}: команда не найдена. Введите help.`);
		const f = flags(args);
		switch (sub) {
			case 'build':
				return build(args);
			case 'images':
				return say('REPOSITORY   TAG      SIZE', ...images.map((i) => `${i.name.split(':')[0].padEnd(12)} ${(i.name.split(':')[1] ?? 'latest').padEnd(8)} ~${i.size} МБ`), ...(images.length ? [] : ['(образов пока нет: docker build)']));
			case 'run':
				return run(args);
			case 'ps': {
				const list = containers.filter((c) => f.a || c.status === 'running');
				return say('CONTAINER ID   IMAGE         STATUS    PORTS            NAMES', ...list.map((c) => `${c.id.slice(0, 12)}   ${c.image.padEnd(12)}  ${(c.status === 'running' ? 'Up' : 'Exited').padEnd(8)}  ${c.ports.map((p) => p.replace(':', '->')).join(', ').padEnd(15)}  ${c.name}`), ...(list.length ? [] : ['(ничего не запущено)']));
			}
			case 'logs': {
				const c = find(f.rest[0] ?? '');
				return c ? say(...c.log) : say(`Error: No such container: ${f.rest[0] ?? ''}`);
			}
			case 'stop': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(`Error: No such container: ${f.rest[0] ?? ''}`);
				c.status = 'exited';
				containers = [...containers];
				return say(c.name);
			}
			case 'start': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(`Error: No such container: ${f.rest[0] ?? ''}`);
				c.status = 'running';
				containers = [...containers];
				return say(c.name);
			}
			case 'rm': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(`Error: No such container: ${f.rest[0] ?? ''}`);
				if (c.status === 'running') return say(`Error: нельзя удалить работающий контейнер. Сначала docker stop ${c.name}`);
				containers = containers.filter((x) => x !== c);
				return say(c.name, c.volumes.length ? 'Данные на томе остались: том живёт отдельно от контейнера.' : 'Всё, что контейнер записал внутрь себя, пропало: для данных нужен том (-v).');
			}
			case 'rmi': {
				const n = f.rest[0] ?? '';
				if (containers.some((c) => c.image === n || c.image + ':latest' === n)) return say('Error: образ используется контейнером. Сначала удалите контейнер.');
				images = images.filter((i) => i.name !== n && i.name !== n + ':latest');
				return say('Untagged: ' + n);
			}
			default:
				return say(`docker ${sub ?? ''}: такой команды нет в симуляторе. Введите help.`);
		}
	}
	async function submit(e: Event) {
		e.preventDefault();
		const line = cmd;
		cmd = '';
		await exec(line);
	}
	const suggestions = ['docker build -t site .', 'docker images', 'docker run -d -p 8080:80 --name site site', 'docker ps', 'curl http://localhost:8080', 'docker logs site', 'docker stop site', 'docker rm site'];
</script>

<figure class="dg">
	<figcaption>Docker в браузере: Dockerfile, образ, контейнер</figcaption>
	<div class="grid">
		<div>
			<div class="dg-ctl" role="group" aria-label="Готовый Dockerfile">
				{#each Object.entries(presets) as [k, v] (k)}<button type="button" onclick={() => (dockerfile = v.text)}>{v.label}</button>{/each}
			</div>
			<label class="area">Dockerfile
				<textarea bind:value={dockerfile} rows="9" spellcheck="false" class="dg-mono"></textarea>
			</label>
			<div class="dh">Образы (слои)</div>
			{#each images as im (im.name)}
				<div class="dg-box">
					<p><strong>{im.name}</strong> <span class="dim">~{im.size} МБ</span>{#if im.secrets} <span class="warn">секрет в образе</span>{/if}</p>
					<ol class="layers">{#each im.layers as l, i (i)}<li class="dg-mono">{l}</li>{/each}</ol>
				</div>
			{:else}<p class="dim">Образов нет. Соберите: <span class="dg-mono">docker build -t site .</span></p>{/each}
			<div class="dh">Контейнеры</div>
			{#each containers as c (c.id)}
				<div class="dg-box"><p><strong>{c.name}</strong> из <span class="dg-mono">{c.image}</span>: <span class:up={c.status === 'running'}>{c.status === 'running' ? 'работает' : 'остановлен'}</span>{c.ports.length ? `, порты ${c.ports.join(', ')}` : ', порт не опубликован'}{c.volumes.length ? `, том ${c.volumes.join(', ')}` : ''}</p></div>
			{:else}<p class="dim">Контейнеров нет.</p>{/each}
		</div>
		<div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
			<div class="term dg-mono" bind:this={box} role="log" aria-label="Терминал" tabindex="0">{#each out as l, i (i)}<div>{l}</div>{/each}</div>
			<form onsubmit={submit} class="dg-ctl">
				<label class="grow"><span class="visually-hidden">Команда</span><input bind:value={cmd} class="dg-mono" placeholder="docker build -t site ." autocomplete="off" spellcheck="false" /></label>
				<button type="submit">Выполнить</button>
			</form>
			<div class="dg-ctl" role="group" aria-label="Подсказки">
				{#each suggestions as s (s)}<button type="button" onclick={() => exec(s)}>{s}</button>{/each}
			</div>
		</div>
	</div>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		gap: var(--space-4);
	}
	.area {
		display: grid;
		gap: var(--space-1);
	}
	textarea,
	input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
	}
	input {
		min-height: var(--hit-min);
	}
	.grow {
		flex: 1;
	}
	.term {
		min-height: 14rem;
		max-height: 20rem;
		overflow: auto;
		padding: var(--space-3);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
		white-space: pre-wrap;
		margin-bottom: var(--space-2);
	}
	.dh {
		margin: var(--space-3) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.dg-box {
		margin-bottom: var(--space-2);
	}
	.dg-box p {
		margin: 0;
	}
	.layers {
		margin: var(--space-2) 0 0;
		font-size: 0.85em;
	}
	.dim {
		color: var(--text-secondary);
	}
	.warn {
		padding: 0 var(--space-2);
		border: var(--line) solid var(--text-primary);
	}
	.up {
		color: var(--accent-measure);
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
