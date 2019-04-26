import ItemComponent from '../components/Item';
import React from 'react';
import { shallow } from 'enzyme';

const fakeItem = {
	id: 'abc123',
	title: 'A Cool Item',
	price: 50000, 
	description: 'v v cool',
	image: 'dog.jpg',
	largeImage: 'largeDog.jpg'
};

describe.skip('<Item/>', () =>  {

	let wrapper;

	beforeEach(() => {
		wrapper = shallow(<ItemComponent item={ fakeItem }/>);
	});

	it('renders the image propertly', () => {
		const img = wrapper.find('img');
		expect(img.props().src).toBe(fakeItem.image);
		expect(img.props().alt).toBe(fakeItem.title);		
	}) 

	it('renders and displays the title and price properly', () => {
		const PriceTag = wrapper.find('PriceTag');
		expect(PriceTag.children().text()).toBe('$500');
		expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
	});

	it('renders out the buttons properly', () => {
		const buttonList = wrapper.find('.buttonList');
		expect(buttonList.children()).toHaveLength(3);
		expect(buttonList.find('Link')).toHaveLength(1);
		// - Alternate way -> expect(buttonList.find('Link').exists()).toBe(true);
		// - Alternate way -> expect(buttonList.find('Link')).toBeTruthy();
		expect(buttonList.find('AddToCart').exists()).toBe(true);
		expect(buttonList.find('DeleteItem').exists()).toBe(true);
	});
});
