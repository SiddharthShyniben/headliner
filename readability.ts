export default function readability(text: string) {

	/* To speed the script up, you can set a sampling rate in words. For example, if you set
		* sampleLimit to 1000, only the first 1000 words will be parsed from the input text.
		* Set to 0 to never sample.
	*/
	const sampleLimit = 1000;

	// Manual rewrite of the textstat Python library (https://github.com/shivam5992/textstat/)

	/*
		* Regular expression to identify a sentence. No, it's not perfect. 
		* Fails e.g. with abbreviations and similar constructs mid-sentence.
		*/
	const sentenceRegex = new RegExp('[.?!]\\s[^a-z]', 'g');

	/*
		* Regular expression to identify a syllable. No, it's not perfect either.
		* It's based on English, so other languages wit different vowel / consonant distributions
	* and syllable definitions need a rewrite.
		* Inspired by https://bit.ly/2VK9dz1
		*/
	const syllableRegex = new RegExp('[aiouy]+e*|e(?!d$|ly).|[td]ed|le$', 'g');

	// Baseline for FRE - English only
	const freBase = {
		base: 206.835,
		sentenceLength: 1.015,
		syllablesPerWord: 84.6,
		syllableThreshold: 3
	};

	const cache: any = {};

	const punctuation = ['!','"','#','$','%','&','\'','(',')','*','+',',','-','.','/',':',';','<','=','>','?','@','[',']','^','_','`','{','|','}','~'];

	const legacyRound = (number: number, precision = 0) => {
		const k = 10 ** precision;
		return Math.floor((number * k) + 0.5 * Math.sign(number)) / k;
	};

	const charCount = (text: string) => {
		if (cache.charCount) return cache.charCount;
		if (sampleLimit > 0) text = text.split(' ').slice(0, sampleLimit).join(' ');
		text = text.replace(/\s/g, '');
		return cache.charCount = text.length;
	};

	const removePunctuation = (text: string) => text.split('').filter(c => !punctuation.includes(c)).join('');

	const letterCount = (text: string) => {
		if (sampleLimit > 0) text = text.split(' ').slice(0, sampleLimit).join(' ');
		text = text.replace(/\s/g, '');
		return removePunctuation(text).length;
	};

	const lexiconCount = (text: string, useCache = false, ignoreSample = false) => {
		if (useCache && cache.lexiconCount) return cache.lexiconCount;
		if (ignoreSample !== true && sampleLimit > 0) text = text.split(' ').slice(0, sampleLimit).join(' ');
		text = removePunctuation(text);
		const lexicon = text.split(' ').length;
		return useCache ? cache.lexiconCount = lexicon : lexicon;
	};

	const getWords = (text: string, useCache = false) => {
		if (useCache && cache.getWords) return cache.getWords;
		if (sampleLimit > 0) text = text.split(' ').slice(0, sampleLimit).join(' ');
		text = text.toLowerCase();
		text = removePunctuation(text);
		const words = text.split(' ');
		return useCache ? cache.getWords = words : words;
	};

	const syllableCount = (text: string, useCache = false) => {
		if (useCache && cache.syllableCount) return cache.syllableCount;
		const syllables = getWords(text, useCache).reduce((a: any, c: string) => a + (c.match(syllableRegex) || [1]).length, 0);
		return useCache ? cache.syllableCount = syllables : syllables;
	};

	const polySyllableCount = (text: string, useCache = false) => {
		let count = 0;
		getWords(text, useCache).forEach((word: string) => {
			const syllables = syllableCount(word);
			if (syllables >= 3) {
				count += 1;
			}
		});
		return count;
	};

	const sentenceCount = (text: string, useCache = false) => {
		if (useCache && cache.sentenceCount) return cache.sentenceCount;
		if (sampleLimit > 0) text = text.split(' ').slice(0, sampleLimit).join(' ');
		let ignoreCount = 0;
		const sentences = text.split(sentenceRegex);
		sentences.forEach(s => {
			if (lexiconCount(s, true, false) <= 2) { ignoreCount += 1; }
		});
		const count = Math.max(1, sentences.length - ignoreCount);
		return useCache ? cache.sentenceCount = count : count;
	};

	const avgSentenceLength = (text: string) => {
		const avg = lexiconCount(text, true) / sentenceCount(text, true);
		return legacyRound(avg, 2);
	};

	const avgSyllablesPerWord = (text: string) => {
		const avg = syllableCount(text, true) / lexiconCount(text, true);
		return legacyRound(avg, 2);
	};

	const avgLettersPerWord = (text: string) => {
		const avg = letterCount(text) / lexiconCount(text, true);
		return legacyRound(avg, 2);
	};

	const avgSentencesPerWord = (text: string) => {
		const avg = sentenceCount(text, true) / lexiconCount(text, true);
		return legacyRound(avg, 2);
	};

	const fleschReadingEase = (text: string) => {
		const sentenceLength = avgSentenceLength(text);
		const syllablesPerWord = avgSyllablesPerWord(text);
		return legacyRound(
			freBase.base - 
				freBase.sentenceLength * sentenceLength - 
				freBase.syllablesPerWord * syllablesPerWord,
			2
		);
	};

	const fleschKincaidGrade = (text: string) => {
		const sentenceLength = avgSentenceLength(text);
		const syllablesPerWord = avgSyllablesPerWord(text);
		return legacyRound(
			0.39 * sentenceLength +
				11.8 * syllablesPerWord -
				15.59,
			2
		);
	};

	const smogIndex = (text: string) => {
		const sentences = sentenceCount(text, true);
		if (sentences >= 3) {
			const polySyllables = polySyllableCount(text, true);
			const smog = 1.043 * ((polySyllables * (30 / sentences)) ** 0.5) + 3.1291;
			return legacyRound(smog, 2);
		}
		return 0.0;
	};

	const colemanLiauIndex = (text: string) => {
		const letters = legacyRound(avgLettersPerWord(text) * 100, 2);
		const sentences = legacyRound(avgSentencesPerWord(text) * 100, 2);
		const coleman = 0.0588 * letters - 0.296 * sentences - 15.8;
		return legacyRound(coleman, 2);
	};

	const automatedReadabilityIndex = (text: string) => {
		const chars = charCount(text);
		const words = lexiconCount(text, true);
		const sentences = sentenceCount(text, true);
		const a = chars / words;
		const b = words / sentences;
		const readability = (
			4.71 * legacyRound(a, 2) +
				0.5 * legacyRound(b, 2) -
				21.43
		);
		return legacyRound(readability, 2); 
	};

	const linsearWriteFormula = (text: string) => {
		let easyWord = 0;
		let difficultWord = 0;
		const roughTextFirst100 = text.split(' ').slice(0,100).join(' ');
		const plainTextListFirst100 = getWords(text, true).slice(0,100);
		plainTextListFirst100.forEach((word: string) => {
			if (syllableCount(word) < 3) {
				easyWord += 1;
			} else {
				difficultWord += 1;
			}
		});
		let number = (easyWord + difficultWord * 3) / sentenceCount(roughTextFirst100);
		if (number <= 20) {
			number -= 2;
		}
		return legacyRound(number / 2, 2);
	};

	const rix = (text: string) => {
		const words = getWords(text, true);
		const longCount = words.filter((word: string) => word.length > 6).length;
		const sentencesCount = sentenceCount(text, true);
		return legacyRound(longCount / sentencesCount, 2);
	};

	const readingTime = (text: string) => {
		const wordsPerSecond = 4.17;
		// To get full reading time, ignore cache and sample
		return legacyRound(lexiconCount(text, false, true) / wordsPerSecond, 2);
	};

	// Build textStandard
	let grade = [];
	const obj: any = {};

	(() => {
		// FRE
		const fre = obj.fleschReadingEase = fleschReadingEase(text);
		if (fre < 100 && fre >= 90) {
			grade.push(5);
		} else if (fre < 90 && fre >= 80) {
			grade.push(6);
		} else if (fre < 80 && fre >= 70) {
			grade.push(7);
		} else if (fre < 70 && fre >= 60) {
			grade.push(8);
			grade.push(9);
		} else if (fre < 60 && fre >= 50) {
			grade.push(10);
		} else if (fre < 50 && fre >= 40) {
			grade.push(11);
		} else if (fre < 40 && fre >= 30) {
			grade.push(12);
		} else {
			grade.push(13);
		}

		// FK
		const fk = obj.fleschKincaidGrade = fleschKincaidGrade(text);
		grade.push(Math.floor(fk));
		grade.push(Math.ceil(fk));

		// SMOG
		const smog = obj.smogIndex = smogIndex(text);
		grade.push(Math.floor(smog));
		grade.push(Math.ceil(smog));

		// CL
		const cl = obj.colemanLiauIndex = colemanLiauIndex(text);
		grade.push(Math.floor(cl));
		grade.push(Math.ceil(cl));

		// ARI
		const ari = obj.automatedReadabilityIndex = automatedReadabilityIndex(text);
		grade.push(Math.floor(ari));
		grade.push(Math.ceil(ari));

		// LWF
		const lwf = obj.linsearWriteFormula = linsearWriteFormula(text);
		grade.push(Math.floor(lwf));
		grade.push(Math.ceil(lwf));

		// RIX
		const rixScore = obj.rix = rix(text);
		if (rixScore >= 7.2) {
			grade.push(13);
		} else if (rixScore < 7.2 && rixScore >= 6.2) {
			grade.push(12);
		} else if (rixScore < 6.2 && rixScore >= 5.3) {
			grade.push(11);
		} else if (rixScore < 5.3 && rixScore >= 4.5) {
			grade.push(10);
		} else if (rixScore < 4.5 && rixScore >= 3.7) {
			grade.push(9);
		} else if (rixScore < 3.7 && rixScore >= 3.0) {
			grade.push(8);
		} else if (rixScore < 3.0 && rixScore >= 2.4) {
			grade.push(7);
		} else if (rixScore < 2.4 && rixScore >= 1.8) {
			grade.push(6);
		} else if (rixScore < 1.8 && rixScore >= 1.3) {
			grade.push(5);
		} else if (rixScore < 1.3 && rixScore >= 0.8) {
			grade.push(4);
		} else if (rixScore < 0.8 && rixScore >= 0.5) {
			grade.push(3);
		} else if (rixScore < 0.5 && rixScore >= 0.2) {
			grade.push(2);
		} else {
			grade.push(1);
		}

		// Find median grade
		grade = grade.sort((a, b) => a - b);
		const midPoint = Math.floor(grade.length / 2);
		const medianGrade = legacyRound(
			grade.length % 2 ? 
				grade[midPoint] : 
				(grade[midPoint-1] + grade[midPoint]) / 2.0
		);
		obj.medianGrade = medianGrade;

	})();

	obj.readingTime = readingTime(text);

	return obj;
}
