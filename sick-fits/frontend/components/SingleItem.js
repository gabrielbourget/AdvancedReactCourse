import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import styled from 'styled-components';

import ErrorMessage from './ErrorMessage';

const SingleItemStyles = styled.div`
	max-width: 1200px;
	margin: 2rem auto;
	box-shadow: ${ props => props.theme.bs };
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-flow: column;
	min-height: 800px;
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.details {
		margin: 3rem;
		font-size: 2rem;	
	}
`;

export const SINGLE_ITEM_QUERY = gql`
	query SINGLE_ITEM_QUERY($id: ID!) {
		item (where: { id: $id }) {
			id
			title
			description 
			largeImage
		}
	}
`;

class SingleItem extends React.Component {
	render() {
		return (
			<Query query={ SINGLE_ITEM_QUERY } variables={{
				id: this.props.id
			}}>
				{ 
					({ error, loading, data }) => {
						if (error) return <ErrorMessage error={ error }/>
						if (loading) return <p>Loading...</p>
						if (!data.item) return <p>No item found for item { this.props.id }</p>
						const item = data.item;
						return (
							<React.Fragment>
								<Head>
									<title>Sick Fits | { item.title }</title>
								</Head>
								<SingleItemStyles>
									<img src={ item.largeImage } alt={ item.title }/>
									<div className="details">
										<h2>Viewing { item.title }</h2>
										<p>{ item.description }</p>
									</div>
								</SingleItemStyles>
							</React.Fragment>
						);
					}
				}
			</Query>
		);
	}
}

export default SingleItem;
