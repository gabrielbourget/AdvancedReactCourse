import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import styled from 'styled-components';
import formatMoney from '../lib/formatMoney';

import OrderItemStyles from './styles/OrderItemStyles';
import ErrorMessage from './ErrorMessage';

const USER_ORDERS_QUERY = gql`
	query USER_ORDERS_QUERY {
		orders(orderBy: createdAt_DESC) {
			id
			total 
			createdAt 
			items {
				id 
				title 
				price 
				description 
				quantity 
				image 
			}
		}
	}
`;

const OrderUL = styled.ul`
	display: grid;
	grid-gap: 4rem;
	grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class OrderList extends React.Component {
	render() {
		return (
			<Query query={ USER_ORDERS_QUERY }>
				{
					({ data: { orders }, loading, error }) => {
						if (loading) return <p>Loading...</p>
						if (error) return <ErrorMessage error={ error } />
						console.log(orders);
						return (
							<React.Fragment>
								<p>You have { orders.length } order{ orders.length > 1 ? 's' : '' }</p>
								<OrderUL>
									{
										orders.map(order=> {
											const orderQuantity = order.items.reduce((tally, item) => tally + item.quantity, 0);
											const numProducts = order.items.length;
											return (
												<OrderItemStyles key={ order.id }>
													<Link 
														href={{
														pathname: '/order',
														query: { id: order.id }
													}}>
														<a>
															<div className="order-meta">
																<p>
																	{ orderQuantity } item{ orderQuantity > 1 ? 's' : '' }
																</p>
																<p>
																	{ numProducts } product{ numProducts > 1 ? 's' : '' }
																</p>
																<p>
																	{ formatDistance(order.createdAt, new Date()) }
																</p>
																<p>
																	{ formatMoney(order.total) }
																</p>
															</div>
															<div className="images">
																{
																	order.items.map(item => (
																		<img src={ item.image } alt={ item.title } key={ item.id }/>
																	))
																}
															</div>
														</a>
													</Link>
												</OrderItemStyles>
											);
										})
									}
								</OrderUL>
							</React.Fragment>
						);
					}
				}
			</Query>
		);
	}
}

export default OrderList;
