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
	import { pick } from '#lib/i18n/index.ts';

	// The simulator's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// Docker's own output (build lines, `docker ps` headers) stays English in both; the explanations are the edition's.
	const W = pick({
		ru: {
			lang: 'ru',
			simple: 'Простой', multi: 'Сборка и раздача', secret: 'С ошибкой: ключ в образе',
			intro: 'Это учебный симулятор: настоящего Docker здесь нет. Введите help или нажмите на команду ниже.',
			title: 'Мой сайт',
			needTag: 'ERROR: нужен тег образа: docker build -t site .',
			noInstr: 'ERROR: failed to solve: file with no instructions',
			needFrom: 'ERROR: failed to solve: dockerfile parse error: первая инструкция должна быть FROM',
			notFound: (r: string) => `ERROR: failed to solve: ${r}: not found. Образ с таким именем не найден.`,
			noStage: (f: string) => `ERROR: failed to solve: COPY --from=${f}: стадии ${f} нет`,
			noFile: (f: string) => `ERROR: failed to solve: failed to compute cache key: "/${f}": not found. Такого файла нет в папке сборки.`,
			warnSecret: 'WARNING: в образ записан секрет (ENV или ARG с KEY, TOKEN, SECRET или PASSWORD). Его увидит любой, у кого есть образ. Передавайте секреты при запуске: docker run -e ... или через env_file.',
			needImage: 'ERROR: нужен образ: docker run -d -p 8080:80 --name site site',
			pullDenied: (i: string) => `ERROR: pull access denied for ${i}: репозитория нет или он закрыт. Соберите образ командой docker build.`,
			nameTaken: (n: string) => `ERROR: имя "${n}" уже занято контейнером. Выберите другое или удалите: docker rm ${n}`,
			portTaken: (h: string, n: string, next: number) => `ERROR: port is already allocated: порт ${h} уже занят контейнером ${n}. Возьмите другой, например -p ${next}:80`,
			foreground: 'nginx запущен; Ctrl+C остановит его. Для работы «в фоне» добавьте -d.',
			noPort: 'Подсказка: порт не опубликован (нет -p), поэтому снаружи контейнер не откроется.',
			noCmd: (c: string) => `${c}: команда не найдена. Введите help.`,
			help: ['Команды: docker build -t имя .   docker images   docker run -d -p 8080:80 --name site имя', 'docker ps [-a]   docker logs имя   docker stop имя   docker start имя   docker rm имя   docker rmi имя', 'curl http://localhost:8080   ls   clear'],
			refused: (p: string) => `curl: (7) Failed to connect to localhost port ${p}: соединение отклонено (контейнер не запущен или порт не опубликован)`,
			html: (t: string) => `<!doctype html><html lang="ru"><head><title>${t}</title></head><body><h1>${t}</h1>…`,
			noImages: '(образов пока нет: docker build)',
			nothingRunning: '(ничего не запущено)',
			noSuchContainer: (n: string) => `Error: No such container: ${n}`,
			cantRmRunning: (n: string) => `Error: нельзя удалить работающий контейнер. Сначала docker stop ${n}`,
			volumeKept: 'Данные на томе остались: том живёт отдельно от контейнера.',
			dataLost: 'Всё, что контейнер записал внутрь себя, пропало: для данных нужен том (-v).',
			imageInUse: 'Error: образ используется контейнером. Сначала удалите контейнер.',
			noSubcommand: (s: string) => `docker ${s}: такой команды нет в симуляторе. Введите help.`,
			mb: 'МБ',
			caption: 'Docker в браузере: Dockerfile, образ, контейнер',
			ready: 'Готовый Dockerfile',
			imagesH: 'Образы (слои)',
			secretInImage: 'секрет в образе',
			noImagesP: 'Образов нет. Соберите:',
			containersH: 'Контейнеры',
			from: 'из',
			running: 'работает', stopped: 'остановлен',
			ports: ', порты', noPortPub: ', порт не опубликован', volume: ', том',
			noContainers: 'Контейнеров нет.',
			terminal: 'Терминал', command: 'Команда', run: 'Выполнить', hints: 'Подсказки'
		},
		en: {
			lang: 'en',
			simple: 'Simple', multi: 'Build, then serve', secret: 'With a mistake: a key in the image',
			intro: 'This is a teaching simulator: there is no real Docker here. Type help or press a command below.',
			title: 'My site',
			needTag: 'ERROR: an image tag is needed: docker build -t site .',
			noInstr: 'ERROR: failed to solve: file with no instructions',
			needFrom: 'ERROR: failed to solve: dockerfile parse error: the first instruction must be FROM',
			notFound: (r: string) => `ERROR: failed to solve: ${r}: not found. No image with that name exists.`,
			noStage: (f: string) => `ERROR: failed to solve: COPY --from=${f}: there is no stage ${f}`,
			noFile: (f: string) => `ERROR: failed to solve: failed to compute cache key: "/${f}": not found. That file isn't in the build folder.`,
			warnSecret: 'WARNING: a secret is written into the image (ENV or ARG with KEY, TOKEN, SECRET or PASSWORD). Anyone who has the image will see it. Pass secrets at launch: docker run -e ... or through env_file.',
			needImage: 'ERROR: an image is needed: docker run -d -p 8080:80 --name site site',
			pullDenied: (i: string) => `ERROR: pull access denied for ${i}: the repository doesn't exist or is closed. Build the image with docker build.`,
			nameTaken: (n: string) => `ERROR: the name "${n}" is already taken by a container. Choose another or remove it: docker rm ${n}`,
			portTaken: (h: string, n: string, next: number) => `ERROR: port is already allocated: port ${h} is already taken by the container ${n}. Take another, for example -p ${next}:80`,
			foreground: 'nginx is running; Ctrl+C would stop it. To run it “in the background” add -d.',
			noPort: 'Hint: the port is not published (no -p), so the container can’t be opened from outside.',
			noCmd: (c: string) => `${c}: command not found. Type help.`,
			help: ['Commands: docker build -t name .   docker images   docker run -d -p 8080:80 --name site name', 'docker ps [-a]   docker logs name   docker stop name   docker start name   docker rm name   docker rmi name', 'curl http://localhost:8080   ls   clear'],
			refused: (p: string) => `curl: (7) Failed to connect to localhost port ${p}: connection refused (the container isn't running or the port isn't published)`,
			html: (t: string) => `<!doctype html><html lang="en"><head><title>${t}</title></head><body><h1>${t}</h1>…`,
			noImages: '(no images yet: docker build)',
			nothingRunning: '(nothing is running)',
			noSuchContainer: (n: string) => `Error: No such container: ${n}`,
			cantRmRunning: (n: string) => `Error: a running container can't be removed. First docker stop ${n}`,
			volumeKept: 'The data on the volume is still there: a volume lives apart from the container.',
			dataLost: 'Everything the container wrote inside itself is gone: data needs a volume (-v).',
			imageInUse: 'Error: the image is in use by a container. Remove the container first.',
			noSubcommand: (s: string) => `docker ${s}: the simulator has no such command. Type help.`,
			mb: 'MB',
			caption: 'Docker in the browser: a Dockerfile, an image, a container',
			ready: 'A ready-made Dockerfile',
			imagesH: 'Images (layers)',
			secretInImage: 'a secret in the image',
			noImagesP: 'There are no images. Build one:',
			containersH: 'Containers',
			from: 'from',
			running: 'running', stopped: 'stopped',
			ports: ', ports', noPortPub: ', port not published', volume: ', volume',
			noContainers: 'There are no containers.',
			terminal: 'Terminal', command: 'Command', run: 'Run', hints: 'Suggestions'
		}
	});

	type Image = { name: string; layers: string[]; size: number; secrets: boolean };
	type Container = { id: string; name: string; image: string; ports: string[]; status: 'running' | 'exited'; env: string[]; volumes: string[]; log: string[] };

	const presets: Record<string, { label: string; text: string }> = {
		simple: { label: W.simple, text: 'FROM nginx:alpine\nCOPY dist/ /usr/share/nginx/html/\nEXPOSE 80\n' },
		multi: { label: W.multi, text: 'FROM node:lts-alpine AS build\nWORKDIR /app\nCOPY package.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80\n' },
		secret: { label: W.secret, text: 'FROM nginx:alpine\nENV API_KEY=sk-live-1234567890\nCOPY dist/ /usr/share/nginx/html/\nEXPOSE 80\n' }
	};
	const known = ['nginx:alpine', 'nginx', 'node:lts-alpine', 'hello-world', 'busybox', 'postgres'];
	const context = ['Dockerfile', 'dist', 'package.json', 'src', '.dockerignore'];

	let dockerfile = $state(presets.simple.text);
	let images = $state<Image[]>([]);
	let containers = $state<Container[]>([]);
	let lastBuild = $state<string[]>([]);
	let out = $state<string[]>([W.intro]);
	let cmd = $state('');
	let title = $state(W.title);
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
		if (!tag) return say(W.needTag);
		const ins = dockerfile.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
		if (!ins.length) return say(W.noInstr);
		if (!/^FROM\s/i.test(ins[0])) return say(W.needFrom);
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
				if (!known.some((k) => ref === k) && !ref.includes('/')) return say(W.notFound(ref));
			}
			if (op === 'COPY') {
				const from = rest.match(/--from=(\S+)/)?.[1];
				if (from && !stages.includes(from)) return say(W.noStage(from));
				if (!from) {
					const src = rest.split(/\s+/).filter((x) => !x.startsWith('--'))[0] ?? '';
					const first = src.replace(/\/$/, '').split('/')[0];
					if (src !== '.' && !context.includes(first)) return say(W.noFile(first));
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
		if (secrets) await say(W.warnSecret);
	}

	async function run(args: string[]) {
		const f = flags(args);
		const image = f.rest[0];
		if (!image) return say(W.needImage);
		const local = images.find((i) => i.name === image || i.name === image + ':latest');
		const lines: string[] = [];
		if (!local) {
			if (!known.includes(image)) return say(`Unable to find image '${image}' locally`, W.pullDenied(image));
			lines.push(`Unable to find image '${image}' locally`, `${image}: Pulling from library/${image.split(':')[0]}`, 'Status: Downloaded newer image');
		}
		const name = f.name || ['quiet_fox', 'brave_owl', 'calm_hare'][containers.length % 3];
		if (containers.some((c) => c.name === name)) return say(W.nameTaken(name));
		for (const m of f.p) {
			const host = m.split(':')[0];
			const clash = containers.find((c) => c.status === 'running' && c.ports.some((p) => p.split(':')[0] === host));
			if (clash) return say(W.portTaken(host, clash.name, +host + 1));
		}
		const c: Container = { id: id(), name, image, ports: f.p, status: 'running', env: f.e, volumes: f.v, log: ['/docker-entrypoint.sh: Configuration complete; ready for start up', 'start worker processes'] };
		containers = [...containers, c];
		await say(...lines, f.d ? c.id : W.foreground);
		if (!f.d) {
			c.status = 'exited';
			containers = [...containers];
		}
		if (!f.p.length) await say(W.noPort);
	}

	async function exec(line: string) {
		const t = line.trim();
		if (!t) return;
		await say('$ ' + t);
		const [bin, sub, ...args] = t.split(/\s+/);
		if (t === 'clear') return void (out = []);
		if (t === 'ls') return say('Dockerfile  dist/  package.json  src/  .dockerignore');
		if (t === 'help')
			return say(...W.help);
		if (bin === 'curl') {
			const port = t.match(/:(\d+)/)?.[1];
			const c = containers.find((x) => x.status === 'running' && x.ports.some((p) => p.split(':')[0] === port));
			if (!c) return say(W.refused(port ?? '80'));
			c.log = [...c.log, `172.17.0.1 - - "GET / HTTP/1.1" 200 612`];
			containers = [...containers];
			return say('HTTP/1.1 200 OK', W.html(title));
		}
		if (bin !== 'docker') return say(W.noCmd(bin));
		const f = flags(args);
		switch (sub) {
			case 'build':
				return build(args);
			case 'images':
				return say('REPOSITORY   TAG      SIZE', ...images.map((i) => `${i.name.split(':')[0].padEnd(12)} ${(i.name.split(':')[1] ?? 'latest').padEnd(8)} ~${i.size} ${W.mb}`), ...(images.length ? [] : [W.noImages]));
			case 'run':
				return run(args);
			case 'ps': {
				const list = containers.filter((c) => f.a || c.status === 'running');
				return say('CONTAINER ID   IMAGE         STATUS    PORTS            NAMES', ...list.map((c) => `${c.id.slice(0, 12)}   ${c.image.padEnd(12)}  ${(c.status === 'running' ? 'Up' : 'Exited').padEnd(8)}  ${c.ports.map((p) => p.replace(':', '->')).join(', ').padEnd(15)}  ${c.name}`), ...(list.length ? [] : [W.nothingRunning]));
			}
			case 'logs': {
				const c = find(f.rest[0] ?? '');
				return c ? say(...c.log) : say(W.noSuchContainer(f.rest[0] ?? ''));
			}
			case 'stop': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(W.noSuchContainer(f.rest[0] ?? ''));
				c.status = 'exited';
				containers = [...containers];
				return say(c.name);
			}
			case 'start': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(W.noSuchContainer(f.rest[0] ?? ''));
				c.status = 'running';
				containers = [...containers];
				return say(c.name);
			}
			case 'rm': {
				const c = find(f.rest[0] ?? '');
				if (!c) return say(W.noSuchContainer(f.rest[0] ?? ''));
				if (c.status === 'running') return say(W.cantRmRunning(c.name));
				containers = containers.filter((x) => x !== c);
				return say(c.name, c.volumes.length ? W.volumeKept : W.dataLost);
			}
			case 'rmi': {
				const n = f.rest[0] ?? '';
				if (containers.some((c) => c.image === n || c.image + ':latest' === n)) return say(W.imageInUse);
				images = images.filter((i) => i.name !== n && i.name !== n + ':latest');
				return say('Untagged: ' + n);
			}
			default:
				return say(W.noSubcommand(sub ?? ''));
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
	<figcaption>{W.caption}</figcaption>
	<div class="grid">
		<div>
			<div class="dg-ctl" role="group" aria-label={W.ready}>
				{#each Object.entries(presets) as [k, v] (k)}<button type="button" onclick={() => (dockerfile = v.text)}>{v.label}</button>{/each}
			</div>
			<label class="area">Dockerfile
				<textarea bind:value={dockerfile} rows="9" spellcheck="false" class="dg-mono"></textarea>
			</label>
			<div class="dh">{W.imagesH}</div>
			{#each images as im (im.name)}
				<div class="dg-box">
					<p><strong>{im.name}</strong> <span class="dim">~{im.size} {W.mb}</span>{#if im.secrets} <span class="warn">{W.secretInImage}</span>{/if}</p>
					<ol class="layers">{#each im.layers as l, i (i)}<li class="dg-mono">{l}</li>{/each}</ol>
				</div>
			{:else}<p class="dim">{W.noImagesP} <span class="dg-mono">docker build -t site .</span></p>{/each}
			<div class="dh">{W.containersH}</div>
			{#each containers as c (c.id)}
				<div class="dg-box"><p><strong>{c.name}</strong> {W.from} <span class="dg-mono">{c.image}</span>: <span class:up={c.status === 'running'}>{c.status === 'running' ? W.running : W.stopped}</span>{c.ports.length ? `${W.ports} ${c.ports.join(', ')}` : W.noPortPub}{c.volumes.length ? `${W.volume} ${c.volumes.join(', ')}` : ''}</p></div>
			{:else}<p class="dim">{W.noContainers}</p>{/each}
		</div>
		<div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
			<div class="term dg-mono" bind:this={box} role="log" aria-label={W.terminal} tabindex="0">{#each out as l, i (i)}<div>{l}</div>{/each}</div>
			<form onsubmit={submit} class="dg-ctl">
				<label class="grow"><span class="visually-hidden">{W.command}</span><input bind:value={cmd} class="dg-mono" placeholder="docker build -t site ." autocomplete="off" spellcheck="false" /></label>
				<button type="submit">{W.run}</button>
			</form>
			<div class="dg-ctl" role="group" aria-label={W.hints}>
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
