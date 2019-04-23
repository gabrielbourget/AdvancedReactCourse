import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import ErrorMessage from './ErrorMessage';
import { STRIPE_KEY } from '../config';

import User, { CURRENT_USER_QUERY } from './User';

const totalItems = ( cart ) => {
	return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
};

class TakeMyMoney extends React.Component {

	onToken = (res) => {
		console.log(res);
	};

	render() {
		console.log( STRIPE_KEY );
		return (
			<User>
				{
					({ data: { me }}) => (
						<StripeCheckout
							amount={ calcTotalPrice(me.cart) }
							name="Sick Fits" 
							description={ `Order of ${totalItems(me.cart)}`}
							image={ me.cart[0].item && me.cart[0].item.image }
							stripeKey={ STRIPE_KEY }
							currency='USD'
							email={ me.email }
							token={ res => this.onToken(res) }
						>
							{ this.props.children }
						</StripeCheckout>
					)
				}
			</User>
		);
	}
}

export default TakeMyMoney;
