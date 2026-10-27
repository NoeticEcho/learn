// @ts-nocheck
/*
	«Учебный SQL»: маленький разборщик для уроков части 7 (и для их практики).
	Это НЕ PostgreSQL и не его кусок. Он понимает несколько основных конструкций: CREATE TABLE,
	CREATE INDEX, INSERT, SELECT (JOIN, LEFT JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT),
	UPDATE, DELETE, BEGIN/COMMIT/ROLLBACK и EXPLAIN. Всё живёт в памяти страницы и пропадает при
	перезагрузке. Сообщения об ошибках похожи на настоящие, но написаны здесь.
	Настоящий PostgreSQL в браузере: https://pglite.dev/

	Файл написан на простом JavaScript без типов: практика уроков вставляет его текст в страницу
	человека (блок data-scaffold), и там он должен работать как есть. Licence: Apache-2.0.
*/

export class SqlError extends Error {}

const KEYWORDS = new Set(
	'select from where group by having order limit offset asc desc distinct as join inner left right outer on and or not null is in like between true false insert into values update set delete create table index unique primary key references default begin commit rollback explain integer int serial text varchar numeric boolean date timestamp real if exists'.split(
		' '
	)
);

function tokenize(src) {
	const out = [];
	const re = /\s+|--[^\n]*|('(?:[^']|'')*')|("(?:[^"]*)")|(\d+(?:\.\d+)?)|([A-Za-z_\u0400-\u04FF][A-Za-z0-9_\u0400-\u04FF]*)|(<=|>=|<>|!=|\|\||[(),.*+\-\/=<>;])/gy;
	let pos = 0;
	while (pos < src.length) {
		re.lastIndex = pos;
		const m = re.exec(src);
		if (!m) throw new SqlError(`синтаксическая ошибка: не понимаю символ «${src[pos]}»`);
		pos = re.lastIndex;
		if (m[1] !== undefined) out.push({ t: 'str', v: m[1].slice(1, -1).replace(/''/g, "'") });
		else if (m[2] !== undefined) out.push({ t: 'id', v: m[2].slice(1, -1).toLowerCase(), quoted: true });
		else if (m[3] !== undefined) out.push({ t: 'num', v: Number(m[3]) });
		else if (m[4] !== undefined) {
			const low = m[4].toLowerCase();
			out.push(KEYWORDS.has(low) ? { t: 'kw', v: low, raw: m[4] } : { t: 'id', v: low });
		} else if (m[5] !== undefined) out.push({ t: 'op', v: m[5] });
	}
	return out;
}

/** The text of a script, split into statements by «;» outside quotes. */
export function splitStatements(sql) {
	const parts = [];
	let cur = '';
	let q = false;
	for (let i = 0; i < sql.length; i++) {
		const c = sql[i];
		if (c === "'") q = !q;
		if (c === ';' && !q) {
			parts.push(cur);
			cur = '';
		} else cur += c;
	}
	parts.push(cur);
	return parts.map((s) => s.replace(/--[^\n]*/g, '').trim()).filter(Boolean);
}

class Parser {
	constructor(tokens) {
		this.k = tokens;
		this.i = 0;
	}
	peek(o = 0) {
		return this.k[this.i + o];
	}
	isKw(v, o = 0) {
		const t = this.peek(o);
		return !!t && t.t === 'kw' && t.v === v;
	}
	isOp(v, o = 0) {
		const t = this.peek(o);
		return !!t && t.t === 'op' && t.v === v;
	}
	eatKw(v) {
		if (this.isKw(v)) return this.i++, true;
		return false;
	}
	eatOp(v) {
		if (this.isOp(v)) return this.i++, true;
		return false;
	}
	expectKw(v) {
		if (!this.eatKw(v)) this.fail(`ожидалось слово ${v.toUpperCase()}`);
	}
	expectOp(v) {
		if (!this.eatOp(v)) this.fail(`ожидался символ «${v}»`);
	}
	fail(msg) {
		const t = this.peek();
		const near = t ? ` около «${t.t === 'str' ? "'" + t.v + "'" : (t.raw ?? t.v)}»` : ' в конце запроса';
		throw new SqlError(`синтаксическая ошибка${near}: ${msg}`);
	}
	name() {
		const t = this.peek();
		if (t && (t.t === 'id' || (t.t === 'kw' && ['key', 'text', 'date', 'index'].includes(t.v)))) return this.i++, t.v;
		this.fail('ожидалось имя');
	}
	done() {
		return this.i >= this.k.length;
	}

	/* expressions */
	expr() {
		return this.or();
	}
	or() {
		let l = this.and();
		while (this.eatKw('or')) l = { op: 'or', l, r: this.and() };
		return l;
	}
	and() {
		let l = this.not();
		while (this.eatKw('and')) l = { op: 'and', l, r: this.not() };
		return l;
	}
	not() {
		if (this.eatKw('not')) return { op: 'not', e: this.not() };
		return this.cmp();
	}
	cmp() {
		const l = this.add();
		const t = this.peek();
		if (t && t.t === 'op' && ['=', '<>', '!=', '<', '>', '<=', '>='].includes(t.v)) {
			this.i++;
			return { op: t.v === '!=' ? '<>' : t.v, l, r: this.add() };
		}
		if (this.isKw('is')) {
			this.i++;
			const neg = this.eatKw('not');
			this.expectKw('null');
			return { op: 'isnull', e: l, neg };
		}
		const neg = this.isKw('not') && (this.isKw('like', 1) || this.isKw('in', 1) || this.isKw('between', 1));
		if (neg) this.i++;
		if (this.eatKw('like')) return { op: 'like', l, r: this.add(), neg };
		if (this.eatKw('in')) {
			this.expectOp('(');
			const list = [this.expr()];
			while (this.eatOp(',')) list.push(this.expr());
			this.expectOp(')');
			return { op: 'in', l, list, neg };
		}
		if (this.eatKw('between')) {
			const lo = this.add();
			this.expectKw('and');
			const hi = this.add();
			return { op: 'between', e: l, lo, hi, neg };
		}
		return l;
	}
	add() {
		let l = this.mul();
		for (;;) {
			const t = this.peek();
			if (t && t.t === 'op' && ['+', '-', '||'].includes(t.v)) {
				this.i++;
				l = { op: t.v, l, r: this.mul() };
			} else return l;
		}
	}
	mul() {
		let l = this.unary();
		for (;;) {
			const t = this.peek();
			if (t && t.t === 'op' && ['*', '/'].includes(t.v)) {
				this.i++;
				l = { op: t.v, l, r: this.unary() };
			} else return l;
		}
	}
	unary() {
		if (this.eatOp('-')) return { op: 'neg', e: this.unary() };
		return this.primary();
	}
	primary() {
		const t = this.peek();
		if (!t) this.fail('ожидалось значение');
		if (t.t === 'num') return this.i++, { op: 'lit', v: t.v };
		if (t.t === 'str') return this.i++, { op: 'lit', v: t.v };
		if (t.t === 'kw' && t.v === 'null') return this.i++, { op: 'lit', v: null };
		if (t.t === 'kw' && t.v === 'true') return this.i++, { op: 'lit', v: true };
		if (t.t === 'kw' && t.v === 'false') return this.i++, { op: 'lit', v: false };
		if (this.eatOp('(')) {
			const e = this.expr();
			this.expectOp(')');
			return e;
		}
		if (t.t === 'id' && this.isOp('(', 1)) {
			this.i += 2;
			const fn = t.v;
			if (!['count', 'sum', 'avg', 'min', 'max', 'lower', 'upper', 'length', 'coalesce'].includes(fn)) throw new SqlError(`функция ${fn}() здесь не поддерживается`);
			if (fn === 'count' && this.eatOp('*')) {
				this.expectOp(')');
				return { op: 'agg', fn, star: true };
			}
			const args = [this.expr()];
			while (this.eatOp(',')) args.push(this.expr());
			this.expectOp(')');
			return ['count', 'sum', 'avg', 'min', 'max'].includes(fn) ? { op: 'agg', fn, e: args[0] } : { op: 'fn', fn, args };
		}
		if (t.t === 'id' || (t.t === 'kw' && ['text', 'date', 'key', 'index'].includes(t.v))) {
			this.i++;
			if (this.isOp('.') && this.peek(1) && (this.peek(1).t === 'id' || this.peek(1).t === 'kw')) {
				this.i++;
				const c = this.peek();
				this.i++;
				return { op: 'col', table: t.v, name: c.v };
			}
			return { op: 'col', name: t.v };
		}
		this.fail('ожидалось значение или имя столбца');
	}
}

const text = (e) => {
	switch (e.op) {
		case 'col':
			return e.table ? `${e.table}.${e.name}` : e.name;
		case 'lit':
			return e.v === null ? 'NULL' : typeof e.v === 'string' ? `'${e.v}'` : String(e.v);
		case 'agg':
			return `${e.fn}(${e.star ? '*' : text(e.e)})`;
		case 'fn':
			return `${e.fn}(${e.args.map(text).join(', ')})`;
		default:
			return e.op;
	}
};

const hasAgg = (e) => !!e && (e.op === 'agg' || [e.l, e.r, e.e, e.lo, e.hi].some(hasAgg) || (e.args || e.list || []).some(hasAgg));

export function createDb() {
	return { tables: {}, indexes: [], txn: null, aborted: false };
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const isNum = (v) => typeof v === 'number';

function table(db, name) {
	const t = db.tables[name];
	if (!t) throw new SqlError(`таблицы «${name}» нет. Есть: ${Object.keys(db.tables).join(', ') || 'ни одной'}`);
	return t;
}

function coerce(col, v) {
	if (v === null || v === undefined) return null;
	const ty = col.type;
	if (['integer', 'int', 'serial'].includes(ty)) {
		if (isNum(v) && Number.isInteger(v)) return v;
		if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) return Number(v);
		throw new SqlError(`значение ${typeof v === 'string' ? `«${v}»` : v} не подходит к типу integer (столбец ${col.name})`);
	}
	if (['numeric', 'real'].includes(ty)) {
		if (isNum(v)) return v;
		if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
		throw new SqlError(`значение «${v}» не подходит к типу ${ty} (столбец ${col.name})`);
	}
	if (ty === 'boolean') {
		if (typeof v === 'boolean') return v;
		throw new SqlError(`значение «${v}» не подходит к типу boolean (столбец ${col.name})`);
	}
	return typeof v === 'string' ? v : String(v);
}

/* ---------- evaluation ---------- */

function resolve(ctx, e) {
	const found = [];
	for (const c of ctx) {
		if (e.table && c.alias !== e.table) continue;
		if (c.cols.includes(e.name)) found.push(c);
	}
	if (!found.length) {
		const all = ctx.flatMap((c) => c.cols.map((n) => `${c.alias}.${n}`));
		throw new SqlError(`столбца «${e.table ? e.table + '.' : ''}${e.name}» нет. Доступны: ${all.join(', ')}`);
	}
	if (found.length > 1) throw new SqlError(`столбец «${e.name}» неоднозначен: он есть в таблицах ${found.map((f) => f.alias).join(' и ')}. Напишите ${found[0].alias}.${e.name}`);
	return found[0].row ? found[0].row[e.name] : null;
}

function cmpVals(a, b) {
	if (a === null || b === null) return null;
	if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
	if (typeof a !== typeof b) throw new SqlError(`нельзя сравнить ${typeof a === 'number' ? 'число' : 'текст'} и ${typeof b === 'number' ? 'число' : 'текст'}`);
	return a < b ? -1 : a > b ? 1 : 0;
}

function like(s, p) {
	const re = new RegExp('^' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'is');
	return re.test(s);
}

function ev(e, ctx, grp) {
	switch (e.op) {
		case 'lit':
			return e.v;
		case 'col':
			return resolve(ctx, e);
		case 'neg': {
			const v = ev(e.e, ctx, grp);
			return v === null ? null : -v;
		}
		case 'not': {
			const v = ev(e.e, ctx, grp);
			return v === null ? null : !v;
		}
		case 'and': {
			const l = ev(e.l, ctx, grp);
			if (l === false) return false;
			const r = ev(e.r, ctx, grp);
			if (r === false) return false;
			return l === null || r === null ? null : true;
		}
		case 'or': {
			const l = ev(e.l, ctx, grp);
			if (l === true) return true;
			const r = ev(e.r, ctx, grp);
			if (r === true) return true;
			return l === null || r === null ? null : false;
		}
		case '=':
		case '<>':
		case '<':
		case '>':
		case '<=':
		case '>=': {
			const c = cmpVals(ev(e.l, ctx, grp), ev(e.r, ctx, grp));
			if (c === null) return null;
			return { '=': c === 0, '<>': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[e.op];
		}
		case 'isnull': {
			const v = ev(e.e, ctx, grp);
			return e.neg ? v !== null : v === null;
		}
		case 'like': {
			const l = ev(e.l, ctx, grp),
				r = ev(e.r, ctx, grp);
			if (l === null || r === null) return null;
			const m = like(String(l), String(r));
			return e.neg ? !m : m;
		}
		case 'in': {
			const l = ev(e.l, ctx, grp);
			if (l === null) return null;
			const m = e.list.some((x) => cmpVals(l, ev(x, ctx, grp)) === 0);
			return e.neg ? !m : m;
		}
		case 'between': {
			const v = ev(e.e, ctx, grp);
			const lo = cmpVals(v, ev(e.lo, ctx, grp)),
				hi = cmpVals(v, ev(e.hi, ctx, grp));
			if (lo === null || hi === null) return null;
			const m = lo >= 0 && hi <= 0;
			return e.neg ? !m : m;
		}
		case '+':
		case '-':
		case '*':
		case '/': {
			const l = ev(e.l, ctx, grp),
				r = ev(e.r, ctx, grp);
			if (l === null || r === null) return null;
			if (!isNum(l) || !isNum(r)) throw new SqlError(`арифметика (${e.op}) работает с числами, а здесь текст`);
			if (e.op === '/' && r === 0) throw new SqlError('деление на ноль');
			return e.op === '+' ? l + r : e.op === '-' ? l - r : e.op === '*' ? l * r : l / r;
		}
		case '||': {
			const l = ev(e.l, ctx, grp),
				r = ev(e.r, ctx, grp);
			return l === null || r === null ? null : String(l) + String(r);
		}
		case 'fn': {
			const a = e.args.map((x) => ev(x, ctx, grp));
			if (e.fn === 'coalesce') return a.find((x) => x !== null) ?? null;
			if (a[0] === null) return null;
			if (e.fn === 'lower') return String(a[0]).toLowerCase();
			if (e.fn === 'upper') return String(a[0]).toUpperCase();
			return String(a[0]).length;
		}
		case 'agg': {
			if (!grp) throw new SqlError(`${e.fn.toUpperCase()}() можно писать только в SELECT или HAVING, но не в WHERE`);
			if (e.star) return grp.length;
			const vals = grp.map((g) => ev(e.e, g, null)).filter((v) => v !== null);
			if (e.fn === 'count') return vals.length;
			if (!vals.length) return null;
			if (e.fn === 'min') return vals.reduce((a, b) => (cmpVals(a, b) <= 0 ? a : b));
			if (e.fn === 'max') return vals.reduce((a, b) => (cmpVals(a, b) >= 0 ? a : b));
			if (!vals.every(isNum)) throw new SqlError(`${e.fn.toUpperCase()}() считает только числа`);
			const s = vals.reduce((a, b) => a + b, 0);
			return e.fn === 'sum' ? s : s / vals.length;
		}
	}
	throw new SqlError('не понимаю выражение');
}

/* ---------- statements ---------- */

function parseSelect(p) {
	const q = { distinct: false, items: [], from: null, joins: [], where: null, group: [], having: null, order: [], limit: null, offset: 0 };
	p.expectKw('select');
	q.distinct = p.eatKw('distinct');
	do {
		if (p.eatOp('*')) q.items.push({ star: true });
		else if (p.peek() && p.peek().t === 'id' && p.isOp('.', 1) && p.isOp('*', 2)) {
			const tb = p.peek().v;
			p.i += 3;
			q.items.push({ star: true, table: tb });
		} else {
			const e = p.expr();
			let alias = null;
			if (p.eatKw('as')) alias = p.name();
			else if (p.peek() && p.peek().t === 'id') alias = p.name();
			q.items.push({ e, alias });
		}
	} while (p.eatOp(','));
	if (p.eatKw('from')) {
		const tableRef = () => {
			const name = p.name();
			let alias = name;
			if (p.eatKw('as')) alias = p.name();
			else if (p.peek() && p.peek().t === 'id') alias = p.name();
			return { name, alias };
		};
		q.from = tableRef();
		for (;;) {
			let kind = null;
			if (p.eatKw('left')) {
				p.eatKw('outer');
				p.expectKw('join');
				kind = 'left';
			} else if (p.eatKw('inner')) {
				p.expectKw('join');
				kind = 'inner';
			} else if (p.eatKw('join')) kind = 'inner';
			else if (p.isKw('right')) throw new SqlError('RIGHT JOIN в учебной песочнице не поддерживается: поменяйте таблицы местами и напишите LEFT JOIN');
			else break;
			const ref = tableRef();
			p.expectKw('on');
			q.joins.push({ kind, ...ref, on: p.expr() });
		}
	}
	if (p.eatKw('where')) q.where = p.expr();
	if (p.eatKw('group')) {
		p.expectKw('by');
		do q.group.push(p.expr());
		while (p.eatOp(','));
	}
	if (p.eatKw('having')) q.having = p.expr();
	if (p.eatKw('order')) {
		p.expectKw('by');
		do {
			const e = p.expr();
			const desc = p.eatKw('desc');
			if (!desc) p.eatKw('asc');
			q.order.push({ e, desc });
		} while (p.eatOp(','));
	}
	if (p.eatKw('limit')) {
		const t = p.peek();
		if (!t || t.t !== 'num') p.fail('после LIMIT нужно число');
		p.i++;
		q.limit = t.v;
	}
	if (p.eatKw('offset')) {
		const t = p.peek();
		if (!t || t.t !== 'num') p.fail('после OFFSET нужно число');
		p.i++;
		q.offset = t.v;
	}
	return q;
}

/** An index can serve `col = literal` among the AND-ed conditions of WHERE. */
function indexFor(db, q, tname, alias) {
	if (!q.where) return null;
	const conj = [];
	(function walk(e) {
		if (e.op === 'and') (walk(e.l), walk(e.r));
		else conj.push(e);
	})(q.where);
	for (const c of conj) {
		if (c.op !== '=') continue;
		const [a, b] = c.l.op === 'col' ? [c.l, c.r] : [c.r, c.l];
		if (a.op !== 'col' || b.op !== 'lit' || (a.table && a.table !== alias)) continue;
		const ix = db.indexes.find((i) => i.table === tname && i.cols[0] === a.name);
		if (ix) return { ix, col: a.name, value: b.v };
		const t = db.tables[tname];
		if (t.pk.length === 1 && t.pk[0] === a.name) return { ix: { name: `${tname}_pkey`, table: tname, cols: [a.name] }, col: a.name, value: b.v };
	}
	return null;
}

function execSelect(db, q, explain) {
	let scanned = 0;
	const plan = [];
	const trace = { from: 0, where: 0, groups: null, result: 0, limit: 0 };
	let ctxRows = [];
	if (!q.from) {
		ctxRows = [[]];
	} else {
		const t0 = table(db, q.from.name);
		const hit = indexFor(db, q, q.from.name, q.from.alias);
		let base = t0.rows;
		if (hit) {
			base = t0.rows.filter((r) => r[hit.col] === hit.value);
			scanned += base.length;
			plan.push(`Index Scan по индексу ${hit.ix.name} на «${q.from.name}»: прочитано строк ${base.length}`);
		} else {
			scanned += t0.rows.length;
			plan.push(`Seq Scan на «${q.from.name}»: просмотрена вся таблица, строк ${t0.rows.length}`);
		}
		ctxRows = base.map((r) => [{ alias: q.from.alias, cols: t0.columns.map((c) => c.name), row: r }]);
		for (const j of q.joins) {
			const tj = table(db, j.name);
			const cols = tj.columns.map((c) => c.name);
			const next = [];
			scanned += tj.rows.length;
			plan.push(`${j.kind === 'left' ? 'Left ' : ''}Join с «${j.name}»: просмотрено строк ${tj.rows.length}`);
			for (const left of ctxRows) {
				let matched = false;
				for (const r of tj.rows) {
					const ctx = [...left, { alias: j.alias, cols, row: r }];
					if (ev(j.on, ctx, null) === true) {
						next.push(ctx);
						matched = true;
					}
				}
				if (!matched && j.kind === 'left') next.push([...left, { alias: j.alias, cols, row: null }]);
			}
			ctxRows = next;
		}
	}
	trace.from = ctxRows.length;
	if (q.where) {
		if (hasAgg(q.where)) throw new SqlError('в WHERE нельзя писать COUNT, SUM и подобные: они считаются после отбора. Для условий по ним есть HAVING');
		ctxRows = ctxRows.filter((c) => ev(q.where, c, null) === true);
	}
	trace.where = ctxRows.length;
	const aggregated = q.group.length > 0 || q.items.some((i) => i.e && hasAgg(i.e)) || (q.having && hasAgg(q.having));
	// the header
	const columns = [];
	const exprs = [];
	for (const it of q.items) {
		if (it.star) {
			const sample = q.from ? [{ alias: q.from.alias, cols: table(db, q.from.name).columns.map((c) => c.name) }, ...q.joins.map((j) => ({ alias: j.alias, cols: table(db, j.name).columns.map((c) => c.name) }))] : [];
			for (const s of sample) {
				if (it.table && s.alias !== it.table) continue;
				for (const n of s.cols) {
					columns.push(n);
					exprs.push({ op: 'col', table: s.alias, name: n });
				}
			}
		} else {
			columns.push(it.alias || (it.e.op === 'col' ? it.e.name : it.e.op === 'agg' || it.e.op === 'fn' ? it.e.fn : text(it.e)));
			exprs.push(it.e);
		}
	}
	let rows; // each: { out: [...], ctx, grp }
	if (aggregated) {
		const groups = new Map();
		for (const c of ctxRows) {
			const key = JSON.stringify(q.group.map((g) => ev(g, c, null)));
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(c);
		}
		if (!q.group.length && !groups.size) groups.set('', []);
		const groupText = q.group.map((g) => (g.op === 'col' ? g.name : text(g)));
		for (const [i, e] of exprs.entries()) {
			const bare = (x) => !x || x.op === 'agg' || x.op === 'lit' || groupText.includes(x.op === 'col' ? x.name : text(x)) || ([x.l, x.r, x.e].some((s) => s) && [x.l, x.r, x.e].filter(Boolean).every(bare));
			if (!bare(e)) throw new SqlError(`столбец «${columns[i]}» нужно либо добавить в GROUP BY, либо обернуть в COUNT, SUM, MIN, MAX или AVG: иначе непонятно, какую из строк группы показать`);
		}
		rows = [...groups.values()].map((g) => ({ grp: g, ctx: g[0] || [] }));
		trace.groups = rows.length;
		if (q.having) rows = rows.filter((r) => ev(q.having, r.ctx, r.grp) === true);
		rows.forEach((r) => (r.out = exprs.map((e) => ev(e, r.ctx, r.grp))));
	} else {
		rows = ctxRows.map((c) => ({ ctx: c, grp: null, out: exprs.map((e) => ev(e, c, null)) }));
	}
	if (q.distinct) {
		const seen = new Set();
		rows = rows.filter((r) => {
			const k = JSON.stringify(r.out);
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
	}
	if (q.order.length) {
		const keyOf = (r, o) => {
			if (o.e.op === 'lit' && isNum(o.e.v)) return r.out[o.e.v - 1];
			if (o.e.op === 'col' && !o.e.table && columns.includes(o.e.name)) return r.out[columns.indexOf(o.e.name)];
			return ev(o.e, r.ctx, r.grp);
		};
		rows.sort((a, b) => {
			for (const o of q.order) {
				const x = keyOf(a, o),
					y = keyOf(b, o);
				if (x === y) continue;
				if (x === null) return o.desc ? -1 : 1;
				if (y === null) return o.desc ? 1 : -1;
				const c = cmpVals(x, y);
				if (c !== 0) return o.desc ? -c : c;
			}
			return 0;
		});
	}
	trace.result = rows.length;
	const total = rows.length;
	if (q.offset) rows = rows.slice(q.offset);
	if (q.limit !== null) rows = rows.slice(0, q.limit);
	trace.limit = rows.length;
	return { kind: 'select', columns, rows: rows.map((r) => r.out), scanned, plan, total, trace };
}

function checkRow(db, t, row, skipPk) {
	for (const c of t.columns) {
		if (row[c.name] === null && (c.notNull || t.pk.includes(c.name))) throw new SqlError(`в столбец «${c.name}» таблицы «${t.name}» нельзя записать NULL (нарушено ограничение NOT NULL)`);
		if (c.ref && row[c.name] !== null) {
			const rt = db.tables[c.ref.table];
			if (!rt) throw new SqlError(`таблицы «${c.ref.table}» нет`);
			if (!rt.rows.some((r) => r[c.ref.col] === row[c.name])) throw new SqlError(`нарушен внешний ключ: в таблице «${c.ref.table}» нет строки, где ${c.ref.col} = ${row[c.name]}`);
		}
	}
	const uniq = [t.pk.length ? t.pk : null, ...t.columns.filter((c) => c.unique).map((c) => [c.name])].filter(Boolean);
	for (const cols of uniq) {
		const dup = t.rows.some((r) => r !== skipPk && cols.every((c) => r[c] === row[c]));
		if (dup) throw new SqlError(`нарушено ограничение уникальности: строка с ${cols.map((c) => `${c} = ${row[c]}`).join(', ')} в таблице «${t.name}» уже есть`);
	}
}

function execOne(db, sql) {
	const p = new Parser(tokenize(sql));
	const first = p.peek();
	if (!first) return null;
	let explain = false;
	if (p.eatKw('explain')) explain = true;
	if (p.isKw('select')) {
		const q = parseSelect(p);
		if (!p.done()) p.fail('лишнее после конца запроса');
		const r = execSelect(db, q, explain);
		if (explain) return { kind: 'plan', lines: r.plan, scanned: r.scanned };
		return r;
	}
	if (explain) throw new SqlError('EXPLAIN в песочнице работает только с SELECT');
	if (p.eatKw('begin')) {
		if (db.txn) throw new SqlError('транзакция уже начата');
		db.txn = clone({ tables: db.tables, indexes: db.indexes });
		return { kind: 'msg', message: 'BEGIN: транзакция началась. До COMMIT изменения можно отменить командой ROLLBACK' };
	}
	if (p.eatKw('commit')) {
		if (!db.txn) return { kind: 'msg', message: 'COMMIT: транзакции не было, ничего не произошло' };
		db.txn = null;
		return { kind: 'msg', message: 'COMMIT: изменения записаны насовсем' };
	}
	if (p.eatKw('rollback')) {
		if (!db.txn) return { kind: 'msg', message: 'ROLLBACK: транзакции не было, ничего не произошло' };
		db.tables = db.txn.tables;
		db.indexes = db.txn.indexes;
		db.txn = null;
		db.aborted = false;
		return { kind: 'msg', message: 'ROLLBACK: все изменения с BEGIN отменены' };
	}
	if (p.eatKw('create')) {
		if (p.eatKw('unique')) {
			p.expectKw('index');
			return createIndex(db, p, true);
		}
		if (p.eatKw('index')) return createIndex(db, p, false);
		p.expectKw('table');
		if (p.eatKw('if')) (p.expectKw('not'), p.expectKw('exists'));
		const name = p.name();
		if (db.tables[name]) throw new SqlError(`таблица «${name}» уже есть`);
		p.expectOp('(');
		const t = { name, columns: [], pk: [], rows: [], seq: 0 };
		do {
			if (p.eatKw('primary')) {
				p.expectKw('key');
				p.expectOp('(');
				do t.pk.push(p.name());
				while (p.eatOp(','));
				p.expectOp(')');
				continue;
			}
			const col = { name: p.name(), type: 'text', notNull: false, unique: false, def: undefined, ref: null };
			const ty = p.peek();
			if (!ty || ty.t !== 'kw' || !['integer', 'int', 'serial', 'text', 'varchar', 'numeric', 'boolean', 'date', 'timestamp', 'real'].includes(ty.v)) p.fail('ожидался тип столбца: integer, text, numeric, boolean, date или timestamp');
			p.i++;
			col.type = ty.v === 'varchar' ? 'text' : ty.v;
			if (p.eatOp('(')) {
				while (!p.eatOp(')')) p.i++;
			}
			for (;;) {
				if (p.eatKw('primary')) (p.expectKw('key'), t.pk.push(col.name));
				else if (p.eatKw('not')) (p.expectKw('null'), (col.notNull = true));
				else if (p.eatKw('unique')) col.unique = true;
				else if (p.eatKw('default')) col.def = p.primary().v;
				else if (p.eatKw('references')) {
					const rt = p.name();
					p.expectOp('(');
					const rc = p.name();
					p.expectOp(')');
					if (!db.tables[rt]) throw new SqlError(`таблица «${rt}» ещё не создана: сначала создайте её, потом ссылайтесь`);
					col.ref = { table: rt, col: rc };
				} else break;
			}
			t.columns.push(col);
		} while (p.eatOp(','));
		p.expectOp(')');
		for (const k of t.pk) if (!t.columns.some((c) => c.name === k)) throw new SqlError(`в PRIMARY KEY указан столбец «${k}», которого нет`);
		db.tables[name] = t;
		return { kind: 'msg', message: `CREATE TABLE: таблица «${name}» создана${t.pk.length ? `, ключ: ${t.pk.join(', ')}` : ', но первичного ключа нет'}` };
	}
	if (p.eatKw('insert')) {
		p.expectKw('into');
		const t = table(db, p.name());
		let cols = t.columns.map((c) => c.name);
		if (p.eatOp('(')) {
			cols = [];
			do cols.push(p.name());
			while (p.eatOp(','));
			p.expectOp(')');
			for (const c of cols) if (!t.columns.some((x) => x.name === c)) throw new SqlError(`в таблице «${t.name}» нет столбца «${c}». Есть: ${t.columns.map((x) => x.name).join(', ')}`);
		}
		p.expectKw('values');
		const made = [];
		do {
			p.expectOp('(');
			const vals = [];
			do vals.push(ev(p.expr(), [], null));
			while (p.eatOp(','));
			p.expectOp(')');
			if (vals.length !== cols.length) throw new SqlError(`столбцов ${cols.length}, а значений ${vals.length}: их должно быть поровну`);
			const row = {};
			for (const c of t.columns) {
				const at = cols.indexOf(c.name);
				let v = at >= 0 ? vals[at] : c.def !== undefined ? c.def : null;
				if (v === null && c.type === 'serial') v = ++t.seq;
				row[c.name] = coerce(c, v);
				if (c.type === 'serial' && row[c.name] > t.seq) t.seq = row[c.name];
			}
			checkRow(db, t, row);
			t.rows.push(row);
			made.push(row);
		} while (p.eatOp(','));
		if (!p.done()) p.fail('лишнее после конца запроса');
		return { kind: 'msg', message: `INSERT: добавлено строк ${made.length}`, changed: made.length };
	}
	if (p.eatKw('update')) {
		const t = table(db, p.name());
		p.expectKw('set');
		const sets = [];
		do {
			const c = p.name();
			if (!t.columns.some((x) => x.name === c)) throw new SqlError(`в таблице «${t.name}» нет столбца «${c}»`);
			p.expectOp('=');
			sets.push([c, p.expr()]);
		} while (p.eatOp(','));
		const where = p.eatKw('where') ? p.expr() : null;
		if (!p.done()) p.fail('лишнее после конца запроса');
		const cols = t.columns.map((c) => c.name);
		const hit = t.rows.filter((r) => !where || ev(where, [{ alias: t.name, cols, row: r }], null) === true);
		const next = hit.map((r) => {
			const n = { ...r };
			for (const [c, e] of sets) n[c] = coerce(t.columns.find((x) => x.name === c), ev(e, [{ alias: t.name, cols, row: r }], null));
			return [r, n];
		});
		for (const [r, n] of next) {
			checkRow(db, t, n, r);
			Object.assign(r, n);
		}
		return { kind: 'msg', message: `UPDATE: изменено строк ${hit.length}${where ? '' : '. Условия WHERE не было, поэтому изменены ВСЕ строки таблицы'}`, changed: hit.length };
	}
	if (p.eatKw('delete')) {
		p.expectKw('from');
		const t = table(db, p.name());
		const where = p.eatKw('where') ? p.expr() : null;
		if (!p.done()) p.fail('лишнее после конца запроса');
		const cols = t.columns.map((c) => c.name);
		const gone = t.rows.filter((r) => !where || ev(where, [{ alias: t.name, cols, row: r }], null) === true);
		for (const r of gone)
			for (const o of Object.values(db.tables))
				for (const c of o.columns)
					if (c.ref && c.ref.table === t.name && o.rows.some((x) => x[c.name] !== null && x[c.name] === r[c.ref.col])) throw new SqlError(`нельзя удалить: на эту строку ссылается таблица «${o.name}» (столбец ${c.name}). Сначала уберите ссылки`);
		t.rows = t.rows.filter((r) => !gone.includes(r));
		return { kind: 'msg', message: `DELETE: удалено строк ${gone.length}${where ? '' : '. Условия WHERE не было, поэтому удалены ВСЕ строки таблицы'}`, changed: gone.length };
	}
	throw new SqlError('эта песочница знает команды SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, CREATE INDEX, BEGIN, COMMIT, ROLLBACK и EXPLAIN SELECT');
}

function createIndex(db, p, unique) {
	let name = null;
	if (!p.isKw('on')) name = p.name();
	p.expectKw('on');
	const tn = p.name();
	const t = table(db, tn);
	p.expectOp('(');
	const cols = [];
	do cols.push(p.name());
	while (p.eatOp(','));
	p.expectOp(')');
	for (const c of cols) if (!t.columns.some((x) => x.name === c)) throw new SqlError(`в таблице «${tn}» нет столбца «${c}»`);
	name = name || `${tn}_${cols.join('_')}_idx`;
	if (db.indexes.some((i) => i.name === name)) throw new SqlError(`индекс «${name}» уже есть`);
	db.indexes.push({ name, table: tn, cols, unique });
	return { kind: 'msg', message: `CREATE INDEX: индекс «${name}» по ${tn}(${cols.join(', ')}) построен. Теперь каждая запись в «${tn}» обновляет и его` };
}

/**
 * Runs a script: statements split by «;», executed in order, stopping at the first error.
 * Returns { results, error }. After an error inside BEGIN the transaction is «aborted»
 * and every command is refused until ROLLBACK, as in PostgreSQL.
 */
export function run(db, sql) {
	const results = [];
	for (const s of splitStatements(sql)) {
		try {
			if (db.aborted && !/^\s*rollback\b/i.test(s)) throw new SqlError('транзакция прервана после ошибки: все команды игнорируются, пока не будет ROLLBACK');
			const r = execOne(db, s);
			if (r) results.push({ ...r, sql: s });
		} catch (e) {
			if (!(e instanceof SqlError)) throw e;
			if (db.txn) db.aborted = true;
			return { results, error: { message: e.message, sql: s } };
		}
	}
	return { results, error: null };
}

/** Puts ready rows into an existing table (for seeding a page from the person's brief). */
export function load(db, name, rows) {
	const t = table(db, name);
	for (const r of rows) {
		const row = {};
		for (const c of t.columns) {
			row[c.name] = r[c.name] === undefined ? null : r[c.name];
			if (c.type === 'serial') (row[c.name] === null && (row[c.name] = ++t.seq), (t.seq = Math.max(t.seq, row[c.name])));
		}
		t.rows.push(row);
	}
}

/** A value as the person reads it in a result table. */
export function show(v) {
	return v === null ? 'NULL' : v === true ? 'true' : v === false ? 'false' : String(v);
}
