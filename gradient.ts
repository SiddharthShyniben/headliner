import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';
import tinygradient from 'https://jspm.dev/tinygradient';

export default function(gradient: string[]) {
	const grad = (tinygradient as Function)(gradient);
	return (str: string) => {
		const count = str.length;
		const gen = grad.rgb(count);
		return gen.map((color: any, i: number) => (chalk as any).bgHex(color.toHexString()).hex(color.toHexString())(str[i])).join('');
	}
}
