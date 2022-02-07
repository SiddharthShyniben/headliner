import wordBank from './words.ts';
import headlineType from './type.ts';
import {chart} from './draw.ts';
import readability from './readability.ts';

const headline = Deno.args[0] ?? await prompt('\u001b[1;34mWhat is the headline?\u001b[0m') ?? '';
const words = headline.split(' ');

let counts = {
	common: 0,
	uncommon: 0,
	emotional: 0,
	powerful: 0,

	positive: 0,
	negative: 0,
	type: 'Generic',
	readability: {},
	wordCount: 0,
	charCount: 0,
};

const wordStrip = (str: string) => str.replace(/[^a-zA-Z ]/g, '').toLowerCase();

type Word = {
	word: string;
	sentiment?: string;
}

type Bank = Word[];

words.forEach((word: string) => {
	const stripped = wordStrip(word);
	let search: Word | undefined;

	const setSentiment = (search: Word): void => {
		if (search.sentiment === 'positive') {
			counts.positive++;
		} else {
			counts.negative++;
		}
	};

	const findWord = (bank: Bank): Word | undefined => bank.find((word: Word): boolean => word.word === stripped);

	if (search = findWord(wordBank.Common)) {
		counts.common++;
		setSentiment(search);
	} else if (search = findWord(wordBank.Uncommon)) {
		counts.uncommon++;
		setSentiment(search);
	} else if (search = findWord(wordBank.Emotional)) {
		counts.emotional++;
		setSentiment(search);
	} else if (search = findWord(wordBank.Power)) {
		counts.powerful++;
		setSentiment(search);
	}
});

counts.type = headlineType(headline);
counts.readability = readability(headline);

counts.wordCount = words.length;
counts.charCount = headline.length;

chart(counts);
