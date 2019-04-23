import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import User from './User';
import CartItem from './CartItem';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import calcTotalPrice from '../lib/calcTotalPrice'; 
import formatMoney from '../lib/formatMoney'; 
import TakeMyMoney from './TakeMyMoney';

export const LOCAL_STATE_QUERY = gql`
	query {
		cartOpen @client
	}
`;

export const TOGGLE_CART_MUTATION = gql`
	mutation{
		toggleCart @client
	} 
`;

const Composed = adopt({
	user: ({ render }) => <User>{ render }</User>,
	toggleCart: ({ render }) => <Mutation mutation={ TOGGLE_CART_MUTATION }>{ render }</Mutation>,
	localState: ({ render }) => <Query query={ LOCAL_STATE_QUERY }>{ render }</Query> 
});

const Cart = (props) => (
	<Composed>
		{
			({ user, toggleCart, localState }) => {
				const me = user.data.me;
				if (!me) return null;
				return (
					<CartStyles open={ localState.data.cartOpen }>
						<CloseButton 
							title='close'
							onClick={ toggleCart }
						>
							&times;
						</CloseButton>
						<Supreme>{ me.name }'s Cart</Supreme>
						<p>
							You have { me.cart.reduce((tally, item) => tally + item.quantity, 0) } 
							&nbsp; item{ me.cart.length === 1 ? '' : 's'} in your cart.
						</p>
						<ul>
							{
								me.cart.map((cartItem) => (
									<CartItem 
										key={ cartItem.id }
										cartItem={ cartItem }
									/>
								))
							}
						</ul>
						<footer>
							<p>{ formatMoney(calcTotalPrice(me.cart)) }</p>
							{
								me.cart.length && (
									<TakeMyMoney>
										<SickButton>Checkout</SickButton>
									</TakeMyMoney>
								)
							}
						</footer>
					</CartStyles>
				)	
			}
		}
	</Composed>
				
);

export default Cart;
