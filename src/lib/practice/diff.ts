/** A line diff (LCS), for «Показать решение»: what to change in the person's code to reach it. */
export type DiffLine = { op: ' ' | '-' | '+'; text: string };

export function lineDiff(from: string, to: string): DiffLine[] {
	const a = from.split('\n'),
		b = to.split('\n');
	const n = a.length,
		m = b.length;
	const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
	for (let i = n - 1; i >= 0; i--)
		for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
	const out: DiffLine[] = [];
	let i = 0,
		j = 0;
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			out.push({ op: ' ', text: a[i] });
			i++;
			j++;
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) out.push({ op: '-', text: a[i++] });
		else out.push({ op: '+', text: b[j++] });
	}
	while (i < n) out.push({ op: '-', text: a[i++] });
	while (j < m) out.push({ op: '+', text: b[j++] });
	return out;
}
