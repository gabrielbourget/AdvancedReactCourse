import { mount } from 'enzyme';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import PleaseSignIn from '../components/PleaseSignIn';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks= [
	{
		request: { query: CURRENT_USER_QUERY },
		result: {
			data: { me: null }
		}
	}
];

const signedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: {
			data: { me: fakeUser() }
		}
	}
];

describe('<PleaseSignIn/>', () => {
	it('Renders the signin dialog to logged out user', async () => {
		const wrapper = mount(
			<MockedProvider mocks={ notSignedInMocks }>
				<PleaseSignIn/>
			</MockedProvider>
		);
		expect(wrapper.text()).toContain('Loading...');
		await wait();
		wrapper.update();
		expect(wrapper.text()).toContain('Please sign in before continuing.');
		expect(wrapper.find('Signin').exists()).toBe(true);
	});

	it('Renders the child component when the user is signed in', async () => {
		const Hey = () => <p>Hey!</p>;
		const wrapper = mount(
			<MockedProvider mocks={ signedInMocks }>
				<PleaseSignIn>
					<Hey/>
				</PleaseSignIn>
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		// expect(wrapper.find('Hey').exists()).toBe(true);
		expect(wrapper.contains(<Hey/>)).toBe(true);
	});
});
