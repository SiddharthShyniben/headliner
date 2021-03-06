import gradient from './gradient.ts';

export function chart(data: any) {
	const width = Deno.consoleSize(Deno.stdout.rid).columns;
	const actualWidth = width - 4;

	const round = (n = 0) => isNaN(n) ? 0 : Math.round(n);

	// positive/negative
	const totalSentiment = data.positive + data.negative;

	const positivePercent = round((data.positive / totalSentiment) * 100);
	const negativePercent = round((data.negative / totalSentiment) * 100);

	const positiveStr = positivePercent.toString() + '%';
	const negativeStr = negativePercent.toString() + '%';

	const positiveLength = (actualWidth / 100) * positivePercent;
	const negativeLength = (actualWidth / 100) * negativePercent;

	console.log('  Sentiment:');
	console.log()
	console.log(' ', 
		'\u001b[42m' +
		' '.repeat(positiveLength) + 
		'\u001b[41m' +
		' '.repeat(negativeLength) +
		'\u001b[0m'
	);

	console.log()
	console.log('    \u001b[42m  \u001b[0m Positive:', positiveStr);
	console.log('    \u001b[41m  \u001b[0m Negative:', negativeStr);
	console.log()
	console.log('    \u001b[41m beta \u001b[0m')
	console.log()

	// types
	const totalPercent = data.common + data.uncommon + data.emotional + data.powerful;

	const commonPercent = round((data.common / totalPercent) * 100);
	const uncommonPercent = round((data.uncommon / totalPercent) * 100);
	const emotionalPercent = round((data.emotional / totalPercent) * 100);
	const powerPercent = round((data.powerful / totalPercent) * 100);

	const commonStr = commonPercent.toString() + '%';
	const uncommonStr = uncommonPercent.toString() + '%';
	const emotionalStr = emotionalPercent.toString() + '%';
	const powerStr = powerPercent.toString() + '%';

	const commonLength = (actualWidth / 100) * commonPercent;
	const uncommonLength = (actualWidth / 100) * uncommonPercent;
	const emotionalLength = (actualWidth / 100) * emotionalPercent;
	const powerLength = (actualWidth / 100) * powerPercent;

	console.log('  Types:');
	console.log()
	console.log(' ', 
		'\u001b[44m' +
		' '.repeat(commonLength) + 
		'\u001b[45m' +
		' '.repeat(uncommonLength) +
		'\u001b[43m' +
		' '.repeat(emotionalLength) + 
		'\u001b[41m' +
		' '.repeat(powerLength) + 
		'\u001b[0m'
	);

	console.log()
	console.log(`    \u001b[44m  \u001b[0m Common:`, commonStr);
	console.log(`    \u001b[45m  \u001b[0m Uncommon:`, uncommonStr);
	console.log(`    \u001b[43m  \u001b[0m Emotional:`, emotionalStr);
	console.log(`    \u001b[41m  \u001b[0m Power:`, powerStr);
	console.log()

	// word count
	const wordCount = Math.max(Math.min(data.wordCount, 24), 0);
	const rangeGradient = gradient(['red', 'yellow', 'green', 'yellow','red']);

	const wordCountPercent = round((wordCount / 24) * 100);
	const wordCountStartPad = (actualWidth / 100) * wordCountPercent;

	console.log('  Word Count:');
	console.log()
	console.log(' ', 0 + ' '.repeat(wordCountStartPad - 3) + wordCount + ' '.repeat(actualWidth - (wordCountStartPad + 1)) + 24);
	console.log(' ', rangeGradient('.'.repeat(actualWidth)));
	console.log(' '.repeat(wordCountStartPad) + '???'.repeat(wordCount.toString().length));
	console.log()

	// char count
	const charCount = Math.max(Math.min(data.charCount, 150), 0);

	const charCountPercent = round((charCount / 150) * 100);
	const charCountStartPad = (actualWidth / 100) * charCountPercent;

	console.log('  Character Count:');
	console.log()
	console.log(' ', 0 + ' '.repeat(charCountStartPad - 3) + charCount + ' '.repeat(actualWidth - (charCountStartPad + 2)) + 150);
	console.log(' ', rangeGradient('.'.repeat(actualWidth)));
	console.log(' '.repeat(charCountStartPad) + '???'.repeat(charCount.toString().length));
	console.log()

	console.log('  Type:', data.type); 
	console.log();

	console.log('  Tips:');

	let overallScore = 0;

	if (commonPercent > 30) {
		console.log('    - Decrease your common words')
	} else if (commonPercent < 20) {
		console.log('    - Increase your common words')
	} else overallScore += 15;

	if (uncommonPercent > 20) {
		console.log('    - Decrease your uncommon words')
	} else if (uncommonPercent < 20) {
		console.log('    - Increase your uncommon words')
	} else overallScore += 15;

	if (emotionalPercent > 15) {
		console.log('    - Decrease your emotional words')
	} else if (emotionalPercent < 10) {
		console.log('    - Increase your emotional words')
	} else overallScore += 15;

	if (data.powerful < 2) {
		console.log('    - Increase your power words')
	} else overallScore += 15;

	if (data.type === 'Generic') {
		console.log('    - Rephrase your headline as a question, list, or how-to');
	} else overallScore += 15;

	if (data.wordCount < 10) {
		if (data.wordCount > 6) overallScore += 10;
		else overallScore += 5;
		console.log('    - Increase your word count; good headlines are around 12 words');
	} else if (data.wordCount > 14) {
		if (data.wordCount < 18) overallScore += 10;
		else overallScore += 5;
		console.log('    - Decrease your word count; good headlines are around 12 words');
	} else overallScore += 15;

	if (data.charCount < 50) {
		if (data.charCount > 30) overallScore += 10;
		else overallScore += 5;
		console.log('    - Increase your character count; good headlines are around 70 characters');
	} else if (data.charCount > 90) {
		if (data.charCount < 110) overallScore += 10;
		else overallScore += 5;
		console.log('    - Decrease your character count; good headlines are around 70 characters');
	} else overallScore += 10;

	console.log();
	console.log('\u001b[1;34m Overall score:', overallScore, '\u001b[0m')
}
