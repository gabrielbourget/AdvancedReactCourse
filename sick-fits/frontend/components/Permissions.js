import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import ErrorMessage from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
	'ADMIN',
	'USER',
	'ITEMCREATE',
	'ITEMUPDATE',
	'ITEMDELETE',
	'PERMISSIONUPDATE'
];

const ALL_USERS_QUERY = gql`
	query {
		users {
			id 
			name 
			email 
			permissions 
		}
	}
`;

const Permissions = props => (
	<Query query={ ALL_USERS_QUERY }>
		{
			({ data, loading, error }) => (
				<React.Fragment>
					<ErrorMessage error={ error } />
					<div>
						<h2>Manage Permissions</h2>
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									{
										possiblePermissions.map((permission, idx) => <th key={ idx }>{ permission }</th>)
									}
									<th>&darr;</th>
								</tr>
							</thead>
							<tbody>
								{ 
									data.users.map((user) => (
										<User user={ user } id={ user.id }/>
									))
								}
							</tbody>
						</Table>
					</div>
				</React.Fragment>
			)
		}
	</Query>
);

class User extends React.Component {
	render() {
		const user = this.props.user;
		return (
			<tr>
				<td>{ user.name }</td>
				<td>{ user.email }</td>
				{
					possiblePermissions.map((permission, idx) => (
						<td>
							<label htmlFor={ `${user.id}-permission-${permission}` }>
								<input 
									type="checkbox"
								/>
							</label>
						</td>
					))
				}
				<td>
					<SickButton>Update</SickButton>
				</td>
			</tr>
		);
	}
}

export default Permissions;




















