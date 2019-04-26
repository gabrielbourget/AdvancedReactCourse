function Person(name, foods) {
	this.name = name;
	this.foods = foods;
}

Person.prototype.fetchFavFoods = function() {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(this.foods), 2000);
	});
};

// - CURRENTLY BEING SKIPPED
describe.skip('mocking learning', () => {
	it('mocks a regular function', () => {
		const fetchDogs = jest.fn();
		fetchDogs('snickers');
		expect(fetchDogs).toHaveBeenCalled();
		expect(fetchDogs).toHaveBeenCalledWith('snickers');
		fetchDogs('hugo');
		expect(fetchDogs).toHaveBeenCalledTimes(2);
	});

	it('can create a person', () => {
		const me = new Person('Wes', ['pizza', 'burgs']);
		expect(me.name).toBe('Wes');
	});

	it('can fetch foods', async () => {
		const me = new Person('Wes', ['pizza', 'burgs']);
		// - Mock the favFoods function
		me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi', 'ramen']);
		const favFoods = await me.fetchFavFoods();
		console.log(favFoods);
		expect(favFoods).toContain('sushi');
	});
});

