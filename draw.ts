export function chart(data: any) {
	const width = Deno.consoleSize(Deno.stdout.rid).columns;
	const actualWidth = width - 4;

	// positive/negative
	const totalSentiment = data.positive + data.negative;

	const positivePercent = Math.round((data.positive / totalSentiment) * 100);
	const negativePercent = Math.round((data.negative / totalSentiment) * 100);

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

	// types
	const totalPercent = data.common + data.uncommon + data.emotional + data.powerful;

	const commonPercent = Math.round((data.common / totalPercent) * 100);
	const uncommonPercent = Math.round((data.uncommon / totalPercent) * 100);
	const emotionalPercent = Math.round((data.emotional / totalPercent) * 100);
	const powerPercent = Math.round((data.powerful / totalPercent) * 100);

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
	console.log('    \u001b[44m  \u001b[0m Common:', commonStr);
	console.log('    \u001b[45m  \u001b[0m Uncommon:', uncommonStr);
	console.log('    \u001b[43m  \u001b[0m Emotional:', emotionalStr);
	console.log('    \u001b[41m  \u001b[0m Power:', powerStr);
}
