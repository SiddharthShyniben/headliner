import wordBank from './words.ts';
import {chart} from './draw.ts';

const headline = Deno.args[0] ?? await prompt('What is the headline?') ?? '';
const words = headline.split(' ');

let counts = {
	common: 0,
	uncommon: 0,
	emotional: 0,
	powerful: 0,

	positive: 0,
	negative: 0,
};

const wordStrip = (str: string) => str.replace(/[^a-zA-Z ]/g, '').toLowerCase();

type Word = {
	word: string;
	sentiment?: string;
}

type Bank = Word[];

words.forEach((word: string) => {
	const stripped = wordStrip(word);
	let search;

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

chart(counts);
