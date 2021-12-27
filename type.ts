export default (headline: string) => {
	if (headline.toLowerCase().startsWith('how to')) {
		return 'How-to';
	}

	if (headline.toLowerCase().endsWith('?')) {
		return 'Question';
	}

	if (/\d+ /g.test(headline)) {
		return 'Listicle';
	}

	return 'Generic';
};
