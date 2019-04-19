import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Link from 'next/link';

import PaginationStyles from './styles/PaginationStyles';
import ErrorMessage from './ErrorMessage';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
	query PAGINATION_QUERY {
		itemsConnection {
			aggregate {
				count 
			}
		}
	}
`;

const  Pagination = (props) => (

	
		<Query query={ PAGINATION_QUERY }>
			{
				({ data, loading, error }) => {
					if (loading) return <p>Loading...</p>
					if (error) return <ErrorMessage error={ error }/>
					const count = data.itemsConnection.aggregate.count;
					const pages = Math.ceil(count / perPage);
					return (
						<PaginationStyles>
							<Head>
								<title>Sick Fits | Page { props.page } of { pages }</title>
							</Head>
							<Link href={{
								pathname: 'items'
								query: { page: page - 1}
							}}>
								<a>&larr Prev</a>
							</Link>
							<p>Page { props.page } of { pages }</p>
							<Link href={{
								pathname: 'items'
								query: { page: page + 1 } 
							}}>
								<a>&rarr Next</a>
							</Link>
						</PaginationStyles>
					);
				}
			}
		</Query>
	
)

export default Pagination;
