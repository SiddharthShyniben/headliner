export default (headline: string) => {
	if (headline.toLowerCase().includes('how to')) {
		return 'How-to';
	}

	if (headline.toLowerCase().includes('?')) {
		return 'Question';
	}

	if (/\d+ /g.test(headline)) {
		return 'Listicle';
	}

	return 'Generic';
};
